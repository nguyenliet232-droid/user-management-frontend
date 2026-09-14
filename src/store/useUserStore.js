import { create } from "zustand";

// Link API công khai đã được Deploy lên Render
const API_URL = "https://user-management-backend-7clg.onrender.com/api/users";

export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Không thể tải dữ liệu!");
      const data = await res.json();
      const users = Array.isArray(data) ? data : data.users;
      if (!Array.isArray(users)) {
        throw new Error("Dữ liệu người dùng không hợp lệ!");
      }
      set({ users, loading: false });
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
    } catch {
      alert("❌ Lỗi khi thêm người dùng!");
    }
    return false;
  },

  deleteUser: async (id) => {
    if (!id) {
      set({ error: "Không tìm thấy mã người dùng!" });
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        await get().fetchUsers();
        return true;
      }
      throw new Error("Không thể xóa người dùng!");
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },
}));
