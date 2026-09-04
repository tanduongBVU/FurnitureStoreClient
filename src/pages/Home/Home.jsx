import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useSettings } from "../../contexts/SettingsContext";
import Reveal from "../../components/Reveal/Reveal";
import WishlistButton from "../../components/WishlistButton/WishlistButton";
import CompareButton from "../../components/CompareButton/CompareButton";
import RatingStars from "../../components/RatingStars/RatingStars";
import NewsletterForm from "../../components/NewsletterForm/NewsletterForm";
import "./Home.css";

const rooms = [
  { id: 1, label: "Phòng Khách", icon: "🛋️", desc: "Sofa, kệ TV, bàn trà, tủ trang trí" },
  { id: 2, label: "Phòng Ngủ", icon: "🛏️", desc: "Giường, tủ quần áo, bàn đầu giường" },
  { id: 3, label: "Phòng Ăn", icon: "🍽️", desc: "Bàn ăn, ghế ăn, tủ bếp, kệ rượu" },
  { id: 4, label: "Phòng Làm Việc", icon: "💼", desc: "Bàn làm việc, ghế công thái học, kệ sách" },
  { id: 5, label: "Phòng Tắm", icon: "🚿", desc: "Tủ gương, kệ đựng đồ, ghế tắm" },
  { id: 6, label: "Ban Công", icon: "🌿", desc: "Bàn ghế ngoài trời, xích đu, đèn sân vườn" },
];

// Nếu sản phẩm đang giảm giá, trả về bản sao với price = giá đã giảm
// (dùng khi thêm vào giỏ để giỏ hàng luôn tính đúng giá đang bán, không phải giá gốc)
const withSalePrice = (p) =>
  p.discountPercent > 0
    ? { ...p, price: Math.round(p.price * (1 - p.discountPercent / 100)) }
    : p;

// ── Component ─────────────────────────────────────────
export default function Home() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const { addToCart } = useCart();
  const { get } = useSettings();
  const location = useLocation();

  // Nếu URL có #contact (VD: bấm "Liên Hệ" ở Navbar từ trang khác) → tự cuộn mượt xuống
  useEffect(() => {
    if (location.hash === "#contact") {
      const t = setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [location]);

  const slides = [
    {
      id: 1,
      title: get("hero.slide1.title", "Không gian sống\nđẳng cấp"),
      sub: get("hero.slide1.subtitle", "Nội thất cao cấp — tinh tế từng đường nét"),
      bg: get("hero.slide1.bg", "#2c1f10"),
      accent: get("hero.slide1.accent", "#c8a96e"),
      img: get("hero.slide1.image", "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&q=80&auto=format&fit=crop"),
      video: get("hero.slide1.video", ""),
    },
    {
      id: 2,
      title: get("hero.slide2.title", "Chất liệu\ntự nhiên"),
      sub: get("hero.slide2.subtitle", "Gỗ óc chó, gỗ sồi nhập khẩu chính hãng"),
      bg: get("hero.slide2.bg", "#1a2c20"),
      accent: get("hero.slide2.accent", "#7ab87a"),
      img: get("hero.slide2.image", "https://images.unsplash.com/photo-1621295693450-080546d2ec8e?w=1600&q=80&auto=format&fit=crop"),
      video: get("hero.slide2.video", ""),
    },
    {
      id: 3,
      title: get("hero.slide3.title", "Thiết kế\nriêng cho bạn"),
      sub: get("hero.slide3.subtitle", "Tư vấn & thi công theo yêu cầu"),
      bg: get("hero.slide3.bg", "#1a1f2c"),
      accent: get("hero.slide3.accent", "#6e9ec8"),
      img: get("hero.slide3.image", "https://images.unsplash.com/photo-1687180498602-5a1046defaa4?w=1600&q=80&auto=format&fit=crop"),
      video: get("hero.slide3.video", ""),
    },
  ];

  const [bestSellers, setBestSellers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ── Combo tiết kiệm ──
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(true);

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

  // Tải danh sách combo — độc lập với việc tải sản phẩm bán chạy ở trên (2 useEffect
  // riêng), để 1 API chậm/lỗi không làm phần còn lại của trang bị chặn theo.
  useEffect(() => {
    api.get("/Bundles")
      .then(res => setBundles(res.data.slice(0, 3))) // chỉ hiện tối đa 3 combo ở trang chủ
      .catch(() => setBundles([]))
      .finally(() => setLoadingBundles(false));
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
  const salePriceOf = (p) => p.price * (1 - (p.discountPercent || 0) / 100);

  // Thêm CẢ combo vào giỏ chỉ với 1 lần bấm — áp % giảm của combo lên TỪNG sản phẩm
  // trước khi thêm, để tổng tiền hiện trong giỏ hàng khớp CHÍNH XÁC với FinalPrice đã
  // quảng cáo ở thẻ combo (không lệch do làm tròn cộng dồn nhiều lần).
  const addBundleToCart = (bundle) => {
    bundle.items.forEach((item) => {
      const discountedUnitPrice = item.productPrice * (1 - bundle.discountPercent / 100);
      addToCart(
        { id: item.productId, name: item.productName, image: item.productImage, price: discountedUnitPrice },
        item.quantity
      );
    });
  };

  return (
    <div className="home">

      {/* ── SLIDER ── */}
      <section className="hero-slider" style={{ background: slide.bg }}>
        {slide.video ? (
          <video
            key={`video-${slide.id}`}
            className="hero-bg-video"
            src={slide.video}
            poster={slide.img || undefined}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            key={`img-${slide.id}`}
            src={slide.img}
            alt={slide.title.replace("\n", " ")}
            className="hero-bg-image"
          />
        )}
        <div className="hero-overlay" />

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

        {/* Dots */}
        <div className="slider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? "dot--active" : ""}`}
              style={{ background: i === current ? slide.accent : "rgba(255,255,255,0.4)" }}
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
          <Reveal as="div" className="about-text" direction="left">
            <span className="eyebrow">Về LuxWood</span>
            <h2>
              {get("about.title", "Hơn 15 năm kiến tạo\nkhông gian sống đẹp").split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <p>{get("about.description", "Chúng tôi tin rằng một ngôi nhà đẹp bắt đầu từ những món đồ nội thất được làm ra với tâm huyết. Mỗi sản phẩm của LuxWood đều được chọn lọc từ gỗ tự nhiên cao cấp, gia công thủ công tỉ mỉ và qua kiểm định chất lượng nghiêm ngặt.")}</p>
            <div className="stats">
              <div className="stat"><strong>{get("about.stat1Number", "500+")}</strong><span>{get("about.stat1Label", "Sản phẩm")}</span></div>
              <div className="stat"><strong>{get("about.stat2Number", "10.000+")}</strong><span>{get("about.stat2Label", "Khách hàng")}</span></div>
              <div className="stat"><strong>{get("about.stat3Number", "15+")}</strong><span>{get("about.stat3Label", "Năm kinh nghiệm")}</span></div>
            </div>
            <Link to="/about" className="btn-outline">Tìm hiểu thêm →</Link>
          </Reveal>
          <Reveal as="div" className="about-img" direction="right" delay={120}>
            <img
              src={get("about.image", "https://images.unsplash.com/photo-1680503397090-0483be73406f?w=1200&q=80&auto=format&fit=crop")}
              alt="Showroom LuxWood"
              className="about-real-img"
            />
          </Reveal>
        </div>
      </section>

      {/* ── SẢN PHẨM BÁN CHẠY ── */}
      <section className="products-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Được yêu thích nhất</span>
            <h2>Sản phẩm bán chạy</h2>
          </Reveal>

          {loadingProducts ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Đang tải sản phẩm...</p>
          ) : bestSellers.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Chưa có sản phẩm nào được đánh dấu bán chạy.
            </p>
          ) : (
            <div className="products-grid">
              {bestSellers.map((p, idx) => {
                const hasDiscount = p.discountPercent > 0;
                return (
                  <Reveal as="div" key={p.id} delay={Math.min(idx * 80, 320)}>
                  <Link to={`/products/${p.id}`} className="product-card">
                    <div className="product-img">
                      {p.image
                        ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                        : <span style={{ fontSize: 40 }}>🪑</span>
                      }
                      <span className="product-tag">Bán chạy</span>
                      {hasDiscount && (
                        <span
                          style={{
                            position: "absolute", top: 52, right: 12,
                            background: "#c0392b", color: "#fff", fontSize: 11, fontWeight: 700,
                            padding: "4px 10px", borderRadius: 20, letterSpacing: .5,
                          }}
                        >
                          -{p.discountPercent}%
                        </span>
                      )}
                      <WishlistButton product={p} />
                      <CompareButton product={p} />
                    </div>
                    <div className="product-info">
                      <span className="product-cat">{p.category}</span>
                      <h3>{p.name}</h3>
                      <RatingStars avg={p.averageRating} count={p.reviewCount} />
                      <div className="product-footer">
                        {hasDiscount ? (
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <strong className="product-price" style={{ color: "#b3492f" }}>{formatPrice(salePriceOf(p))}</strong>
                            <span style={{ fontSize: 12, color: "#9a9186", textDecoration: "line-through" }}>{formatPrice(p.price)}</span>
                          </span>
                        ) : (
                          <strong className="product-price">{formatPrice(p.price)}</strong>
                        )}
                        <button
                          className="btn-add"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({ ...p, price: hasDiscount ? salePriceOf(p) : p.price }, 1);
                          }}
                        >+ Thêm</button>
                      </div>
                    </div>
                  </Link>
                  </Reveal>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/products" className="btn-outline">Xem tất cả sản phẩm →</Link>
          </div>
        </div>
      </section>

      {/* ── COMBO TIẾT KIỆM ── */}
      {/* Ẩn hoàn toàn cả section nếu chưa có combo nào — tránh lộ khung rỗng xấu xí
          trên trang chủ trong lúc Admin chưa tạo combo nào. */}
      {!loadingBundles && bundles.length > 0 && (
        <section className="bundles-section">
          <div className="section-inner">
            <Reveal as="div" className="section-header">
              <span className="eyebrow">Mua trọn bộ, tiết kiệm hơn</span>
              <h2>Combo tiết kiệm</h2>
            </Reveal>

            <div className="bundles-grid-home">
              {bundles.map((b, idx) => {
                const coverImage = b.image || b.items[0]?.productImage;
                return (
                  <Reveal as="div" key={b.id} delay={Math.min(idx * 90, 320)}>
                    <div className="bundle-card-home">
                      <div className="bundle-card-home__img">
                        {coverImage
                          ? <img src={coverImage} alt={b.name} onError={e => e.target.style.display = "none"} />
                          : <span style={{ fontSize: 40 }}>🎁</span>
                        }
                        {b.discountPercent > 0 && (
                          <span className="bundle-card-home__badge">Giảm thêm {b.discountPercent}%</span>
                        )}
                      </div>
                      <div className="bundle-card-home__body">
                        <h3>{b.name}</h3>
                        <ul className="bundle-card-home__items">
                          {b.items.slice(0, 3).map(item => (
                            <li key={item.productId}>{item.productName} x{item.quantity}</li>
                          ))}
                          {b.items.length > 3 && <li>...và {b.items.length - 3} sản phẩm khác</li>}
                        </ul>
                        <div className="bundle-card-home__price">
                          {b.discountPercent > 0 && (
                            <span className="bundle-card-home__price-original">{formatPrice(b.subtotal)}</span>
                          )}
                          <strong>{formatPrice(b.finalPrice)}</strong>
                        </div>
                        <button className="btn-primary bundle-card-home__btn" style={{ background: "var(--walnut)", color: "#fff" }} onClick={() => addBundleToCart(b)}>
                          Thêm cả combo vào giỏ
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PHÒNG ── */}
      <section className="rooms-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Danh mục</span>
            <h2>Nội thất theo từng phòng</h2>
          </Reveal>
          <div className="rooms-grid">
            {rooms.map((r, idx) => {
              const roomImage = get(`rooms.room${r.id}.image`, "");
              return (
                <Reveal as="div" key={r.id} delay={Math.min(idx * 70, 350)}>
                <Link to="/products" className="room-card">
                  <div className="room-img">
                    {roomImage ? (
                      <>
                        <img src={roomImage} alt={r.label} />
                        <span className="room-icon">{r.icon}</span>
                      </>
                    ) : (
                      <div className="room-img-placeholder">
                        <span style={{ fontSize: 40 }}>{r.icon}</span>
                      </div>
                    )}
                  </div>
                  <div className="room-card-body">
                    <h3>{r.label}</h3>
                    <p>{r.desc}</p>
                  </div>
                </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LIÊN HỆ ── */}
      <section className="contact-section" id="contact">
        <div className="section-inner contact-inner">
          <Reveal as="div" className="contact-text" direction="left">
            <span className="eyebrow" style={{ color: "#c8a96e" }}>Liên hệ</span>
            <h2 style={{ color: "#fff" }}>Bạn cần tư vấn?</h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn chọn lựa nội thất phù hợp nhất.</p>
            <ul className="contact-list">
              <li>📍 {get("footer.address", "123 Đường Nội Thất, Quận 1, TP.HCM")}</li>
              <li>📞 {get("footer.phone", "0909 123 456")}</li>
              <li>✉️ {get("footer.email", "hello@luxwood.vn")}</li>
              <li>🕐 {get("footer.hours", "Thứ 2 – Thứ 7: 8:00 – 20:00")}</li>
            </ul>
          </Reveal>
          <Reveal as="form" className="contact-form" direction="right" delay={120} onSubmit={handleContactSubmit}>
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
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="section-inner footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">⬡ <strong>LuxWood</strong></span>
            <p>Không gian sống — tinh tế từng đường nét.</p>
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
                Đăng ký nhận tin khuyến mãi mới nhất
              </p>
              <NewsletterForm variant="inline" />
            </div>
          </div>
          <div className="footer-links">
            <h4>Trang</h4>
            <Link to="/">Trang chủ</Link>
            <Link to="/about">Giới thiệu</Link>
            <Link to="/products">Sản phẩm</Link>
            <Link to="/sale">Khuyến mãi</Link>
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