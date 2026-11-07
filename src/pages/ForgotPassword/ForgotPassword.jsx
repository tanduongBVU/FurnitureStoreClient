import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import FieldError from "../../components/FieldError/FieldError";
import SEO from "../../components/SEO/SEO";
import useFormValidation from "../../hooks/useFormValidation";
import { required, email } from "../../utils/validators";
import "./ForgotPassword.css";

// Icon SVG nét mảnh (thay emoji) — tự đổi màu theo màu chữ
const ICONS = {
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3M14 9l2 2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 7l9 7 9-7" /></>,
};
const RecoveryIcon = ({ name }) => (
  <span className="recovery-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  </span>
);

// Luật kiểm tra — lỗi hiện chữ đỏ ngay dưới ô nhập
const RULES = {
  email: [required("Vui lòng nhập email."), email()],
};

// Trang "Quên mật khẩu" của KHÁCH HÀNG: nhập email → Backend gửi link đặt lại mật khẩu.
// Backend luôn trả cùng một câu dù email có tồn tại hay không (không để lộ email nào đã đăng ký),
// nên trang này cũng chỉ hiện đúng câu đó, không tự suy đoán gì thêm.
const ForgotPassword = () => {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const { errors, validateField, validateAll, clearError } = useFormValidation(RULES);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    clearError(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateAll(form)) return;

    setLoading(true);
    try {
      const res = await api.post("/Auth/forgot-password", { email: form.email.trim() });
      setSentMessage(
        res.data?.message ||
          "Nếu email này đã đăng ký tài khoản, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (kể cả mục Spam)."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Không gửi được yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      <SEO title="Quên mật khẩu" description="Đặt lại mật khẩu tài khoản LuxWood của bạn." />
      <div className="recovery-card">
        <RecoveryIcon name={sentMessage ? "mail" : "key"} />
        <h1>{sentMessage ? "Kiểm tra email của bạn" : "Quên mật khẩu?"}</h1>

        {sentMessage ? (
          <>
            <div className="recovery-success" role="status">{sentMessage}</div>
            <p className="recovery-desc recovery-desc--flush">
              Liên kết có hiệu lực trong 30 phút. Chưa thấy email? Chờ khoảng 1 phút rồi thử gửi lại.
            </p>
            <div className="recovery-links">
              <button
                type="button"
                className="recovery-link-btn"
                onClick={() => setSentMessage("")}
              >
                Gửi lại hoặc dùng email khác
              </button>
              <Link to="/login">← Quay lại đăng nhập</Link>
            </div>
          </>
        ) : (
          <>
            <p className="recovery-desc">
              Nhập email đã đăng ký tài khoản. Chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.
            </p>
            {error && <div className="recovery-error" role="alert">{error}</div>}
            <form className="recovery-form" onSubmit={handleSubmit} noValidate>
              <div className="recovery-group">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  className={errors.email ? "is-invalid" : ""}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => validateField("email", form)}
                  placeholder="ten@gmail.com"
                  autoComplete="email"
                />
                <FieldError message={errors.email} />
              </div>
              <button type="submit" className="recovery-btn" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại mật khẩu"}
              </button>
            </form>
            <div className="recovery-links">
              <Link to="/login">← Quay lại đăng nhập</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;