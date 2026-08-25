const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "kiko_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { auth = false, ...options } = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });

  if (res.status === 401 && auth) {
    clearToken();
    // Utility module, outside the component tree — no router access, so a hard navigation is the only option.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.message || `Request failed: ${res.status}`);
  }
  return body;
}

export async function getHealth() {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export function register({ username, email, password, confirmPassword, accountType, inviteCode, groupName }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, confirmPassword, accountType, inviteCode, groupName }),
  });
}

export function login({ identifier, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function getMe() {
  return request("/auth/me", { auth: true });
}

export function forgotPassword({ email }) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword({ token, password, confirmPassword }) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password, confirmPassword }),
  });
}

export function declareDay(tasks) {
  return request("/days", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ tasks }),
  });
}

export function getToday() {
  return request("/days/today", { auth: true });
}

export function addTasks(tasks) {
  return request("/days/today/tasks", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ tasks }),
  });
}

export function startDay() {
  return request("/days/today/start", { method: "POST", auth: true });
}

// Fire-and-forget: deliberately bypasses request() (which redirects to /login
// on a 401) and swallows every failure. The Pomodoro timer must keep running
// silently even if this never lands -- see backend/src/routes/sessions.js.
export function logSession({ startedAt, endedAt, type }) {
  const token = getToken();
  if (!token) return;
  fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ startedAt, endedAt, type }),
  }).catch(() => {});
}
