import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/Settings")
      .then(res => {
        setSettings(res.data);
        applyTheme(res.data);
      })
      .catch(() => {
        // Nếu API lỗi, site vẫn chạy bình thường với style CSS mặc định có sẵn
      })
      .finally(() => setLoaded(true));
  }, []);

  const applyTheme = (data) => {
    const root = document.documentElement;
    if (data["theme.walnut"])   root.style.setProperty("--walnut", data["theme.walnut"]);
    if (data["theme.cream"])    root.style.setProperty("--cream", data["theme.cream"]);
    if (data["theme.gold"])     root.style.setProperty("--gold", data["theme.gold"]);
    if (data["theme.goldDark"]) root.style.setProperty("--gold-d", data["theme.goldDark"]);
  };

  // Hàm tiện lợi: get("footer.phone", "giá trị dự phòng nếu chưa có")
  const get = (key, fallback = "") => settings[key] ?? fallback;

  return (
    <SettingsContext.Provider value={{ settings, get, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings phải được dùng bên trong SettingsProvider");
  return ctx;
};
