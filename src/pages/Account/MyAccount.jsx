import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import FieldError from "../../components/FieldError/FieldError";
import useFormValidation from "../../hooks/useFormValidation";
import { required, phoneVN, minLength, maxLength, sameAs } from "../../utils/validators";
import "./MyAccount.css";

// Đánh giá độ mạnh mật khẩu mới — chỉ là GỢI Ý hiển thị, quy tắc bắt buộc vẫn là tối thiểu 6 ký tự
const getPwStrength = (pw) => {
  if (!pw) return { level: 0, label: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: 1, label: "Yếu" };
  if (score <= 3) return { level: 2, label: "Trung bình" };
  return { level: 3, label: "Mạnh" };
};

// Chữ cái đầu của TÊN (từ cuối trong họ tên) để làm avatar — "Dương Nguyễn" → "N"
const getInitial = (name) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] || "?";
  return last.charAt(0).toUpperCase();
};

// Bộ icon SVG nét mảnh — thay emoji để giao diện đồng bộ, tự đổi màu theo màu chữ (currentColor)
const ICON_PATHS = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  box: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  truck: <><rect x="2" y="7" width="12" height="9" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18" /><circle cx="16" cy="15" r="1" /></>,
  chevron: <path d="M9 6l6 6-6 6" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
};
const Icon = ({ name, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICON_PATHS[name]}
  </svg>
);

// Đường dẫn trang "Đơn hàng của tôi" — khớp <Route path="/orders"> trong App.jsx
const ORDERS_PATH = "/orders";

const formatPrice = (n) => Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
const formatDateShort = (d) =>
  new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatMonthYear = (d) => {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getFullYear()}`;
};

// Phân loại trạng thái đơn giống MyOrders.jsx (Admin đặt tên trạng thái tự do nên suy ra theo nội dung)
const isCancelled = (status = "") => /huỷ|hủy/i.test(status);
const isDone = (status = "") => /hoàn thành|giao thành công/i.test(status);
const orderStatusClass = (status = "") => {
  const s = status.toLowerCase();
  if (isCancelled(s)) return "acc-status--cancelled";
  if (isDone(s)) return "acc-status--done";
  if (s.includes("giao")) return "acc-status--shipping";
  return "acc-status--processing";
};

// Luật kiểm tra — lỗi hiện chữ đỏ ngay dưới ô nhập
const PROFILE_RULES = {
  name: [
    required("Vui lòng nhập họ và tên."),
    minLength(2, "Họ tên cần ít nhất 2 ký tự."),
    maxLength(100, "Họ tên tối đa 100 ký tự."),
  ],
  phone: [phoneVN()], // không bắt buộc, nhưng nếu nhập thì phải đúng định dạng
  address: [maxLength(250, "Địa chỉ tối đa 250 ký tự.")],
};
const PW_RULES = {
  current: [required("Vui lòng nhập mật khẩu hiện tại.")],
  next: [
    required("Vui lòng nhập mật khẩu mới."),
    minLength(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
  ],
  confirm: [
    required("Vui lòng nhập lại mật khẩu mới."),
    sameAs("next", "Xác nhận mật khẩu mới chưa khớp."),
  ],
};

export default function MyAccount() {
  const { user, isLoggedIn, updateProfile, updateAvatar, changePassword } = useAuth();
  const navigate = useNavigate();
  const profileV = useFormValidation(PROFILE_RULES);
  const pwV = useFormValidation(PW_RULES);

  // Tab đang xem: "overview" | "profile" | "password"
  const [tab, setTab] = useState("overview");

  // ── Ảnh đại diện + ngày tham gia ──
  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [avatarBroken, setAvatarBroken] = useState(false); // ảnh lỗi tải → quay về chữ cái đầu
  const [joinedAt, setJoinedAt] = useState("");

  // ── Hồ sơ ──
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // ── Đổi mật khẩu ──
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  // ── Đơn hàng của tôi (cho tab Tổng quan) — cùng API với trang MyOrders ──
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    api
      .get("/Auth/me")
      .then((res) => {
        setProfileForm({ name: res.data.name || "", phone: res.data.phone || "", address: res.data.address || "" });
        setJoinedAt(res.data.createdAt || "");
      })
      .catch(() => {
        setProfileForm({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "" });
      })
      .finally(() => setLoadingProfile(false));
  }, [isLoggedIn, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoggedIn) return;
    api
      .get("/Orders/mine")
      .then((res) => setOrders(res.data))
      .catch(() => setOrdersError("Không thể tải thông tin đơn hàng lúc này."))
      .finally(() => setLoadingOrders(false));
  }, [isLoggedIn]);

  // Gõ lại thì xoá lỗi của chính ô đó
  const setProfileField = (f, v) => {
    setProfileForm((p) => ({ ...p, [f]: v }));
    profileV.clearError(f);
  };
  const setPwField = (f, v) => {
    setPwForm((p) => ({ ...p, [f]: v }));
    pwV.clearError(f);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    if (!profileV.validateAll(profileForm)) return;
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });
    try {
      await updateProfile(profileForm);
      setProfileMsg({ type: "success", text: "✓ Đã cập nhật thông tin thành công!" });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });

    if (!pwV.validateAll(pwForm)) return;

    setSavingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwMsg({ type: "success", text: "✓ Đã đổi mật khẩu thành công!" });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      // Sai mật khẩu hiện tại → hiện ngay dưới ô "Mật khẩu hiện tại"; lỗi khác → thông báo phía trên form
      if (/hiện tại/i.test(msg)) {
        pwV.setErrors((prev) => ({ ...prev, current: msg }));
      } else {
        setPwMsg({ type: "error", text: msg });
      }
    } finally {
      setSavingPw(false);
    }
  };

  // Chọn ảnh → kiểm tra loại/dung lượng → tải lên /Upload → lưu URL vào hồ sơ qua updateAvatar
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng 1 file
    if (!file) return;
    setAvatarMsg("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarMsg("Vui lòng chọn ảnh JPG, PNG hoặc WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg("Ảnh vượt quá 2MB, vui lòng chọn ảnh nhẹ hơn.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Content-Type: undefined để trình duyệt tự sinh multipart/form-data kèm boundary đúng
      const up = await api.post("/Upload", formData, { headers: { "Content-Type": undefined } });
      await updateAvatar(up.data.url);
      setAvatarBroken(false);
    } catch (err) {
      setAvatarMsg(err.response?.data?.message || "Không thể cập nhật ảnh đại diện, vui lòng thử lại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarMsg("");
    setUploadingAvatar(true);
    try {
      await updateAvatar("");
    } catch (err) {
      setAvatarMsg(err.response?.data?.message || "Không thể xoá ảnh, vui lòng thử lại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Số liệu tổng quan — doanh thu chỉ tính đơn Hoàn thành, giống cách Admin tính
  const inProgressCount = orders.filter((o) => !isCancelled(o.status) && !isDone(o.status)).length;
  const totalSpent = orders.filter((o) => isDone(o.status)).reduce((sum, o) => sum + o.total, 0);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const displayName = profileForm.name || user?.name || "Khách hàng";
  const strength = getPwStrength(pwForm.next);
  const pwInputType = showPw ? "text" : "password";

  return (
    <div className="myaccount-page">
      <div className="myaccount-header">
        <div className="section-inner myaccount-hero">
          <div className="account-avatar-wrap">
            <div className="account-avatar">
              {user?.avatarUrl && !avatarBroken ? (
                <img src={user.avatarUrl} alt="Ảnh đại diện" onError={() => setAvatarBroken(true)} />
              ) : (
                getInitial(displayName)
              )}
            </div>
            <button
              type="button"
              className="account-avatar-edit"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Đổi ảnh đại diện"
              title="Đổi ảnh đại diện"
            >
              <Icon name="camera" size={16} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarFile}
            />
          </div>
          <div className="myaccount-hero__text">
            <span className="eyebrow" style={{ color: "#c8a96e" }}>Tài khoản của bạn</span>
            <h1>{displayName}</h1>
            <p>{user?.email}</p>
            <div className="myaccount-hero__meta">
              {joinedAt && <span>Thành viên từ tháng {formatMonthYear(joinedAt)}</span>}
              {uploadingAvatar && <span>Đang cập nhật ảnh...</span>}
              {user?.avatarUrl && !uploadingAvatar && (
                <button type="button" className="account-avatar-remove" onClick={handleRemoveAvatar}>
                  Xoá ảnh
                </button>
              )}
            </div>
            {avatarMsg && <p className="account-avatar-msg">{avatarMsg}</p>}
          </div>
        </div>
      </div>

      <div className="section-inner myaccount-body">
        {/* ── Menu tài khoản (thành thanh tab ngang khi màn hình hẹp) ── */}
        <nav className="account-nav" aria-label="Menu tài khoản">
          <button
            type="button"
            className={`account-nav__item ${tab === "overview" ? "account-nav__item--active" : ""}`}
            onClick={() => setTab("overview")}
          >
            <span className="account-nav__icon"><Icon name="home" /></span> Tổng quan
          </button>
          <button
            type="button"
            className={`account-nav__item ${tab === "profile" ? "account-nav__item--active" : ""}`}
            onClick={() => setTab("profile")}
          >
            <span className="account-nav__icon"><Icon name="user" /></span> Hồ sơ cá nhân
          </button>
          <button
            type="button"
            className={`account-nav__item ${tab === "password" ? "account-nav__item--active" : ""}`}
            onClick={() => setTab("password")}
          >
            <span className="account-nav__icon"><Icon name="lock" /></span> Đổi mật khẩu
          </button>
        </nav>

        <div className="account-content">
          {/* ── Tổng quan: số liệu đơn hàng + 3 đơn gần nhất ── */}
          {tab === "overview" && (
            <Reveal as="div" className="account-card" direction="right" key="overview">
              <h2>Tổng quan</h2>
              <p className="account-card__sub">Xem nhanh hoạt động mua sắm của bạn tại LuxWood.</p>
              {loadingOrders ? (
                <p className="account-loading">Đang tải đơn hàng...</p>
              ) : ordersError ? (
                <p className="account-msg account-msg--error">{ordersError}</p>
              ) : (
                <>
                  <div className="acc-stats">
                    <div className="acc-stat">
                      <span className="acc-stat__icon"><Icon name="box" size={20} /></span>
                      <span className="acc-stat__value">{orders.length}</span>
                      <span className="acc-stat__label">Tổng đơn hàng</span>
                    </div>
                    <div className="acc-stat">
                      <span className="acc-stat__icon"><Icon name="truck" size={20} /></span>
                      <span className="acc-stat__value">{inProgressCount}</span>
                      <span className="acc-stat__label">Đơn đang xử lý / giao</span>
                    </div>
                    <div className="acc-stat">
                      <span className="acc-stat__icon"><Icon name="wallet" size={20} /></span>
                      <span className="acc-stat__value acc-stat__value--money">{formatPrice(totalSpent)}</span>
                      <span className="acc-stat__label">Đã chi tiêu (đơn hoàn thành)</span>
                    </div>
                  </div>

                  <div className="acc-recent__header">
                    <h3>Đơn hàng gần đây</h3>
                    {orders.length > 0 && (
                      <Link to={ORDERS_PATH} className="acc-recent__link">Xem tất cả →</Link>
                    )}
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="acc-empty">
                      <p>Bạn chưa có đơn hàng nào.</p>
                      <Link to="/products" className="btn-dark">Khám phá sản phẩm →</Link>
                    </div>
                  ) : (
                    <div className="acc-orders">
                      {recentOrders.map((o) => (
                        <Link to={ORDERS_PATH} className="acc-order" key={o.id}>
                          <div className="acc-order__left">
                            <strong>Đơn hàng #{o.id}</strong>
                            <span>{formatDateShort(o.createdAt)}</span>
                          </div>
                          <div className="acc-order__right">
                            <span className={`acc-status ${orderStatusClass(o.status)}`}>{o.status}</span>
                            <strong>{formatPrice(o.total)}</strong>
                          </div>
                          <span className="acc-order__chevron"><Icon name="chevron" size={16} /></span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Reveal>
          )}

          {/* ── Hồ sơ cá nhân ── */}
          {tab === "profile" && (
            <Reveal as="div" className="account-card" direction="right" key="profile">
              <h2>Hồ sơ cá nhân</h2>
              <p className="account-card__sub">Thông tin này dùng để giao hàng và liên hệ với bạn.</p>
              {loadingProfile ? (
                <p className="account-loading">Đang tải thông tin...</p>
              ) : (
                <form onSubmit={handleSaveProfile} className="account-form account-form--grid" noValidate>
                  {profileMsg.text && (
                    <p className={`account-msg account-msg--${profileMsg.type}`}>{profileMsg.text}</p>
                  )}
                  <div className="account-field account-field--full">
                    <label>Email</label>
                    <input type="email" value={user?.email || ""} disabled />
                    <span className="account-hint">Email không thể thay đổi.</span>
                  </div>
                  <div className="account-field">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      className={profileV.errors.name ? "is-invalid" : ""}
                      value={profileForm.name}
                      onChange={(e) => setProfileField("name", e.target.value)}
                      onBlur={() => profileV.validateField("name", profileForm)}
                    />
                    <FieldError message={profileV.errors.name} />
                  </div>
                  <div className="account-field">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      className={profileV.errors.phone ? "is-invalid" : ""}
                      value={profileForm.phone}
                      onChange={(e) => setProfileField("phone", e.target.value)}
                      onBlur={() => profileV.validateField("phone", profileForm)}
                    />
                    <FieldError message={profileV.errors.phone} />
                  </div>
                  <div className="account-field account-field--full">
                    <label>Địa chỉ</label>
                    <textarea
                      rows={2}
                      name="address"
                      className={profileV.errors.address ? "is-invalid" : ""}
                      value={profileForm.address}
                      onChange={(e) => setProfileField("address", e.target.value)}
                      onBlur={() => profileV.validateField("address", profileForm)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                    <FieldError message={profileV.errors.address} />
                    <span className="account-hint">Địa chỉ này sẽ được tự điền sẵn khi bạn đặt hàng.</span>
                  </div>
                  <button type="submit" className="btn-dark" disabled={savingProfile}>
                    {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              )}
            </Reveal>
          )}

          {/* ── Đổi mật khẩu ── */}
          {tab === "password" && (
            <Reveal as="div" className="account-card" direction="right" key="password">
              <h2>Đổi mật khẩu</h2>
              <p className="account-card__sub">Dùng mật khẩu đủ mạnh để bảo vệ tài khoản của bạn.</p>
              <form onSubmit={handleChangePassword} className="account-form" noValidate>
                {pwMsg.text && (
                  <p className={`account-msg account-msg--${pwMsg.type}`}>{pwMsg.text}</p>
                )}
                <div className="account-field">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type={pwInputType}
                    name="current"
                    className={pwV.errors.current ? "is-invalid" : ""}
                    value={pwForm.current}
                    onChange={(e) => setPwField("current", e.target.value)}
                    onBlur={() => pwV.validateField("current", pwForm)}
                    autoComplete="current-password"
                  />
                  <FieldError message={pwV.errors.current} />
                </div>
                <div className="account-field">
                  <label>Mật khẩu mới</label>
                  <input
                    type={pwInputType}
                    name="next"
                    className={pwV.errors.next ? "is-invalid" : ""}
                    value={pwForm.next}
                    onChange={(e) => setPwField("next", e.target.value)}
                    onBlur={() => {
                      pwV.validateField("next", pwForm);
                      // Đổi mật khẩu mới sau khi đã nhập ô xác nhận → kiểm tra lại độ khớp
                      if (pwForm.confirm) pwV.validateField("confirm", pwForm);
                    }}
                    autoComplete="new-password"
                  />
                  <FieldError message={pwV.errors.next} />
                  {pwForm.next ? (
                    <div className="pw-strength">
                      <div className="pw-strength__bars">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={`pw-strength__bar ${strength.level >= n ? `pw-strength__bar--l${strength.level}` : ""}`}
                          />
                        ))}
                      </div>
                      <span className={`pw-strength__label pw-strength__label--l${strength.level}`}>{strength.label}</span>
                    </div>
                  ) : (
                    <span className="account-hint">Ít nhất 6 ký tự. Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.</span>
                  )}
                </div>
                <div className="account-field">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type={pwInputType}
                    name="confirm"
                    className={pwV.errors.confirm ? "is-invalid" : ""}
                    value={pwForm.confirm}
                    onChange={(e) => setPwField("confirm", e.target.value)}
                    onBlur={() => pwV.validateField("confirm", pwForm)}
                    autoComplete="new-password"
                  />
                  <FieldError message={pwV.errors.confirm} />
                </div>
                <label className="pw-toggle">
                  <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
                  Hiện mật khẩu
                </label>
                <button type="submit" className="btn-dark" disabled={savingPw}>
                  {savingPw ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </form>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}