import { Link } from "react-router-dom";
import NewsletterForm from "../NewsletterForm/NewsletterForm";
import "./Footer.css";

// Tách ra từ Home.jsx — trước đây Footer nằm ngay trong Home.jsx nên CHỈ hiện ở trang chủ,
// mọi trang khác (Sản phẩm, Giới thiệu, Thanh toán...) đều thiếu. Giờ đặt component này ở
// MainLayout.jsx (bọc ngoài <Outlet/>) để hiện thống nhất ở MỌI trang Client.
const Footer = () => (
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
);

export default Footer;