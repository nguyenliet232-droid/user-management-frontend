import { useState, useEffect, useRef } from "react";
import Auth from "./components/Auth";
import MovieList from "./components/MovieList";
import Dashboard from "./components/Dashboard";
import { API_URL } from "./config/api";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("vipOrders");
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("movie_token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setActiveTab("vipOrders");
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("movie_token");

      if (token) {
        try {
          const res = await fetch(`${API_URL}/users/profile`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const contentType = res.headers.get("content-type") || "";
          const data = contentType.includes("application/json")
            ? await res.json()
            : { message: (await res.text()) || `HTTP ${res.status}` };

          if (res.ok) {
            if (data.role?.toLowerCase() !== "admin") {
              alert(
                "⛔ Tài khoản của bạn không phải quản trị viên. Vui lòng đăng nhập bằng tài khoản admin.",
              );
              handleLogout();
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
      alert(
        "🎉 Đăng nhập thành công, nhưng tài khoản này không có quyền Admin.",
      );
      handleLogout();
      return;
    }

    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Hàm nén ảnh trước khi tải lên
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

  // Xử lý đổi ảnh đại diện trực tiếp từ Header
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh!");
      return;
    }

    const token =
      localStorage.getItem("token") || localStorage.getItem("movie_token");

    try {
      setUploadingAvatar(true);
      const compressedBase64 = await compressImage(file);

      const res = await fetch(`${API_URL}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: compressedBase64,
          name: currentUser?.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✨ Cập nhật ảnh đại diện thành công!");
        const updatedUser = { ...currentUser, avatar: compressedBase64 };
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert(data.message || "Cập nhật ảnh thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ khi đổi ảnh!");
    } finally {
      setUploadingAvatar(false);
    }
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
              {/* Ô hiển thị thông tin Admin kèm tính năng bấm vào Avatar để đổi ảnh */}
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="relative group cursor-pointer"
                  title="Bấm vào để đổi ảnh đại diện"
                >
                  <img
                    src={getHeaderAvatar(currentUser)}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-indigo-400 group-hover:opacity-70 transition"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition">
                    {uploadingAvatar ? "..." : "Sửa"}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
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
            {/* Thanh điều hướng gọn gàng chỉ có Quản lý phim và Duyệt đơn VIP */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
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
            </div>

            {/* Hiển thị component tương ứng */}
            {activeTab === "movies" ? (
              <MovieList />
            ) : (
              <Dashboard
                user={currentUser}
                onLogout={handleLogout}
                onUserUpdate={(updated) =>
                  setCurrentUser((prev) => ({ ...prev, ...updated }))
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
