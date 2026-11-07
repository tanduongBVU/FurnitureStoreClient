import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";

import "./Footer.css";

// Danh mục phòng — khớp với Navbar / Products.jsx để bấm vào là lọc đúng sản phẩm.
const ROOMS = ["Phòng khách", "Phòng ngủ", "Phòng ăn", "Phòng làm việc", "Phòng tắm", "Ban công"];

// Footer hiện ở MỌI trang Client (đặt ở MainLayout, ngoài <Outlet/>).
// Thông tin liên hệ lấy từ SiteSettings (footer.*) — Admin sửa ở trang Cài đặt giao diện là footer đổi theo.
const Footer = () => {
  const { get } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Dải kêu gọi hành động ở đầu footer */}
      <div className="footer__cta">
        <div className="footer__wrap footer__cta-inner">
          <h2>
            Không gian sống,
            <br />
            tinh tế từng đường nét.
          </h2>
          <Link to="/contact" className="footer__cta-btn">
            Liên hệ tư vấn <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="footer__wrap footer__grid">
        <div className="footer__brand">
          <span className="footer__logo">
            <span className="footer__logo-icon">⬡</span> LUXWOOD
          </span>
          <p>Nội thất gỗ cao cấp, thiết kế và thi công trọn gói cho mọi không gian sống.</p>
          <dl className="footer__contact">
            <div>
              <dt>Địa chỉ</dt>
              <dd>{get("footer.address", "123 Đường Nội Thất, Quận 1, TP.HCM")}</dd>
            </div>
            <div>
              <dt>Điện thoại</dt>
              <dd>{get("footer.phone", "0909 123 456")}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{get("footer.email", "hello@luxwood.vn")}</dd>
            </div>
          </dl>
        </div>

        <nav className="footer__col" aria-label="Khám phá">
          <h4>Khám phá</h4>
          <Link to="/">Trang chủ</Link>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/sale">Khuyến mãi</Link>
          <Link to="/blog">Cẩm nang</Link>
          <Link to="/contact">Liên hệ</Link>
        </nav>

        <nav className="footer__col" aria-label="Danh mục">
          <h4>Danh mục</h4>
          {ROOMS.map((room) => (
            <Link key={room} to={`/products?category=${encodeURIComponent(room)}`}>{room}</Link>
          ))}
        </nav>

        <nav className="footer__col" aria-label="Hỗ trợ">
          <h4>Dịch vụ &amp; hỗ trợ</h4>
          <Link to="/services/thi-cong">Dịch vụ thi công</Link>
          <Link to="/services/thiet-ke">Dịch vụ thiết kế</Link>
          <a href="#">Chính sách bảo hành</a>
          <a href="#">Hướng dẫn đặt hàng</a>
          <a href="#">Câu hỏi thường gặp</a>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="footer__wrap footer__bottom-inner">
          <p>© {year} LuxWood. Bảo lưu mọi quyền.</p>
          <button
            type="button"
            className="footer__top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Về đầu trang <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;