# Velto - Personal Finance Tracker

Velto is a browser-based finance tracker. The dashboard supports income and expense records, category and currency filters, editing, monthly budgets, savings goals, and recurring-payment reminders. Recurring reminders never create transactions automatically; recording one requires confirmation.

## Data and backups

Records are stored in browser `localStorage` under the signed-in user's account. They are not synced to a server. Use **Backup & export** on the dashboard to download a JSON backup (transactions, budgets, goals, and reminders) or a CSV of transactions. Restoring a JSON backup validates it and merges records without replacing existing data.

Statement files are processed in the browser. CSV imports are supported. Some bank PDF layouts are deliberately rejected when their transaction rows cannot be verified reliably; use the bank's CSV export for those statements rather than risk importing incorrect amounts.

## Development

```sh
npm install
npm run dev
npm run build
npm run lint
```

## React + Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
