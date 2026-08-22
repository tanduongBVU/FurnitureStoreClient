import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import Reveal from "../../components/Reveal/Reveal";
import ProductReviews from "../../components/ProductReviews/ProductReviews";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    setQuantity(1);
    api.get(`/Products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError("Không tìm thấy sản phẩm này."))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  const hasDiscount = product?.discountPercent > 0;
  const salePrice = product ? product.price * (1 - (product.discountPercent || 0) / 100) : 0;

  // Giá THỰC TẾ khách phải trả — dùng giá này khi thêm vào giỏ, KHÔNG dùng product.price gốc,
  // để giỏ hàng/đơn hàng phản ánh đúng giá đã giảm.
  const getCartPayload = () => ({ ...product, price: hasDiscount ? salePrice : product.price });

  const handleAddToCart = () => {
    addToCart(getCartPayload(), quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(getCartPayload(), quantity);
    navigate("/cart");
  };

  if (loading) return (
    <div className="pd-page">
      <div className="loading-box"><div className="spinner" /><p>Đang tải sản phẩm...</p></div>
    </div>
  );

  if (error || !product) return (
    <div className="pd-page">
      <div className="pd-empty">
        <p>⚠️ {error || "Không tìm thấy sản phẩm."}</p>
        <Link to="/products" className="btn-outline">← Quay lại danh sách sản phẩm</Link>
      </div>
    </div>
  );

  return (
    <div className="pd-page">
      <div className="section-inner">
        <div className="pd-breadcrumb">
          <Link to="/products">Sản phẩm</Link> <span>/</span> <span>{product.name}</span>
        </div>

        <div className="pd-layout">
          <Reveal as="div" className="pd-image" direction="left" style={{ position: "relative" }}>
            {product.image
              ? <img src={product.image} alt={product.name} onError={e => e.target.style.display = "none"} />
              : <span className="pd-image-placeholder">🪑</span>
            }
            {product.isBestSeller && <span className="pd-tag">Bán chạy</span>}
            {hasDiscount && (
              <span
                style={{
                  position: "absolute", top: 16, right: 16,
                  background: "#c0392b", color: "#fff", fontSize: 12, fontWeight: 700,
                  padding: "5px 12px", borderRadius: 20, letterSpacing: .5,
                }}
              >
                -{product.discountPercent}%
              </span>
            )}
          </Reveal>

          <Reveal as="div" className="pd-info" direction="right" delay={120}>
            <span className="pd-cat">{product.category}</span>
            <h1>{product.name}</h1>

            {hasDiscount ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <p className="pd-price" style={{ margin: 0, color: "#b3492f" }}>{formatPrice(salePrice)}</p>
                <span style={{ fontSize: 16, color: "#9a9186", textDecoration: "line-through" }}>
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <p className="pd-price">{formatPrice(product.price)}</p>
            )}

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "none", border: "none", padding: "4px 0",
                cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 8,
                color: isInWishlist(product.id) ? "#e0245e" : "#7a6a58",
              }}
            >
              <span style={{ fontSize: 17 }}>{isInWishlist(product.id) ? "♥" : "♡"}</span>
              {isInWishlist(product.id) ? "Đã lưu vào Yêu thích" : "Lưu vào Yêu thích"}
            </button>

            <p className="pd-desc">{product.description || "Chưa có mô tả cho sản phẩm này."}</p>

            <div className="pd-stock">
              {product.stock === 0
                ? <span className="pd-stock--out">Hết hàng</span>
                : product.stock <= 3
                  ? <span className="pd-stock--low">Chỉ còn {product.stock} sản phẩm</span>
                  : <span className="pd-stock--ok">Còn hàng ({product.stock} sản phẩm)</span>
              }
            </div>

            {product.stock > 0 && (
              <>
                <div className="pd-qty">
                  <span>Số lượng</span>
                  <div className="qty-control">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <input
                      type="number"
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={e => {
                        const v = Number(e.target.value);
                        if (v >= 1 && v <= product.stock) setQuantity(v);
                      }}
                    />
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                  </div>
                </div>

                <div className="pd-actions">
                  <button className="btn-outline" onClick={handleAddToCart}>
                    {added ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                  </button>
                  <button className="btn-primary-solid" onClick={handleBuyNow}>Mua ngay</button>
                </div>
              </>
            )}
          </Reveal>
        </div>

        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;