import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import "./Home.css";

// ── Data ──────────────────────────────────────────────
const slides = [
  {
    id: 1,
    title: "Không gian sống\nđẳng cấp",
    sub: "Nội thất cao cấp — tinh tế từng đường nét",
    bg: "#2c1f10",
    accent: "#c8a96e",
  },
  {
    id: 2,
    title: "Chất liệu\ntự nhiên",
    sub: "Gỗ óc chó, gỗ sồi nhập khẩu chính hãng",
    bg: "#1a2c20",
    accent: "#7ab87a",
  },
  {
    id: 3,
    title: "Thiết kế\nriêng cho bạn",
    sub: "Tư vấn & thi công theo yêu cầu",
    bg: "#1a1f2c",
    accent: "#6e9ec8",
  },
];

const rooms = [
  { id: 1, label: "Phòng Khách", icon: "🛋️", desc: "Sofa, kệ TV, bàn trà, tủ trang trí" },
  { id: 2, label: "Phòng Ngủ", icon: "🛏️", desc: "Giường, tủ quần áo, bàn đầu giường" },
  { id: 3, label: "Phòng Ăn", icon: "🍽️", desc: "Bàn ăn, ghế ăn, tủ bếp, kệ rượu" },
  { id: 4, label: "Phòng Làm Việc", icon: "💼", desc: "Bàn làm việc, ghế công thái học, kệ sách" },
  { id: 5, label: "Phòng Tắm", icon: "🚿", desc: "Tủ gương, kệ đựng đồ, ghế tắm" },
  { id: 6, label: "Ban Công", icon: "🌿", desc: "Bàn ghế ngoài trời, xích đu, đèn sân vườn" },
];

// ── Component ─────────────────────────────────────────
export default function Home() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const { addToCart } = useCart();

  const [bestSellers, setBestSellers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactStatus, setContactStatus] = useState(""); // "", "success", "error"
  const setContactField = (f, v) => setContactForm(p => ({ ...p, [f]: v }));

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSending(true);
    setContactStatus("");
    try {
      await api.post("/Contacts", {
        name: contactForm.name,
        phone: contactForm.phone,
        email: contactForm.email,
        message: contactForm.message,
        status: "Mới",
      });
      setContactStatus("success");
      setContactForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setContactStatus("error");
    } finally {
      setContactSending(false);
    }
  };

  useEffect(() => {
    api.get("/Products")
      .then(res => {
        const best = res.data.filter(p => p.isBestSeller).slice(0, 4);
        setBestSellers(best);
      })
      .catch(() => setBestSellers([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const goTo = (idx) => {
    setCurrent((idx + slides.length) % slides.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => goTo(current + 1), 4500);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const slide = slides[current];
  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  return (
    <div className="home">

      {/* ── SLIDER ── */}
      <section className="hero-slider" style={{ background: slide.bg }}>
        <div className="hero-content">
          <span className="hero-eyebrow" style={{ color: slide.accent }}>LuxWood Collection 2025</span>
          <h1 className="hero-title" style={{ "--accent": slide.accent }}>
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className="hero-sub">{slide.sub}</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary" style={{ background: slide.accent, color: "#1a1208" }}>
              Khám phá ngay
            </Link>
            <Link to="/about" className="btn-ghost">Về chúng tôi</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-placeholder" style={{ borderColor: slide.accent }}>
            <span style={{ color: slide.accent, fontSize: 48 }}>🛋️</span>
            <p style={{ color: slide.accent, opacity: 0.6, fontSize: 13, marginTop: 12 }}>Ảnh sản phẩm</p>
          </div>
        </div>
        {/* Dots */}
        <div className="slider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? "dot--active" : ""}`}
              style={{ background: i === current ? slide.accent : "rgba(255,255,255,0.3)" }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        {/* Arrows */}
        <button className="arrow arrow--left" onClick={() => goTo(current - 1)}>‹</button>
        <button className="arrow arrow--right" onClick={() => goTo(current + 1)}>›</button>
      </section>

      {/* ── GIỚI THIỆU ── */}
      <section className="about-section">
        <div className="section-inner">
          <div className="about-text">
            <span className="eyebrow">Về LuxWood</span>
            <h2>Hơn 15 năm kiến tạo<br />không gian sống đẹp</h2>
            <p>Chúng tôi tin rằng một ngôi nhà đẹp bắt đầu từ những món đồ nội thất được làm ra với tâm huyết. Mỗi sản phẩm của LuxWood đều được chọn lọc từ gỗ tự nhiên cao cấp, gia công thủ công tỉ mỉ và qua kiểm định chất lượng nghiêm ngặt.</p>
            <div className="stats">
              <div className="stat"><strong>500+</strong><span>Sản phẩm</span></div>
              <div className="stat"><strong>10.000+</strong><span>Khách hàng</span></div>
              <div className="stat"><strong>15+</strong><span>Năm kinh nghiệm</span></div>
            </div>
            <Link to="/about" className="btn-outline">Tìm hiểu thêm →</Link>
          </div>
          <div className="about-img">
            <div className="img-placeholder">
              <span style={{ fontSize: 64 }}>🏠</span>
              <p>Ảnh showroom</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SẢN PHẨM BÁN CHẠY ── */}
      <section className="products-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Được yêu thích nhất</span>
            <h2>Sản phẩm bán chạy</h2>
          </div>

          {loadingProducts ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Đang tải sản phẩm...</p>
          ) : bestSellers.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Chưa có sản phẩm nào được đánh dấu bán chạy.
            </p>
          ) : (
            <div className="products-grid">
              {bestSellers.map((p) => (
                <Link to={`/products/${p.id}`} className="product-card" key={p.id}>
                  <div className="product-img">
                    {p.image
                      ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      : <span style={{ fontSize: 40 }}>🪑</span>
                    }
                    <span className="product-tag">Bán chạy</span>
                  </div>
                  <div className="product-info">
                    <span className="product-cat">{p.category}</span>
                    <h3>{p.name}</h3>
                    <div className="product-footer">
                      <strong className="product-price">{formatPrice(p.price)}</strong>
                      <button
                        className="btn-add"
                        onClick={(e) => { e.preventDefault(); addToCart(p, 1); }}
                      >+ Thêm</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/products" className="btn-outline">Xem tất cả sản phẩm →</Link>
          </div>
        </div>
      </section>

      {/* ── PHÒNG ── */}
      <section className="rooms-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Danh mục</span>
            <h2>Nội thất theo từng phòng</h2>
          </div>
          <div className="rooms-grid">
            {rooms.map((r) => (
              <Link to="/products" className="room-card" key={r.id}>
                <span className="room-icon">{r.icon}</span>
                <h3>{r.label}</h3>
                <p>{r.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIÊN HỆ ── */}
      <section className="contact-section">
        <div className="section-inner contact-inner">
          <div className="contact-text">
            <span className="eyebrow" style={{ color: "#c8a96e" }}>Liên hệ</span>
            <h2 style={{ color: "#fff" }}>Bạn cần tư vấn?</h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn chọn lựa nội thất phù hợp nhất.</p>
            <ul className="contact-list">
              <li>📍 123 Đường Nội Thất, Quận 1, TP.HCM</li>
              <li>📞 0909 123 456</li>
              <li>✉️ hello@luxwood.vn</li>
              <li>🕐 Thứ 2 – Thứ 7: 8:00 – 20:00</li>
            </ul>
          </div>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            {contactStatus === "success" && (
              <p style={{ color: "#7ab87a", fontSize: 14, margin: 0 }}>
                ✓ Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
              </p>
            )}
            {contactStatus === "error" && (
              <p style={{ color: "#e07a7a", fontSize: 14, margin: 0 }}>
                ⚠️ Gửi thất bại, vui lòng thử lại sau.
              </p>
            )}
            <input
              type="text"
              placeholder="Họ và tên"
              value={contactForm.name}
              onChange={e => setContactField("name", e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={contactForm.phone}
              onChange={e => setContactField("phone", e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={contactForm.email}
              onChange={e => setContactField("email", e.target.value)}
              required
            />
            <textarea
              rows={4}
              placeholder="Nội dung cần tư vấn..."
              value={contactForm.message}
              onChange={e => setContactField("message", e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ background: "#c8a96e", color: "#1a1208", width: "100%", justifyContent: "center" }}
              disabled={contactSending}
            >
              {contactSending ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="section-inner footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">⬡ <strong>LuxWood</strong></span>
            <p>Không gian sống — tinh tế từng đường nét.</p>
          </div>
          <div className="footer-links">
            <h4>Trang</h4>
            <Link to="/">Trang chủ</Link>
            <Link to="/about">Giới thiệu</Link>
            <Link to="/products">Sản phẩm</Link>
          </div>
          <div className="footer-links">
            <h4>Danh mục</h4>
            <Link to="/products">Phòng khách</Link>
            <Link to="/products">Phòng ngủ</Link>
            <Link to="/products">Phòng ăn</Link>
          </div>
          <div className="footer-links">
            <h4>Hỗ trợ</h4>
            <a href="#">Chính sách bảo hành</a>
            <a href="#">Hướng dẫn đặt hàng</a>
            <a href="#">Câu hỏi thường gặp</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 LuxWood. Bảo lưu mọi quyền.</p>
        </div>
      </footer>

    </div>
  );
}
