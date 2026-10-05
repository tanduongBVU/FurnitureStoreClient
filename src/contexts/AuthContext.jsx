import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("clientUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Đồng bộ ảnh đại diện từ Backend mỗi khi có người dùng đăng nhập (kể cả khi tải lại trang).
  // Các API login/register/google chỉ trả { token, id, name, email, role } nên chưa có avatarUrl —
  // lấy bổ sung từ /Auth/me để Navbar và trang Tài khoản luôn hiện đúng ảnh. Lỗi thì bỏ qua êm
  // (chỉ mất ảnh, không ảnh hưởng đăng nhập).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    api
      .get("/Auth/me")
      .then((res) => {
        if (cancelled) return;
        const avatarUrl = res.data.avatarUrl || "";
        setUser((prev) => {
          if (!prev || (prev.avatarUrl || "") === avatarUrl) return prev;
          const updated = { ...prev, avatarUrl };
          localStorage.setItem("clientUser", JSON.stringify(updated));
          return updated;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const login = async (email, password) => {
    const res = await api.post("/Auth/login", { email, password });
    const { token, id, name, email: userEmail, role } = res.data;

    if (role !== "Khách hàng") {
      throw { response: { data: { message: "Tài khoản này không phải tài khoản khách hàng." } } };
    }

    const userData = { id, name, email: userEmail, role };
    localStorage.setItem("clientToken", token);
    localStorage.setItem("clientUser", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (form) => {
    const res = await api.post("/Auth/register", form);
    const { token, id, name, email, role } = res.data;
    const userData = { id, name, email, role };
    localStorage.setItem("clientToken", token);
    localStorage.setItem("clientUser", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Đăng nhập bằng Google — nhận idToken do Google Identity Services cấp ở phía trình
  // duyệt (xem GoogleLoginButton.jsx), gửi thẳng lên Backend để verify + đăng nhập/tạo
  // tài khoản. Cùng shape response { token, id, name, email, role } như login/register
  // thường, nên tái dùng đúng logic lưu localStorage + setUser, không lệch state.
  const loginWithGoogle = async (idToken) => {
    const res = await api.post("/Auth/google", { idToken });
    const { token, id, name, email, role } = res.data;
    const userData = { id, name, email, role };
    localStorage.setItem("clientToken", token);
    localStorage.setItem("clientUser", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Cập nhật tên, số điện thoại & địa chỉ — dùng cho trang Tài khoản cá nhân
  const updateProfile = async (form) => {
    const res = await api.put("/Auth/me", form);
    const updated = { ...user, name: res.data.name, phone: res.data.phone, address: res.data.address };
    localStorage.setItem("clientUser", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  // Đặt ảnh đại diện (truyền URL do /Upload trả về) hoặc xoá ảnh (truyền chuỗi rỗng "")
  const updateAvatar = async (avatarUrl) => {
    const res = await api.put("/Auth/me/avatar", { avatarUrl });
    const updated = { ...user, avatarUrl: res.data.avatarUrl || "" };
    localStorage.setItem("clientUser", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  // Đổi mật khẩu — yêu cầu nhập đúng mật khẩu hiện tại (backend tự kiểm tra)
  const changePassword = async (currentPassword, newPassword) => {
    await api.put("/Auth/change-password", { currentPassword, newPassword });
  };

  const logout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, login, register, loginWithGoogle, logout,
        updateProfile, updateAvatar, changePassword,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
};