import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="section-inner">
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá những sản phẩm nội thất tuyệt vời của LuxWood</p>
            <Link to="/products" className="btn-primary-solid">Khám phá sản phẩm</Link>
          </div>
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
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
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
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.stock ? item.quantity >= item.stock : false}
                  >+</button>
                </div>
                <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} title="Xoá">🗑️</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
