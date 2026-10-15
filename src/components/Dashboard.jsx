import { useState } from "react";

export default function Dashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://user-management-backend-7clg.onrender.com";
  const token = localStorage.getItem("token");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatar }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: await res.text() || `HTTP ${res.status}` };
      if (res.ok) {
        setMessage("?? C?p nh?t th?ng tin th?nh c?ng!");
        setIsSuccess(true);
        if (onUserUpdate) onUserUpdate(data.user);
      } else {
        setMessage(`? ${data.message || "C?p nh?t th?t b?i!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("? L?i k?t n?i m?y ch?!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("? M?t kh?u x?c nh?n kh?ng kh?p!");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: await res.text() || `HTTP ${res.status}` };
      if (res.ok) {
        setMessage("?? ??i m?t kh?u th?nh c?ng!");
        setIsSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(`? ${data.message || "??i m?t kh?u th?t b?i!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("? L?i k?t n?i m?y ch?!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
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
          ??ng xu?t ??
        </button>
      </div>

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
          ?? Th?ng Tin C? Nh?n
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
          ?? ??i M?t Kh?u
        </button>
      </div>

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

      {activeTab === "profile" && (
        <form onSubmit={handleUpdateProfile} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              H? v? t?n
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
              URL ảnh đại Diện (Avatar)
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
    </div>
  );
}

