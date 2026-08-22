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

  // ── Mã giảm giá ──
  const [couponInput, setCouponInput] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState("");
  // appliedCoupon = { code, discountPercent, discountAmount } khi mã hợp lệ, null nếu chưa áp dụng
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Tự điền sẵn tên nếu khách đã đăng nhập
  useEffect(() => {
    if (isLoggedIn && user) {
      setForm(p => ({ ...p, customerName: user.name }));

      // user trong AuthContext (từ login/register) không có sẵn phone/address,
      // nên gọi thẳng /Auth/me để lấy đúng thông tin đã lưu trong tài khoản
      // rồi tự điền sẵn — khách vẫn có thể sửa lại trước khi đặt hàng.
      api.get("/Auth/me")
        .then(res => {
          setForm(p => ({
            ...p,
            phone: res.data.phone || p.phone,
            address: res.data.address || p.address,
          }));
        })
        .catch(() => {
          // Không lấy được thì thôi, để khách tự nhập như bình thường
        });
    }
  }, [isLoggedIn, user]);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  // Giá cuối cùng sau khi trừ giảm giá (nếu có mã đang áp dụng) — chỉ dùng để HIỂN THỊ,
  // số tiền thật lưu vào đơn hàng luôn do server tự tính lại (xem OrdersController.Create).
  const finalTotal = appliedCoupon ? totalPrice - appliedCoupon.discountAmount : totalPrice;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponChecking(true);
    setCouponError("");
    try {
      const res = await api.post("/Coupons/validate", { code, orderValue: totalPrice });
      setAppliedCoupon(res.data);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || "Mã giảm giá không hợp lệ.");
    } finally {
      setCouponChecking(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

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
        // Gửi mã kèm theo, nhưng số tiền thật giảm bao nhiêu do SERVER tự tính lại —
        // client không được quyết định số tiền giảm cuối cùng, chỉ gợi ý mã muốn dùng.
        couponCode: appliedCoupon ? appliedCoupon.code : null,
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
              {saving ? "Đang xử lý..." : `Đặt hàng — ${formatPrice(finalTotal)}`}
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

            {/* ── Mã giảm giá ── */}
            <div className="checkout-coupon">
              {appliedCoupon ? (
                <div className="checkout-coupon__applied">
                  <span>
                    🎟️ Mã <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)
                  </span>
                  <button type="button" onClick={handleRemoveCoupon}>Bỏ mã</button>
                </div>
              ) : (
                <div className="checkout-coupon__form">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponChecking || !couponInput.trim()}
                  >
                    {couponChecking ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>
              )}
              {couponError && <p className="checkout-coupon__error">⚠️ {couponError}</p>}
            </div>

            <div className="checkout-summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {appliedCoupon && (
              <div className="checkout-summary-row checkout-summary-row--discount">
                <span>Giảm giá ({appliedCoupon.code})</span>
                <span>−{formatPrice(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            <div className="checkout-summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;