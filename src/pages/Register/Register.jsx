import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FieldError from "../../components/FieldError/FieldError";
import useFormValidation from "../../hooks/useFormValidation";
import { required, email, phoneVN, minLength, maxLength, sameAs } from "../../utils/validators";
import "../Login/Login.css";

// Luật kiểm tra từng ô — lỗi hiện chữ đỏ ngay dưới ô nhập
const RULES = {
  name: [
    required("Vui lòng nhập họ và tên."),
    minLength(2, "Họ tên cần ít nhất 2 ký tự."),
    maxLength(100, "Họ tên tối đa 100 ký tự."),
  ],
  email: [required("Vui lòng nhập email."), email()],
  phone: [required("Vui lòng nhập số điện thoại."), phoneVN()],
  address: [maxLength(250, "Địa chỉ tối đa 250 ký tự.")], // không bắt buộc
  password: [
    required("Vui lòng nhập mật khẩu."),
    minLength(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  ],
  confirmPassword: [
    required("Vui lòng nhập lại mật khẩu."),
    sameAs("password", "Mật khẩu nhập lại không khớp."),
  ],
};

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { errors, validateField, validateAll, clearError, setErrors } = useFormValidation(RULES);

  // Gõ lại thì xoá lỗi của chính ô đó
  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    clearError(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateAll(form)) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại! Vui lòng thử lại.";
      // Lỗi liên quan email (VD "Email đã được sử dụng!") → hiện ngay dưới ô email; lỗi khác → banner phía trên
      if (/email/i.test(msg)) {
        setErrors(prev => ({ ...prev, email: msg }));
        const el = document.querySelector('[name="email"]');
        if (el) el.focus();
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">⬡</span>
          <span className="auth-logo-text">LuxWood</span>
        </div>
        <h1>Tạo tài khoản</h1>
        <p className="auth-desc">Đăng ký để theo dõi đơn hàng dễ dàng hơn</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nguyễn Văn A"
              className={errors.name ? "is-invalid" : ""}
              value={form.name}
              onChange={e => set("name", e.target.value)}
              onBlur={() => validateField("name", form)}
              autoComplete="name"
            />
            <FieldError message={errors.name} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="ban@email.com"
              className={errors.email ? "is-invalid" : ""}
              value={form.email}
              onChange={e => set("email", e.target.value)}
              onBlur={() => validateField("email", form)}
              autoComplete="email"
            />
            <FieldError message={errors.email} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              placeholder="09xxxxxxxx"
              className={errors.phone ? "is-invalid" : ""}
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
              onBlur={() => validateField("phone", form)}
              autoComplete="tel"
            />
            <FieldError message={errors.phone} />
          </div>
          <div className="form-group">
            <label>Địa chỉ (không bắt buộc)</label>
            <input
              type="text"
              name="address"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              className={errors.address ? "is-invalid" : ""}
              value={form.address}
              onChange={e => set("address", e.target.value)}
              onBlur={() => validateField("address", form)}
              autoComplete="street-address"
            />
            <FieldError message={errors.address} />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="Tối thiểu 6 ký tự"
              className={errors.password ? "is-invalid" : ""}
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onBlur={() => {
                validateField("password", form);
                // Đổi mật khẩu sau khi đã nhập ô xác nhận → kiểm tra lại độ khớp
                if (form.confirmPassword) validateField("confirmPassword", form);
              }}
              autoComplete="new-password"
            />
            <FieldError message={errors.password} />
          </div>
          <div className="form-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              className={errors.confirmPassword ? "is-invalid" : ""}
              value={form.confirmPassword}
              onChange={e => set("confirmPassword", e.target.value)}
              onBlur={() => validateField("confirmPassword", form)}
              autoComplete="new-password"
            />
            <FieldError message={errors.confirmPassword} />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;