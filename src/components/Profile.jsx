import { useState, useEffect } from "react";

function Profile({ currentUser, onUpdateSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // States cho đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          "https://user-management-backend-7clg.onrender.com/api/users/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        if (res.ok) {
          setName(data.name || "");
          setEmail(data.email || "");
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // 1. Cập nhật tên
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMsg("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/users/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setProfileMsg("🎉 Cập nhật thông tin thành công!");
        setIsProfileSuccess(true);
        if (onUpdateSuccess) onUpdateSuccess(data);
      } else {
        setProfileMsg(`❌ ${data.message || "Cập nhật thất bại!"}`);
        setIsProfileSuccess(false);
      }
    } catch {
      setProfileMsg("❌ Lỗi kết nối máy chủ!");
      setIsProfileSuccess(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 2. Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg("");

    if (newPassword !== confirmPassword) {
      setPasswordMsg("❌ Mật khẩu mới và Xác nhận mật khẩu không khớp!");
      setIsPasswordSuccess(false);
      return;
    }

    setLoadingPassword(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg(`🎉 ${data.message}`);
        setIsPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg(`❌ ${data.message}`);
        setIsPasswordSuccess(false);
      }
    } catch {
      setPasswordMsg("❌ Lỗi kết nối máy chủ!");
      setIsPasswordSuccess(false);
    } finally {
      setLoadingPassword(false);
    }
  };

  // Hàm lấy URL avatar: Ưu tiên dùng avatar user nhập -> Nếu không có thì tự tạo theo tên
  const getAvatarUrl = (user) => {
    if (user?.avatar) return user.avatar;
    const name = user?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      {/* CARD 1: CẬP NHẬT TÊN */}
      <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          👤 Thông Tin Cá Nhân
        </h2>

        {profileMsg && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${
              isProfileSuccess
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email (Không thể sửa)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
            />
          </div>

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

          <button
            type="submit"
            disabled={loadingProfile}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loadingProfile ? "Đang lưu..." : "Cập Nhật Thông Tin"}
          </button>
        </form>
      </div>

      {/* CARD 2: ĐỔI MẬT KHẨU */}
      <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          🔑 Đổi Mật Khẩu
        </h2>

        {passwordMsg && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${
              isPasswordSuccess
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {passwordMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
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
          {/* Giao diện hiển thị */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={getAvatarUrl(currentUser)}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loadingPassword ? "Đang xử lý..." : "Đổi Mật Khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
