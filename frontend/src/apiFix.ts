const PROD_BACKEND = "https://mathib-backend.onrender.com";

export function sanitizeApiUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;

  // 1. Strip any stray markdown brackets, parentheses, or quotes
  let url = rawUrl.replace(/[\[\]\(\)"']/g, "").trim();

  // 2. Always slice from the LAST occurrence of /api/v1 (or /api/) to prevent doubled base URLs
  const lastV1 = url.lastIndexOf("/api/v1");
  if (lastV1 !== -1) {
    url = PROD_BACKEND + url.substring(lastV1);
  } else if (url.includes("/api/")) {
    url = PROD_BACKEND + url.substring(url.lastIndexOf("/api/"));
  } else if (url.startsWith("http://localhost:8000")) {
    url = url.replace("http://localhost:8000", PROD_BACKEND);
  }

  // 3. Clean up any accidental double slashes in the path
  url = url.replace(/([^:]\/)\/+/g, "$1");

  // 4. Enforce trailing slash on all Render API calls before query parameters
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
