import axios from "axios";

// Allowed values
const ALLOWED_STACKS = ["backend", "frontend"];
const ALLOWED_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const ALLOWED_PACKAGES = [
  "cache", "controller", "cron_job", "db", "domain", "handler", "repository",
  "route", "service", "component", "hook", "page", "state", "style",
  "auth", "config", "middleware", "utils"
];

// Replace with your token from auth API
let AUTH_TOKEN = null;
export const setAuthToken = (token) => { AUTH_TOKEN = token; };

export async function log(stack, level, pkg, message) {
  try {
    // ✅ Validate inputs
    if (!ALLOWED_STACKS.includes(stack)) throw new Error("Invalid stack");
    if (!ALLOWED_LEVELS.includes(level)) throw new Error("Invalid level");
    if (!ALLOWED_PACKAGES.includes(pkg)) throw new Error("Invalid package");
    if (!message || typeof message !== "string") throw new Error("Invalid message");

    const payload = { stack, level, package: pkg, message };

    // ✅ Call Test Server API
    if (AUTH_TOKEN) {
      const res = await axios.post(
        "http://20.244.56.144/evaluation-service/logs",
        payload,
        { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
      );
      return res.data;
    } else {
      console.warn("No auth token set, saving log locally instead");
    }
  } catch (err) {
    console.error("Log failed:", err.message);

    // ✅ Fallback to localStorage (frontend) or file (backend)
    if (typeof localStorage !== "undefined") {
      const logs = JSON.parse(localStorage.getItem("logs") || "[]");
      logs.push({ timestamp: new Date().toISOString(), stack, level, pkg, message });
      localStorage.setItem("logs", JSON.stringify(logs));
    }
  }
}
