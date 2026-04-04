/*
Health AI Frontend Test Setup
(Jest + React Testing Library)
*/

export const mockFetch = (response, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => response,
});

export const mockPredictionResult = {
  top3: [
    ["Fever", 0.85],
    ["Common Cold", 0.78],
    ["Flu", 0.65],
  ],
  confidence: 0.85,
  description: "Elevated body temperature",
  precautions: ["Rest", "Hydration", "Monitor symptoms"],
  alert: "Consult a professional.",
  extracted_symptoms: ["high_fever", "cough"],
};

export const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  created_at: "2026-04-02T00:00:00Z",
  totp_enabled: "false",
};
