const DATA_SOURCE_STORAGE_KEY = "DATA_SOURCE";
const DATA_SOURCE_MOCK = "mock";
const DATA_SOURCE_API = "api";

function readStoredMode() {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(DATA_SOURCE_STORAGE_KEY) || "").toLowerCase();
  } catch (error) {
    console.warn("Cannot read DATA_SOURCE from localStorage:", error);
    return "";
  }
}

function normalizeMode(value) {
  const mode = (value || "").toLowerCase().trim();
  if (mode === DATA_SOURCE_API || mode === DATA_SOURCE_MOCK) {
    return mode;
  }
  return "";
}

export function getDataSourceMode() {
  const storedMode = normalizeMode(readStoredMode());
  if (storedMode) return storedMode;

  const envMode = normalizeMode(process.env.VUE_APP_DATA_SOURCE);
  if (envMode) return envMode;

  return DATA_SOURCE_MOCK;
}

export function isMockDataEnabled() {
  return getDataSourceMode() === DATA_SOURCE_MOCK;
}

export function setDataSourceMode(mode) {
  if (typeof window === "undefined") return;
  const normalizedMode = normalizeMode(mode);
  if (!normalizedMode) return;
  localStorage.setItem(DATA_SOURCE_STORAGE_KEY, normalizedMode);
}

export function clearDataSourceMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DATA_SOURCE_STORAGE_KEY);
}

export {
  DATA_SOURCE_API,
  DATA_SOURCE_MOCK,
  DATA_SOURCE_STORAGE_KEY,
};
