import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import WishlistButton from "../../components/WishlistButton/WishlistButton";
import CompareButton from "../../components/CompareButton/CompareButton";
import RatingStars from "../../components/RatingStars/RatingStars";
import "./Products.css";

const CATEGORIES = ["Tất cả", "Phòng khách", "Phòng ngủ", "Phòng ăn", "Phòng làm việc", "Ban công"];
// Phải khớp CHÍNH XÁC với danh sách Admin dùng khi nhập liệu (ProductCreate.jsx/ProductEdit.jsx),
// nếu không chip lọc sẽ không bao giờ khớp được với dữ liệu thật trong DB.
const MATERIALS = ["Gỗ tự nhiên", "Gỗ công nghiệp", "Kim loại", "Vải nỉ", "Da/Da công nghiệp", "Mây tre đan", "Kính"];
const COLORS = ["Nâu gỗ", "Trắng", "Đen", "Xám", "Be/Kem", "Xanh dương", "Xanh lá", "Vàng"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(() => {
    const fromUrl = searchParams.get("category");
    return CATEGORIES.includes(fromUrl) ? fromUrl : "Tất cả";
  });
  const [sort, setSort] = useState("default");

  // ── Bộ lọc nâng cao ──
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [materials, setMaterials] = useState([]); // chọn được nhiều
  const [colors, setColors] = useState([]);       // chọn được nhiều
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const toggleInList = (list, setList, value) => {
    setList(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const resetFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setMaterials([]);
    setColors([]);
    setInStockOnly(false);
    setOnSaleOnly(false);
  };

  const activeFilterCount =
    materials.length + colors.length +
    (priceMin !== "" ? 1 : 0) + (priceMax !== "" ? 1 : 0) +
    (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0);

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
    const matchMaterial = materials.length === 0 || materials.includes(p.material);
    const matchColor = colors.length === 0 || colors.includes(p.color);
    const matchPriceMin = priceMin === "" || p.price >= Number(priceMin);
    const matchPriceMax = priceMax === "" || p.price <= Number(priceMax);
    const matchStock = !inStockOnly || p.stock > 0;
    const matchSale = !onSaleOnly || p.discountPercent > 0;
    return matchSearch && matchCat && matchMaterial && matchColor && matchPriceMin && matchPriceMax && matchStock && matchSale;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") filtered = [...filtered].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  if (sort === "newest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
          <button
            type="button"
            className={`btn-filter-toggle ${showFilters ? "btn-filter-toggle--active" : ""}`}
            onClick={() => setShowFilters(s => !s)}
          >
            ⚙️ Bộ lọc nâng cao{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="rating-desc">Đánh giá cao nhất</option>
            <option value="newest">Mới nhất</option>
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

        {/* Bộ lọc nâng cao — chỉ hiện khi bấm mở */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Khoảng giá (₫)</label>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Từ"
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  min={0}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Chất liệu</label>
              <div className="filter-chips">
                {MATERIALS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`filter-chip ${materials.includes(m) ? "filter-chip--active" : ""}`}
                    onClick={() => toggleInList(materials, setMaterials, m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Màu sắc</label>
              <div className="filter-chips">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`filter-chip ${colors.includes(c) ? "filter-chip--active" : ""}`}
                    onClick={() => toggleInList(colors, setColors, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group filter-group--row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                />
                <span>Chỉ hiện còn hàng</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={e => setOnSaleOnly(e.target.checked)}
                />
                <span>Đang giảm giá</span>
              </label>
            </div>

            {activeFilterCount > 0 && (
              <button type="button" className="btn-clear-filters" onClick={resetFilters}>
                ✕ Xoá bộ lọc ({activeFilterCount})
              </button>
            )}
          </div>
        )}

        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải sản phẩm...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-box">
            Không tìm thấy sản phẩm phù hợp
            {activeFilterCount > 0 && (
              <button type="button" className="btn-clear-filters" onClick={resetFilters} style={{ marginTop: 12 }}>
                Xoá bộ lọc và thử lại
              </button>
            )}
          </div>
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