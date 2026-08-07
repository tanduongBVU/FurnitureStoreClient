import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Products.css";

const CATEGORIES = ["Tất cả", "Phòng khách", "Phòng ngủ", "Phòng ăn", "Phòng làm việc", "Ban công"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("default");

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
              onClick={() => setCategory(c)}
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
            {filtered.map(p => (
              <Link to={`/products/${p.id}`} className="product-card" key={p.id}>
                <div className="product-img">
                  {p.image
                    ? <img src={p.image} alt={p.name} onError={e => e.target.style.display = "none"} />
                    : <span className="product-img-placeholder">🪑</span>
                  }
                  {p.isBestSeller && <span className="product-tag">Bán chạy</span>}
                  {p.stock === 0 && <span className="product-tag product-tag--out">Hết hàng</span>}
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <div className="product-footer">
                    <span className="product-price">{formatPrice(p.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
