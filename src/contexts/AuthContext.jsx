import { createContext, useContext, useState } from "react";
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

  const logout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
};
