import { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { useDebounce } from "../hooks/useDebounce";

function UserList() {
  const {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    user: storeUser,
  } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");

  // 📍 1. State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng người dùng trên mỗi trang

  // 📍 Lấy thông tin người dùng đang đăng nhập (Ưu tiên từ Store -> LocalStorage)
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = storeUser || localUser;

  // 📍 Kiểm tra quyền Admin (Không phân biệt chữ hoa / chữ thường)
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // Trì hoãn xử lý tìm kiếm 400ms để tránh giật lag
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 📍 Reset về trang 1 mỗi khi người dùng tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Lọc danh sách theo Tên hoặc Email
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  // 📍 2. Tính toán phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Hàm lấy URL Avatar
  const getUserAvatar = (user) => {
    if (user?.avatar) return user.avatar;
    const displayName = user?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=random&color=fff&size=64`;
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center justify-between">
        <span>📋 Danh Sách Người Dùng</span>
        {isAdmin && (
          <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold">
            🛡️ Quyền Admin
          </span>
        )}
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
        {currentUsers.map((u) => {
          const userId = u._id || u.id;
          const currentUserId = currentUser._id || currentUser.id;
          const isSelf = userId === currentUserId;

          return (
            <li
              key={userId}
              className="py-3 flex justify-between items-center gap-3"
            >
              {/* Khung hiển thị Avatar + Thông tin người dùng */}
              <div className="flex items-center gap-3">
                <img
                  src={getUserAvatar(u)}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <p className="font-semibold text-slate-700 flex items-center gap-2">
                    {u.name}
                    {u.role?.toLowerCase() === "admin" && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                        ADMIN
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
              </div>

              {/* 📍 Chỉ hiển thị nút Xóa nếu là Admin và không phải tự xóa chính mình */}
              {isAdmin && !isSelf && (
                <button
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn xóa ${u.name}?`)) {
                      deleteUser(userId);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 font-medium rounded-md transition cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {!loading && !error && filteredUsers.length === 0 && (
        <p className="py-4 text-center text-slate-500">
          Không tìm thấy người dùng phù hợp.
        </p>
      )}

      {/* 📍 3. Thanh điều hướng Phân trang (Pagination) */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Trang <span className="font-bold">{currentPage}</span> /{" "}
            {totalPages} (Tổng {filteredUsers.length} người dùng)
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ◀ Trước
            </button>

            {/* Các nút bấm số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Sau ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
