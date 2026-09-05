import { useState } from "react";
import Auth from "./components/Auth";
import UserList from "./components/UserList";
import Profile from "./components/Profile";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users' hoặc 'profile'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 shadow-md">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🚀 React Mastery - Mini App
          </h1>
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                👤 {currentUser.name}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
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
                onUpdateSuccess={(updatedUser) =>
                  setCurrentUser((prev) => ({
                    ...prev,
                    name: updatedUser.name,
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
