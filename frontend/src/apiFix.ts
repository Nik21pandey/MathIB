// Global API URL & Trailing Slash Interceptor for Production
const PROD_BACKEND = "https://mathib-backend.onrender.com";

export function sanitizeApiUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
  let url = rawUrl.trim();

  // 1. If env var was pasted as Markdown [url](url), extract the clean path after the last ')'
  if (url.includes("](") || url.includes("[http")) {
    const afterParen = url.split(")").pop() || "";
    const cleanPath = afterParen.startsWith("/") ? afterParen : "/" + afterParen;
    url = `${PROD_BACKEND}/api/v1${cleanPath}`;
  }

  // 2. Strip any stray brackets, parens, or quotes
  url = url.replace(/[\[\]\(\)"']/g, "").trim();

  // 3. Route any relative /api/ or Vercel-hosted /api/ calls to Render
  if (url.startsWith("/api/")) {
    url = PROD_BACKEND + url;
  } else if (url.includes("vercel.app")) {
    const apiIdx = url.indexOf("/api/");
    if (apiIdx !== -1) {
      url = PROD_BACKEND + url.substring(apiIdx);
    } else {
      const v1Idx = url.indexOf("/v1/");
      if (v1Idx !== -1) {
        url = `${PROD_BACKEND}/api${url.substring(v1Idx)}`;
      }
    }
  } else if (url.includes("localhost:") && window.location.hostname !== "localhost") {
    const apiIdx = url.indexOf("/api/");
    if (apiIdx !== -1) {
      url = PROD_BACKEND + url.substring(apiIdx);
    }
  }

  // 4. Clean up any accidental double slashes in path (e.g. /api/v1//auth)
  url = url.replace(/([^:]\/)\/+/g, "$1");

  // 5. Enforce trailing slash on all Render API calls before query string
  if (url.startsWith(PROD_BACKEND)) {
    const [pathPart, queryPart] = url.split("?");
    const fixedPath = pathPart.endsWith("/") ? pathPart : pathPart + "/";
    url = queryPart ? `${fixedPath}?${queryPart}` : fixedPath;
  }

  return url;
}

const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === "string") {
    input = sanitizeApiUrl(input);
  } else if (input instanceof URL) {
    input = new URL(sanitizeApiUrl(input.toString()));
  } else if (input instanceof Request) {
    const fixedUrl = sanitizeApiUrl(input.url);
    if (fixedUrl !== input.url) {
      input = new Request(fixedUrl, input);
    }
  }
  return originalFetch.call(this, input, init);
};

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
  const fixedUrl = typeof url === "string" ? sanitizeApiUrl(url) : sanitizeApiUrl(url.toString());
  return (originalOpen as any).call(this, method, fixedUrl, ...rest);
};
