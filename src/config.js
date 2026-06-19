export const API = "https://ocampo-padawag-realty.onrender.com";

export function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API}${url}`;
}
