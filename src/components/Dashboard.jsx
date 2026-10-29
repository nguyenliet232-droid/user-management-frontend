import { useState, useEffect } from "react";

export default function Dashboard({ user, onLogout, onUserUpdate, showToast }) {
  const [activeTab, setActiveTab] = useState("vipOrders");
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vipOrders, setVipOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const BASE_URL = "http://localhost:5001";
  const token =
    localStorage.getItem("token") || localStorage.getItem("movie_token");

  const fetchVipOrders = async () => {
    if (user?.role !== "admin") return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/vip-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVipOrders(data);
      }
    } catch (err) {
      console.error("Lỗi tải đơn VIP:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "vipOrders") {
      fetchVipOrders();
    }
  }, [activeTab]);

  const handleVipAction = async (orderId, action) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/vip-orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast(data.message, "success");
        else alert(data.message);
        fetchVipOrders();
      } else {
        if (showToast) showToast(data.message || "Thất bại!", "error");
        else alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/users/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatar }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };
      if (res.ok) {
        setMessage("✨ Cập nhật thông tin thành công!");
        setIsSuccess(true);
        if (onUserUpdate) onUserUpdate(data.user);
      } else {
        setMessage(`❌ ${data.message || "Cập nhật thất bại!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp!");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };
      if (res.ok) {
        setMessage("✨ Đổi mật khẩu thành công!");
        setIsSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(`❌ ${data.message || "Đổi mật khẩu thất bại!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <img
            src={
              user?.avatar ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user?.name || "User")
            }
            alt="Avatar"
            className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user?.name}</h1>
              {user?.role === "admin" && (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 font-medium rounded-xl text-xs transition cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>

      <div className="flex space-x-4 mt-6 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("profile");
            setMessage("");
          }}
          className={`pb-3 text-xs font-semibold transition cursor-pointer ${
            activeTab === "profile"
              ? "border-b-2 border-indigo-500 text-indigo-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          👤 Thông Tin Cá Nhân
        </button>
        <button
          onClick={() => {
            setActiveTab("changePassword");
            setMessage("");
          }}
          className={`pb-3 text-xs font-semibold transition cursor-pointer ${
            activeTab === "changePassword"
              ? "border-b-2 border-indigo-500 text-indigo-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🔒 Đổi Mật Khẩu
        </button>

        {user?.role === "admin" && (
          <button
            onClick={() => {
              setActiveTab("vipOrders");
              setMessage("");
            }}
            className={`pb-3 text-xs font-semibold transition cursor-pointer ${
              activeTab === "vipOrders"
                ? "border-b-2 border-yellow-500 text-yellow-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            👑 Quản Lý Đơn VIP
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs font-medium text-center ${isSuccess ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}
        >
          {message}
        </div>
      )}

      {activeTab === "profile" && (
        <form
          onSubmit={handleUpdateProfile}
          className="space-y-4 mt-6 max-w-xl mx-auto"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Email (Không thể sửa)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              URL Ảnh Đại Diện (Avatar)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Cập Nhật Hồ Sơ"}
          </button>
        </form>
      )}

      {activeTab === "changePassword" && (
        <form
          onSubmit={handleChangePassword}
          className="space-y-4 mt-6 max-w-xl mx-auto"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Mật khẩu mới (tối thiểu 6 ký tự)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
          </button>
        </form>
      )}

      {activeTab === "vipOrders" && user?.role === "admin" && (
        <div className="mt-6 space-y-4">
          <h2 className="text-base font-bold text-yellow-400">
            👑 Danh Sách Đơn Yêu Cầu Nâng Cấp VIP
          </h2>
          {loadingOrders ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Đang tải danh sách đơn hàng...
            </p>
          ) : vipOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Chưa có đơn yêu cầu nâng cấp VIP nào.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-300 font-bold">
                  <tr>
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Gói</th>
                    <th className="p-3">Số tiền</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vipOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold">{order.userName}</td>
                      <td className="p-3 text-slate-400">{order.userEmail}</td>
                      <td className="p-3 text-yellow-400 font-bold">
                        {order.packageType === "1_month"
                          ? "1 Tháng"
                          : order.packageType === "6_months"
                            ? "6 Tháng"
                            : "Trọn Đời"}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">
                        {order.amount?.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            order.status === "pending"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : order.status === "approved"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {order.status === "pending"
                            ? "⏳ Chờ duyệt"
                            : order.status === "approved"
                              ? "✅ Đã duyệt"
                              : "❌ Từ chối"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {order.status === "pending" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleVipAction(order._id, "approve")
                              }
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                handleVipAction(order._id, "reject")
                              }
                              className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 font-bold rounded-lg transition cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
