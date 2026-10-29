import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Image as ImageIcon } from "lucide-react";

const API_URL = "https://user-management-backend-7clg.onrender.com/api";

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMovieId, setEditMovieId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("Hành động");
  const [isVipOnly, setIsVipOnly] = useState(false); // 🌟 Thêm State quản lý VIP

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/movies`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "API phim chưa sẵn sàng hoặc backend đang offline."
            : `HTTP ${res.status}`,
        );
      }

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : [];

      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách phim:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Xử lý chọn ảnh từ máy tính (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mở modal thêm mới
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditMovieId(null);
    setTitle("");
    setDescription("");
    setPosterUrl("");
    setVideoUrl("");
    setCategory("Hành động");
    setIsVipOnly(false); // Reset về mặc định
    setShowModal(true);
  };

  // Mở modal sửa phim (Điền sẵn thông tin cũ)
  const handleOpenEditModal = (movie) => {
    setIsEditing(true);
    setEditMovieId(movie._id);
    setTitle(movie.title || "");
    setDescription(movie.description || "");
    setPosterUrl(movie.posterUrl || "");
    setVideoUrl(movie.videoUrl || "");
    setCategory(movie.category || "Hành động");
    setIsVipOnly(movie.isVipOnly || false); // Load trạng thái VIP cũ của phim
    setShowModal(true);
  };

  // Gửi dữ liệu Thêm mới hoặc Cập nhật
  const handleSubmitMovie = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này!");
      return;
    }

    if (!posterUrl) {
      alert("Vui lòng chọn ảnh poster cho phim!");
      return;
    }

    try {
      const url = isEditing
        ? `${API_URL}/movies/${editMovieId}`
        : `${API_URL}/movies`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          posterUrl,
          videoUrl,
          category,
          isVipOnly, // 🌟 Gửi trạng thái VIP lên Backend khớp với Movie.js
        }),
      });

      let data = {};
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || `HTTP ${res.status}` };
      }

      if (res.ok) {
        alert(
          isEditing ? "Cập nhật phim thành công!" : "🎉 Thêm phim thành công!",
        );
        setShowModal(false);
        await fetchMovies();
      } else {
        alert(data.message || "Không thể lưu thông tin phim!");
      }
    } catch (err) {
      console.error("Lỗi lưu phim:", err);
      alert("Lỗi kết nối server!");
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bộ phim này?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Xóa phim thành công!");
        await fetchMovies();
      } else {
        alert("Không thể xóa phim!");
      }
    } catch (err) {
      console.error("Lỗi xóa phim:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🎬 Quản Lý Phim ({movies.length})
        </h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Phim Mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">
          ⏳ Đang tải danh sách phim...
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          Chưa có bộ phim nào. Hãy bấm "Thêm Phim Mới".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="border border-slate-200 rounded-lg p-3 flex gap-3 relative bg-slate-50"
            >
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded-md bg-slate-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/150x225?text=No+Image";
                }}
              />
              <div className="flex-1 min-w-0 pr-12">
                <h3 className="font-bold text-slate-800 text-sm truncate">
                  {movie.title}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="inline-block bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {movie.category || "Hành động"}
                  </span>
                  {/* 🌟 Hiển thị huy hiệu VIP trên danh sách */}
                  {movie.isVipOnly && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                      👑 VIP
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {movie.description || "Không có mô tả"}
                </p>
              </div>

              {/* 🌟 Nút Sửa & Xóa trên góc thẻ phim */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(movie)}
                  className="text-amber-500 hover:text-amber-700 p-1 cursor-pointer"
                  title="Sửa phim"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMovie(movie._id)}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  title="Xóa phim"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 Modal Thêm / Sửa Phim */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isEditing ? "✏️ Chỉnh Sửa Thông Tin Phim" : "🎬 Thêm Phim Mới"}
            </h3>
            <form onSubmit={handleSubmitMovie} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Phim
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Avatar 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Thể Loại Phim
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="Hành động">Hành động</option>
                  <option value="Tình cảm">Tình cảm</option>
                  <option value="Hoạt hình">Hoạt hình</option>
                  <option value="Kinh dị">Kinh dị</option>
                  <option value="Hài hước">Hài hước</option>
                  <option value="Viễn tưởng">Viễn tưởng</option>
                </select>
              </div>

              {/* 🌟 Checkbox cấu hình Phim VIP */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="isVipOnly"
                  checked={isVipOnly}
                  onChange={(e) => setIsVipOnly(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="isVipOnly"
                  className="text-xs font-semibold text-amber-900 cursor-pointer select-none"
                >
                  👑 Chỉ dành cho tài khoản VIP (isVipOnly)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mô Tả
                </label>
                <textarea
                  rows="3"
                  placeholder="Nhập mô tả phim..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Ảnh Poster Phim
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-3 text-sm text-slate-600 cursor-pointer bg-slate-50 transition">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    <span>
                      {posterUrl
                        ? "Đã chọn ảnh poster"
                        : "Chọn file ảnh mới (PNG, JPG)..."}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {/* Xem trước ảnh */}
                {posterUrl && (
                  <div className="mt-2 relative w-20 h-28 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={posterUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Video URL (YouTube / MP4)
                </label>
                <input
                  type="url"
                  placeholder="https://... hoặc link Youtube nhúng"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {isEditing ? "Lưu thay đổi" : "Thêm phim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieList;
