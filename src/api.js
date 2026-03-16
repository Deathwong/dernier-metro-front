const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5001";

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || "Erreur serveur";
    throw new Error(message);
  }

  return data;
}

export function getStations() {
  return fetchJson("/stations");
}

export function getNextMetro(station) {
  const query = new URLSearchParams({ station });
  return fetchJson(`/next-metro?${query.toString()}`);
}

export { API_BASE_URL };
