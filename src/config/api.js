const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL ||
  "https://user-management-backend-7clg.onrender.com";

export const API_URL = `${API_ORIGIN.replace(/\/+$/, "")}/api`;
