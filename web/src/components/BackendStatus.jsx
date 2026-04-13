import { API_BASE } from "../utils/api";

function BackendStatus({ status }) {
  const isOnline = status?.state === "online";
  const isChecking = status?.state === "checking";

  return (
    <div
      className={`backend-status ${
        isOnline ? "online" : isChecking ? "checking" : "offline"
      }`}
    >
      <span />
      <div>
        <strong>
          {isOnline
            ? "Backend connected"
            : isChecking
              ? "Checking backend"
              : "Backend not connected"}
        </strong>
        <small>
          {status?.message ||
            `API: ${API_BASE}. Database status appears here when connected.`}
        </small>
      </div>
    </div>
  );
}

export default BackendStatus;
