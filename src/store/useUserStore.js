import { create } from "zustand";

const API_URL = "https://user-management-backend-7clg.onrender.com/api";

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    if (user && typeof user === "object" && !Array.isArray(user)) {
      return user;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  localStorage.removeItem("user");
  return null;
};

const readResponseBody = async (response) => {
  const body = await response.text();
  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) return { message: body };
    throw error;
  }
};

const getErrorMessage = (error, fallback) =>
  error instanceof Error ? error.message : fallback;

export const useUserStore = create((set, get) => ({
  users: [],
  user: getStoredUser(),
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

      const data = await readResponseBody(res);
      if (!res.ok) throw new Error(data?.message || "Đăng nhập thất bại!");
      if (
        typeof data?.token !== "string" ||
        !data.token ||
        !data.user ||
        typeof data.user !== "object" ||
        Array.isArray(data.user)
      ) {
        throw new Error("Phản hồi đăng nhập không hợp lệ.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Đăng nhập thất bại!"),
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, users: [], loading: false, error: null });
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const token = get().token || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        throw new Error(data?.message || `Lỗi server: ${res.status}`);
      }

      const users = Array.isArray(data) ? data : data?.users;
      if (!Array.isArray(users)) {
        throw new Error("Dữ liệu người dùng không hợp lệ.");
      }

      set({ users, loading: false });
      return true;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Không thể tải danh sách người dùng."),
        loading: false,
      });
      return false;
    }
  },

  deleteUser: async (id) => {
    if (id === null || id === undefined || id === "") {
      set({ error: "Không tìm thấy người dùng!" });
      return false;
    }

    const token = get().token || localStorage.getItem("token");
    if (!token) {
      set({ error: "Vui lòng đăng nhập để xóa người dùng." });
      return false;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await readResponseBody(res);

      if (!res.ok) {
        throw new Error(data?.message || "Không thể xóa người dùng!");
      }

      await get().fetchUsers();
      return true;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Không thể xóa người dùng!"),
        loading: false,
      });
      return false;
    }
  },
}));
