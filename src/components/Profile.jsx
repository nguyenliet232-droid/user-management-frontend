import { useState, useRef } from "react";

function Profile({ currentUser, onUpdateSuccess }) {
  // States cho cập nhật thông tin & avatar
  const [name, setName] = useState(currentUser?.name || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // States cho đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef(null);

  // 📍 1. Hàm nén ảnh tự động trước khi chuyển Base64 (Bước 1)
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
          } else {
            if (height > maxWidth) {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
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

  // 📍 2. Xử lý khi người dùng chọn file ảnh
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chỉ chọn file hình ảnh!");
      return;
    }

    try {
      setLoading(true);
      const compressedBase64 = await compressImage(file);
      await uploadAvatarToBackend(compressedBase64);
    } catch (error) {
      console.error("Lỗi khi nén ảnh:", error);
      setProfileMsg("❌ Lỗi nén ảnh, vui lòng thử lại!");
      setIsProfileSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // 📍 3. Upload chuỗi Base64 lên Backend
  const uploadAvatarToBackend = async (base64Image) => {
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
          body: JSON.stringify({ avatar: base64Image, name }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setProfileMsg("🎉 Cập nhật ảnh đại diện thành công!");
        setIsProfileSuccess(true);

        const updatedUser = { ...currentUser, avatar: base64Image, name };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (onUpdateSuccess) onUpdateSuccess(updatedUser);
      } else {
        setProfileMsg(`❌ ${data.message || "Cập nhật ảnh thất bại!"}`);
        setIsProfileSuccess(false);
      }
    } catch {
      setProfileMsg("❌ Lỗi kết nối đến máy chủ!");
      setIsProfileSuccess(false);
    }
  };

  // 📍 4. Hàm xử lý cập nhật tên
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await uploadAvatarToBackend(currentUser?.avatar);
  };

  // 📍 5. Xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("❌ Vui lòng nhập đầy đủ mật khẩu cũ và mới!");
      setIsPasswordSuccess(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg("❌ Mật khẩu mới và Xác nhận mật khẩu không khớp!");
      setIsPasswordSuccess(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg("❌ Mật khẩu mới phải có ít nhất 6 ký tự!");
      setIsPasswordSuccess(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg("🎉 Đổi mật khẩu thành công!");
        setIsPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMsg(`❌ ${data.message || "Đổi mật khẩu thất bại!"}`);
        setIsPasswordSuccess(false);
      }
    } catch (err) {
      setPasswordMsg("❌ Lỗi kết nối đến máy chủ!");
      setIsPasswordSuccess(false);
    }
  };

  // 📍 6. Lấy URL Avatar hiển thị
  const getAvatarSrc = () => {
    if (currentUser?.avatar) return currentUser.avatar;
    const displayName = currentUser?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=random&color=fff&size=128`;
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h3 className="text-xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
        👤 Quản Lý Tài Khoản
      </h3>

      {/* Khung Avatar */}
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
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition">
            {loading ? "Đang nén..." : "Đổi ảnh"}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Bấm vào hình ảnh để thay đổi
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
          className={`p-2 text-sm rounded-lg text-center ${
            isProfileSuccess
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {profileMsg}
        </p>
      )}

      {/* Form Cập Nhật Thông Tin */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={currentUser?.email || ""}
            disabled
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition text-sm"
        >
          Cập Nhật Thông Tin
        </button>
      </form>

      <hr className="my-6 border-slate-200" />

      {/* Form Đổi Mật Khẩu */}
      <div className="space-y-4">
        <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
          🔒 Đổi Mật Khẩu
        </h4>

        {passwordMsg && (
          <p
            className={`p-2 text-sm rounded-lg text-center ${
              isPasswordSuccess
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {passwordMsg}
          </p>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow transition text-sm"
          >
            Đổi Mật Khẩu
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
