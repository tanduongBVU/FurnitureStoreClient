import { useState } from "react";
import api from "../../services/api";
import { useSettings } from "../../contexts/SettingsContext";
import Reveal from "../../components/Reveal/Reveal";
import "./Contact.css";

const Contact = () => {
  const { get } = useSettings();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(""); // "", "success", "error"
  const setField = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");
    try {
      await api.post("/Contacts", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        status: "Mới",
      });
      setStatus("success");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  // Địa chỉ dùng chung với Footer/Home — lấy từ CMS để không lệch thông tin giữa các trang
  const address = get("footer.address", "123 Đường Nội Thất, Quận 1, TP.HCM");
  // Địa chỉ RIÊNG cho bản đồ — có thể khác định dạng với địa chỉ hiển thị đẹp cho khách đọc,
  // vì Google Maps geocode chính xác hơn với địa chỉ ngắn gọn kiểu "số nhà, đường, phường,
  // thành phố" (không có tên toà nhà/ghi chú). Nếu Admin chưa cấu hình riêng, tạm dùng chung
  // địa chỉ hiển thị — vẫn hoạt động, chỉ có thể kém chính xác hơn.
  const mapAddress = get("footer.mapAddress", "") || address;

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Liên hệ</span>
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>Đội ngũ LuxWood luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>
      </div>

      <div className="section-inner contact-body">
        <Reveal as="div" className="contact-info-col" direction="left">
          <span className="eyebrow">Thông tin liên hệ</span>
          <h2>Kết nối cùng LuxWood</h2>
          <p className="contact-info-desc">
            Bạn cần tư vấn về sản phẩm, đặt hàng số lượng lớn, hay có góp ý cho chúng tôi?
            Đừng ngần ngại liên hệ qua các kênh dưới đây.
          </p>
          <ul className="contact-info-list">
            <li>
              <span className="contact-info-icon">📍</span>
              <div>
                <strong>Địa chỉ</strong>
                <span>{address}</span>
              </div>
            </li>
            <li>
              <span className="contact-info-icon">📞</span>
              <div>
                <strong>Điện thoại</strong>
                <span>{get("footer.phone", "0909 123 456")}</span>
              </div>
            </li>
            <li>
              <span className="contact-info-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <span>{get("footer.email", "hello@luxwood.vn")}</span>
              </div>
            </li>
            <li>
              <span className="contact-info-icon">🕐</span>
              <div>
                <strong>Giờ làm việc</strong>
                <span>{get("footer.hours", "Thứ 2 – Thứ 7: 8:00 – 20:00")}</span>
              </div>
            </li>
          </ul>

          {/* Bản đồ Google Maps nhúng bằng iframe embed công khai — không cần API key,
              chỉ cần địa chỉ text được Google Maps tự geocode. */}
          <div className="contact-map">
            <iframe
              title="Bản đồ LuxWood"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>

        <Reveal as="form" className="contact-form-col" direction="right" delay={120} onSubmit={handleSubmit}>
          <h3>Gửi yêu cầu tư vấn</h3>

          {status === "success" && (
            <p className="contact-form-msg contact-form-msg--success">
              ✓ Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
            </p>
          )}
          {status === "error" && (
            <p className="contact-form-msg contact-form-msg--error">
              ⚠️ Gửi thất bại, vui lòng thử lại sau.
            </p>
          )}

          <div className="contact-form-field">
            <label>Họ và tên *</label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={e => setField("name", e.target.value)}
              required
            />
          </div>
          <div className="contact-form-field">
            <label>Số điện thoại *</label>
            <input
              type="tel"
              placeholder="09xxxxxxxx"
              value={form.phone}
              onChange={e => setField("phone", e.target.value)}
              required
            />
          </div>
          <div className="contact-form-field">
            <label>Email *</label>
            <input
              type="email"
              placeholder="ban@email.com"
              value={form.email}
              onChange={e => setField("email", e.target.value)}
              required
            />
          </div>
          <div className="contact-form-field">
            <label>Nội dung *</label>
            <textarea
              rows={5}
              placeholder="Nội dung cần tư vấn..."
              value={form.message}
              onChange={e => setField("message", e.target.value)}
              required
            />
          </div>

          <button type="submit" className="contact-form-submit" disabled={sending}>
            {sending ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;