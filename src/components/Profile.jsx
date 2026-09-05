import { useState, useEffect } from "react";

function Profile({ onUpdateSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Tự động lấy thông tin Profile khi mở trang
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Bạn chưa đăng nhập!");
        setIsSuccess(false);
        return;
      }

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
        } else {
          setMessage(data.message || "Không thể lấy thông tin người dùng!");
          setIsSuccess(false);
        }
      } catch (err) {
        setMessage("Lỗi kết nối máy chủ!");
        setIsSuccess(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Xử lý cập nhật thông tin (Họ tên)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
        setMessage("🎉 Cập nhật thông tin thành công!");
        setIsSuccess(true);
        if (onUpdateSuccess) onUpdateSuccess(data);
      } else {
        setMessage(`❌ ${data.message || "Cập nhật thất bại!"}`);
        setIsSuccess(false);
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-2xl border border-slate-100">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
        👤 Quản Lý Tài Khoản
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${
            isSuccess
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email (Không thể thay đổi)
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
            placeholder="Nhập họ tên mới"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Cập Nhật Thông Tin"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
