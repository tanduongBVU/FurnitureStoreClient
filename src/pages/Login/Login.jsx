import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import GoogleLoginButton from "../../components/GoogleLoginButton/GoogleLoginButton";
import FieldError from "../../components/FieldError/FieldError";
import useFormValidation from "../../hooks/useFormValidation";
import { required, email } from "../../utils/validators";
import "./Login.css";

// Luật kiểm tra từng ô — lỗi hiện chữ đỏ ngay dưới ô nhập
const RULES = {
  email: [required("Vui lòng nhập email."), email()],
  password: [required("Vui lòng nhập mật khẩu.")],
};

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { errors, validateField, validateAll, clearError } = useFormValidation(RULES);

  // Gõ lại thì xoá lỗi của chính ô đó
  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    clearError(f);
  };

  const redirectTo = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateAll(form)) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="auth-page">
      <Reveal as="div" className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">⬡</span>
          <span className="auth-logo-text">LuxWood</span>
        </div>
        <h1>Đăng nhập</h1>
        <p className="auth-desc">Chào mừng bạn quay lại LuxWood</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <div className="auth-google-wrap">
          <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={setError} />
        </div>

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className={errors.password ? "is-invalid" : ""}
              value={form.password}
              onChange={e => set("password", e.target.value)}
              onBlur={() => validateField("password", form)}
              autoComplete="current-password"
            />
            <FieldError message={errors.password} />
            {/* Quên mật khẩu → gửi link đặt lại qua email (xem pages/ForgotPassword) */}
            <div style={{ textAlign: "right", marginTop: 6 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: "#a8854a", textDecoration: "none" }}>
                Quên mật khẩu?
              </Link>
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </Reveal>
    </div>
  );
};

export default Login;