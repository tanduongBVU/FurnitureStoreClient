import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import WishlistButton from "../../components/WishlistButton/WishlistButton";
import CompareButton from "../../components/CompareButton/CompareButton";
import RatingStars from "../../components/RatingStars/RatingStars";
// Dùng chung bộ style thẻ sản phẩm với trang Sản phẩm; Sale.css chỉ thêm phần riêng của trang này
import "../Products/Products.css";
import "./Sale.css";

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
  // Làm tròn tới đồng — trước đây không làm tròn nên giá hiện số lẻ (VD "2.999.999.999,7 ₫")
  const salePriceOf = (p) => Math.round(p.price * (1 - p.discountPercent / 100));

  // Mức giảm cao nhất — hiện ở đầu trang như một điểm nhấn
  const maxDiscount = products.reduce((m, p) => Math.max(m, p.discountPercent || 0), 0);

  return (
    <div className="products-page sale-page">
      <div className="products-hero sale-hero">
        <div className="section-inner">
          <span className="eyebrow">Ưu đãi có hạn</span>
          <h1>Khuyến Mãi</h1>
          <p>Săn ngay các sản phẩm đang giảm giá — số lượng có hạn</p>

          {!loading && products.length > 0 && (
            <div className="sale-hero__stats">
              <div>
                <strong>{products.length}</strong>
                <span>Sản phẩm đang giảm giá</span>
              </div>
              <div>
                <strong>-{maxDiscount}%</strong>
                <span>Mức giảm cao nhất</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-inner sale-body">
        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải sản phẩm khuyến mãi...</p></div>
        ) : products.length === 0 ? (
          <div className="empty-box">Hiện chưa có sản phẩm nào đang khuyến mãi. Quay lại sau nhé!</div>
        ) : (
          <div className="client-products-grid">
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
                    : <span className="product-tag product-tag--sale">-{p.discountPercent}%</span>
                  }
                  <WishlistButton product={p} />
                  <CompareButton product={p} />
                </div>
                <div className="product-info">
                  <span className="product-cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <RatingStars avg={p.averageRating} count={p.reviewCount} />
                  <div className="product-footer">
                    <div className="product-prices">
                      <span className="product-price product-price--sale">{formatPrice(salePriceOf(p))}</span>
                      <span className="product-price-original">{formatPrice(p.price)}</span>
                    </div>
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