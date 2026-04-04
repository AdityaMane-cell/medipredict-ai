import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const DEFAULT_SYMPTOM_PLACEHOLDERS = [
  "fever",
  "headache",
  "cough",
  "fatigue",
  "itching",
  "nausea",
  "skin rash",
  "nodal skin eruption",
];

const toast = (msg, type = "info") => ({
  message: msg,
  type,
  timestamp: Date.now(),
});

function App() {
  const [mode, setMode] = useState("symptoms");
  const [symptoms, setSymptoms] = useState(() =>
    JSON.parse(sessionStorage.getItem("symptoms") || "[]"),
  );
  const [symptomText, setSymptomText] = useState("");
  const [textInput, setTextInput] = useState(
    () => sessionStorage.getItem("textInput") || "",
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [availableSymptoms, setAvailableSymptoms] = useState(
    DEFAULT_SYMPTOM_PLACEHOLDERS,
  );

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("home"); // home, auth, app
  const [sidebarTab, setSidebarTab] = useState("history");
  const [history, setHistory] = useState([]);
  const [guestMode, setGuestMode] = useState(false);

  const resetAuthForms = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const setAuthSession = async (accessToken) => {
    localStorage.setItem("health-ai-token", accessToken);
    setToken(accessToken);

    const meRes = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meRes.ok) {
      throw new Error("Failed to fetch profile");
    }

    const userData = await meRes.json();
    setUser(userData);
    setGuestMode(false);

    const historyRes = await fetch(`${API_BASE}/history`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (historyRes.ok) {
      const histories = await historyRes.json();
      setHistory(histories);
    } else {
      setHistory([]);
    }
  };

  const enableGuestMode = () => {
    setUser(null);
    setToken(null);
    setGuestMode(true);
    setHistory([]);
    setPage("app");
    localStorage.removeItem("health-ai-token");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Fill username, email, and password for signup");
      return;
    }

    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Signup failed");
      return;
    }

    const tokenRes = await fetch(`${API_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });

    if (!tokenRes.ok) {
      const data = await tokenRes.json();
      setError(data.detail || "Auto-login failed");
      return;
    }

    const tokenData = await tokenRes.json();
    await setAuthSession(tokenData.access_token);
    setPage("app");
    resetAuthForms();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Enter username and password to login");
      return;
    }

    const res = await fetch(`${API_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Invalid username or password");
      return;
    }

    const tokenData = await res.json();
    await setAuthSession(tokenData.access_token);
    setPage("app");
    resetAuthForms();
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setToken(null);
    setMode("symptoms");
    setSidebarTab("history");
    setPage("home");
    setGuestMode(false);
    setResult(null);
    localStorage.removeItem("health-ai-token");
  };

  const addAlert = (message, type = "info") => {
    setAlerts((prev) => [toast(message, type), ...prev].slice(0, 4));
  };

  useEffect(() => {
    const tokenStored = localStorage.getItem("health-ai-token");
    if (tokenStored) {
      setToken(tokenStored);
      setAuthSession(tokenStored).catch(() => {
        localStorage.removeItem("health-ai-token");
      });
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("symptoms", JSON.stringify(symptoms));
  }, [symptoms]);

  useEffect(() => {
    sessionStorage.setItem("textInput", textInput);
  }, [textInput]);

  useEffect(() => {
    if (error) addAlert(error, "error");
  }, [error]);

  useEffect(() => {
    setSymptomText(symptoms.join(", "));
  }, [symptoms]);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const res = await fetch(`${API_BASE}/symptoms`);
        if (!res.ok) throw new Error("Could not fetch symptom glossary");
        const data = await res.json();
        if (Array.isArray(data.symptoms) && data.symptoms.length > 0) {
          setAvailableSymptoms(data.symptoms.slice(0, 120));
        }
      } catch (err) {
        console.warn(err);
      }
    };

    fetchSymptoms();
  }, []);

  const addSymptom = (value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    if (!symptoms.includes(normalized))
      setSymptoms((prev) => [...prev, normalized]);
  };

  const removeSymptom = (value) => {
    setSymptoms((prev) => prev.filter((s) => s !== value));
  };

  const fetchPrediction = async (payload, endpoint) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed");
      setResult(data);

      if (user) {
        const historyRes = await fetch(`${API_BASE}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (historyRes.ok) {
          setHistory(await historyRes.json());
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSymptoms = (event) => {
    event.preventDefault();
    if (!symptoms.length)
      return setError("Add at least one symptom before predicting");

    fetchPrediction({ symptoms }, "predict");
  };

  const handleSubmitText = (event) => {
    event.preventDefault();
    if (!textInput.trim())
      return setError("Enter symptom text before predicting");

    fetchPrediction({ text: textInput }, "predict-text");
  };

  const top3List = result?.top3 ?? [];

  if (page === "home") {
    return (
      <div className="app-shell home-shell">
        <div className="home-card">
          <h1>Health AI Prediction</h1>
          <p>
            Start anonymously or login/sign up to save your prediction history
            and profile.
          </p>
          <div className="home-actions">
            <button
              className="primary"
              onClick={() => {
                setPage("app");
                enableGuestMode();
              }}
            >
              Continue as Guest
            </button>
            <button className="secondary" onClick={() => setPage("auth")}>
              Login / Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === "auth" && !user) {
    return (
      <div className="app-shell auth-shell">
        <div className="auth-card">
          <h1>Health AI Gateway</h1>
          <p>Login or sign up to keep track of your predictions.</p>

          <div className="auth-switch">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={authMode === "signup" ? "active" : ""}
              onClick={() => {
                setAuthMode("signup");
                setError("");
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={authMode === "login" ? handleLogin : handleSignup}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose username"
              required
            />

            {authMode === "signup" && (
              <>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </>
            )}

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            {error && <div className="status error">{error}</div>}

            <button className="primary" type="submit">
              {authMode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell app-layout">
      <aside className="sidebar">
        <div className="account-card">
          <h3>{user.username}</h3>
          <small>{user.email}</small>
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="sidebar-tabs">
          <button
            className={sidebarTab === "history" ? "active" : ""}
            onClick={() => setSidebarTab("history")}
          >
            History
          </button>
          <button
            className={sidebarTab === "profile" ? "active" : ""}
            onClick={() => setSidebarTab("profile")}
          >
            Profile
          </button>
        </div>

        <div className="sidebar-content">
          {sidebarTab === "history" ? (
            <div className="history-list">
              <h4>Prediction History</h4>
              {history.length === 0 ? (
                <p>No history yet. Run predictions to save entries.</p>
              ) : (
                <ul>
                  {history.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>
                          {new Date(item.created_at).toLocaleString()}
                        </strong>
                        <span>
                          {item.method === "symptoms" ? "Symptom" : "Text"}
                        </span>
                      </div>
                      <div className="history-query">
                        {item.method === "symptoms"
                          ? item.query.join(", ")
                          : item.query}
                      </div>
                      <div className="history-result">
                        Top 1 {item.result?.top3?.[0]?.[0] || "N/A"} (
                        {item.result?.confidence != null
                          ? `${(item.result.confidence * 100).toFixed(1)}%`
                          : "--"}
                        )
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="profile-view">
              <h4>Account Profile</h4>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Predictions made:</strong> {history.length}
              </p>
              <p>
                <strong>2FA:</strong>{" "}
                {user.totp_enabled === "true" ? "Enabled" : "Disabled"}
              </p>
              {user.totp_enabled !== "true" ? (
                <button
                  className="secondary"
                  onClick={async () => {
                    const setupRes = await fetch(`${API_BASE}/2fa/setup`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!setupRes.ok) {
                      addAlert("2FA setup failed", "error");
                      return;
                    }
                    const data = await setupRes.json();
                    const code = prompt(
                      "Enter code from your authenticator app:",
                    );
                    if (!code) return;

                    const enableRes = await fetch(`${API_BASE}/2fa/enable`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ code }),
                    });

                    if (!enableRes.ok) {
                      const err = await enableRes.json();
                      addAlert(err.detail || "2FA enable failed", "error");
                      return;
                    }
                    addAlert("2FA enabled", "success");
                    setUser({ ...user, totp_enabled: "true" });
                  }}
                >
                  Enable 2FA
                </button>
              ) : (
                <button
                  className="secondary"
                  onClick={async () => {
                    const code = prompt("Enter TOTP code to disable 2FA:");
                    if (!code) return;
                    const disableRes = await fetch(`${API_BASE}/2fa/disable`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ code }),
                    });
                    if (!disableRes.ok) {
                      const err = await disableRes.json();
                      addAlert(err.detail || "2FA disable failed", "error");
                      return;
                    }
                    addAlert("2FA disabled", "success");
                    setUser({ ...user, totp_enabled: "false" });
                  }}
                >
                  Disable 2FA
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      <div className="main-content">
        <header className="hero-section">
          <h1>Health AI Diagnosis Dashboard</h1>
          <p>
            AI-assisted symptom analysis with real-time disease risk evaluation.
          </p>
        </header>

        <div className="section-controls">
          <button
            className={mode === "symptoms" ? "active" : ""}
            onClick={() => setMode("symptoms")}
          >
            Symptom Picker
          </button>
          <button
            className={mode === "text" ? "active" : ""}
            onClick={() => setMode("text")}
          >
            Natural Language
          </button>
        </div>

        <main className="dashboard-grid">
          <section className="card form-card">
            <h2>
              {mode === "symptoms"
                ? "Select Symptoms"
                : "Describe in plain English"}
            </h2>

            {mode === "symptoms" ? (
              <>
                <p>Tap common symptoms or type your own symptom and hit +.</p>

                <div className="chips">
                  {availableSymptoms.slice(0, 24).map((symptom) => (
                    <button
                      key={symptom}
                      className="chip"
                      onClick={() => addSymptom(symptom)}
                    >
                      {symptom.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>

                <div className="input-group">
                  <input
                    aria-label="add symptom"
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    placeholder="Add comma-separated symptoms"
                  />
                  <button
                    onClick={() => {
                      symptomText
                        .split(",")
                        .map((token) => token.trim())
                        .filter(Boolean)
                        .forEach((token) => addSymptom(token));
                    }}
                  >
                    + Add
                  </button>
                </div>

                <div className="chips selected">
                  {symptoms.map((sym) => (
                    <span key={sym} className="chip selected">
                      {sym}
                      <button onClick={() => removeSymptom(sym)}>
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleSubmitSymptoms}>
                  <button className="primary" type="submit" disabled={loading}>
                    {loading ? "Running..." : "Predict from Symptoms"}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleSubmitText}>
                <p>Example: "I have fever and headache with chest pain"</p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe how you feel..."
                  rows={4}
                />
                <button className="primary" type="submit" disabled={loading}>
                  {loading ? "Running..." : "Predict from Text"}
                </button>
              </form>
            )}
          </section>

          <section className="card result-card">
            <h2>Prediction Output</h2>

            {error && <div className="status error">{error}</div>}
            {!result && !loading && <p>No result yet. Start a prediction.</p>}

            {loading && (
              <div className="status info">Analyzing symptoms...</div>
            )}

            {result && (
              <div className="result-body">
                {"extracted_symptoms" in result && (
                  <div className="data-group">
                    <strong>Extracted symptoms:</strong>
                    <p>{result.extracted_symptoms.join(", ") || "none"}</p>
                  </div>
                )}

                <div className="result-summary">
                  <h3>Top Prediction</h3>
                  <p className="top-disease">{top3List[0]?.[0] ?? "N/A"}</p>
                  <p className="top-confidence">
                    Confidence:{" "}
                    {result.confidence != null
                      ? `${(result.confidence * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                  <div className="confidence-meter">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${Math.min((result.confidence ?? 0) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="data-group">
                  <strong>Top 3 predictions</strong>
                  <ul>
                    {top3List.map(([disease, conf]) => (
                      <li key={disease}>
                        {disease} <span>{(conf * 100).toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.description && (
                  <div className="data-group">
                    <strong>Disease description</strong>
                    <p>{result.description}</p>
                  </div>
                )}

                {result.precautions && result.precautions.length > 0 && (
                  <div className="data-group">
                    <strong>Precautions</strong>
                    <ul>
                      {result.precautions.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.alert && (
                  <div className="status warning">{result.alert}</div>
                )}
                {result.note && (
                  <div className="status info">{result.note}</div>
                )}
              </div>
            )}
          </section>
        </main>

        <aside className="toast-wrapper">
          {alerts.map((a) => (
            <div key={`${a.timestamp}-${a.type}`} className={`toast ${a.type}`}>
              {a.message}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export default App;
