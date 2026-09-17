import { useSettings } from "../../contexts/SettingsContext";
import "./FloatingContact.css";

// 2 nút liên hệ nhanh nổi, xếp chồng NGAY PHÍA TRÊN bong bóng ChatWidget (xem CSS).
// Lấy số Zalo/link Facebook từ CMS (SiteSettings, tab "Liên hệ & Footer") qua
// useSettings — ĐÂY LÀ LÝ DO component này phải nằm bên trong MainLayout.jsx (nơi có
// SettingsProvider bao quanh qua Routes/App.jsx), KHÔNG được đặt ở main.jsx như
// ChatWidget, vì main.jsx nằm NGOÀI SettingsProvider.
const FloatingContact = () => {
  const { get } = useSettings();

  // Chỉ giữ lại chữ số khi ghép link Zalo — Zalo yêu cầu số điện thoại thuần, không
  // chấp nhận khoảng trắng/dấu gạch ngang dù Admin nhập ở CMS kiểu "090 123 4567".
  const zaloPhoneRaw = get("social.zaloPhone", "0909123456");
  const zaloPhone = zaloPhoneRaw.replace(/\D/g, "");

  // Bấm vào đi thẳng tới link Facebook thật (trang cá nhân/fanpage) do Admin nhập —
  // khác Messenger trước đây (chỉ mở khung chat), giờ chuyển hẳn sang trang Facebook.
  const facebookUrl = get("social.facebookUrl", "https://facebook.com");

  return (
    <div className="floating-contact">
      <a
        href={`https://zalo.me/${zaloPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact__btn floating-contact__btn--zalo"
        aria-label="Chat qua Zalo"
        title="Chat qua Zalo"
      >
        <span className="floating-contact__zalo-text">Zalo</span>
      </a>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact__btn floating-contact__btn--facebook"
        aria-label="Trang Facebook LuxWood"
        title="Trang Facebook LuxWood"
      >
        <span className="floating-contact__fb-text">f</span>
      </a>
    </div>
  );
};

export default FloatingContact;