import { create } from "zustand";

const API_URL = "https://user-management-backend-7clg.onrender.com/api";

export const useUserStore = create((set, get) => ({
  users: [],
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại!");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, users: [] });
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      // Lấy token từ state hoặc trực tiếp từ localStorage
      const token = get().token || localStorage.getItem("token");

      const res = await fetch(`${API_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Lỗi server: ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : [];
      const users = Array.isArray(data) ? data : data.users || [];

      set({ users, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  deleteUser: async (id) => {
    if (!id) {
      set({ error: "Không tìm thấy người dùng!" });
      return false;
    }

    const token = get().token || localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };

      if (res.ok) {
        await get().fetchUsers();
        return true;
      }

      throw new Error(data.message || "Không thể xóa người dùng!");
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      set({ error: err.message });
      return false;
    }
  },
}));
