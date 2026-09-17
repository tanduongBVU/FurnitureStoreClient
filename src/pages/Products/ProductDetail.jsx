import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import WishlistButton from "../../components/WishlistButton/WishlistButton";
import CompareButton from "../../components/CompareButton/CompareButton";
import RatingStars from "../../components/RatingStars/RatingStars";
import Reveal from "../../components/Reveal/Reveal";
import ProductReviews from "../../components/ProductReviews/ProductReviews";
import SEO from "../../components/SEO/SEO";
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

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    setQuantity(1);
    api.get(`/Products/${id}`)
      .then(res => {
        setProduct(res.data);
        const variants = res.data.variants || [];
        if (variants.length > 0) {
          const firstInStock = variants.find(v => v.stock > 0);
          setSelectedVariant(firstInStock || variants[0]);
        } else {
          setSelectedVariant(null);
        }
      })
      .catch(() => setError("Không tìm thấy sản phẩm này."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setRelatedLoading(true);
    api.get(`/Products/${id}/related`)
      .then(res => setRelated(res.data))
      .catch(() => setRelated([]))
      .finally(() => setRelatedLoading(false));
  }, [id]);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  const hasVariants = (product?.variants?.length ?? 0) > 0;

  const activePrice = hasVariants && selectedVariant ? selectedVariant.price : (product?.price ?? 0);
  const activeStock = hasVariants && selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);

  const hasDiscount = product?.discountPercent > 0;
  const salePrice = activePrice * (1 - (product?.discountPercent || 0) / 100);

  useEffect(() => {
    if (activeStock > 0 && quantity > activeStock) setQuantity(activeStock);
  }, [selectedVariant]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCartPayload = () => ({ ...product, price: hasDiscount ? salePrice : activePrice });
  const getVariantPayload = () =>
    hasVariants && selectedVariant
      ? { ...selectedVariant, price: hasDiscount ? salePrice : selectedVariant.price }
      : null;

  const handleAddToCart = () => {
    addToCart(getCartPayload(), quantity, getVariantPayload());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(getCartPayload(), quantity, getVariantPayload());
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
      <SEO
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
      />

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

            {(product.material || product.color) && (
              <div className="pd-attrs">
                {product.material && <span className="pd-attr-chip">Chất liệu: {product.material}</span>}
                {product.color && <span className="pd-attr-chip">Màu sắc: {product.color}</span>}
              </div>
            )}

            {hasDiscount ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <p className="pd-price" style={{ margin: 0, color: "#b3492f" }}>{formatPrice(salePrice)}</p>
                <span style={{ fontSize: 16, color: "#9a9186", textDecoration: "line-through" }}>
                  {formatPrice(activePrice)}
                </span>
              </div>
            ) : (
              <p className="pd-price">{formatPrice(activePrice)}</p>
            )}

            {hasVariants && (
              <div className="pd-variants">
                <span className="pd-variants__label">Chọn loại:</span>
                <div className="pd-variants__options">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      className={`pd-variant-btn ${selectedVariant?.id === v.id ? "pd-variant-btn--active" : ""} ${v.stock === 0 ? "pd-variant-btn--out" : ""}`}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                    >
                      {v.name}
                      {v.stock === 0 && " (Hết hàng)"}
                    </button>
                  ))}
                </div>
              </div>
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
              {activeStock === 0
                ? <span className="pd-stock--out">Hết hàng</span>
                : activeStock <= 3
                  ? <span className="pd-stock--low">Chỉ còn {activeStock} sản phẩm</span>
                  : <span className="pd-stock--ok">Còn hàng ({activeStock} sản phẩm)</span>
              }
            </div>

            {activeStock > 0 && (
              <>
                <div className="pd-qty">
                  <span>Số lượng</span>
                  <div className="qty-control">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <input
                      type="number"
                      value={quantity}
                      min={1}
                      max={activeStock}
                      onChange={e => {
                        const v = Number(e.target.value);
                        if (v >= 1 && v <= activeStock) setQuantity(v);
                      }}
                    />
                    <button onClick={() => setQuantity(q => Math.min(activeStock, q + 1))}>+</button>
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

        {!relatedLoading && related.length > 0 && (
          <div className="pd-related">
            <h2 className="pd-related__title">Sản phẩm liên quan</h2>
            <div className="pd-related__grid">
              {related.map((p, idx) => (
                <Reveal as="div" key={p.id} delay={Math.min(idx * 70, 300)}>
                  <Link to={`/products/${p.id}`} className="pd-related__card">
                    <div className="pd-related__img">
                      {p.image
                        ? <img src={p.image} alt={p.name} onError={e => e.target.style.display = "none"} />
                        : <span className="pd-related__img-placeholder">🪑</span>
                      }
                      {p.stock === 0 ? (
                        <span className="pd-related__tag pd-related__tag--out">Hết hàng</span>
                      ) : p.discountPercent > 0 ? (
                        <span className="pd-related__tag" style={{ background: "#b91c1c" }}>-{p.discountPercent}%</span>
                      ) : p.isBestSeller ? (
                        <span className="pd-related__tag">Bán chạy</span>
                      ) : null}
                      <WishlistButton product={p} />
                      <CompareButton product={p} />
                    </div>
                    <div className="pd-related__info">
                      <span className="pd-related__cat">{p.category}</span>
                      <h3>{p.name}</h3>
                      <RatingStars avg={p.averageRating} count={p.reviewCount} />
                      {p.discountPercent > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ textDecoration: "line-through", color: "#9a9a9a", fontSize: 12 }}>
                            {formatPrice(p.price)}
                          </span>
                          <span className="pd-related__price" style={{ color: "#b91c1c" }}>
                            {formatPrice(p.price * (1 - p.discountPercent / 100))}
                          </span>
                        </div>
                      ) : (
                        <span className="pd-related__price">{formatPrice(p.price)}</span>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;