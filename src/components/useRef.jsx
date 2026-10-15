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
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ avatarUrl: base64Image }),
        },
      );

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : { message: await response.text() || `HTTP ${response.status}` };
      if (response.ok) {
        setAvatar(base64Image);
        if (onAvatarUpdated) onAvatarUpdated(base64Image);
        alert("C?p nh?t ?nh ??i di?n th?nh c?ng!");
      } else {
        alert(data.message || "C?p nh?t th?t b?i!");
      }
    } catch (error) {
      console.error("L?i upload avatar:", error);
      alert("L?i k?t n?i m?y ch?!");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Vui l?ng ch?n ?nh dung l??ng d??i 2MB!");
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
        src={avatar || "https://ui-avatars.com/api/?name=User&background=random"}
        alt="avatar preview"
        onClick={handleImageClick}
        className="w-24 h-24 rounded-full object-cover cursor-pointer border-2 border-slate-200"
      />
    </div>
  );
}

export default UseRefDemo;

