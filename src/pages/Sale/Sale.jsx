import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import WishlistButton from "../../components/WishlistButton/WishlistButton";
import CompareButton from "../../components/CompareButton/CompareButton";
import RatingStars from "../../components/RatingStars/RatingStars";
import "../Products/Products.css";

const Sale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/Products/sale")
      .then(res => setProducts(res.data))
      .catch(() => setError("Không thể tải danh sách sản phẩm khuyến mãi. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
  const salePriceOf = (p) => p.price * (1 - p.discountPercent / 100);

  return (
    <div className="products-page">
      <div className="products-hero" style={{ background: "#3b2a1a" }}>
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Ưu đãi có hạn</span>
          <h1 style={{ color: "#fff" }}>Khuyến Mãi</h1>
          <p style={{ color: "rgba(255,255,255,0.75)" }}>
            Săn ngay các sản phẩm đang giảm giá — số lượng có hạn
          </p>
        </div>
      </div>

      <div className="section-inner">
        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải sản phẩm khuyến mãi...</p></div>
        ) : products.length === 0 ? (
          <div className="empty-box">Hiện chưa có sản phẩm nào đang khuyến mãi. Quay lại sau nhé!</div>
        ) : (
          <div className="client-products-grid" style={{ marginTop: 40 }}>
            {products.map((p, idx) => (
              <Reveal as="div" key={p.id} delay={Math.min((idx % 8) * 60, 400)}>
              <Link to={`/products/${p.id}`} className="product-card">
                <div className="product-img">
                  {p.image
                    ? <img src={p.image} alt={p.name} onError={e => e.target.style.display = "none"} />
                    : <span className="product-img-placeholder">🪑</span>
                  }
                  {p.stock === 0
                    ? <span className="product-tag product-tag--out">Hết hàng</span>
                    : <span className="product-tag" style={{ background: "#b91c1c" }}>-{p.discountPercent}%</span>
                  }
                  <WishlistButton product={p} />
                  <CompareButton product={p} />
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <RatingStars avg={p.averageRating} count={p.reviewCount} />
                  <div className="product-footer" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ textDecoration: "line-through", color: "#9a9a9a", fontSize: 13 }}>
                      {formatPrice(p.price)}
                    </span>
                    <span className="product-price" style={{ color: "#b91c1c", fontWeight: 700 }}>
                      {formatPrice(salePriceOf(p))}
                    </span>
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

export default Sale;