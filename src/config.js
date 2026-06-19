export const API = "https://casa-realty-demo.onrender.com";

export function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API}${url}`;
}
