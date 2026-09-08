import { useState } from "react";

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // States dữ liệu
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // 📍 1. Đăng nhập / Đăng ký
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const bodyData = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(
        `https://user-management-backend-7clg.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        },
      );

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("token", data.token);
          if (onLoginSuccess) onLoginSuccess(data.user);
        } else {
          setMessage("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
          setIsSuccess(true);
          setIsLogin(true);
        }
      } else {
        setMessage(`❌ ${data.message || "Thao tác thất bại!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // 📍 2. Yêu cầu gửi mã OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setMessage(`🎉 ${data.message}`);
        setIsSuccess(true);
        setOtpSent(true); // Chuyển sang form nhập OTP
      } else {
        setMessage(`❌ ${data.message}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // 📍 3. Xác nhận OTP & Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setMessage(`🎉 ${data.message}`);
        setIsSuccess(true);
        setTimeout(() => {
          setIsForgotPassword(false);
          setOtpSent(false);
          setIsLogin(true);
          setMessage("");
        }, 2000);
      } else {
        setMessage(`❌ ${data.message}`);
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
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
        {isForgotPassword
          ? "🔑 Quên Mật Khẩu"
          : isLogin
            ? "🔐 Đăng Nhập"
            : "📝 Đăng Ký Tài Khoản"}
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

      {/* FORM QUÊN MẬT KHẨU */}
      {isForgotPassword ? (
        !otpSent ? (
          /* Bước 1: Nhập Email gửi OTP */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email tài khoản
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
            >
              {loading ? "Đang gửi OTP..." : "Gửi Mã OTP Đặt Lại Mật Khẩu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setMessage("");
              }}
              className="w-full text-center text-sm text-indigo-600 hover:underline pt-2"
            >
              ← Quay lại Đăng nhập
            </button>
          </form>
        ) : (
          /* Bước 2: Nhập OTP + Mật khẩu mới */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mã OTP (gửi qua Email)
              </label>
              <input
                type="text"
                required
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest font-bold text-lg"
                placeholder="123456"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
            >
              {loading ? "Đang đặt lại..." : "Xác Nhận Đặt Mật Khẩu Mới"}
            </button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-sm text-slate-500 hover:underline pt-2"
            >
              Bấm để gửi lại OTP
            </button>
          </form>
        )
      ) : (
        /* FORM ĐĂNG NHẬP / ĐĂNG KÝ */
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLogin && (
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

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setMessage("");
                }}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loading
              ? "Đang xử lý..."
              : isLogin
                ? "Đăng Nhập"
                : "Đăng Ký Tài Khoản"}
          </button>

          <div className="text-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
              className="text-sm text-slate-600 hover:text-indigo-600 font-medium"
            >
              {isLogin
                ? "Chưa có tài khoản? Đăng ký ngay"
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Auth;
