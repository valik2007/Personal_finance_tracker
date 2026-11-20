import { getTransactionCurrency, normalizeCurrency } from "./currency.js";

function countDelimiter(line, delimiter) {
  let count = 0;
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') {
      if (quoted && line[index + 1] === '"') {
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && line[index] === delimiter) {
      count += 1;
    }
  }

  return count;
}

export function parseCsv(text) {
  const contents = text.replace(/^\uFEFF/, "");
  if (!contents.trim()) throw new Error("The selected CSV file is empty.");

  const firstLine = contents.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiters = [",", ";", "\t"];
  const delimiter = delimiters.reduce((best, candidate) =>
    countDelimiter(firstLine, candidate) > countDelimiter(firstLine, best)
      ? candidate
      : best
  );
  if (countDelimiter(firstLine, delimiter) === 0) {
    throw new Error("Could not detect CSV columns. Save the statement as a comma- or semicolon-separated CSV.");
  }

  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (character === '"') {
      if (quoted && contents[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && character === delimiter) {
      row.push(cell.trim());
      cell = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && contents[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length < 2) throw new Error("The CSV must include a header and at least one transaction.");

  return rows;
}

function getPdfLines(items) {
  const words = items
    .filter((item) => item.str?.trim() && item.transform)
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform[4],
      y: item.transform[5],
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];

  words.forEach((word) => {
    let line = lines[lines.length - 1];
    if (!line || Math.abs(line.y - word.y) > 3) {
      line = { y: word.y, items: [] };
      lines.push(line);
    }
    line.items.push(word);
  });

  return lines.map((line) => ({
    ...line,
    items: line.items.sort((a, b) => a.x - b.x),
    text: line.items.map((item) => item.text).join(" ").replace(/\s+/g, " ").trim(),
  }));
}

function classifyPdfHeader(value) {
  const normalized = value.trim().toLowerCase();
  if (/date|дата/.test(normalized)) return "date";
  if (/debit|withdrawal|outflow|expense|дебет|списание|расход/.test(normalized)) {
    return "debit";
  }
  if (/credit|deposit|inflow|income|кредит|зачисление|поступление|пополнение|приход|доход/.test(normalized)) {
    return "credit";
  }
  if (/description|details|memo|narrative|payee|merchant|transaction|operation|описание|назначение|получатель|операция/.test(normalized)) {
    return "description";
  }
  if (/amount|sum|value|сумма/.test(normalized)) return "amount";
  if (/type|direction|тип|видоперации/.test(normalized)) return "type";
  if (/category|категория/.test(normalized)) return "category";
  return "";
}

function createPdfColumns(headerLine) {
  const seen = new Set();
  return headerLine.items
    .map((item) => ({ kind: classifyPdfHeader(item.text), x: item.x }))
    .filter(({ kind }) => {
      if (!kind || seen.has(kind)) return false;
      seen.add(kind);
      return true;
    })
    .sort((a, b) => a.x - b.x);
}

function pdfRowFromLine(line, columns) {
  const cells = columns.map(() => "");
  line.items.forEach((item) => {
    let columnIndex = 0;
    for (let index = 1; index < columns.length; index += 1) {
      const boundary = (columns[index - 1].x + columns[index].x) / 2;
      if (item.x >= boundary) columnIndex = index;
    }
    cells[columnIndex] = `${cells[columnIndex]} ${item.text}`.trim();
  });
  return cells;
}

function parsePdfTextLines(lines) {
  const headers = ["Date", "Description", "Amount", "Type"];
  const rows = [];
  const datePattern =
    /\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i;
  const amountPattern =
    /(?:\(?[-−+]?\s*(?:[$€£₽]\s*)?\d[\d\u00a0\s.,]*[.,]\d{2}\s*(?:USD|EUR|RUB|UAH|руб\.?)?\)?|[$€£₽]\s*\d[\d\u00a0\s.,]*\d?)/gi;

  lines.forEach((line) => {
    const dateMatch = line.text.match(datePattern);
    if (!dateMatch) return;

    const remainder = line.text.replace(dateMatch[0], " ");
    const amounts = [...remainder.matchAll(amountPattern)];
    if (amounts.length !== 1) return;

    const description = remainder.replace(amountPattern, " ").replace(/\s+/g, " ").trim();
    if (!description) return;
    const type = parseType(line.text) || "";
    rows.push([dateMatch[0], description, amounts[0][0].trim(), type]);
  });

  return { headers, rows };
}

export async function parsePdfStatement(file) {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const document = await pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  }).promise;
  const allLines = [];
  const tableRows = [];
  let activeColumns = null;

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = getPdfLines(content.items);
    allLines.push(...lines);

    const headerIndex = lines.findIndex((line) => {
      const kinds = line.items.map((item) => classifyPdfHeader(item.text));
      return (
        kinds.includes("date") &&
        kinds.includes("description") &&
        (kinds.includes("amount") || kinds.includes("debit") || kinds.includes("credit"))
      );
    });

    let headerY = Number.POSITIVE_INFINITY;
    if (headerIndex >= 0) {
      activeColumns = createPdfColumns(lines[headerIndex]);
      headerY = lines[headerIndex].y;
    }

    if (!activeColumns) continue;

    const indexes = Object.fromEntries(
      activeColumns.map((column, index) => [column.kind, index])
    );
    lines.forEach((line, lineIndex) => {
      if (lineIndex === headerIndex || line.y >= headerY - 2) return;
      const row = pdfRowFromLine(line, activeColumns);
      const hasDate = row[indexes.date]?.trim();
      const hasDescription = row[indexes.description]?.trim();
      const hasAmount =
        row[indexes.amount]?.trim() ||
        row[indexes.debit]?.trim() ||
        row[indexes.credit]?.trim();
      if (hasDate && hasDescription && hasAmount) tableRows.push(row);
    });
  }

  const pdfText = allLines.map((line) => line.text).join(" ").toLowerCase();
  if (
    /initial amount balance/.test(pdfText) &&
    /final amount balance/.test(pdfText) &&
    /operation date/.test(pdfText) &&
    /value date/.test(pdfText)
  ) {
    throw new Error(
      "This bank's PDF layout cannot be imported reliably yet. Use the CSV export to avoid incorrect transactions."
    );
  }

  if (tableRows.length && activeColumns) {
    return {
      headers: activeColumns.map(({ kind }) => ({
        date: "Date",
        description: "Description",
        amount: "Amount",
        debit: "Debit",
        credit: "Credit",
        type: "Type",
        category: "Category",
      })[kind]),
      rows: tableRows,
      source: "pdf",
    };
  }

  const fallback = parsePdfTextLines(allLines);
  if (!fallback.rows.length) {
    if (!allLines.length) {
      throw new Error("This PDF has no selectable text. Scanned PDFs need OCR and cannot be imported yet.");
    }
    throw new Error("Could not recognize transactions in this PDF. Check that it contains a text-based transaction table.");
  }

  return { ...fallback, source: "pdf" };
}

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "").replace(/['’]/g, "");
}

function findColumn(headers, aliases) {
  return headers.findIndex((header) => {
    const normalized = normalizeHeader(header);
    return aliases.some((alias) => normalized === alias || normalized.startsWith(alias));
  });
}

export function detectCsvColumns(headers) {
  return {
    dateIndex: findColumn(headers, [
      "date",
      "transactiondate",
      "bookingdate",
      "posteddate",
      "valuedate",
      "transactioncompletiondate",
      "completiondate",
      "operationdate",
      "дата",
    ]),
    descriptionIndex: findColumn(headers, [
      "description",
      "details",
      "memo",
      "narrative",
      "payee",
      "merchant",
      "transactiondescription",
      "transactiondetails",
      "transactionsdetails",
      "operationdetails",
      "name",
      "описание",
      "назначение",
      "получатель",
      "операция",
    ]),
    amountIndex: findColumn(headers, ["amount", "sum", "value", "сумма"]),
    debitIndex: findColumn(headers, ["debit", "withdrawal", "outflow", "дебет", "списание", "расход"]),
    creditIndex: findColumn(headers, ["credit", "deposit", "inflow", "кредит", "зачисление", "поступление", "пополнение", "приход", "доход"]),
    typeIndex: findColumn(headers, ["type", "direction", "transactiontype", "тип", "видоперации"]),
    categoryIndex: findColumn(headers, ["category", "категория"]),
    currencyIndex: findColumn(headers, ["currency", "currencycode", "curr", "валюта"]),
  };
}

function parseAmount(value) {
  let normalized = value
    .trim()
    .replace(/[−–]/g, "-")
    .replace(/[^\d.,+-]/g, "");
  if (!normalized) return null;

  const isParenthesized = value.trim().startsWith("(") && value.trim().endsWith(")");
  const commaIndex = normalized.lastIndexOf(",");
  const periodIndex = normalized.lastIndexOf(".");
  if (commaIndex !== -1 && periodIndex !== -1) {
    const decimalSeparator = commaIndex > periodIndex ? "," : ".";
    const groupingSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized.split(groupingSeparator).join("");
    if (decimalSeparator === ",") normalized = normalized.replace(",", ".");
  } else if (commaIndex !== -1) {
    const decimalDigits = normalized.length - commaIndex - 1;
    normalized =
      decimalDigits > 0 && decimalDigits <= 2
        ? normalized.replace(",", ".")
        : normalized.replace(/,/g, "");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return isParenthesized ? -Math.abs(amount) : amount;
}

function parseDate(value) {
  const input = value.trim();
  if (!input) return null;

  let date;
  const isoDate = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const separatedDate = input.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\D|$)/);
  if (isoDate) {
    date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  } else if (separatedDate) {
    const [, first, second, year] = separatedDate;
    const dayFirst = input.includes(".") || Number(first) > 12;
    const month = Number(dayFirst ? second : first);
    const day = Number(dayFirst ? first : second);
    date = new Date(Number(year), month - 1, day);
    if (date.getFullYear() !== Number(year) || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
  } else {
    date = new Date(input);
  }

  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseType(value) {
  const normalized = value.trim().toLowerCase();
  if (/income|credit|deposit|inflow|salary|доход|приход|зачислен|поступлен|пополнен|входящ/.test(normalized)) {
    return "income";
  }
  if (/expense|debit|withdrawal|outflow|payment|расход|списан|оплат|плат[её]ж|покупк|исходящ/.test(normalized)) {
    return "expense";
  }
  return null;
}

function inferCategory(description, type) {
  const normalized = description.toLowerCase();
  if (type === "income") {
    if (/salary|payroll|wage|salari|зарплат|remunerat/.test(normalized)) return "Salary";
    if (/freelance|contract|фриланс|prestari servicii/.test(normalized)) return "Freelance";
    if (/invest|dividend|interest|dob[aâ]nd|инвест|дивиденд/.test(normalized)) return "Investment";
    if (/gift|cadou|donat|подар/.test(normalized)) return "Gift";
    return "Other";
  }

  if (/rent|mortgage|housing|utilities?|electricity|water bill|internet bill|enel|engie|hidroelectrica|gaze|chirie|locuin|utility|аренд|жиль|коммунал/.test(normalized)) {
    return "Housing";
  }
  if (/food|grocery|groceries|restaurant|cafe|supermarket|lidl|kaufland|carrefour|profi|mega[\s-]*image|penny|auchan|selgros|bringo|glovo|tazz|mcdonald|kfc|pizza|alimente|продукт|ресторан|кафе/.test(normalized)) {
    return "Food & groceries";
  }
  if (/shopping|clothing|fashion|shop\b|emag|altex|dedeman|ikea|zara|decathlon|h&m|magazin|cumpar|haine|покуп|одежд/.test(normalized)) {
    return "Shopping";
  }
  if (/transport|taxi|uber|bolt|fuel|gas|metro|bus|tram|train|parking|toll|omv|petrom|rompetrol|benzin|motorin|parcare|bilet|ровин|транспорт|такси|бензин|топлив|метро|автобус/.test(normalized)) {
    return "Transport";
  }
  return "Other";
}

export function previewCsvTransactions(rows, mapping) {
  if (mapping.dateIndex < 0) {
    return { transactions: [], skipped: rows.length, error: "Select the date column." };
  }
  if (mapping.descriptionIndex < 0) {
    return { transactions: [], skipped: rows.length, error: "Select the description column." };
  }
  if (mapping.amountIndex < 0 && mapping.debitIndex < 0 && mapping.creditIndex < 0) {
    return { transactions: [], skipped: rows.length, error: "Select an amount, debit, or credit column." };
  }

  const transactions = [];
  let skipped = 0;

  rows.forEach((row, index) => {
    const description = row[mapping.descriptionIndex]?.trim() || "";
    const date = parseDate(row[mapping.dateIndex] || "");
    let amount = null;
    let type = null;

    const debit = mapping.debitIndex >= 0 ? parseAmount(row[mapping.debitIndex] || "") : null;
    const credit = mapping.creditIndex >= 0 ? parseAmount(row[mapping.creditIndex] || "") : null;
    if (debit !== null || credit !== null) {
      if (debit !== null && debit !== 0 && credit !== null && credit !== 0) {
        skipped += 1;
        return;
      }
      if (debit !== null && debit !== 0) {
        amount = Math.abs(debit);
        type = "expense";
      } else if (credit !== null && credit !== 0) {
        amount = Math.abs(credit);
        type = "income";
      }
    }

    if (amount === null && mapping.amountIndex >= 0) {
      amount = parseAmount(row[mapping.amountIndex] || "");
      if (amount !== null) type = amount < 0 ? "expense" : "income";
    }

    if (amount === null || amount === 0 || !description || !date) {
      skipped += 1;
      return;
    }

    if (type === null && mapping.typeIndex >= 0) {
      type = parseType(row[mapping.typeIndex] || "");
    }
    if (mapping.debitIndex < 0 && mapping.creditIndex < 0 && mapping.typeIndex >= 0) {
      type = parseType(row[mapping.typeIndex] || "") || type;
    }

    const importedCategory = row[mapping.categoryIndex]?.trim();
    const currency =
      mapping.currencyIndex >= 0
        ? normalizeCurrency(row[mapping.currencyIndex])
        : normalizeCurrency("");
    transactions.push({
      id: `${Date.now()}-${index}`,
      text: description,
      amount: Math.abs(amount),
      category: importedCategory || inferCategory(description, type),
      type: type || "income",
      date,
      currency,
    });
  });

  return { transactions, skipped, error: "" };
}

export function getTransactionFingerprint(transaction) {
  return [
    transaction.date,
    transaction.text.trim().toLowerCase(),
    Number(transaction.amount).toFixed(2),
    transaction.type,
    getTransactionCurrency(transaction),
  ].join("|");
}
