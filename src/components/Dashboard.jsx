import { useState } from "react";

function Dashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "changePassword"

  // State cập nhật thông tin
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // State đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State ẩn/hiện mật khẩu
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // State thông báo
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://user-management-backend-7clg.onrender.com";
  const token = localStorage.getItem("token");

  // 📍 1. Cập nhật thông tin cá nhân (Tên / Avatar)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(treu);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, avatar }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("🎉 Cập nhật thông tin thành công!");
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

  // 📍 2. Đổi mật khẩu
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
      const res = await fetch(`${BASE_URL}/api/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("🎉 Đổi mật khẩu thành công!");
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
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      {/* Header Dashboard */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <img
            src={
              user?.avatar ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user?.name || "User")
            }
            alt="Avatar"
            className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800">{user?.name}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-sm transition"
        >
          Đăng xuất 👋
        </button>
      </div>

      {/* Tabs Chức năng */}
      <div className="flex space-x-4 mt-6 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("profile");
            setMessage("");
          }}
          className={`pb-3 text-sm font-semibold transition ${
            activeTab === "profile"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          👤 Thông Tin Cá Nhân
        </button>
        <button
          onClick={() => {
            setActiveTab("changePassword");
            setMessage("");
          }}
          className={`pb-3 text-sm font-semibold transition ${
            activeTab === "changePassword"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🔒 Đổi Mật Khẩu
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium text-center ${
            isSuccess
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Nội dung Tab 1: Cập nhật Hồ sơ */}
      {activeTab === "profile" && (
        <form onSubmit={handleUpdateProfile} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email (Không thể sửa)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              URL Ảnh Đại Diện (Avatar)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Cập Nhật Hồ Sơ"}
          </button>
        </form>
      )}

      {/* Nội dung Tab 2: Đổi mật khẩu */}
      {activeTab === "changePassword" && (
        <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showOldPass ? "text" : "password"}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
              >
                {showOldPass ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
              >
                {showNewPass ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
          </button>
        </form>
      )}
    </div>
  );
}
