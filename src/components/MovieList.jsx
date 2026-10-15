import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

const API_URL = "https://user-management-backend-7clg.onrender.com/api";

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("Hành động");

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
      const data = contentType.includes("application/json") ? await res.json() : [];

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

  const handleAddMovie = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Vui lòng đăng nhập để thêm phim!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/movies`, {
        method: "POST",
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
        alert("🎉 Thêm phim thành công!");
        setTitle("");
        setDescription("");
        setPosterUrl("");
        setVideoUrl("");
        setCategory("Hành động");
        setShowAddModal(false);
        await fetchMovies();
      } else {
        alert(data.message || "Không thể thêm phim!");
      }
    } catch (err) {
      console.error("Lỗi thêm phim:", err);
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
          onClick={() => setShowAddModal(true)}
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
              />
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-bold text-slate-800 text-sm truncate">
                  {movie.title}
                </h3>
                <span className="inline-block bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded mt-1">
                  {movie.category || "Hành động"}
                </span>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {movie.description || "Không có mô tả"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteMovie(movie._id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 cursor-pointer"
                title="Xóa phim"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              🎬 Thêm Phim Mới
            </h3>
            <form onSubmit={handleAddMovie} className="space-y-4">
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
                  Poster URL
                </label>
                <input
                  type="url"
                  placeholder="https://...jpg"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  placeholder="https://...mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Thêm phim
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

