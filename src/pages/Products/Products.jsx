import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import WishlistButton from "../../components/WishlistButton/WishlistButton";
import CompareButton from "../../components/CompareButton/CompareButton";
import RatingStars from "../../components/RatingStars/RatingStars";
import "./Products.css";

const CATEGORIES = ["Tất cả", "Phòng khách", "Phòng ngủ", "Phòng ăn", "Phòng làm việc", "Ban công"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc category từ URL (?category=Phòng ngủ) — dùng khi bấm từ dropdown Navbar
  const [category, setCategory] = useState(() => {
    const fromUrl = searchParams.get("category");
    return CATEGORIES.includes(fromUrl) ? fromUrl : "Tất cả";
  });
  const [sort, setSort] = useState("default");

  // Đọc từ khoá tìm kiếm từ URL (?search=...) — dùng khi khách nhấn Enter ở ô search
  // Navbar rồi được điều hướng sang đây, để ô search trên trang này tự điền sẵn từ khoá đó.
  useEffect(() => {
    const fromUrl = searchParams.get("search");
    if (fromUrl) setSearch(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/Products");
        setProducts(res.data);
      } catch {
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Nếu URL đổi (VD: bấm link khác từ dropdown khi đang ở trang /products) → cập nhật lại tab
  useEffect(() => {
    const fromUrl = searchParams.get("category");
    const next = CATEGORIES.includes(fromUrl) ? fromUrl : "Tất cả";
    setCategory(prev => (prev !== next ? next : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCategoryClick = (c) => {
    setCategory(c);
    if (c === "Tất cả") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: c }, { replace: true });
    }
  };

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tất cả" || p.category === category;
    return matchSearch && matchCat;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="products-page">
      <div className="products-hero">
        <div className="section-inner">
          <span className="eyebrow">Bộ sưu tập</span>
          <h1>Sản Phẩm Nội Thất</h1>
          <p>Khám phá những thiết kế tinh tế, chất lượng bền vững cho không gian sống của bạn</p>
        </div>
      </div>

      <div className="section-inner">
        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>

        <div className="category-tabs">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`cat-tab ${category === c ? "cat-tab--active" : ""}`}
              onClick={() => handleCategoryClick(c)}
            >{c}</button>
          ))}
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải sản phẩm...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-box">Không tìm thấy sản phẩm phù hợp</div>
        ) : (
          <div className="client-products-grid">
            {filtered.map((p, idx) => (
              <Reveal as="div" key={p.id} delay={Math.min((idx % 8) * 60, 400)}>
              <Link to={`/products/${p.id}`} className="product-card">
                <div className="product-img">
                  {p.image
                    ? <img src={p.image} alt={p.name} onError={e => e.target.style.display = "none"} />
                    : <span className="product-img-placeholder">🪑</span>
                  }
                  {p.stock === 0 ? (
                    <span className="product-tag product-tag--out">Hết hàng</span>
                  ) : p.discountPercent > 0 ? (
                    <span className="product-tag" style={{ background: "#b91c1c" }}>-{p.discountPercent}%</span>
                  ) : p.isBestSeller ? (
                    <span className="product-tag">Bán chạy</span>
                  ) : null}
                  <WishlistButton product={p} />
                  <CompareButton product={p} />
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <RatingStars avg={p.averageRating} count={p.reviewCount} />
                  <div className="product-footer">
                    {p.discountPercent > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ textDecoration: "line-through", color: "#9a9a9a", fontSize: 12 }}>
                          {formatPrice(p.price)}
                        </span>
                        <span className="product-price" style={{ color: "#b91c1c" }}>
                          {formatPrice(p.price * (1 - p.discountPercent / 100))}
                        </span>
                      </div>
                    ) : (
                      <span className="product-price">{formatPrice(p.price)}</span>
                    )}
                  </div>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;