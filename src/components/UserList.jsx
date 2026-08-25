import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useUserStore } from "../store/useUserStore"; // Import Zustand Store

function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Lấy data và các action trực tiếp từ Zustand Store
  const { users, loading, error, fetchUsers, addUser, deleteUser } =
    useUserStore();

  // Tải danh sách lần đầu khi Component được render
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !email) return alert("Vui lòng điền đủ Tên và Email!");
    const success = await addUser(name, email);
    if (success) {
      setName("");
      setEmail("");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        <span className="ml-3 text-lg font-semibold text-slate-600">
          ⏳ Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <h3 className="text-xl font-bold text-red-600 mb-2">❌ Lỗi kết nối</h3>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition duration-200"
        >
          🔄 Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            👥 Quản Lý Người Dùng (Zustand Store)
          </h2>
          <p className="text-sm text-slate-500">
            State tập trung kết nối Node.js Backend
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-200"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Form Thêm */}
      <form
        onSubmit={handleAddUser}
        className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl"
      >
        <h3 className="text-md font-semibold text-slate-700 mb-3">
          ➕ Thêm Người Dùng Mới
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Họ và tên..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Địa chỉ Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition duration-200"
        >
          ➕ Lưu Vào Store & Server
        </button>
      </form>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* List */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredUsers.map((user) => (
            <div
              key={user._id || user.id}
              className="p-5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between"
            >
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  👤 {user.name}
                </h4>
                <p className="text-sm text-slate-500 mt-1">📧 {user.email}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  ID: {(user._id || user.id).slice(-6)}
                </span>
                <button
                  onClick={() => deleteUser(user._id || user.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">
            Chưa có người dùng nào phù hợp!
          </p>
        </div>
      )}
    </div>
  );
}

export default UserList;
