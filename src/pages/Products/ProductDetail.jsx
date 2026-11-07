import { useState, useEffect, useMemo } from "react";
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
import { sanitizeRichHtml } from "../../utils/sanitizeHtml";
import "./ProductDetail.css";
import "./ProductDetailContent.css";

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
  // Ảnh đang hiện to ở khung chính — mặc định là ảnh chính (product.image), khách bấm
  // vào 1 thumbnail (ảnh phụ) để đổi ảnh hiện ở đây, KHÔNG đổi product.image.
  const [activeImage, setActiveImage] = useState(null);

  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    setAdded(false);
    setQuantity(1);
    api.get(`/Products/${id}`)
      .then(res => {
        setProduct(res.data);
        setActiveImage(res.data.image);
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
  // Làm tròn để giá hiển thị / giá bỏ vào giỏ luôn là số nguyên (khớp với trang Sản phẩm & Khuyến mãi)
  const salePrice = Math.round(activePrice * (1 - (product?.discountPercent || 0) / 100));

  // "Thông tin chi tiết" (HTML do Admin soạn) — LỌC an toàn trước khi hiển thị. useMemo để chỉ lọc lại
  // khi nội dung đổi, không lọc lại mỗi lần đổi số lượng/biến thể. Rỗng → ẩn hẳn cả mục.
  const detailHtml = useMemo(() => sanitizeRichHtml(product?.detailContent), [product?.detailContent]);
  const hasDetail = detailHtml.replace(/<[^>]*>/g, "").trim().length > 0 || /<(img|table)\b/i.test(detailHtml);

  // Ảnh chính + ảnh phụ (product.images là chuỗi "url1,url2,..." từ Backend) — hiện thành dải thumbnail,
  // CHỈ khi có ít nhất 1 ảnh phụ (sản phẩm cũ chưa có ảnh phụ thì không hiện dải này).
  const extraImages = (product?.images || "")
    .split(",")
    .map(u => u.trim())
    .filter(Boolean);
  const galleryImages = product?.image ? [product.image, ...extraImages] : extraImages;
  const hasGallery = galleryImages.length > 1;

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

  const wished = isInWishlist(product.id);

  return (
    <div className="pd-page">
      <SEO
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
      />

      <div className="section-inner">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/products">Sản phẩm</Link>
          {product.category && <><span>/</span><span>{product.category}</span></>}
          <span>/</span><span className="pd-breadcrumb__current">{product.name}</span>
        </nav>

        <div className="pd-layout">
          <Reveal as="div" className={`pd-gallery ${hasGallery ? "pd-gallery--multi" : ""}`} direction="left">
            {hasGallery && (
              <div className="pd-thumbs">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pd-thumb ${activeImage === img ? "pd-thumb--active" : ""}`}
                    onClick={() => setActiveImage(img)}
                    aria-label={`Xem ảnh ${i + 1}`}
                    aria-pressed={activeImage === img}
                  >
                    <img src={img} alt="" onError={e => (e.target.style.display = "none")} />
                  </button>
                ))}
              </div>
            )}

            <div className="pd-image">
              {activeImage
                ? <img src={activeImage} alt={product.name} onError={e => e.target.style.display = "none"} />
                : <span className="pd-image-placeholder">🪑</span>
              }
              {product.isBestSeller && <span className="pd-tag">Bán chạy</span>}
              {hasDiscount && <span className="pd-tag pd-tag--sale">-{product.discountPercent}%</span>}
            </div>
          </Reveal>

          <Reveal as="div" className="pd-info" direction="right" delay={120}>
            <span className="pd-cat">{product.category}</span>
            <h1>{product.name}</h1>

            {hasDiscount ? (
              <div className="pd-price-row">
                <p className="pd-price pd-price--sale">{formatPrice(salePrice)}</p>
                <span className="pd-price-original">{formatPrice(activePrice)}</span>
              </div>
            ) : (
              <div className="pd-price-row">
                <p className="pd-price">{formatPrice(activePrice)}</p>
              </div>
            )}

            <p className="pd-desc">{product.description || "Chưa có mô tả cho sản phẩm này."}</p>

            {(product.material || product.color) && (
              <dl className="pd-attrs">
                {product.material && <div className="pd-attr"><dt>Chất liệu</dt><dd>{product.material}</dd></div>}
                {product.color && <div className="pd-attr"><dt>Màu sắc</dt><dd>{product.color}</dd></div>}
              </dl>
            )}

            {hasVariants && (
              <div className="pd-variants">
                <span className="pd-variants__label">Chọn loại</span>
                <div className="pd-variants__options">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      className={`pd-variant-btn ${selectedVariant?.id === v.id ? "pd-variant-btn--active" : ""} ${v.stock === 0 ? "pd-variant-btn--out" : ""}`}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                      aria-pressed={selectedVariant?.id === v.id}
                    >
                      {v.name}
                      {v.stock === 0 && " (Hết hàng)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    <button type="button" aria-label="Giảm số lượng" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
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
                    <button type="button" aria-label="Tăng số lượng" onClick={() => setQuantity(q => Math.min(activeStock, q + 1))}>+</button>
                  </div>
                </div>

                <div className="pd-actions">
                  <button type="button" className="btn-outline" onClick={handleAddToCart}>
                    {added ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                  </button>
                  <button type="button" className="btn-primary-solid" onClick={handleBuyNow}>Mua ngay</button>
                </div>
              </>
            )}

            <button
              type="button"
              className={`pd-wish ${wished ? "pd-wish--on" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              <span className="pd-wish__icon">{wished ? "♥" : "♡"}</span>
              {wished ? "Đã lưu vào Yêu thích" : "Lưu vào Yêu thích"}
            </button>
          </Reveal>
        </div>

        {/* ── THÔNG TIN CHI TIẾT — chữ định dạng, bảng thông số, ảnh, link do Admin soạn.
            Không có nội dung thì ẩn hẳn cả mục (sản phẩm cũ vẫn hiển thị như trước). ── */}
        {hasDetail && (
          <section className="pd-detail">
            <div className="pd-detail__head">
              <span className="pd-eyebrow">Chi tiết sản phẩm</span>
              <h2 className="pd-detail__title">Thông tin chi tiết</h2>
            </div>
            <div
              className="pd-detail__content"
              dangerouslySetInnerHTML={{ __html: detailHtml }}
            />
          </section>
        )}

        <div className="pd-reviews">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {!relatedLoading && related.length > 0 && (
        <section className="pd-related">
          <div className="section-inner">
            <span className="pd-eyebrow">Gợi ý cho bạn</span>
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
                        <span className="pd-related__tag pd-related__tag--sale">-{p.discountPercent}%</span>
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
                        <div className="pd-related__prices">
                          <span className="pd-related__price pd-related__price--sale">
                            {formatPrice(Math.round(p.price * (1 - p.discountPercent / 100)))}
                          </span>
                          <span className="pd-related__price-original">{formatPrice(p.price)}</span>
                        </div>
                      ) : (
                        <div className="pd-related__prices">
                          <span className="pd-related__price">{formatPrice(p.price)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;