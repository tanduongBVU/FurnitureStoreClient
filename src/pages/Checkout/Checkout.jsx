import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import "./Checkout.css";

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  // Tự điền sẵn tên nếu khách đã đăng nhập
  useEffect(() => {
    if (isLoggedIn && user) {
      setForm(p => ({ ...p, customerName: user.name }));
    }
  }, [isLoggedIn, user]);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/Orders", {
        userId: isLoggedIn ? user.id : null,
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        status: "Chờ xác nhận",
        total: totalPrice,
        orderItems: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      clearCart();
      setSuccess(true);
    } catch {
      setError("Đặt hàng thất bại! Vui lòng kiểm tra lại thông tin hoặc thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="section-inner">
          <div className="checkout-success">
            <span className="checkout-success-icon">✅</span>
            <h2>Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã tin tưởng LuxWood. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
            <Link to="/products" className="btn-primary-solid">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="section-inner">
          <div className="checkout-success">
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Vui lòng thêm sản phẩm trước khi thanh toán.</p>
            <Link to="/products" className="btn-primary-solid">Khám phá sản phẩm</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="section-inner">
        <h1 className="checkout-title">Thanh Toán</h1>

        {!isLoggedIn && (
          <div className="checkout-guest-note">
            Bạn đang đặt hàng với tư cách khách. <Link to="/login">Đăng nhập</Link> để theo dõi đơn hàng dễ dàng hơn.
          </div>
        )}

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3>Thông tin giao hàng</h3>

            {error && <div className="checkout-error">⚠️ {error}</div>}

            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                value={form.customerName}
                onChange={e => set("customerName", e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="09xxxxxxxx"
                required
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ giao hàng *</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={e => set("address", e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                required
              />
            </div>

            <button type="submit" className="btn-primary-solid btn-full" disabled={saving}>
              {saving ? "Đang xử lý..." : `Đặt hàng — ${formatPrice(totalPrice)}`}
            </button>
          </form>

          <div className="checkout-summary">
            <h3>Đơn hàng của bạn</h3>
            <div className="checkout-items">
              {cart.map(item => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-img">
                    {item.image
                      ? <img src={item.image} alt={item.name} onError={e => e.target.style.display = "none"} />
                      : <span>🪑</span>
                    }
                    <span className="checkout-item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-item-info">
                    <p>{item.name}</p>
                    <span>{formatPrice(item.price)} x {item.quantity}</span>
                  </div>
                  <div className="checkout-item-total">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="checkout-summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
