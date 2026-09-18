import { useState } from "react";

function Auth({ onLoginSuccess }) {
  // Điều hướng form
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Dành cho Quên mật khẩu
  const [regOtpSent, setRegOtpSent] = useState(false); // Dành cho Đăng ký

  // States dữ liệu
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerOtp, setRegisterOtp] = useState(""); // OTP đăng ký
  const [otp, setOtp] = useState(""); // OTP quên mật khẩu
  const [newPassword, setNewPassword] = useState("");

  // States ẩn/hiện mật khẩu (Con mắt)
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // States thông báo & loading
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://user-management-backend-7clg.onrender.com";

  // Reset toàn bộ input khi chuyển tab/chế độ
  const resetFormState = () => {
    setMessage("");
    setShowPassword(false);
    setShowNewPassword(false);
  };

  // 📍 1. Đăng Nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        if (onLoginSuccess) onLoginSuccess(data.user);
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

  // 📍 2. Đăng Ký - Bước 1: Gửi mã OTP xác thực email
  const handleSendRegisterOtp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage("❌ Mật khẩu phải từ 6 ký tự trở lên!");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`📩 ${data.message}`);
        setIsSuccess(true);
        setRegOtpSent(true);
      } else {
        setMessage(`❌ ${data.message || "Gửi OTP thất bại!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // 📍 3. Đăng Ký - Bước 2: Xác nhận OTP & Tạo tài khoản
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp: registerOtp }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
        setIsSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setRegOtpSent(false);
          setRegisterOtp("");
          setPassword("");
          resetFormState();
        }, 2000);
      } else {
        setMessage(`❌ ${data.message || "Xác thực OTP thất bại!"}`);
        setIsSuccess(false);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // 📍 4. Quên mật khẩu - Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`🎉 ${data.message}`);
        setIsSuccess(true);
        setOtpSent(true);
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

  // 📍 5. Quên mật khẩu - Xác nhận OTP & Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`🎉 ${data.message}`);
        setIsSuccess(true);
        setTimeout(() => {
          setIsForgotPassword(false);
          setOtpSent(false);
          setIsLogin(true);
          resetFormState();
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

      {/* ======================================================== */}
      {/* 1. FORM QUÊN MẬT KHẨU */}
      {/* ======================================================== */}
      {isForgotPassword ? (
        !otpSent ? (
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
                resetFormState();
              }}
              className="w-full text-center text-sm text-indigo-600 hover:underline pt-2"
            >
              ← Quay lại Đăng nhập
            </button>
          </form>
        ) : (
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

            {/* 👁️ Mật khẩu mới trong Quên mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
                >
                  {showNewPassword ? "👁️" : "🙈"}
                </button>
              </div>
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
      ) : isLogin ? (
        /* ======================================================== */
        /* 2. FORM ĐĂNG NHẬP */
        /* ======================================================== */
        <form onSubmit={handleLoginSubmit} className="space-y-4">
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

          {/* 👁️ Mật khẩu trong Đăng nhập */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(true);
                resetFormState();
              }}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>

          <div className="text-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                resetFormState();
              }}
              className="text-sm text-slate-600 hover:text-indigo-600 font-medium"
            >
              Chưa có tài khoản? Đăng ký ngay
            </button>
          </div>
        </form>
      ) : (
        /* ======================================================== */
        /* 3. FORM ĐĂNG KÝ (2 BƯỚC VỚI OTP) */
        /* ======================================================== */
        <div>
          {!regOtpSent ? (
            /* Bước 1: Nhập thông tin & Nhận OTP */
            <form onSubmit={handleSendRegisterOtp} className="space-y-4">
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

              {/* 👁️ Mật khẩu trong Đăng ký */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
              >
                {loading ? "Đang gửi OTP..." : "Nhận Mã OTP Xác Thực Email"}
              </button>

              <div className="text-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    resetFormState();
                  }}
                  className="text-sm text-slate-600 hover:text-indigo-600 font-medium"
                >
                  Đã có tài khoản? Đăng nhập
                </button>
              </div>
            </form>
          ) : (
            /* Bước 2: Nhập OTP tạo tài khoản */
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <p className="text-xs text-slate-500 text-center">
                Mã OTP xác thực đã được gửi tới <b>{email}</b>
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nhập mã OTP (6 số)
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={registerOtp}
                  onChange={(e) => setRegisterOtp(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest font-bold text-lg"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
              >
                {loading ? "Đang tạo tài khoản..." : "Xác Nhận & Đăng Ký"}
              </button>

              <button
                type="button"
                onClick={() => setRegOtpSent(false)}
                className="w-full text-center text-sm text-slate-500 hover:underline pt-2 block"
              >
                ← Quay lại sửa thông tin
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Auth;
