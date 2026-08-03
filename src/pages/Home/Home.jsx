import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

const bestSellers = [
  { id: 1, name: "Sofa Bắc Âu Oslo", price: "18.500.000", category: "Phòng khách", tag: "Bán chạy" },
  { id: 2, name: "Bàn ăn Walnut 6 ghế", price: "24.900.000", category: "Phòng ăn", tag: "Mới" },
  { id: 3, name: "Giường ngủ Nordic", price: "14.200.000", category: "Phòng ngủ", tag: "Bán chạy" },
  { id: 4, name: "Kệ TV tối giản", price: "8.700.000", category: "Phòng khách", tag: "" },
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

  const goTo = (idx) => {
    setCurrent((idx + slides.length) % slides.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => goTo(current + 1), 4500);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const slide = slides[current];

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
          <div className="products-grid">
            {bestSellers.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-img">
                  <span style={{ fontSize: 40 }}>🪑</span>
                  {p.tag && <span className="product-tag">{p.tag}</span>}
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <div className="product-footer">
                    <strong className="product-price">{p.price} ₫</strong>
                    <button className="btn-add">+ Thêm</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Họ và tên" />
            <input type="tel" placeholder="Số điện thoại" />
            <input type="email" placeholder="Email" />
            <textarea rows={4} placeholder="Nội dung cần tư vấn..." />
            <button type="submit" className="btn-primary" style={{ background: "#c8a96e", color: "#1a1208", width: "100%", justifyContent: "center" }}>
              Gửi yêu cầu
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
