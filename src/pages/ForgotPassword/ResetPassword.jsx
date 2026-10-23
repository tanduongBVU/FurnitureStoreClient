import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import FieldError from "../../components/FieldError/FieldError";
import SEO from "../../components/SEO/SEO";
import useFormValidation from "../../hooks/useFormValidation";
import { required, minLength, sameAs } from "../../utils/validators";
import "./ForgotPassword.css";

// Luật kiểm tra — lỗi hiện chữ đỏ ngay dưới ô nhập
const RULES = {
  newPassword: [
    required("Vui lòng nhập mật khẩu mới."),
    minLength(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
  ],
  confirmPassword: [
    required("Vui lòng nhập lại mật khẩu mới."),
    sameAs("newPassword", "Mật khẩu nhập lại chưa khớp."),
  ],
};

// Trang đặt mật khẩu mới — khách mở từ link trong email: /reset-password?token=...
// Token do Backend kiểm tra (đúng chữ ký, còn hạn 30 phút, chỉ dùng 1 lần); trang này chỉ gửi nó lên.
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { errors, validateField, validateAll, clearError } = useFormValidation(RULES);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    clearError(f);
    // Sửa mật khẩu mới thì ô nhập lại cũng cần kiểm tra lại
    if (f === "newPassword") clearError("confirmPassword");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateAll(form)) return;

    setLoading(true);
    try {
      await api.post("/Auth/reset-password", { token, newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không đặt lại được mật khẩu. Vui lòng thử lại hoặc yêu cầu gửi liên kết mới."
      );
    } finally {
      setLoading(false);
    }
  };

  // Không có token trong đường dẫn (mở trang trực tiếp hoặc link bị cắt mất)
  if (!token) {
    return (
      <div className="recovery-page">
        <SEO title="Đặt lại mật khẩu" description="Đặt mật khẩu mới cho tài khoản LuxWood." />
        <div className="recovery-card">
          <span className="recovery-icon">⚠️</span>
          <h1>Liên kết không hợp lệ</h1>
          <p className="recovery-desc">
            Liên kết đặt lại mật khẩu bị thiếu hoặc không đúng. Vui lòng yêu cầu gửi lại liên kết mới.
          </p>
          <Link to="/forgot-password" className="recovery-btn">Yêu cầu liên kết mới</Link>
          <div className="recovery-links">
            <Link to="/login">← Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="recovery-page">
        <SEO title="Đặt lại mật khẩu" description="Đặt mật khẩu mới cho tài khoản LuxWood." />
        <div className="recovery-card">
          <span className="recovery-icon">✅</span>
          <h1>Đã đặt lại mật khẩu</h1>
          <p className="recovery-desc">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
          <Link to="/login" className="recovery-btn">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recovery-page">
      <SEO title="Đặt lại mật khẩu" description="Đặt mật khẩu mới cho tài khoản LuxWood." />
      <div className="recovery-card">
        <span className="recovery-icon">🔒</span>
        <h1>Đặt mật khẩu mới</h1>
        <p className="recovery-desc">Nhập mật khẩu mới cho tài khoản của bạn (tối thiểu 6 ký tự).</p>

        {error && (
          <div className="recovery-error">
            ⚠️ {error}{" "}
            <Link to="/forgot-password" style={{ color: "#c0392b", fontWeight: 600 }}>Yêu cầu liên kết mới</Link>
          </div>
        )}

        <form className="recovery-form" onSubmit={handleSubmit} noValidate>
          <div className="recovery-group">
            <label htmlFor="reset-new">Mật khẩu mới</label>
            <input
              id="reset-new"
              name="newPassword"
              type="password"
              className={errors.newPassword ? "is-invalid" : ""}
              value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)}
              onBlur={() => validateField("newPassword", form)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <FieldError message={errors.newPassword} />
          </div>
          <div className="recovery-group">
            <label htmlFor="reset-confirm">Nhập lại mật khẩu mới</label>
            <input
              id="reset-confirm"
              name="confirmPassword"
              type="password"
              className={errors.confirmPassword ? "is-invalid" : ""}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              onBlur={() => validateField("confirmPassword", form)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <FieldError message={errors.confirmPassword} />
          </div>
          <button type="submit" className="recovery-btn" disabled={loading}>
            {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;