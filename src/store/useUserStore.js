import { create } from "zustand";

const API_URL = "http://localhost:5000/api/users";

export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Không thể tải dữ liệu! ");
      const data = await res.json();
      set({ users: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addUser: async (name, email) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        get().fetchUsers();
        return true;
      }
    } catch (err) {
      alert("❌ Lỗi khi thêm người dùng!");
    }
    return false;
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        get().fetchUsers();
      }
    } catch (err) {
      alert("❌ Lỗi khi xáo");
    }
  },
}));
