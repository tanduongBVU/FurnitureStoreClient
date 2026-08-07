import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Trang Chủ" },
    { path: "/about", label: "Giới Thiệu" },
    { path: "/products", label: "Sản Phẩm" },
  ];

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
        </nav>

        {/* CTA */}
        <div className="navbar__actions">
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
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`navbar__mobile-link ${location.pathname === path ? "navbar__mobile-link--active" : ""}`}
          >
            {label}
          </Link>
        ))}
        <Link to="/cart" className="navbar__mobile-link">
          Giỏ hàng {totalItems > 0 && `(${totalItems})`}
        </Link>
        {isLoggedIn ? (
          <>
            <p className="navbar__mobile-user">Xin chào, {user.name}</p>
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
