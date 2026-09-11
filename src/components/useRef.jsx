import { useRef, useState } from "react";

function UseRefDemo({ user, onAvatarUpdated }) {
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatarToBackend = async (base64Image) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://user-management-backend-7clg.onrender.com/api/users/avatar",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl: base64Image }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        setAvatar(base64Image);
        if (onAvatarUpdated) onAvatarUpdated(base64Image);
        alert("Cập nhật ảnh đại diện thành công!");
      } else {
        alert(data.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh dung lượng dưới 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await uploadAvatarToBackend(base64Image);
    };
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <img
        src={
          avatar || "https://ui-avatars.com/api/?name=User&background=random"
        }
        alt="avatar preview"
        onClick={handleImageClick}
        className="w-24 h-24 rounded-full object-cover cursor-pointer border-2 border-slate-200"
      />
    </div>
  );
}

export default UseRefDemo;
