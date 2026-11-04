export default function Icon({ src, alt = "" }) {
  return <img src={src} alt={alt} className="block max-w-none" />;
}
