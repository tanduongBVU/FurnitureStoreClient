import Navbar from "../components/Navbar/Navbar";
import PromoBanner from "../components/PromoBanner/PromoBanner";
import NewsletterPopup from "../components/NewsletterPopup/NewsletterPopup";
import CompareBar from "../components/CompareBar/CompareBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => (
  <>
    <PromoBanner />
    <Navbar />
    {/* 72px = chiều cao Navbar cố định (--nav-height trong Navbar.css).
        var(--banner-h) = chiều cao banner khuyến mãi, do PromoBanner tự set — 0px nếu banner tắt. */}
    <main style={{ paddingTop: "calc(72px + var(--banner-h, 0px))", width: "100%" }}>
      <Outlet />
    </main>
    {/* Popup đăng ký nhận tin — đặt ở MainLayout (không phải Home) để hiện được ở MỌI trang
        Client, không chỉ riêng Trang chủ. Tự ẩn vĩnh viễn sau khi khách đóng/đăng ký
        (xem STORAGE_KEY trong NewsletterPopup.jsx). */}
    <NewsletterPopup />
    {/* Thanh so sánh nổi cố định dưới màn hình — tự ẩn khi danh sách so sánh rỗng
        (xem CompareBar.jsx), hiện ở mọi trang để khách so sánh xong ở Products vẫn
        thấy thanh này khi lỡ chuyển sang trang khác trước khi bấm "So sánh ngay". */}
    <CompareBar />
  </>
);

export default MainLayout;