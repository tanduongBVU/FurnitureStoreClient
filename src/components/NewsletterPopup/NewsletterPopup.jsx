import { useState, useEffect } from "react";
import NewsletterForm from "../NewsletterForm/NewsletterForm";
import "./NewsletterPopup.css";

// Key localStorage dùng để nhớ "đã hiện/đóng/đăng ký rồi" — KHÔNG hiện lại popup nữa
// trong các lần ghé thăm sau, tránh làm phiền khách đã từng thấy hoặc đã đăng ký.
const STORAGE_KEY = "luxwood_newsletter_popup_dismissed";
const SHOW_DELAY_MS = 6000; // hiện sau 6 giây, đủ để khách kịp lướt xem trang trước

const NewsletterPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return; // đã từng đóng hoặc đăng ký rồi → không hiện lại

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="newsletter-popup-overlay" onClick={close}>
      <div className="newsletter-popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="newsletter-popup-close" onClick={close} aria-label="Đóng">✕</button>
        <NewsletterForm variant="modal" onSuccess={() => localStorage.setItem(STORAGE_KEY, "1")} />
      </div>
    </div>
  );
};

export default NewsletterPopup;