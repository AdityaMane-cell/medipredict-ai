import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { createToast, DEFAULT_SYMPTOM_PLACEHOLDERS } from "./constants";
import AuthPage from "./pages/AuthPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import HomePage from "./pages/HomePage";
import {
  normalizePredictionResponse,
  requestJson,
} from "./utils/api";

const TOKEN_KEY = "health-ai-token";

const readStoredArray = (key) => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function AppShell() {
  const [page, setPage] = useState("home");
  const [mode, setMode] = useState("symptoms");
  const [symptoms, setSymptoms] = useState(() =>
    readStoredArray("symptoms")
  );
  const [symptomText, setSymptomText] = useState("");
  const [textInput, setTextInput] = useState(
    () => sessionStorage.getItem("textInput") || ""
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);

  const [availableSymptoms, setAvailableSymptoms] = useState(
    DEFAULT_SYMPTOM_PLACEHOLDERS
  );

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("history");
  const [history, setHistory] = useState([]);
  const [guestMode, setGuestMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    state: "checking",
    message: "Checking API and database connection...",
  });

  // 🔔 Alerts
  const addAlert = useCallback((message, type = "info") => {
    setAlerts((prev) =>
      [createToast(message, type), ...prev].slice(0, 4)
    );
  }, []);

  // 🔄 Reset auth
  const resetAuthForms = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  // 📥 Load history
  const loadHistory = useCallback(async (accessToken) => {
    const histories = await requestJson("/history", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setHistory(Array.isArray(histories) ? histories : []);
  }, []);

  // 🔐 Set session
  const setAuthSession = useCallback(
    async (accessToken) => {
      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);

      const userData = await requestJson("/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUser(userData);
      setGuestMode(false);

      try {
        await loadHistory(accessToken);
      } catch {
        setHistory([]);
      }
    },
    [loadHistory]
  );

  // 👤 Guest mode
  const enableGuestMode = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    setGuestMode(true);
    setHistory([]);
    setResult(null);
    setError("");
    setPage("app");
  };

  // 🔁 Mode switch
  const handleAuthModeChange = (nextMode) => {
    setAuthMode(nextMode);
    resetAuthForms();
  };

  // ✅ Validation
  const validateAuthForm = (needsEmail) => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (cleanUsername.length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (needsEmail && !cleanEmail) {
      return "Enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  // 🆕 SIGNUP
  const handleSignup = async (event) => {
    event?.preventDefault();
    setError("");

    const validationError = validateAuthForm(true);
    if (validationError) return setError(validationError);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    setAuthLoading(true);

    try {
      // register
      await requestJson("/register", {
        method: "POST",
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password,
        }),
      });

      // login
      const tokenData = await requestJson("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: cleanUsername,
          password,
        }),
      });

      await setAuthSession(tokenData.access_token);
      resetAuthForms();
      setPage("app");
      addAlert("Account created successfully!", "success");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔐 LOGIN
  const handleLogin = async (event) => {
    event?.preventDefault();
    setError("");

    const validationError = validateAuthForm(false);
    if (validationError) return setError(validationError);

    const cleanUsername = username.trim();

    setAuthLoading(true);

    try {
      const tokenData = await requestJson("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: cleanUsername,
          password,
        }),
      });

      await setAuthSession(tokenData.access_token);
      resetAuthForms();
      setPage("app");
      addAlert("Logged in successfully!", "success");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setHistory([]);
    setToken(null);
    setPage("home");
    setGuestMode(false);
    setResult(null);
    setError("");
  };

  useEffect(() => {
    const checkBackend = async () => {
      setBackendStatus({
        state: "checking",
        message: "Checking API and database connection...",
      });

      try {
        const data = await requestJson("/health");
        const dbStatus = data?.database?.status || "unknown";

        if (data?.status === "ok" && dbStatus === "connected") {
          setBackendStatus({
            state: "online",
            message: "API is running and database is connected.",
          });
          return;
        }

        setBackendStatus({
          state: "offline",
          message:
            data?.database?.detail ||
            "API is running, but the database is not connected.",
        });
      } catch (err) {
        setBackendStatus({
          state: "offline",
          message: err.message || "Backend is not reachable.",
        });
      }
    };

    checkBackend();
  }, []);

  // 🔄 Restore session
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setAuthSession(stored)
        .then(() => setPage("app"))
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
        });
    }
  }, [setAuthSession]);

  // 📦 Persist
  useEffect(() => {
    sessionStorage.setItem("symptoms", JSON.stringify(symptoms));
  }, [symptoms]);

  useEffect(() => {
    sessionStorage.setItem("textInput", textInput);
  }, [textInput]);

  useEffect(() => {
    if (error) addAlert(error, "error");
  }, [error, addAlert]);

  // 📥 Fetch symptoms
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const data = await requestJson("/symptoms");
        if (Array.isArray(data.symptoms)) {
          setAvailableSymptoms(data.symptoms.slice(0, 120));
        }
      } catch (err) {
        console.warn("Could not fetch symptoms:", err);
      }
    };
    fetchSymptoms();
  }, []);

  // ➕ Add symptom
  const addSymptom = (value) => {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
    if (!normalized || symptoms.includes(normalized)) return;
    setSymptoms((prev) => [...prev, normalized]);
  };

  const removeSymptom = (value) => {
    setSymptoms((prev) =>
      prev.filter((symptom) => symptom !== value)
    );
  };

  // 🔮 Prediction
  const fetchPrediction = async (payload, endpoint) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await requestJson(`/${endpoint}`, {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        body: JSON.stringify(payload),
      });

      const normalized = normalizePredictionResponse(data, endpoint);
      setResult(normalized);
      addAlert("Prediction complete!", "success");

      if (user && token) await loadHistory(token);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSymptoms = (e) => {
    e?.preventDefault();
    if (symptoms.length < 2) {
      return setError("Add at least two symptoms.");
    }
    fetchPrediction({ symptoms }, "predict");
  };

  const handleSubmitText = (e) => {
    e?.preventDefault();
    if (!textInput.trim()) {
      return setError("Enter text first.");
    }
    fetchPrediction({ text: textInput.trim() }, "predict-text");
  };

  // 🧭 Routing
  if (page === "home") {
    return (
      <HomePage
        backendStatus={backendStatus}
        onAuth={() => setPage("auth")}
        onContinueAsGuest={enableGuestMode}
      />
    );
  }

  if (page === "auth" && !user) {
    return (
      <AuthPage
        authMode={authMode}
        backendStatus={backendStatus}
        email={email}
        error={error}
        loading={authLoading}
        password={password}
        username={username}
        onBack={() => setPage("home")}
        onChangeAuthMode={handleAuthModeChange}
        onEmailChange={setEmail}
        onLogin={handleLogin}
        onPasswordChange={setPassword}
        onSignup={handleSignup}
        onUsernameChange={setUsername}
      />
    );
  }

  return (
    <DiagnosisPage
      alerts={alerts}
      availableSymptoms={availableSymptoms}
      backendStatus={backendStatus}
      error={error}
      guestMode={guestMode}
      history={history}
      loading={loading}
      mode={mode}
      result={result}
      sidebarTab={sidebarTab}
      symptomText={symptomText}
      symptoms={symptoms}
      textInput={textInput}
      user={user}
      onAddSymptom={addSymptom}
      onGoHome={handleLogout}
      onLogout={handleLogout}
      onModeChange={setMode}
      onRemoveSymptom={removeSymptom}
      onSidebarTabChange={setSidebarTab}
      onSubmitSymptoms={handleSubmitSymptoms}
      onSubmitText={handleSubmitText}
      onSymptomTextChange={setSymptomText}
      onTextInputChange={setTextInput}
    />
  );
}

export default AppShell;
