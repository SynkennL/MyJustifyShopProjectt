const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

function headers(json = true) {
  const token = getToken();
  const h: Record<string,string> = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });
  return res.json();
}
