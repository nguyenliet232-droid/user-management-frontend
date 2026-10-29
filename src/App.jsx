import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import UserList from "./components/UserList";
import Profile from "./components/Profile";
import MovieList from "./components/MovieList";
import Dashboard from "./components/Dashboard"; // 🌟 Nhớ import Dashboard (nơi chứa bảng duyệt đơn VIP)

const MOVIE_APP_URL = "http://localhost:5001/api/admin/users";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("movie_token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setActiveTab("users");
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("movie_token");

      if (token) {
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

          const contentType = res.headers.get("content-type") || "";
          const data = contentType.includes("application/json")
            ? await res.json()
            : { message: (await res.text()) || `HTTP ${res.status}` };

          if (res.ok) {
            if (data.role?.toLowerCase() !== "admin") {
              alert(
                "⛔ Tài khoản của bạn là Người dùng thường! Đang chuyển sang Trang Xem Phim...",
              );
              handleLogout();
              window.location.href = MOVIE_APP_URL;
              return;
            }

            setCurrentUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error("Lỗi xác thực phiên đăng nhập:", err);
          handleLogout();
        }
      }

      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  const handleLoginSuccess = (user) => {
    if (user.role?.toLowerCase() !== "admin") {
      alert("🎉 Đăng nhập thành công! Đang chuyển sang Trang Xem Phim...");
      handleLogout();
      window.location.href = MOVIE_APP_URL;
      return;
    }

    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const getHeaderAvatar = (user) => {
    if (user?.avatar) return user.avatar;
    const displayName = user?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=random&color=fff&size=64`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
        ⏳ Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-900 text-white py-4 shadow-md">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🛡️ Admin Management Dashboard
          </h1>

          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <img
                  src={getHeaderAvatar(currentUser)}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover border border-indigo-400"
                />
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 font-bold uppercase">
                  ADMIN
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="p-4">
        {!currentUser ? (
          <Auth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* 🌟 Thanh điều hướng các Tab Admin */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === "users"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                👥 Quản lý người dùng
              </button>
              <button
                onClick={() => setActiveTab("movies")}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === "movies"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                🎬 Quản lý phim
              </button>
              {/* 🌟 Tab Quản lý đơn VIP mới thêm */}
              <button
                onClick={() => setActiveTab("vipOrders")}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === "vipOrders"
                    ? "bg-yellow-500 text-slate-950 shadow-md font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                👑 Duyệt đơn VIP
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                👤 Hồ sơ Admin
              </button>
            </div>

            {/* 🌟 Hiển thị Component tương ứng theo Tab */}
            {activeTab === "users" ? (
              <UserList />
            ) : activeTab === "movies" ? (
              <MovieList />
            ) : activeTab === "vipOrders" ? (
              <Dashboard
                user={currentUser}
                onLogout={handleLogout}
                onUserUpdate={(updated) =>
                  setCurrentUser((prev) => ({ ...prev, ...updated }))
                }
              />
            ) : (
              <Profile
                currentUser={currentUser}
                onUpdateSuccess={(updatedUser) =>
                  setCurrentUser((prev) => ({
                    ...prev,
                    ...updatedUser,
                  }))
                }
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
