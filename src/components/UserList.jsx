import { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import useDebounce from "../hooks/useDebounce";

function UserList() {
  const { users, loading, error, fetchUsers, deleteUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Trì hoãn xử lý tìm kiếm 400ms để tránh giật lag
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc danh sách theo Tên hoặc Email
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-slate-800">
        📋 Danh Sách Người Dùng
      </h3>

      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="🔍 Tìm kiếm theo tên hoặc email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      {loading && <p className="text-slate-500">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}

      <ul className="divide-y divide-slate-100">
        {filteredUsers.map((u) => (
          <li
            key={u._id || u.id}
            className="py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-slate-700">{u.name}</p>
              <p className="text-sm text-slate-500">{u.email}</p>
            </div>
            <button
              onClick={() => deleteUser(u._id || u.id)}
              className="px-3 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 font-medium rounded-md transition"
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
