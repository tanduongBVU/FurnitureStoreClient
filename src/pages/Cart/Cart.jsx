import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./Cart.css";

// Cảnh báo của 1 dòng COMBO trong giỏ (null nếu ổn). Dữ liệu isAvailable/stock được đồng bộ
// từ server mỗi lần mở trang này (syncBundleLines).
const bundleProblem = (item) => {
  if (item.type !== "bundle") {
    // Dòng sản phẩm thường: dữ liệu được đồng bộ từ server (syncProductLines)
    if (item.removed) return "Sản phẩm này không còn được bán. Vui lòng xoá khỏi giỏ hàng.";
    if (typeof item.stock === "number" && item.stock <= 0) return "Sản phẩm tạm hết hàng. Vui lòng xoá khỏi giỏ hoặc quay lại sau.";
    if (typeof item.stock === "number" && item.quantity > item.stock) {
      return `Kho chỉ còn ${item.stock} sản phẩm — vui lòng giảm số lượng.`;
    }
    return null;
  }
  if (item.removed) return "Combo này không còn được bán. Vui lòng xoá khỏi giỏ hàng.";
  if (item.isAvailable === false) {
    const names = item.outOfStockItems?.length ? `: ${item.outOfStockItems.join(", ")}` : "";
    return `Combo tạm hết hàng${names}. Vui lòng xoá khỏi giỏ hoặc quay lại sau.`;
  }
  if (typeof item.stock === "number" && item.quantity > item.stock) {
    return `Kho chỉ còn đủ cho ${item.stock} combo — vui lòng giảm số lượng.`;
  }
  return null;
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, addToCart, cartProductIds, syncBundleLines, syncProductLines } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  // ── Gợi ý "Có thể bạn cũng thích" — chỉ sản phẩm LIÊN QUAN tới thứ đã mua / đang trong giỏ
  // (Backend dùng Gemini, xem ProductsController.GetRecommendations). Không có gợi ý nào
  // phù hợp thì ẩn hẳn mục này, không lấp bằng sản phẩm bất kỳ. userId do Backend lấy từ
  // token đăng nhập nên Client không gửi nữa.
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Chuỗi id sản phẩm trong giỏ (đã sắp xếp) — dùng làm dependency để chỉ gọi lại API khi
  // TẬP HỢP sản phẩm thực sự đổi, không gọi lại chỉ vì đổi số lượng.
  const cartIdsKey = [...cartProductIds].sort((a, b) => a - b).join(",");

  useEffect(() => {
    // Khách vãng lai + giỏ trống: không có gì để dựa vào, khỏi gọi API.
    if (!isLoggedIn && !cartIdsKey) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    let cancelled = false;
    setLoadingSuggestions(true);
    api
      .get("/Products/recommendations", { params: { cartIds: cartIdsKey || undefined } })
      .then((res) => { if (!cancelled) setSuggestions(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (!cancelled) setSuggestions([]); })
      .finally(() => { if (!cancelled) setLoadingSuggestions(false); });
    return () => { cancelled = true; };
  }, [cartIdsKey, isLoggedIn]);

  // ── Làm mới thông tin các combo trong giỏ (giá, còn hàng không) mỗi khi mở giỏ hàng ──
  const bundleIdsKey = cart
    .filter((item) => item.type === "bundle")
    .map((item) => item.bundleId)
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    if (!bundleIdsKey) return;
    let cancelled = false;
    api
      .get("/Bundles")
      .then((res) => { if (!cancelled && Array.isArray(res.data)) syncBundleLines(res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleIdsKey]);

  // ── Làm mới giá / tồn kho / còn bán của các SẢN PHẨM thường trong giỏ mỗi khi mở giỏ hàng ──
  // Chỉ gọi lại khi TẬP HỢP sản phẩm đổi (không gọi lại chỉ vì đổi số lượng).
  const productIdsKey = [
    ...new Set(cart.filter((item) => item.type !== "bundle").map((item) => item.id)),
  ]
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    if (!productIdsKey) return;
    let cancelled = false;
    const ids = productIdsKey.split(",").map(Number);
    Promise.all(
      ids.map((id) =>
        api
          .get(`/Products/${id}`)
          .then((res) => ({ id, product: res.data }))
          // 404 = sản phẩm đã ẩn / bị xoá → đánh dấu không còn bán. Lỗi khác (mạng...) → bỏ qua, giữ giỏ cũ.
          .catch((err) => (err.response?.status === 404 ? { id, product: null } : null))
      )
    ).then((results) => {
      if (!cancelled) syncProductLines(results.filter(Boolean));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey]);

  const hasBlockingProblem = cart.some((item) => bundleProblem(item));

  // Tổng theo giá niêm yết (chưa trừ giảm giá combo) + số tiền combo đã giảm, để khách thấy
  // rõ khoản tiết kiệm. totalPrice (giá thực phải trả) vốn đã gồm giảm giá combo.
  const listTotal = cart.reduce(
    (sum, item) =>
      sum + (item.type === "bundle" && item.originalPrice > item.price ? item.originalPrice : item.price) * item.quantity,
    0
  );
  const bundleSavings = listTotal - totalPrice;

  // Làm tròn đồng, khớp cách server tính giá (PricingHelper.SaleUnitPrice)
  const salePriceOf = (p) => Math.round(p.price * (1 - (p.discountPercent || 0) / 100));

  // Phần đầu trang (dùng chung cho giỏ có hàng / giỏ trống)
  const hero = (
    <div className="cart-hero">
      <div className="section-inner">
        <span className="cart-eyebrow cart-eyebrow--light">Đơn hàng của bạn</span>
        <h1 className="cart-title">Giỏ Hàng</h1>
        <p>
          {cart.length > 0
            ? `${cart.length} mục trong giỏ — kiểm tra lại trước khi thanh toán`
            : "Chưa có sản phẩm nào trong giỏ"}
        </p>
      </div>
    </div>
  );

  const renderSuggestions = () => {
    // Bỏ ngay khỏi gợi ý những món vừa được thêm vào giỏ (không đợi gọi lại API)
    const shown = suggestions.filter((p) => !cartProductIds.includes(p.id));

    if (shown.length === 0) {
      // Đang tải lần đầu: báo cho khách biết thay vì để trống
      return loadingSuggestions ? (
        <div className="cart-suggestions">
          <div className="section-inner">
            <span className="cart-eyebrow">Gợi ý cho bạn</span>
            <h3>Có thể bạn cũng thích</h3>
            <p className="cart-suggestions__loading">Đang tìm gợi ý phù hợp cho bạn...</p>
          </div>
        </div>
      ) : null;
    }
    return (
      <div className="cart-suggestions">
        <div className="section-inner">
          <span className="cart-eyebrow">Gợi ý cho bạn</span>
          <h3>Có thể bạn cũng thích</h3>
          <div className="cart-suggestions__grid">
            {shown.map((p, idx) => {
              const hasDiscount = p.discountPercent > 0;
              return (
                <Reveal as="div" key={p.id} delay={Math.min(idx * 60, 300)}>
                  <Link to={`/products/${p.id}`} className="cart-suggestion-card">
                    <div className="cart-suggestion-card__img">
                      {p.image
                        ? <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
                        : <span>🪑</span>
                      }
                      {hasDiscount && <span className="cart-suggestion-card__badge">-{p.discountPercent}%</span>}
                    </div>
                    <div className="cart-suggestion-card__info">
                      <p className="cart-suggestion-card__name">{p.name}</p>
                      {p.reason && <p className="cart-suggestion-card__reason">{p.reason}</p>}
                      <div className="cart-suggestion-card__prices">
                        {hasDiscount ? (
                          <>
                            <span className="cart-suggestion-card__price cart-suggestion-card__price--sale">{formatPrice(salePriceOf(p))}</span>
                            <span className="cart-suggestion-card__price--original">{formatPrice(p.price)}</span>
                          </>
                        ) : (
                          <span className="cart-suggestion-card__price">{formatPrice(p.price)}</span>
                        )}
                      </div>
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        {hero}
        <div className="section-inner cart-body cart-body--empty">
          <Reveal as="div" className="cart-empty">
            <svg className="cart-empty-icon" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 7h6l4.5 22h20L40 14H13" />
              <circle cx="19" cy="38" r="2.6" />
              <circle cx="33" cy="38" r="2.6" />
            </svg>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá những sản phẩm nội thất tuyệt vời của LuxWood</p>
            <Link to="/products" className="btn-primary-solid">Khám phá sản phẩm →</Link>
          </Reveal>
        </div>
        {renderSuggestions()}
      </div>
    );
  }

  return (
    <div className="cart-page">
      {hero}

      <div className="section-inner cart-body">
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-head" aria-hidden="true">
              <span className="cart-head-product">Sản phẩm</span>
              <span className="cart-head-qty">Số lượng</span>
              <span className="cart-head-total">Thành tiền</span>
            </div>

            {/* key/remove/update dùng item.cartKey (không phải item.id) — vì 2 biến thể
                khác nhau của CÙNG 1 sản phẩm có id giống nhau nhưng cartKey khác nhau,
                dùng id sẽ khiến bấm xoá/sửa 1 dòng bị ảnh hưởng nhầm sang dòng kia. */}
            {cart.map((item, idx) => {
              const isBundle = item.type === "bundle";
              const problem = bundleProblem(item);
              const plusDisabled = isBundle
                ? item.quantity >= (item.stock ?? 0)
                : (item.stock ? item.quantity >= item.stock : false);

              return (
                <Reveal as="div" className={`cart-item ${problem ? "cart-item--problem" : ""}`} key={item.cartKey} delay={Math.min(idx * 60, 300)}>
                  <div className="cart-item-img">
                    {item.image
                      ? <img src={item.image} alt={item.name} onError={e => e.target.style.display = "none"} />
                      : <span>{isBundle ? "🎁" : "🪑"}</span>
                    }
                  </div>
                  <div className="cart-item-info">
                    {isBundle && (
                      <span className="cart-badge">
                        Combo{item.discountPercent > 0 ? ` -${item.discountPercent}%` : ""}
                      </span>
                    )}
                    <h3>{item.name}</h3>
                    {isBundle && item.items?.length > 0 && (
                      <p className="cart-item-bundle">
                        Gồm: {item.items.map(i => `${i.productName} x${i.quantity}`).join(", ")}
                      </p>
                    )}
                    <p className="cart-item-price">
                      <span>{formatPrice(item.price)}</span>
                      {isBundle && item.originalPrice > item.price && (
                        <span className="cart-item-orig">{formatPrice(item.originalPrice)}</span>
                      )}
                    </p>
                    {!isBundle && item.priceChangedFrom != null && (
                      <p className="cart-item-pricechange">Giá đã cập nhật (trước: {formatPrice(item.priceChangedFrom)})</p>
                    )}
                    {problem && <p className="cart-item-problem">⚠️ {problem}</p>}
                  </div>
                  <div className="cart-item-qty">
                    <button type="button" aria-label="Giảm số lượng" onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Tăng số lượng"
                      onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                      disabled={plusDisabled}
                    >+</button>
                  </div>
                  <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>
                  <button type="button" className="cart-item-remove" onClick={() => removeFromCart(item.cartKey)} title="Xoá" aria-label={`Xoá ${item.name} khỏi giỏ`}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                    </svg>
                  </button>
                </Reveal>
              );
            })}
          </div>

          <Reveal as="div" className="cart-summary" direction="right" delay={150}>
            <h3>Tóm tắt đơn hàng</h3>
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(listTotal)}</span>
            </div>
            {bundleSavings > 0 && (
              <div className="cart-summary-row cart-summary-row--save">
                <span>Giảm giá combo</span>
                <span>−{formatPrice(bundleSavings)}</span>
              </div>
            )}
            <div className="cart-summary-row">
              <span>Phí vận chuyển</span>
              <span className="cart-free">Miễn phí</span>
            </div>
            <div className="cart-summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button
              type="button"
              className="btn-primary-solid btn-full"
              onClick={() => navigate("/checkout")}
              disabled={hasBlockingProblem}
            >
              Tiến hành thanh toán
            </button>
            {hasBlockingProblem && (
              <p className="cart-checkout-warn">
                Vui lòng xử lý các sản phẩm / combo có cảnh báo trước khi thanh toán.
              </p>
            )}
            <Link to="/products" className="cart-continue">← Tiếp tục mua sắm</Link>
          </Reveal>
        </div>
      </div>

      {renderSuggestions()}
    </div>
  );
};

export default Cart;