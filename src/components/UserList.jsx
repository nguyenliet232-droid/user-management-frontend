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
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'vip', 'free'

  // 📍 Modal xem chi tiết WatchHistory & Favorites của user
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // 📍 1. State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng người dùng trên mỗi trang

  // 📍 Lấy thông tin người dùng đang đăng nhập
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = storeUser || localUser;

  // 📍 Kiểm tra quyền Admin
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // Trì hoãn xử lý tìm kiếm 400ms
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc danh sách theo Tên, Email và Trạng thái VIP/Free
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(debouncedSearch.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "vip") matchesStatus = u.isVip;
    else if (filterStatus === "free") matchesStatus = !u.isVip;

    return matchesSearch && matchesStatus;
  });

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
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center justify-between">
        <span>📋 Danh Sách Người Dùng ({filteredUsers.length})</span>
        {isAdmin && (
          <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold">
            🛡️ Quyền Admin
          </span>
        )}
      </h3>

      {/* Bộ công cụ Tìm kiếm & Lọc trạng thái */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 outline-none cursor-pointer"
        >
          <option value="all">🌟 Tất cả trạng thái</option>
          <option value="vip">👑 Chỉ tài khoản VIP</option>
          <option value="free">👤 Chỉ tài khoản Free</option>
        </select>
      </div>

      {loading && <p className="text-slate-500 text-xs">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500 text-xs">Lỗi: {error}</p>}

      <ul className="divide-y divide-slate-100">
        {currentUsers.map((u) => {
          const userId = u._id || u.id;
          const currentUserId = currentUser._id || currentUser.id;
          const isSelf = userId === currentUserId;

          return (
            <li
              key={userId}
              className="py-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              {/* Khung hiển thị Avatar + Thông tin + Huy hiệu VIP */}
              <div className="flex items-center gap-3">
                <img
                  src={getUserAvatar(u)}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">
                      {u.name}
                    </span>
                    {u.role?.toLowerCase() === "admin" && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        ADMIN
                      </span>
                    )}
                    {u.isVip ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                        👑{" "}
                        {u.vipType === "lifetime"
                          ? "VIP Trọn Đời"
                          : u.vipType === "6_months"
                            ? "VIP 6 Tháng"
                            : "VIP 1 Tháng"}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        👤 Free
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{u.email}</p>

                  {/* Hiển thị thời hạn hết hạn VIP nếu có */}
                  {u.isVip && u.vipExpireDate && (
                    <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
                      Hết hạn:{" "}
                      {new Date(u.vipExpireDate).toLocaleDateString("vi-VN")}
                    </p>
                  )}

                  {/* Nút mở Modal xem lịch sử xem phim / yêu thích */}
                  <button
                    onClick={() => setSelectedUserDetail(u)}
                    className="text-[11px] text-indigo-600 hover:underline font-medium mt-1 cursor-pointer inline-block"
                  >
                    📁 Xem lịch sử & yêu thích ➔
                  </button>
                </div>
              </div>

              {/* Nút Xóa (Chỉ hiện nếu là Admin và không phải tự xóa chính mình) */}
              {isAdmin && !isSelf && (
                <button
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn xóa ${u.name}?`)) {
                      deleteUser(userId);
                    }
                  }}
                  className="self-end sm:self-center px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-md transition cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {!loading && !error && filteredUsers.length === 0 && (
        <p className="py-6 text-center text-slate-500 text-xs">
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

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              ◀ Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
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
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Sau ▶
            </button>
          </div>
        </div>
      )}

      {/* 📍 Modal xem chi tiết Lịch sử xem & Yêu thích của User */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">
                📁 Chi tiết: {selectedUserDetail.name}
              </h4>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto text-xs">
              <div>
                <p className="font-bold text-amber-600 mb-1">
                  ⭐ Phim yêu thích ({selectedUserDetail.favorites?.length || 0}
                  ):
                </p>
                {selectedUserDetail.favorites?.length > 0 ? (
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {selectedUserDetail.favorites.map((fav, index) => (
                      <li key={index}>
                        {typeof fav === "object"
                          ? fav.title
                          : `Movie ID: ${fav}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">
                    Chưa có phim yêu thích nào.
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="font-bold text-emerald-600 mb-1">
                  📜 Lịch sử xem phim (
                  {selectedUserDetail.watchHistory?.length || 0}):
                </p>
                {selectedUserDetail.watchHistory?.length > 0 ? (
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {selectedUserDetail.watchHistory.map((his, index) => (
                      <li key={index}>
                        {typeof his === "object"
                          ? his.title
                          : `Movie ID: ${his}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">
                    Chưa có lịch sử xem phim.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedUserDetail(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
