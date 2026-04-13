export const DEFAULT_SYMPTOM_PLACEHOLDERS = [
  "fever",
  "headache",
  "cough",
  "fatigue",
  "itching",
  "nausea",
  "skin rash",
  "swollen skin",
];

const VALID_TYPES = ["info", "success", "error", "warning"];

export const createToast = (message, type = "info") => ({
  id: crypto.randomUUID(),
  message,
  type: VALID_TYPES.includes(type) ? type : "info",
  timestamp: Date.now(),
});