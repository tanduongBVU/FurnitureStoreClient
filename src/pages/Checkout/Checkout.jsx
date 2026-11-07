import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import FieldError from "../../components/FieldError/FieldError";
import useFormValidation from "../../hooks/useFormValidation";
import { required, phoneVN, minLength, maxLength } from "../../utils/validators";
import "./Checkout.css";

// Luật kiểm tra thông tin giao hàng — lỗi hiện chữ đỏ ngay dưới ô nhập
const SHIPPING_RULES = {
  customerName: [
    required("Vui lòng nhập họ và tên."),
    minLength(2, "Họ tên cần ít nhất 2 ký tự."),
    maxLength(100, "Họ tên tối đa 100 ký tự."),
  ],
  phone: [required("Vui lòng nhập số điện thoại."), phoneVN()],
  address: [
    required("Vui lòng nhập địa chỉ giao hàng."),
    minLength(5, "Địa chỉ quá ngắn, vui lòng nhập đầy đủ số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố."),
    maxLength(250, "Địa chỉ tối đa 250 ký tự."),
  ],
};

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

// Phần đầu trang dùng chung cho mọi màn hình của trang thanh toán
const Hero = ({ eyebrow, title, children }) => (
  <div className="checkout-hero">
    <div className="section-inner">
      <span className="checkout-eyebrow checkout-eyebrow--light">{eyebrow}</span>
      <h1 className="checkout-title">{title}</h1>
      {children && <p>{children}</p>}
    </div>
  </div>
);

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
  const [createdOrder, setCreatedOrder] = useState(null); // { id, total, confirmCode } — dùng để dựng QR, hiện mã đơn và xác nhận chuyển khoản
  const [confirming, setConfirming] = useState(false); // đang gửi xác nhận "Tôi đã chuyển khoản"
  const [confirmError, setConfirmError] = useState("");
  const { errors, validateField, validateAll, clearError } = useFormValidation(SHIPPING_RULES);

  // Gõ lại thì xoá lỗi của chính ô đó
  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    clearError(f);
  };

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

  // Tổng theo giá niêm yết (CHƯA trừ giảm giá combo) và số tiền combo đã giảm — để khách
  // thấy rõ khoản giảm. totalPrice (giá thực phải trả) vốn đã gồm giảm giá combo.
  const listTotal = cart.reduce(
    (sum, item) =>
      sum + (item.type === "bundle" && item.originalPrice > item.price ? item.originalPrice : item.price) * item.quantity,
    0
  );
  const bundleSavings = listTotal - totalPrice;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    // Kiểm tra phía trình duyệt trước khi hỏi Backend
    if (!code) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      return;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      setCouponError("Mã giảm giá chỉ gồm chữ cái, số và dấu - hoặc _.");
      return;
    }
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
    setError("");
    if (!validateAll(form)) return;

    setSaving(true);
    try {
      // Client CHỈ gửi "mua gì, bao nhiêu" — giá và tổng tiền do Backend tự tính từ database
      // (kể cả giảm giá combo). Riêng `price` của dòng có biến thể gửi kèm để Backend đối chiếu.
      const plainLines = cart.filter(item => item.type !== "bundle");
      const bundleLines = cart.filter(item => item.type === "bundle");

      const res = await api.post("/Orders", {
        userId: isLoggedIn ? user.id : null,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        orderItems: plainLines.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          variantId: item.variantId ?? null,
          variantName: item.variantName ?? null,
        })),
        bundles: bundleLines.map(item => ({
          bundleId: item.bundleId,
          quantity: item.quantity,
        })),
      });
      // Backend trả về order trực tiếp (đường thường), HOẶC { order, couponNote } nếu mã
      // giảm giá bị từ chối ngầm lúc lưu — lấy đúng object order trong cả 2 trường hợp.
      const order = res.data.order || res.data;
      // confirmCode do Backend trả về, dùng để chính khách này xác nhận chuyển khoản ở bước QR
      setCreatedOrder({ id: order.id, total: order.total, confirmCode: res.data.confirmCode });

      if (paymentMethod === "QR" && qrEnabled) {
        // Thanh toán QR: đơn ĐÃ được tạo (để có mã DH… ghi vào nội dung chuyển khoản) nhưng
        // CHƯA báo thành công và CHƯA xoá giỏ hàng — màn hình chuyển sang hiện QR, chỉ khi
        // khách bấm "Tôi đã chuyển khoản" (handleConfirmTransfer) mới hoàn tất.
      } else {
        // COD: đặt hàng xong là hoàn tất luôn như cũ.
        clearCart();
        setSuccess(true);
      }
    } catch (err) {
      // Hiện đúng lý do Backend trả về (VD: "Combo ...: '...' không đủ hàng") nếu có
      setError(
        err.response?.data?.message ||
        "Đặt hàng thất bại! Vui lòng kiểm tra lại thông tin hoặc thử lại sau."
      );
    } finally {
      setSaving(false);
    }
  };

  // Khách xác nhận đã chuyển khoản xong → báo cho Backend ghi nhận đơn "Đã thanh toán" (Admin không
  // cần bấm xác nhận nữa), rồi mới báo "Đặt hàng thành công" + xoá giỏ hàng. Lỗi thì giữ nguyên màn hình QR
  // để khách bấm lại, không mất mã QR.
  const handleConfirmTransfer = async () => {
    setConfirmError("");
    setConfirming(true);
    try {
      await api.post(`/Orders/${createdOrder.id}/confirm-transfer`, { code: createdOrder.confirmCode });
      clearCart();
      setSuccess(true);
    } catch (err) {
      setConfirmError(err.response?.data?.message || "Không gửi được xác nhận. Vui lòng bấm lại hoặc liên hệ cửa hàng.");
    } finally {
      setConfirming(false);
    }
  };

  // ── Bước 2 của QR: đơn đã tạo, đang chờ khách quét mã & chuyển khoản ──
  if (createdOrder && paymentMethod === "QR" && qrEnabled && !success) {
    // Nội dung chuyển khoản dùng chữ KHÔNG DẤU, có mã đơn — an toàn với mọi app ngân hàng
    // (1 số app cũ xử lý dấu tiếng Việt trong nội dung CK không tốt).
    // Số tiền lấy từ createdOrder.total = tổng do SERVER tính, nên luôn đúng số phải trả.
    const qrUrl = buildVietQrUrl({
      bankBin,
      accountNo: bankAccountNo,
      accountName: bankAccountName,
      amount: createdOrder.total,
      content: `DH${createdOrder.id}`,
    });

    return (
      <div className="checkout-page">
        <Hero eyebrow="Bước cuối cùng" title="Chuyển Khoản">
          Quét mã QR bằng app ngân hàng bất kỳ để hoàn tất đơn hàng
        </Hero>
        <div className="section-inner checkout-body">
          <div className="checkout-qr">
            <div className="checkout-qr__frame">
              <img src={qrUrl} alt="Mã QR chuyển khoản" />
            </div>

            <div className="checkout-qr__info">
              <span className="checkout-eyebrow">Đơn hàng #{createdOrder.id}</span>
              <h2>Thanh toán đơn hàng #{createdOrder.id}</h2>
              <p>
                Vui lòng quét mã QR bên cạnh bằng app ngân hàng để chuyển khoản. Chuyển xong,
                bấm nút <strong>“Tôi đã chuyển khoản”</strong> để hoàn tất đặt hàng.
              </p>

              <dl className="checkout-qr__facts">
                <div><dt>Số tiền</dt><dd>{formatPrice(createdOrder.total)}</dd></div>
                <div><dt>Nội dung chuyển khoản</dt><dd>DH{createdOrder.id}</dd></div>
              </dl>

              {confirmError && <div className="checkout-error">⚠️ {confirmError}</div>}

              <button
                type="button"
                className="btn-primary-solid"
                onClick={handleConfirmTransfer}
                disabled={confirming}
              >
                {confirming ? "Đang xác nhận..." : "Tôi đã chuyển khoản"}
              </button>
              <p className="checkout-qr__note">
                Vui lòng không đóng trang này trước khi bấm nút xác nhận. Bấm xác nhận sau khi bạn
                đã chuyển khoản xong, đơn hàng sẽ được ghi nhận đã thanh toán và chuyển đi xử lý.
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
        <Hero eyebrow="Hoàn tất" title="Cảm Ơn Bạn" />
        <div className="section-inner checkout-body">
          <div className="checkout-success">
            <svg className="checkout-success-icon" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="24" cy="24" r="19" />
              <path d="M15 24.5l6.5 6.5L33 18" />
            </svg>
            <h2>Đặt hàng thành công!</h2>
            {createdOrder && <p>Mã đơn hàng của bạn: <strong>#{createdOrder.id}</strong></p>}

            {paidByQr ? (
              <p>Cảm ơn bạn đã thanh toán! Đơn hàng đã được ghi nhận và chúng tôi sẽ xử lý trong thời gian sớm nhất.</p>
            ) : (
              <p>Cảm ơn bạn đã tin tưởng LuxWood. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
            )}

            <Link to="/products" className="btn-outline-dark">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Hero eyebrow="Đơn hàng của bạn" title="Thanh Toán" />
        <div className="section-inner checkout-body">
          <div className="checkout-success">
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Vui lòng thêm sản phẩm trước khi thanh toán.</p>
            <Link to="/products" className="btn-primary-solid">Khám phá sản phẩm →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Hero eyebrow="Hoàn tất đơn hàng" title="Thanh Toán">
        Điền thông tin giao hàng và chọn cách thanh toán
      </Hero>

      <div className="section-inner checkout-body">
        {!isLoggedIn && (
          <div className="checkout-guest-note">
            Bạn đang đặt hàng với tư cách khách. <Link to="/login">Đăng nhập</Link> để theo dõi đơn hàng dễ dàng hơn.
          </div>
        )}

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <div className="checkout-step">
              <span className="checkout-step__no">01</span>
              <h3>Thông tin giao hàng</h3>
            </div>

            {error && <div className="checkout-error">⚠️ {error}</div>}

            <div className="form-group">
              <label htmlFor="ck-name">Họ và tên *</label>
              <input
                id="ck-name"
                name="customerName"
                className={errors.customerName ? "is-invalid" : ""}
                value={form.customerName}
                onChange={e => set("customerName", e.target.value)}
                onBlur={() => validateField("customerName", form)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
              <FieldError message={errors.customerName} />
            </div>
            <div className="form-group">
              <label htmlFor="ck-phone">Số điện thoại *</label>
              <input
                id="ck-phone"
                name="phone"
                className={errors.phone ? "is-invalid" : ""}
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                onBlur={() => validateField("phone", form)}
                placeholder="09xxxxxxxx"
                autoComplete="tel"
              />
              <FieldError message={errors.phone} />
            </div>
            <div className="form-group">
              <label htmlFor="ck-address">Địa chỉ giao hàng *</label>
              <textarea
                id="ck-address"
                rows={3}
                name="address"
                className={errors.address ? "is-invalid" : ""}
                value={form.address}
                onChange={e => set("address", e.target.value)}
                onBlur={() => validateField("address", form)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                autoComplete="street-address"
              />
              <FieldError message={errors.address} />
            </div>

            <div className="checkout-step checkout-step--second">
              <span className="checkout-step__no">02</span>
              <h3>Phương thức thanh toán</h3>
            </div>
            <div className="pay-options" role="radiogroup" aria-label="Phương thức thanh toán">
              <label className={`pay-option ${paymentMethod === "COD" ? "pay-option--active" : ""}`}>
                <input
                  type="radio"
                  className="pay-option__input"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <span className="pay-option__dot" aria-hidden="true" />
                <span className="pay-option__text">
                  <strong>Thanh toán khi nhận hàng (COD)</strong>
                  <span>Trả tiền mặt trực tiếp cho nhân viên giao hàng.</span>
                </span>
              </label>

              {qrEnabled && (
                <label className={`pay-option ${paymentMethod === "QR" ? "pay-option--active" : ""}`}>
                  <input
                    type="radio"
                    className="pay-option__input"
                    name="paymentMethod"
                    checked={paymentMethod === "QR"}
                    onChange={() => setPaymentMethod("QR")}
                  />
                  <span className="pay-option__dot" aria-hidden="true" />
                  <span className="pay-option__text">
                    <strong>Chuyển khoản QR</strong>
                    <span>Hiện mã QR ngay sau khi bấm đặt hàng — quét bằng app ngân hàng bất kỳ, chuyển xong bấm xác nhận để hoàn tất.</span>
                  </span>
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
                      : <span>{item.type === "bundle" ? "🎁" : "🪑"}</span>
                    }
                    <span className="checkout-item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-item-info">
                    <p>
                      {item.type === "bundle" && <strong className="checkout-item-combo">[Combo] </strong>}
                      {item.name}
                    </p>
                    {item.type === "bundle" && item.items?.length > 0 && (
                      <span className="checkout-item-bundle">
                        Gồm: {item.items.map(i => `${i.productName} x${i.quantity}`).join(", ")}
                      </span>
                    )}
                    <span className="checkout-item-unit">
                      {formatPrice(item.price)} x {item.quantity}
                      {item.type === "bundle" && item.originalPrice > item.price && (
                        <s>{formatPrice(item.originalPrice)}</s>
                      )}
                    </span>
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
                    aria-label="Mã giảm giá"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) setCouponError("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponChecking}
                  >
                    {couponChecking ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>
              )}
              {couponError && <p className="checkout-coupon__error">⚠️ {couponError}</p>}
            </div>

            <div className="checkout-summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(listTotal)}</span>
            </div>
            {bundleSavings > 0 && (
              <div className="checkout-summary-row checkout-summary-row--discount">
                <span>Giảm giá combo</span>
                <span>−{formatPrice(bundleSavings)}</span>
              </div>
            )}
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