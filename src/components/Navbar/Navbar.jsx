import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAuth } from "../../contexts/AuthContext";
import NavbarSearch from "../NavbarSearch/NavbarSearch";
import "./Navbar.css";

// Danh mục theo phòng — khớp đúng với mảng CATEGORIES trong Products.jsx
// để dropdown lọc đúng sản phẩm khi bấm vào
const ROOM_CATEGORIES = [
  { label: "Phòng khách", icon: "🛋️" },
  { label: "Phòng ngủ", icon: "🛏️" },
  { label: "Phòng ăn", icon: "🍽️" },
  { label: "Phòng làm việc", icon: "💼" },
  { label: "Ban công", icon: "🌿" },
];

// 3 mục con của dropdown "Dịch vụ" — 2 mục đầu lọc theo Service.Type, mục cuối trỏ
// sang trang Project (portfolio) riêng biệt, không dùng chung endpoint Service.
const SERVICE_LINKS = [
  { path: "/services/thi-cong", label: "Dịch vụ thi công", icon: "🛠️" },
  { path: "/services/thiet-ke", label: "Dịch vụ thiết kế", icon: "🎨" },
  { path: "/projects", label: "Dự án kiến trúc", icon: "🏛️" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setProductsMenuOpen(false);
    setServicesMenuOpen(false);
    setMobileProductsOpen(false);
    setMobileServicesOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Trang Chủ" },
    { path: "/about", label: "Giới Thiệu" },
  ];

  const isServicesActive = location.pathname.startsWith("/services") || location.pathname.startsWith("/projects");

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⬡</span>
          <span className="navbar__logo-text">
            Lux<span>Wood</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__link ${location.pathname === path ? "navbar__link--active" : ""}`}
            >
              {label}
            </Link>
          ))}

          {/* Dropdown Sản Phẩm — theo danh mục phòng */}
          <div
            className="navbar__dropdown"
            onMouseEnter={() => setProductsMenuOpen(true)}
            onMouseLeave={() => setProductsMenuOpen(false)}
          >
            <Link
              to="/products"
              className={`navbar__link navbar__link--dropdown ${location.pathname === "/products" ? "navbar__link--active" : ""}`}
            >
              Sản Phẩm
              <span className={`navbar__dropdown-arrow ${productsMenuOpen ? "navbar__dropdown-arrow--open" : ""}`}>▾</span>
            </Link>

            <div className={`navbar__dropdown-menu ${productsMenuOpen ? "navbar__dropdown-menu--open" : ""}`}>
              <Link
                to="/products"
                className="navbar__dropdown-item navbar__dropdown-item--all"
                onClick={() => setProductsMenuOpen(false)}
              >
                Tất cả sản phẩm
              </Link>
              {ROOM_CATEGORIES.map(({ label, icon }) => (
                <Link
                  key={label}
                  to={`/products?category=${encodeURIComponent(label)}`}
                  className="navbar__dropdown-item"
                  onClick={() => setProductsMenuOpen(false)}
                >
                  <span className="navbar__dropdown-icon">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Dropdown Dịch Vụ — thi công / thiết kế / dự án kiến trúc */}
          <div
            className="navbar__dropdown"
            onMouseEnter={() => setServicesMenuOpen(true)}
            onMouseLeave={() => setServicesMenuOpen(false)}
          >
            <button
              type="button"
              className={`navbar__link navbar__link--dropdown ${isServicesActive ? "navbar__link--active" : ""}`}
            >
              Dịch Vụ
              <span className={`navbar__dropdown-arrow ${servicesMenuOpen ? "navbar__dropdown-arrow--open" : ""}`}>▾</span>
            </button>

            <div className={`navbar__dropdown-menu ${servicesMenuOpen ? "navbar__dropdown-menu--open" : ""}`}>
              {SERVICE_LINKS.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="navbar__dropdown-item"
                  onClick={() => setServicesMenuOpen(false)}
                >
                  <span className="navbar__dropdown-icon">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/sale"
            className={`navbar__link navbar__link--promo ${location.pathname === "/sale" ? "navbar__link--active" : ""}`}
          >
            🔥 Khuyến Mãi
          </Link>

          <Link
            to="/contact"
            className={`navbar__link ${location.pathname === "/contact" ? "navbar__link--active" : ""}`}
          >
            Liên Hệ
          </Link>

          <Link
            to="/blog"
            className={`navbar__link ${location.pathname.startsWith("/blog") ? "navbar__link--active" : ""}`}
          >
            Cẩm Nang
          </Link>
        </nav>

        {/* CTA */}
        <div className="navbar__actions">
          <NavbarSearch />

          <Link to="/wishlist" className="navbar__cart" aria-label="Yêu thích">
            ♡
            {wishlistCount > 0 && <span className="navbar__cart-badge">{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="navbar__cart" aria-label="Giỏ hàng">
            🛒
            {totalItems > 0 && <span className="navbar__cart-badge">{totalItems}</span>}
          </Link>

          {isLoggedIn ? (
            <div className="navbar__account">
              <button className="navbar__account-btn" onClick={() => setAccountOpen(o => !o)}>
                👤 {user.name.split(" ").slice(-1)[0]}
              </button>
              {accountOpen && (
                <div className="navbar__account-dropdown">
                  <p className="navbar__account-email">{user.email}</p>
                  <Link to="/orders" className="navbar__account-link" onClick={() => setAccountOpen(false)}>
                    Đơn hàng của tôi
                  </Link>
                  <Link to="/account" className="navbar__account-link" onClick={() => setAccountOpen(false)}>
                    Tài khoản của tôi
                  </Link>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__login-link">Đăng nhập</Link>
          )}

          <Link to="/products" className="navbar__cta">
            Khám Phá Ngay
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? "navbar__mobile--open" : ""}`}>
        {/* Search cũng cần trên mobile — đặt đầu menu để dễ thấy ngay khi mở */}
        <div className="navbar__mobile-search">
          <NavbarSearch />
        </div>

        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`navbar__mobile-link ${location.pathname === path ? "navbar__mobile-link--active" : ""}`}
          >
            {label}
          </Link>
        ))}

        {/* Sản Phẩm — accordion theo danh mục phòng (mobile) */}
        <div className="navbar__mobile-group">
          <button
            type="button"
            className="navbar__mobile-link navbar__mobile-link--toggle"
            onClick={() => setMobileProductsOpen(o => !o)}
          >
            Sản Phẩm
            <span className={`navbar__mobile-caret ${mobileProductsOpen ? "navbar__mobile-caret--open" : ""}`}>▾</span>
          </button>
          <div className={`navbar__mobile-submenu ${mobileProductsOpen ? "navbar__mobile-submenu--open" : ""}`}>
            <Link to="/products" className="navbar__mobile-sublink">Tất cả sản phẩm</Link>
            {ROOM_CATEGORIES.map(({ label, icon }) => (
              <Link
                key={label}
                to={`/products?category=${encodeURIComponent(label)}`}
                className="navbar__mobile-sublink"
              >
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Dịch Vụ — accordion (mobile) */}
        <div className="navbar__mobile-group">
          <button
            type="button"
            className="navbar__mobile-link navbar__mobile-link--toggle"
            onClick={() => setMobileServicesOpen(o => !o)}
          >
            Dịch Vụ
            <span className={`navbar__mobile-caret ${mobileServicesOpen ? "navbar__mobile-caret--open" : ""}`}>▾</span>
          </button>
          <div className={`navbar__mobile-submenu ${mobileServicesOpen ? "navbar__mobile-submenu--open" : ""}`}>
            {SERVICE_LINKS.map(({ path, label, icon }) => (
              <Link key={path} to={path} className="navbar__mobile-sublink">
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/sale"
          className={`navbar__mobile-link navbar__mobile-link--promo ${location.pathname === "/sale" ? "navbar__mobile-link--active" : ""}`}
        >
          🔥 Khuyến Mãi
        </Link>

        <Link
          to="/contact"
          className={`navbar__mobile-link ${location.pathname === "/contact" ? "navbar__mobile-link--active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          Liên Hệ
        </Link>

        <Link
          to="/blog"
          className={`navbar__mobile-link ${location.pathname.startsWith("/blog") ? "navbar__mobile-link--active" : ""}`}
        >
          Cẩm Nang
        </Link>

        <Link to="/wishlist" className="navbar__mobile-link">
          Yêu thích {wishlistCount > 0 && `(${wishlistCount})`}
        </Link>

        <Link to="/cart" className="navbar__mobile-link">
          Giỏ hàng {totalItems > 0 && `(${totalItems})`}
        </Link>
        {isLoggedIn ? (
          <>
            <p className="navbar__mobile-user">Xin chào, {user.name}</p>
            <Link to="/orders" className="navbar__mobile-link">Đơn hàng của tôi</Link>
            <Link to="/account" className="navbar__mobile-link">Tài khoản của tôi</Link>
            <button className="navbar__mobile-link navbar__mobile-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar__mobile-link">Đăng nhập</Link>
        )}
        <Link to="/products" className="navbar__cta navbar__cta--mobile">
          Khám Phá Ngay
        </Link>
      </div>
    </header>
  );
};

export default Navbar;