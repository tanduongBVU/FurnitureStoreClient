import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import "./Checkout.css";

// Dựng URL ảnh QR qua dịch vụ MIỄN PHÍ img.vietqr.io — không cần đăng ký, không cần API
// key, không cần webhook/callback (khác hẳn VNPay/MoMo). Trình duyệt tải thẳng ảnh PNG này,
// bên trong đã mã hoá sẵn đúng chuẩn VietQR (ngân hàng + số tài khoản + số tiền + nội dung),
// khách chỉ cần mở app ngân hàng bất kỳ quét là tự điền đủ thông tin chuyển khoản.
const buildVietQrUrl = ({ bankBin, accountNo, accountName, amount, content }) => {
  const base = `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png`;
  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: content,
    accountName,
  });
  return `${base}?${params.toString()}`;
};

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const { get } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: "", phone: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "QR"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null); // { id, total } — dùng để dựng QR và hiện mã đơn
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const [couponInput, setCouponInput] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Cấu hình ngân hàng nhận tiền — Admin điền ở Giao diện > Liên hệ & Footer > Thanh toán QR.
  // Chưa cấu hình (thiếu bankBin hoặc accountNo) → ẨN HẲN lựa chọn QR, chỉ còn COD, tránh
  // hiện 1 tuỳ chọn thanh toán không dùng được.
  const bankBin = get("payment.bankBin", "");
  const bankAccountNo = get("payment.accountNo", "");
  const bankAccountName = get("payment.accountName", "");
  const qrEnabled = Boolean(bankBin && bankAccountNo);

  useEffect(() => {
    if (isLoggedIn && user) {
      setForm(p => ({ ...p, customerName: user.name }));

      api.get("/Auth/me")
        .then(res => {
          setForm(p => ({
            ...p,
            phone: res.data.phone || p.phone,
            address: res.data.address || p.address,
          }));
        })
        .catch(() => {});
    }
  }, [isLoggedIn, user]);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

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
      const res = await api.post("/Orders", {
        userId: isLoggedIn ? user.id : null,
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        status: "Chờ xác nhận",
        total: totalPrice,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        orderItems: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          variantId: item.variantId ?? null,
          variantName: item.variantName ?? null,
        })),
      });
      // Backend trả về order trực tiếp (đường thường), HOẶC { order, couponNote } nếu mã
      // giảm giá bị từ chối ngầm lúc lưu — lấy đúng object order trong cả 2 trường hợp.
      const order = res.data.order || res.data;
      setCreatedOrder({ id: order.id, total: order.total });

      if (paymentMethod === "QR" && qrEnabled) {
        // Thanh toán QR: đơn ĐÃ được tạo (để có mã DH… ghi vào nội dung chuyển khoản) nhưng
        // CHƯA báo thành công và CHƯA xoá giỏ hàng — màn hình chuyển sang hiện QR, chỉ khi
        // khách bấm "Tôi đã chuyển khoản" (handleConfirmTransfer) mới hoàn tất.
      } else {
        // COD: đặt hàng xong là hoàn tất luôn như cũ.
        clearCart();
        setSuccess(true);
      }
    } catch {
      setError("Đặt hàng thất bại! Vui lòng kiểm tra lại thông tin hoặc thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  // Khách xác nhận đã chuyển khoản xong → lúc này mới báo "Đặt hàng thành công" + xoá giỏ hàng.
  // Lưu ý: web không tự biết tiền đã về hay chưa, Admin sẽ đối chiếu và bấm "Đã nhận tiền" ở trang quản trị.
  const handleConfirmTransfer = () => {
    clearCart();
    setSuccess(true);
  };

  // ── Bước 2 của QR: đơn đã tạo, đang chờ khách quét mã & chuyển khoản ──
  if (createdOrder && paymentMethod === "QR" && qrEnabled && !success) {
    // Nội dung chuyển khoản dùng chữ KHÔNG DẤU, có mã đơn — an toàn với mọi app ngân hàng
    // (1 số app cũ xử lý dấu tiếng Việt trong nội dung CK không tốt).
    const qrUrl = buildVietQrUrl({
      bankBin,
      accountNo: bankAccountNo,
      accountName: bankAccountName,
      amount: createdOrder.total,
      content: `DH${createdOrder.id}`,
    });

    return (
      <div className="checkout-page">
        <div className="section-inner">
          <div className="checkout-success">
            <span className="checkout-success-icon">📲</span>
            <h2>Thanh toán đơn hàng #{createdOrder.id}</h2>
            <p>
              Vui lòng quét mã QR bên dưới bằng app ngân hàng để chuyển khoản. Chuyển xong,
              bấm nút <strong>“Tôi đã chuyển khoản”</strong> để hoàn tất đặt hàng.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 10 }}>
              <img
                src={qrUrl}
                alt="Mã QR chuyển khoản"
                style={{ maxWidth: 320, width: "100%", borderRadius: 12, border: "1px solid #e5ddd0" }}
              />
              <p style={{ textAlign: "center", fontSize: 14, color: "#3b2a1a", margin: 0 }}>
                Số tiền: <strong>{formatPrice(createdOrder.total)}</strong><br />
                Nội dung chuyển khoản: <strong>DH{createdOrder.id}</strong>
              </p>
              <button
                type="button"
                className="btn-primary-solid"
                onClick={handleConfirmTransfer}
              >
                Tôi đã chuyển khoản
              </button>
              <p style={{ fontSize: 12, color: "#9a9186", textAlign: "center", margin: 0, maxWidth: 360 }}>
                Vui lòng không đóng trang này trước khi bấm nút xác nhận. Đơn hàng sẽ được
                xử lý sau khi chúng tôi nhận được tiền.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Hoàn tất: COD đặt xong, hoặc QR sau khi khách bấm "Tôi đã chuyển khoản" ──
  if (success) {
    const paidByQr = paymentMethod === "QR" && qrEnabled;
    return (
      <div className="checkout-page">
        <div className="section-inner">
          <div className="checkout-success">
            <span className="checkout-success-icon">✅</span>
            <h2>Đặt hàng thành công!</h2>
            {createdOrder && <p>Mã đơn hàng của bạn: <strong>#{createdOrder.id}</strong></p>}

            {paidByQr ? (
              <p>Cảm ơn bạn! Chúng tôi sẽ xác nhận đơn hàng ngay sau khi nhận được thanh toán.</p>
            ) : (
              <p>Cảm ơn bạn đã tin tưởng LuxWood. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
            )}

            <Link to="/products" className="btn-outline-dark" style={{ marginTop: 20 }}>Tiếp tục mua sắm</Link>
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

            <h3 style={{ marginTop: 8 }}>Phương thức thanh toán</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <label
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  border: paymentMethod === "COD" ? "2px solid #c8a96e" : "1.5px solid #e5ddd0",
                  background: paymentMethod === "COD" ? "rgba(200,169,110,.08)" : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <strong style={{ display: "block", marginBottom: 2 }}>Thanh toán khi nhận hàng (COD)</strong>
                  <span style={{ fontSize: 13, color: "#7a6a58" }}>Trả tiền mặt trực tiếp cho nhân viên giao hàng.</span>
                </div>
              </label>

              {qrEnabled && (
                <label
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                    border: paymentMethod === "QR" ? "2px solid #c8a96e" : "1.5px solid #e5ddd0",
                    background: paymentMethod === "QR" ? "rgba(200,169,110,.08)" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "QR"}
                    onChange={() => setPaymentMethod("QR")}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong style={{ display: "block", marginBottom: 2 }}>Chuyển khoản QR</strong>
                    <span style={{ fontSize: 13, color: "#7a6a58" }}>Hiện mã QR ngay sau khi bấm đặt hàng — quét bằng app ngân hàng bất kỳ, chuyển xong bấm xác nhận để hoàn tất.</span>
                  </div>
                </label>
              )}
            </div>

            <button type="submit" className="btn-primary-solid btn-full" disabled={saving}>
              {saving ? "Đang xử lý..." : `Đặt hàng — ${formatPrice(finalTotal)}`}
            </button>
          </form>

          <div className="checkout-summary">
            <h3>Đơn hàng của bạn</h3>
            <div className="checkout-items">
              {cart.map(item => (
                <div className="checkout-item" key={item.cartKey}>
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