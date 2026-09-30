import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  // ── Gợi ý sản phẩm (KHÔNG gọi AI — Backend tự tính theo quy tắc, xem
  // ProductsController.GetRecommendations): ưu tiên danh mục từ lịch sử đơn hàng đã mua
  // (nếu đã đăng nhập), cộng thêm danh mục của các sản phẩm đang có trong giỏ hàng hiện
  // tại. Hiện ở CẢ 2 trường hợp: giỏ trống và giỏ có sản phẩm.
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Chuỗi id sản phẩm trong giỏ (đã sắp xếp, khử trùng) — dùng làm dependency để chỉ gọi
  // lại API khi TẬP HỢP sản phẩm trong giỏ thực sự đổi (thêm/bớt món), không gọi lại chỉ
  // vì đổi số lượng của món đã có sẵn.
  const cartIdsKey = [...new Set(cart.map((item) => item.id))].sort((a, b) => a - b).join(",");

  useEffect(() => {
    setLoadingSuggestions(true);
    api
      .get("/Products/recommendations", {
        params: {
          userId: isLoggedIn && user ? user.id : undefined,
          cartIds: cartIdsKey || undefined,
        },
      })
      .then((res) => setSuggestions(res.data))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, [cartIdsKey, isLoggedIn, user]);

  const salePriceOf = (p) => p.price * (1 - (p.discountPercent || 0) / 100);

  const renderSuggestions = () => {
    if (loadingSuggestions || suggestions.length === 0) return null;
    return (
      <Reveal as="div" className="cart-suggestions">
        <h3>Có thể bạn cũng thích</h3>
        <div className="cart-suggestions__grid">
          {suggestions.map((p) => {
            const hasDiscount = p.discountPercent > 0;
            return (
              <Link to={`/products/${p.id}`} className="cart-suggestion-card" key={p.id}>
                <div className="cart-suggestion-card__img">
                  {p.image
                    ? <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
                    : <span>🪑</span>
                  }
                  {hasDiscount && <span className="cart-suggestion-card__badge">-{p.discountPercent}%</span>}
                </div>
                <div className="cart-suggestion-card__info">
                  <p className="cart-suggestion-card__name">{p.name}</p>
                  {hasDiscount ? (
                    <p className="cart-suggestion-card__price">
                      <span className="cart-suggestion-card__price--sale">{formatPrice(salePriceOf(p))}</span>
                      <span className="cart-suggestion-card__price--original">{formatPrice(p.price)}</span>
                    </p>
                  ) : (
                    <p className="cart-suggestion-card__price">{formatPrice(p.price)}</p>
                  )}
                  <button
                    type="button"
                    className="cart-suggestion-card__add"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...p, price: hasDiscount ? salePriceOf(p) : p.price }, 1);
                    }}
                  >
                    + Thêm vào giỏ
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </Reveal>
    );
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="section-inner">
          <Reveal as="div" className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá những sản phẩm nội thất tuyệt vời của LuxWood</p>
            <Link to="/products" className="btn-primary-solid">Khám phá sản phẩm</Link>
          </Reveal>

          {renderSuggestions()}
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="section-inner">
        <h1 className="cart-title">Giỏ Hàng</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {/* key/remove/update dùng item.cartKey (không phải item.id) — vì 2 biến thể
                khác nhau của CÙNG 1 sản phẩm có id giống nhau nhưng cartKey khác nhau,
                dùng id sẽ khiến bấm xoá/sửa 1 dòng bị ảnh hưởng nhầm sang dòng kia. */}
            {cart.map((item, idx) => (
              <Reveal as="div" className="cart-item" key={item.cartKey} delay={Math.min(idx * 60, 300)}>
                <div className="cart-item-img">
                  {item.image
                    ? <img src={item.image} alt={item.name} onError={e => e.target.style.display = "none"} />
                    : <span>🪑</span>
                  }
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{formatPrice(item.price)}</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                    disabled={item.stock ? item.quantity >= item.stock : false}
                  >+</button>
                </div>
                <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.cartKey)} title="Xoá">🗑️</button>
              </Reveal>
            ))}
          </div>

          <Reveal as="div" className="cart-summary" direction="right" delay={150}>
            <h3>Tóm tắt đơn hàng</h3>
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Phí vận chuyển</span>
              <span className="cart-free">Miễn phí</span>
            </div>
            <div className="cart-summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button className="btn-primary-solid btn-full" onClick={() => navigate("/checkout")}>
              Tiến hành thanh toán
            </button>
            <Link to="/products" className="cart-continue">← Tiếp tục mua sắm</Link>
          </Reveal>
        </div>

        {renderSuggestions()}
      </div>
    </div>
  );
};

export default Cart;