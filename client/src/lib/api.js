const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");

export async function apiFetch(path, options = {}) {
  const pathWithSlash = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath = path.startsWith("http")
    ? path
    : pathWithSlash.startsWith("/api/")
      ? pathWithSlash.slice(4)
      : pathWithSlash;
  const url = path.startsWith("http") ? path : `${BASE_URL}${normalizedPath}`;
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json"
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { BASE_URL };
