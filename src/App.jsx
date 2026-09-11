import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import UserList from "./components/UserList";
import Profile from "./components/Profile";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  // 🔄 Khôi phục phiên đăng nhập
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem("token");

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

          const data = await res.json();
          if (res.ok) {
            setCurrentUser(data);
          } else {
            localStorage.removeItem("token");
          }
        } catch (err) {
          console.error("Lỗi xác thực phiên đăng nhập:", err);
        }
      }
      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  // 📍 Hàm tạo URL Avatar (Ưu tiên avatar Base64 -> Fallback ui-avatars)
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
        ⏳ Đang tải phiên đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 shadow-md">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🚀 React Mastery - Mini App
          </h1>

          {currentUser && (
            <div className="flex items-center gap-3">
              {/* 📍 Khung hiển thị Avatar tròn + Tên người dùng */}
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <img
                  src={getHeaderAvatar(currentUser)}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover border border-indigo-400"
                />
                <span className="text-sm font-medium">{currentUser.name}</span>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setCurrentUser(null);
                }}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {!currentUser ? (
          <Auth onLoginSuccess={(user) => setCurrentUser(user)} />
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Thanh Tab Chuyển Đổi */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  activeTab === "users"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                👥 Danh sách người dùng
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                👤 Quản lý tài khoản
              </button>
            </div>

            {/* Nội dung tương ứng với Tab */}
            {activeTab === "users" ? (
              <UserList />
            ) : (
              <Profile
                currentUser={currentUser}
                // 📍 Cập nhật toàn bộ object updatedUser bao gồm cả avatar
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
