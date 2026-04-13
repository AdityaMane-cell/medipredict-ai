export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const readResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  return text ? { detail: text } : null;
};

const parseErrorMessage = (detail) => {
  if (!detail) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || String(item))
      .join(", ");
  }
  if (typeof detail === "object") {
    return detail.message || detail.msg || JSON.stringify(detail);
  }
  return String(detail);
};

export const normalizePredictionResponse = (data, endpoint) => {
  if (endpoint === "predict-text") {
    return {
      ...(data?.prediction || {}),
      extracted_symptoms:
        data?.extracted_symptoms ||
        data?.prediction?.extracted_symptoms ||
        [],
    };
  }

  return data;
};

export const requestJson = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  const { headers: optionHeaders = {}, ...restOptions } = options;

  const finalOptions = {
    ...restOptions,
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...optionHeaders,
    },
    credentials: options.credentials || "same-origin",
    signal: controller.signal,
  };

  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, finalOptions);
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    if (err instanceof TypeError) {
      throw new Error(
        `Cannot reach the backend at ${API_BASE}. Make sure the server is running.`
      );
    }

    throw err;
  }

  clearTimeout(timeout);

  const data = await readResponse(res);

  if (!res.ok) {
    throw new Error(
      parseErrorMessage(data?.detail) ||
      data?.error ||
      `Request failed (${res.status})`
    );
  }

  return data;
};
