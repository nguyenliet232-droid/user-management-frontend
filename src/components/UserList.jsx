import { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { useDebounce } from "../hooks/useDebounce";
import { API_URL } from "../config/api";

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

  const handleRevokeVip = async (userId, userEmail) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn hủy quyền VIP của tài khoản ${userEmail}?`,
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("movie_token");

      const res = await fetch(
        `${API_URL}/users/${encodeURIComponent(userId)}/revoke-vip`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(data.message || "Không thể hủy VIP!");
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert("Lỗi kết nối đến máy chủ khi hủy VIP!");
    }
  };

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
    <div className="max-w-4xl mx-auto my-6 p-6 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800">
      <h3 className="text-base font-bold mb-6 text-white flex items-center justify-between pb-4 border-b border-slate-800">
        <span>📋 Danh Sách Người Dùng ({filteredUsers.length})</span>
        {isAdmin && (
          <span className="text-[10px] px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase">
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
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all" className="bg-slate-900">
            🌟 Tất cả trạng thái
          </option>
          <option value="vip" className="bg-slate-900">
            👑 Chỉ tài khoản VIP
          </option>
          <option value="free" className="bg-slate-900">
            👤 Chỉ tài khoản Free
          </option>
        </select>
      </div>

      {loading && (
        <p className="text-slate-400 text-xs text-center py-4">
          Đang tải dữ liệu...
        </p>
      )}
      {error && (
        <p className="text-red-400 text-xs text-center py-4">Lỗi: {error}</p>
      )}

      <ul className="space-y-3">
        {currentUsers.map((u) => {
          const userId = u._id || u.id;
          const currentUserId = currentUser._id || currentUser.id;
          const isSelf = userId === currentUserId;

          return (
            <li
              key={userId}
              className="p-4 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition"
            >
              {/* Khung hiển thị Avatar + Thông tin + Huy hiệu VIP */}
              <div className="flex items-center gap-3.5">
                <img
                  src={getUserAvatar(u)}
                  alt={u.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-sm flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-100 text-sm">
                      {u.name}
                    </span>
                    {u.role?.toLowerCase() === "admin" && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                        ADMIN
                      </span>
                    )}
                    {u.isVip ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                        👑{" "}
                        {u.vipType === "lifetime"
                          ? "VIP Trọn Đời"
                          : u.vipType === "6_months"
                            ? "VIP 6 Tháng"
                            : "VIP 1 Tháng"}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                        👤 Free
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>

                  {/* Hiển thị thời hạn hết hạn VIP nếu có */}
                  {u.isVip && u.vipExpireDate && (
                    <p className="text-[10px] text-amber-400/90 mt-1 font-medium">
                      Hết hạn:{" "}
                      {new Date(u.vipExpireDate).toLocaleDateString("vi-VN")}
                    </p>
                  )}

                  {/* Nút mở Modal xem lịch sử xem phim / yêu thích */}
                  <button
                    onClick={() => setSelectedUserDetail(u)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-medium mt-1.5 cursor-pointer inline-block"
                  >
                    📁 Xem lịch sử & yêu thích ➔
                  </button>
                </div>
              </div>

              {/* Các thao tác Admin (Hủy VIP & Xóa) */}
              {isAdmin && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {u.isVip && (
                    <button
                      onClick={() => handleRevokeVip(userId, u.email)}
                      className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-medium rounded-xl transition cursor-pointer"
                    >
                      Hủy VIP
                    </button>
                  )}

                  {!isSelf && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa ${u.name}?`)) {
                          deleteUser(userId);
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-medium rounded-xl transition cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {!loading && !error && filteredUsers.length === 0 && (
        <p className="py-8 text-center text-slate-400 text-xs">
          Không tìm thấy người dùng phù hợp.
        </p>
      )}

      {/* 📍 3. Thanh điều hướng Phân trang (Pagination) */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Trang <span className="font-bold text-white">{currentPage}</span> /{" "}
            {totalPages} (Tổng {filteredUsers.length} người dùng)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              ◀ Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  currentPage === page
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Sau ▶
            </button>
          </div>
        </div>
      )}

      {/* 📍 Modal xem chi tiết Lịch sử xem & Yêu thích của User */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-indigo-400">
                📁 Chi tiết: {selectedUserDetail.name}
              </h4>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-white font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto text-xs pr-1">
              <div>
                <p className="font-bold text-amber-400 mb-1.5">
                  ⭐ Phim yêu thích ({selectedUserDetail.favorites?.length || 0}
                  ):
                </p>
                {selectedUserDetail.favorites?.length > 0 ? (
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {selectedUserDetail.favorites.map((fav, index) => (
                      <li key={index}>
                        {typeof fav === "object"
                          ? fav.title
                          : `Movie ID: ${fav}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">
                    Chưa có phim yêu thích nào.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="font-bold text-emerald-400 mb-1.5">
                  📜 Lịch sử xem phim (
                  {selectedUserDetail.watchHistory?.length || 0}):
                </p>
                {selectedUserDetail.watchHistory?.length > 0 ? (
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {selectedUserDetail.watchHistory.map((his, index) => (
                      <li key={index}>
                        {typeof his === "object"
                          ? his.title
                          : `Movie ID: ${his}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">
                    Chưa có lịch sử xem phim.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedUserDetail(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-lg"
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
