import { useState, useRef } from "react";

function Profile({ currentUser, onUpdateSuccess }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef(null);

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
      alert("Vui l?ng ch? ch?n file h?nh ?nh!");
      return;
    }

    try {
      setLoading(true);
      const compressedBase64 = await compressImage(file);
      await uploadAvatarToBackend(compressedBase64);
    } catch (error) {
      console.error("L?i khi n?n ?nh:", error);
      setProfileMsg("? L?i n?n ?nh, vui l?ng th? l?i!");
      setIsProfileSuccess(false);
    } finally {
      setLoading(false);
    }
  };

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

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };
      if (res.ok) {
        setProfileMsg("?? C?p nh?t ?nh ??i di?n th?nh c?ng!");
        setIsProfileSuccess(true);

        const updatedUser = { ...currentUser, avatar: base64Image, name };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (onUpdateSuccess) onUpdateSuccess(updatedUser);
      } else {
        setProfileMsg(`? ${data.message || "C?p nh?t ?nh th?t b?i!"}`);
        setIsProfileSuccess(false);
      }
    } catch {
      setProfileMsg("? L?i k?t n?i ??n m?y ch?!");
      setIsProfileSuccess(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await uploadAvatarToBackend(currentUser?.avatar);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("? Vui lòng nhập mậy ?? m?t kh?u c? v? m?i!");
      setIsPasswordSuccess(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg("? M?t kh?u m?i v? X?c nh?n m?t kh?u kh?ng kh?p!");
      setIsPasswordSuccess(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg("? M?t kh?u m?i ph?i c? ?t nh?t 6 k? t?!");
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

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: (await res.text()) || `HTTP ${res.status}` };
      if (res.ok) {
        setPasswordMsg("?? ??i m?t kh?u th?nh c?ng!");
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
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h3 className="text-xl font-bold text-center text-slate-800 flex items-center justify-center gap-2">
        Quản Lý Tài Khoản
      </h3>

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
            {loading ? "?ang n?n..." : "??i ?nh"}
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

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-500"
            >
              {showCurrentPassword ? "??" : "???"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-500"
            >
              {showNewPassword ? "??" : "???"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-slate-500"
            >
              {showConfirmPassword ? "??" : "???"}
            </button>
          </div>
        </div>

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

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition"
        >
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}

export default Profile;
