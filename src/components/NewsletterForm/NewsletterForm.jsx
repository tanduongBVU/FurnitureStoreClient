import { useState } from "react";
import api from "../../services/api";
import "./NewsletterForm.css";

// variant="inline" → dùng trong Footer, không có khung/nền riêng, để cha tự style layout.
// variant="modal"  → dùng trong Popup, có tiêu đề + mô tả + khung card riêng.
const NewsletterForm = ({ variant = "inline", onSuccess }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "", "sending", "success", "error"
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await api.post("/Newsletter", { email });
      setStatus("success");
      setMessage(res.data?.message || "Đăng ký thành công!");
      setEmail("");
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className={`newsletter-form newsletter-form--${variant}`}>
      {variant === "modal" && (
        <>
          <span className="newsletter-form__icon">✉️</span>
          <h3>Đăng ký nhận tin</h3>
          <p>Nhận ngay ưu đãi & bộ sưu tập mới nhất từ LuxWood qua email.</p>
        </>
      )}

      {status === "success" ? (
        <p className="newsletter-form__msg newsletter-form__msg--success">✓ {message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="newsletter-form__row">
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Đang gửi..." : "Đăng ký"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="newsletter-form__msg newsletter-form__msg--error">⚠️ {message}</p>
      )}
    </div>
  );
};

export default NewsletterForm;