import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import "./PromoBanner.css";

// Banner khuyến mãi cố định trên đầu trang (phía trên Navbar), điều khiển hoàn toàn
// qua CMS (Admin → Giao diện Client → Banner khuyến mãi). Nếu Admin tắt hoặc chưa
// nhập nội dung, component không render gì cả — không chiếm chỗ, không có khoảng trắng thừa.
const PromoBanner = () => {
  const { get, loaded } = useSettings();
  const ref = useRef(null);

  const enabled = get("promo.banner.enabled", "false") === "true";
  const text = get("promo.banner.text", "");
  const linkText = get("promo.banner.linkText", "Xem ngay");
  const linkUrl = get("promo.banner.linkUrl", "/sale");
  const bg = get("promo.banner.bg", "#3b2a1a");
  const textColor = get("promo.banner.textColor", "#f5f0e8");

  const show = loaded && enabled && text.trim() !== "";

  // Ghi chiều cao banner ra CSS variable --banner-h ở :root — Navbar (position:fixed)
  // và <main> (padding-top) đều dựa vào biến này để tự đẩy xuống đúng, tránh banner
  // đè lên Navbar hoặc để lại khoảng trắng khi banner tắt.
  //
  // FIX MOBILE: bản cũ chỉ đo offsetHeight MỘT LẦN trong effect (deps: show/text/linkText).
  // Nhưng banner có flex-wrap và đổi flex-direction thành column dưới 640px — chiều cao
  // THẬT của nó thay đổi theo bề rộng màn hình (chữ xuống 2 dòng khi xoay ngang/dọc, hoặc
  // khi khách resize trình duyệt). Dùng ResizeObserver để theo dõi chiều cao thật của phần
  // tử thay vì chỉ theo dõi state, đảm bảo Navbar/<main> luôn đẩy đúng khoảng bất kể xoay
  // màn hình hay đổi kích thước viewport.
  useEffect(() => {
    const root = document.documentElement;

    if (!show || !ref.current) {
      root.style.setProperty("--banner-h", "0px");
      return;
    }

    const el = ref.current;
    const updateHeight = () => root.style.setProperty("--banner-h", `${el.offsetHeight}px`);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
      root.style.setProperty("--banner-h", "0px");
    };
  }, [show, text, linkText]);

  if (!show) return null;

  return (
    <div className="promo-banner" ref={ref} style={{ background: bg, color: textColor }}>
      <div className="promo-banner__inner">
        <span className="promo-banner__text">{text}</span>
        {linkUrl && (
          <Link to={linkUrl} className="promo-banner__link" style={{ color: textColor }}>
            {linkText} →
          </Link>
        )}
      </div>
    </div>
  );
};

export default PromoBanner;