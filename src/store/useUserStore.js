import { create } from "zustand";

// Link API công khai Backend
const API_URL = "https://user-management-backend-7clg.onrender.com/api";

export const useUserStore = create((set, get) => ({
  users: [],
  // 📍 1. Lấy thông tin user & token đã lưu từ localStorage khi khởi chạy
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // 📍 2. Hàm Đăng Nhập (Login)
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

      // Lưu Token và User (bao gồm role: "admin") vào localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // 📍 3. Hàm Đăng Xuất (Logout)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, users: [] });
  },

  // 📍 4. Lấy danh sách người dùng
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/users`);
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

  // 📍 5. Hàm Xóa Người Dùng (Đã bổ sung Authorization Header để gửi Token)
  deleteUser: async (id) => {
    if (!id) {
      set({ error: "Không tìm thấy mã người dùng!" });
      return false;
    }

    const token = get().token || localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 Bắt buộc phải có token này thì Backend mới cho xóa
        },
      });

      const data = await res.json();

      if (res.ok) {
        await get().fetchUsers(); // Tải lại danh sách sau khi xóa thành công
        return true;
      } else {
        throw new Error(data.message || "Không thể xóa người dùng!");
      }
    } catch (err) {
      alert(`❌ ${err.message}`);
      set({ error: err.message });
      return false;
    }
  },
}));
