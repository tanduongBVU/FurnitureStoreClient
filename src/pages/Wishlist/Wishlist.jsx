import { useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import Reveal from "../../components/Reveal/Reveal";
import "../Products/Products.css";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  // Id sản phẩm vừa thêm vào giỏ — để nút đổi chữ "✓ Đã thêm" trong 2 giây
  const [addedId, setAddedId] = useState(null);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
  // Làm tròn để giá giảm luôn là số nguyên (khớp trang Sản phẩm / Khuyến mãi / Chi tiết)
  const salePriceOf = (p) => Math.round(p.price * (1 - (p.discountPercent || 0) / 100));

  const handleAdd = (p, hasDiscount) => {
    addToCart({ ...p, price: hasDiscount ? salePriceOf(p) : p.price }, 1);
    setAddedId(p.id);
    setTimeout(() => setAddedId(cur => (cur === p.id ? null : cur)), 2000);
  };

  return (
    <div className="products-page wishlist-page">
      <div className="products-hero">
        <div className="section-inner">
          <span className="eyebrow">Danh sách của bạn</span>
          <h1>Sản Phẩm Yêu Thích</h1>
          <p>Những sản phẩm bạn đã lưu lại — sẵn sàng để mua bất cứ lúc nào</p>
        </div>
      </div>

      <div className="section-inner wishlist-body">
        {wishlist.length === 0 ? (
          <div className="wish-empty">
            <span className="wish-empty__icon" aria-hidden="true">♡</span>
            <h2>Danh sách yêu thích đang trống</h2>
            <p>Bấm biểu tượng ♡ trên sản phẩm bạn thích để lưu lại và xem sau.</p>
            <Link to="/products" className="wish-btn-solid">Khám phá sản phẩm →</Link>
          </div>
        ) : (
          <>
            <div className="wish-toolbar">
              <span className="wish-count"><strong>{wishlist.length}</strong> sản phẩm đã lưu</span>
              <Link to="/products" className="wish-link">Tiếp tục mua sắm →</Link>
            </div>

            <div className="client-products-grid">
              {wishlist.map((p, idx) => {
                const hasDiscount = p.discountPercent > 0;
                const out = p.stock === 0;
                return (
                  <Reveal as="div" key={p.id} delay={Math.min((idx % 8) * 60, 400)}>
                    <article className="product-card wish-card">
                      <div className="product-img">
                        <Link to={`/products/${p.id}`} className="wish-img-link" aria-label={p.name}>
                          {p.image
                            ? <img src={p.image} alt={p.name} onError={e => e.target.style.display = "none"} />
                            : <span className="product-img-placeholder">🪑</span>
                          }
                        </Link>
                        {out ? (
                          <span className="product-tag product-tag--out">Hết hàng</span>
                        ) : hasDiscount ? (
                          <span className="product-tag product-tag--sale">-{p.discountPercent}%</span>
                        ) : null}
                        <button
                          type="button"
                          className="wish-remove"
                          onClick={() => removeFromWishlist(p.id)}
                          aria-label="Bỏ khỏi yêu thích"
                          title="Bỏ khỏi yêu thích"
                        >♥</button>
                      </div>

                      <div className="product-info">
                        <span className="product-cat">{p.category}</span>
                        <h3><Link to={`/products/${p.id}`}>{p.name}</Link></h3>

                        <div className="wish-prices">
                          {hasDiscount ? (
                            <>
                              <span className="product-price product-price--sale">{formatPrice(salePriceOf(p))}</span>
                              <span className="product-price-original">{formatPrice(p.price)}</span>
                            </>
                          ) : (
                            <span className="product-price">{formatPrice(p.price)}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="wish-add"
                          disabled={out}
                          onClick={() => handleAdd(p, hasDiscount)}
                        >
                          {out ? "Hết hàng" : addedId === p.id ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                        </button>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;