import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./NavbarSearch.css";

const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

const NavbarSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Dropdown gợi ý chỉ hiện khi ô đang được focus VÀ đã gõ đủ ký tự — đóng lại khi
  // bấm ra ngoài, KHÔNG xoá query (khác với bản icon cũ: ô giờ luôn hiện sẵn nên
  // không cần "đóng ô search", chỉ cần ẩn dropdown gợi ý).
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setFocused(false);
        wrapperRef.current?.querySelector("input")?.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Debounce gọi API — chỉ gọi sau khi khách ngừng gõ 300ms, tránh spam request mỗi ký tự
  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      api
        .get(`/Products/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToProduct = (id) => {
    navigate(`/products/${id}`);
    setFocused(false);
    setQuery("");
    setResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setFocused(false);
  };

  const showDropdown = focused && query.trim().length >= MIN_CHARS;

  return (
    <div className={`navbar-search navbar-search--fixed ${focused ? "navbar-search--focused" : ""}`} ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="navbar-search__form">
        <span className="navbar-search__icon">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        {query && (
          <button
            type="button"
            className="navbar-search__clear"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Xoá"
          >
            ✕
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="navbar-search__panel navbar-search__panel--fixed">
          <div className="navbar-search__results">
            {loading ? (
              <p className="navbar-search__hint">Đang tìm...</p>
            ) : results.length === 0 ? (
              <p className="navbar-search__hint">Không tìm thấy sản phẩm phù hợp.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  className="navbar-search__item"
                  onClick={() => goToProduct(p.id)}
                >
                  <div className="navbar-search__item-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
                    ) : (
                      <span>🪑</span>
                    )}
                  </div>
                  <div className="navbar-search__item-info">
                    <span className="navbar-search__item-name">{p.name}</span>
                    <span className="navbar-search__item-price">
                      {p.discountPercent > 0
                        ? formatPrice(p.price * (1 - p.discountPercent / 100))
                        : formatPrice(p.price)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;