import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./MyAccount.css";

export default function MyAccount() {
  const { user, isLoggedIn, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  // ── Hồ sơ ──
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // ── Đổi mật khẩu ──
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    api
      .get("/Auth/me")
      .then((res) => {
        setProfileForm({ name: res.data.name || "", phone: res.data.phone || "", address: res.data.address || "" });
      })
      .catch(() => {
        setProfileForm({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "" });
      })
      .finally(() => setLoadingProfile(false));
  }, [isLoggedIn, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const setProfileField = (f, v) => setProfileForm((p) => ({ ...p, [f]: v }));
  const setPwField = (f, v) => setPwForm((p) => ({ ...p, [f]: v }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
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

    if (pwForm.next.length < 6) {
      setPwMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "Xác nhận mật khẩu mới không khớp." });
      return;
    }

    setSavingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwMsg({ type: "success", text: "✓ Đã đổi mật khẩu thành công!" });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="myaccount-page">
      <div className="myaccount-header">
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Tài khoản của bạn</span>
          <h1>Thông tin tài khoản</h1>
          <p>Cập nhật thông tin cá nhân và bảo mật tài khoản của bạn.</p>
        </div>
      </div>

      <div className="section-inner myaccount-body">
        {/* ── Hồ sơ cá nhân ── */}
        <Reveal as="div" className="account-card" direction="left">
          <h2>Hồ sơ cá nhân</h2>
          {loadingProfile ? (
            <p className="account-loading">Đang tải thông tin...</p>
          ) : (
            <form onSubmit={handleSaveProfile} className="account-form">
              {profileMsg.text && (
                <p className={`account-msg account-msg--${profileMsg.type}`}>{profileMsg.text}</p>
              )}
              <div className="account-field">
                <label>Email</label>
                <input type="email" value={user?.email || ""} disabled />
                <span className="account-hint">Email không thể thay đổi.</span>
              </div>
              <div className="account-field">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileField("name", e.target.value)}
                  required
                />
              </div>
              <div className="account-field">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileField("phone", e.target.value)}
                />
              </div>
              <div className="account-field">
                <label>Địa chỉ</label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) => setProfileField("address", e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
                <span className="account-hint">Địa chỉ này sẽ được tự điền sẵn khi bạn đặt hàng.</span>
              </div>
              <button type="submit" className="btn-dark" disabled={savingProfile}>
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          )}
        </Reveal>

        {/* ── Đổi mật khẩu ── */}
        <Reveal as="div" className="account-card" direction="right" delay={120}>
          <h2>Đổi mật khẩu</h2>
          <form onSubmit={handleChangePassword} className="account-form">
            {pwMsg.text && (
              <p className={`account-msg account-msg--${pwMsg.type}`}>{pwMsg.text}</p>
            )}
            <div className="account-field">
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                value={pwForm.current}
                onChange={(e) => setPwField("current", e.target.value)}
                required
              />
            </div>
            <div className="account-field">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwField("next", e.target.value)}
                required
                minLength={6}
              />
              <span className="account-hint">Ít nhất 6 ký tự.</span>
            </div>
            <div className="account-field">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwField("confirm", e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-dark" disabled={savingPw}>
              {savingPw ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}