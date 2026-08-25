import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

function UserDetail() {
  const { id } = useParams();
  const {
    data: user,
    loading,
    error,
    refetch,
  } = useFetch(`https://jsonplaceholder.typicode.com/users/${id}`);

  if (loading)
    return <h3 style={{ textAlign: "center" }}>⏳ Đang tải thông tin...</h3>;

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", margin: "30px" }}>
        <h3>❌ Lỗi: {error}</h3>
        <button onClick={refetch}>🔄 Thử lại</button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>
        ⬅️ Quay lại danh sách
      </Link>

      {user && (
        <div style={{ marginTop: "20px" }}>
          <h2>
            👤 {user.name} (@{user.username})
          </h2>
          <p>📧 Email: {user.email}</p>
          <p>📞 Điện thoại: {user.phone}</p>
          <p>🌐 Website: {user.website}</p>
          <p>🏢 Công ty: {user.company?.name}</p>
          <p>
            📍 Địa chỉ: {user.address?.street}, {user.address?.city}
          </p>
        </div>
      )}
    </div>
  );
}

export default UserDetail;
