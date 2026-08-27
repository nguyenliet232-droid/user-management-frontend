import { useState } from "react";

function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "register" : "login";
    const bodyData = isRegister
      ? { name, email, password }
      : { email, password };

    try {
      const res = await fetch(
        `https://user-management-backend-7clg.onrender.com/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        },
      );

      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          alert("🎉 Đăng ký thành công! Hãy đăng nhập.");
          setIsRegister(false);
        } else {
          alert(`👋 Chào mừng ${data.user.name} quay trở lại!`);
          localStorage.setItem("token", data.token);
          onLoginSuccess(data.user);
        }
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      alert("❌ Lỗi kết nối máy chủ!");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-2xl border border-slate-100">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
        {isRegister ? "📝 Đăng Ký Tài Khoản" : "🔐 Đăng Nhập Hệ Thống"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ tên
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="example@gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200"
        >
          {isRegister ? "Đăng Ký Ngay" : "Đăng Nhập"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          {isRegister
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Đăng ký ngay"}
        </button>
      </div>
    </div>
  );
}

export default Auth;
