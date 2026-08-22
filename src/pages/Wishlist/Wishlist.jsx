import { Link } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import "../Products/Products.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
  const salePriceOf = (p) => p.price * (1 - (p.discountPercent || 0) / 100);

  return (
    <div className="products-page">
      <div className="products-hero" style={{ background: "#3b2a1a" }}>
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Danh sách của bạn</span>
          <h1 style={{ color: "#fff" }}>Sản Phẩm Yêu Thích</h1>
          <p style={{ color: "rgba(255,255,255,0.75)" }}>
            Những sản phẩm bạn đã lưu lại — sẵn sàng để mua bất cứ lúc nào
          </p>
        </div>
      </div>

      <div className="section-inner">
        {wishlist.length === 0 ? (
          <div className="empty-box" style={{ marginTop: 40 }}>
            Bạn chưa lưu sản phẩm nào. Bấm biểu tượng ♡ trên sản phẩm để lưu lại nhé!
            <div style={{ marginTop: 16 }}>
              <Link to="/products" className="btn-outline">Khám phá sản phẩm →</Link>
            </div>
          </div>
        ) : (
          <div className="client-products-grid" style={{ marginTop: 40 }}>
            {wishlist.map(p => {
              const hasDiscount = p.discountPercent > 0;
              return (
                <div className="product-card" key={p.id} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(p.id)}
                    aria-label="Bỏ khỏi yêu thích"
                    title="Bỏ khỏi yêu thích"
                    style={{
                      position: "absolute", top: 12, right: 12, zIndex: 3,
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(255,255,255,0.95)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, cursor: "pointer", color: "#e0245e",
                      boxShadow: "0 2px 8px rgba(0,0,0,.15)",
                    }}
                  >
                    ♥
                  </button>

                  <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="product-img">
                      {p.image
                        ? <img src={p.image} alt={p.name} onError={e => e.target.style.display = "none"} />
                        : <span className="product-img-placeholder">🪑</span>
                      }
                      {p.stock === 0 ? (
                        <span className="product-tag product-tag--out">Hết hàng</span>
                      ) : hasDiscount ? (
                        <span className="product-tag" style={{ background: "#b91c1c" }}>-{p.discountPercent}%</span>
                      ) : null}
                    </div>
                    <div className="product-info">
                      <span className="product-cat">{p.category}</span>
                      <h3>{p.name}</h3>
                    </div>
                  </Link>

                  <div className="product-info" style={{ paddingTop: 0 }}>
                    <div className="product-footer">
                      {hasDiscount ? (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ textDecoration: "line-through", color: "#9a9a9a", fontSize: 12 }}>
                            {formatPrice(p.price)}
                          </span>
                          <span className="product-price" style={{ color: "#b91c1c" }}>
                            {formatPrice(salePriceOf(p))}
                          </span>
                        </div>
                      ) : (
                        <span className="product-price">{formatPrice(p.price)}</span>
                      )}
                      <button
                        className="btn-add"
                        disabled={p.stock === 0}
                        onClick={() => addToCart({ ...p, price: hasDiscount ? salePriceOf(p) : p.price }, 1)}
                      >
                        {p.stock === 0 ? "Hết hàng" : "+ Thêm vào giỏ"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;