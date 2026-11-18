// Global API URL & Trailing Slash Interceptor for Production
const PROD_BACKEND = "https://mathib-backend.onrender.com";

function sanitizeApiUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  // 1. Strip accidental markdown brackets or quotes from env vars
  let url = rawUrl.replace(/[\[\]"']/g, "").trim();

  // 2. Redirect any relative /api/ calls or Vercel-targeted /api/ calls to Render
  if (url.startsWith("/api/")) {
    url = PROD_BACKEND + url;
  } else if (url.includes("vercel.app/api/")) {
    url = PROD_BACKEND + "/api/" + url.split("vercel.app/api/")[1];
  } else if (url.includes("localhost:") && window.location.hostname !== "localhost") {
    const apiIndex = url.indexOf("/api/");
    if (apiIndex !== -1) {
      url = PROD_BACKEND + url.substring(apiIndex);
    }
  }

  // 3. Ensure every Render API request has a trailing slash before query params
  if (url.startsWith(PROD_BACKEND)) {
    const [pathPart, queryPart] = url.split("?");
    const fixedPath = pathPart.endsWith("/") ? pathPart : pathPart + "/";
    url = queryPart ? `${fixedPath}?${queryPart}` : fixedPath;
  }

  return url;
}

// Intercept native window.fetch
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === "string") {
    input = sanitizeApiUrl(input);
  } else if (input instanceof Request) {
    const fixedUrl = sanitizeApiUrl(input.url);
    if (fixedUrl !== input.url) {
      input = new Request(fixedUrl, input);
    }
  }
  return originalFetch.call(this, input, init);
};

// Intercept XMLHttpRequest (used by Axios)
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
  const fixedUrl = typeof url === "string" ? sanitizeApiUrl(url) : sanitizeApiUrl(url.toString());
  return (originalOpen as any).call(this, method, fixedUrl, ...rest);
};
