import { useState, useRef } from "react";
import { API_URL } from "../config/api";

function Profile({ currentUser, onUpdateSuccess }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef(null);

  // Nén ảnh trước khi upload để tối ưu dung lượng
  const compressImage = (file, maxWidth = 300, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!");
      return;
    }

    try {
      setLoading(true);
      const compressedBase64 = await compressImage(file);
      await updateProfileBackend(compressedBase64, name);
    } catch (error) {
      console.error("Lỗi khi nén ảnh:", error);
      setProfileMsg("❌ Lỗi nén ảnh, vui lòng thử lại!");
      setIsProfileSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API cập nhật thông tin (Tên và Avatar)
  const updateProfileBackend = async (newAvatar, newName) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("movie_token");
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: newAvatar, name: newName }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };

      if (res.ok) {
        setProfileMsg("? C?p nh?t h? s? th?nh c?ng!");
        setIsProfileSuccess(true);

        const updatedUser = {
          ...currentUser,
          avatar: newAvatar,
          name: newName,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (onUpdateSuccess) onUpdateSuccess(updatedUser);
      } else {
        setProfileMsg(`? ${data.message || "C?p nh?t th?t b?i!"}`);
        setIsProfileSuccess(false);
      }
    } catch {
      setProfileMsg("? L?i k?t n?i ??n m?y ch?!");
      setIsProfileSuccess(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfileBackend(currentUser?.avatar, name);
    setLoading(false);
  };

  // Hàm đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("? Vui l?ng nh?p ??y ?? th?ng tin m?t kh?u!");
      setIsPasswordSuccess(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg("? M?t kh?u m?i v? X?c nh?n m?t kh?u kh?ng kh?p!");
      setIsPasswordSuccess(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg("? M?t kh?u m?i ph?i ch?a ?t nh?t 6 k? t?!");
      setIsPasswordSuccess(false);
      return;
    }

    const token =
      localStorage.getItem("token") || localStorage.getItem("movie_token");
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };

      if (res.ok) {
        setPasswordMsg("? ??i m?t kh?u th?nh c?ng!");
        setIsPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg(`? ${data.message || "??i m?t kh?u th?t b?i!"}`);
        setIsPasswordSuccess(false);
      }
    } catch {
      setPasswordMsg("? L?i k?t n?i ??n m?y ch?!");
      setIsPasswordSuccess(false);
    }
  };

  const getAvatarSrc = () => {
    if (currentUser?.avatar) return currentUser.avatar;
    const displayName = currentUser?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl space-y-8">
      <h3 className="text-xl font-bold text-center text-slate-800">
        🛡️ Hồ Sơ Admin & Cài Đặt
      </h3>

      {/* Phần Avatar */}
      <div className="flex flex-col items-center">
        <div
          onClick={() => fileInputRef.current.click()}
          className="relative group cursor-pointer"
        >
          <img
            src={getAvatarSrc()}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-md group-hover:opacity-80 transition"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition">
            {loading ? "Đang tải..." : "Đổi ảnh"}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Bấm vào hình ảnh để thay đổi ảnh đại diện
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {profileMsg && (
        <p
          className={`p-2.5 text-xs rounded-lg text-center font-medium ${
            isProfileSuccess
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {profileMsg}
        </p>
      )}

      {/* Form Cập nhật Họ tên */}
      <form
        onSubmit={handleUpdateName}
        className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
      >
        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Thông tin hiển thị
        </h4>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Nhập họ và tên..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow transition cursor-pointer disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Cập Nhật Tên"}
        </button>
      </form>

      {/* Form Đổi mật khẩu */}
      <form
        onSubmit={handleChangePassword}
        className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
      >
        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Bảo mật tài khoản
        </h4>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              {showCurrentPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              {showNewPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              {showConfirmPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        {passwordMsg && (
          <p
            className={`p-2.5 text-xs rounded-lg text-center font-medium ${
              isPasswordSuccess
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {passwordMsg}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow transition cursor-pointer"
        >
          Đổi Mật Khẩu
        </button>
      </form>
    </div>
  );
}

export default Profile;
