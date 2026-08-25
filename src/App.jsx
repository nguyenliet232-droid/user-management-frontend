import { useState } from "react";
import Auth from "./components/Auth";
import UserList from "./components/UserList";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

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
          <UserList />
        )}
      </main>
    </div>
  );
}

export default App;
