import { useState, useEffect, useRef } from "react";

function Profile({ currentUser, onUpdateSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Reference cho input chọn file ảnh
  const fileInputRef = useRef(null);

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
          setAvatar(data.avatar || "");
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Kích hoạt cửa sổ chọn file khi click vào ảnh
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Đọc file ảnh và chuyển sang chuỗi Base64
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg("❌ Vui lòng chọn ảnh dung lượng dưới 2MB!");
      setIsProfileSuccess(false);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setAvatar(base64Image);
      await uploadAvatarToBackend(base64Image);
    };
  };

  // Gửi ảnh đại diện lên Render
  const uploadAvatarToBackend = async (base64Image) => {
    setLoadingProfile(true);
    setProfileMsg("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/users/avatar",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl: base64Image }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setProfileMsg("🎉 Cập nhật ảnh đại diện thành công!");
        setIsProfileSuccess(true);

        // 1. Tạo object user mới chứa avatar
        const updatedUser = { ...currentUser, avatar: base64Image };

        // 2. Lưu vào LocalStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // 3. Truyền updatedUser ra ngoài cho App/Header cập nhật
        if (onUpdateSuccess) onUpdateSuccess(updatedUser);
      } else {
        setProfileMsg(`❌ ${data.message || "Cập nhật ảnh thất bại!"}`);
        setIsProfileSuccess(false);
      }
    } catch {
      setProfileMsg("❌ Lỗi kết nối máy chủ!");
      setIsProfileSuccess(false);
    } finally {
      setLoadingProfile(false);
    }
  };

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

  // Tạo URL avatar mặc định nếu chưa có ảnh
  const getAvatarUrl = () => {
    if (avatar) return avatar;
    const displayName = name || currentUser?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=random&color=fff&size=128`;
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      {/* CARD 1: CẬP NHẬT THÔNG TIN CÁ NHÂN & AVATAR */}
      <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          👤 Thông Tin Cá Nhân
        </h2>

        {/* Khung hiển thị Avatar & Bấm để đổi */}
        <div className="flex flex-col items-center justify-center mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={handleImageClick}
            className="relative cursor-pointer group w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg"
          >
            <img
              src={getAvatarUrl()}
              alt="Avatar"
              className="w-full h-full object-cover group-hover:opacity-75 transition duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
              <span className="text-white text-xs font-semibold">Đổi ảnh</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Bấm vào ảnh để thay đổi</p>
        </div>

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
