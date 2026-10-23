import { useState, useEffect, useRef } from "react";
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

// 2 mục con của dropdown "Dịch vụ" — lọc theo Service.Type (thi công / thiết kế).
const SERVICE_LINKS = [
  { path: "/services/thi-cong", label: "Dịch vụ thi công", icon: "🛠️" },
  { path: "/services/thiet-ke", label: "Dịch vụ thiết kế", icon: "🎨" },
];

// Chữ cái đầu của TÊN (từ cuối trong họ tên) — dùng làm avatar khi chưa có ảnh
const getInitial = (name) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] || "?";
  return last.charAt(0).toUpperCase();
};

// Avatar tròn: chữ cái đầu làm nền, ảnh thật (nếu có) phủ lên trên; ảnh lỗi thì tự ẩn để lộ chữ cái
const Avatar = ({ user, large = false }) => (
  <span className={`navbar__avatar ${large ? "navbar__avatar--lg" : ""}`} aria-hidden="true">
    {getInitial(user?.name)}
    {user?.avatarUrl && (
      <img src={user.avatarUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
    )}
  </span>
);

// Icon SVG nét mảnh (thay ký tự ♡ và emoji 🛒)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);
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

  // Bấm ra ngoài khung tài khoản thì tự đóng menu thả xuống
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen]);

  const navLinks = [
    { path: "/", label: "Trang Chủ" },
    { path: "/about", label: "Giới Thiệu" },
  ];

  const isServicesActive = location.pathname.startsWith("/services");

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
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement)) setProductsMenuOpen(false);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setProductsMenuOpen(false);
            }}
          >
            <Link
              to="/products"
              className={`navbar__link navbar__link--dropdown ${location.pathname === "/products" ? "navbar__link--active" : ""}`}
              aria-haspopup="true"
              aria-expanded={productsMenuOpen}
              onFocus={() => setProductsMenuOpen(true)}
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

          {/* Dropdown Dịch Vụ — thi công / thiết kế */}
          <div
            className="navbar__dropdown"
            onMouseEnter={() => setServicesMenuOpen(true)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement)) setServicesMenuOpen(false);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setServicesMenuOpen(false);
            }}
          >
            <button
              type="button"
              className={`navbar__link navbar__link--dropdown ${isServicesActive ? "navbar__link--active" : ""}`}
              aria-haspopup="true"
              aria-expanded={servicesMenuOpen}
              onFocus={() => setServicesMenuOpen(true)}
              onClick={() => setServicesMenuOpen(true)}
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

        {/* Khu vực hành động: tìm kiếm / yêu thích / giỏ hàng / tài khoản */}
        <div className="navbar__actions">
          <NavbarSearch />

          <Link to="/wishlist" className="navbar__cart" aria-label="Yêu thích" title="Yêu thích">
            <HeartIcon />
            {wishlistCount > 0 && <span className="navbar__cart-badge">{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="navbar__cart" aria-label="Giỏ hàng" title="Giỏ hàng">
            <CartIcon />
            {totalItems > 0 && <span className="navbar__cart-badge">{totalItems}</span>}
          </Link>

          {isLoggedIn ? (
            <div className="navbar__account" ref={accountRef}>
              <button
                type="button"
                className={`navbar__account-btn ${accountOpen ? "navbar__account-btn--open" : ""}`}
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={accountOpen}
              >
                <Avatar user={user} />
                <span className="navbar__account-name">{user.name.split(" ").slice(-1)[0]}</span>
                <svg className="navbar__account-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {accountOpen && (
                <div className="navbar__account-dropdown">
                  <div className="navbar__account-head">
                    <Avatar user={user} large />
                    <div className="navbar__account-head-text">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <Link to="/orders" className="navbar__account-link" onClick={() => setAccountOpen(false)}>
                    Đơn hàng của tôi
                  </Link>
                  <Link to="/account" className="navbar__account-link" onClick={() => setAccountOpen(false)}>
                    Tài khoản của tôi
                  </Link>
                  <button type="button" className="navbar__account-logout" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__login-link">Đăng nhập</Link>
          )}
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
            onClick={() => setMobileProductsOpen((o) => !o)}
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
            onClick={() => setMobileServicesOpen((o) => !o)}
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
            <div className="navbar__mobile-user">
              <Avatar user={user} large />
              <div className="navbar__mobile-user-text">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
            <Link to="/orders" className="navbar__mobile-link">Đơn hàng của tôi</Link>
            <Link to="/account" className="navbar__mobile-link">Tài khoản của tôi</Link>
            <button className="navbar__mobile-link navbar__mobile-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar__mobile-link navbar__mobile-login">Đăng nhập</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;