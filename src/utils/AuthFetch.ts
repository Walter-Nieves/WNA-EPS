 import type { NavigateFunction } from "react-router-dom";

async function authFetch(
  url: string,
  options: RequestInit = {},
  navigate: NavigateFunction
): Promise<Response | null> {
  const resp = await fetch(url, {
    ...options,
    credentials: "include", // 🔥 cookies
  });

  if (resp.status !== 401) {
    return resp;
  }

  // ⛔ Access token expirado → intentar refresh
  const refreshResp = await fetch(
    import.meta.env.VITE_BACKEND + "/auth/refresh",
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!refreshResp.ok) {
    navigate("/login");
    return null;
  }

  // 🔁 Reintentar request original
  return fetch(url, {
    ...options,
    credentials: "include",
  });
}

export default authFetch;
