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
  if (item.type !== "bundle") return null;
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
  const { cart, removeFromCart, updateQuantity, totalPrice, addToCart, cartProductIds, syncBundleLines } = useCart();
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

  const renderSuggestions = () => {
    // Bỏ ngay khỏi gợi ý những món vừa được thêm vào giỏ (không đợi gọi lại API)
    const shown = suggestions.filter((p) => !cartProductIds.includes(p.id));

    if (shown.length === 0) {
      // Đang tải lần đầu: báo cho khách biết thay vì để trống
      return loadingSuggestions ? (
        <div className="cart-suggestions">
          <h3>Có thể bạn cũng thích</h3>
          <p style={{ fontSize: 14, color: "#9a9186", margin: 0 }}>Đang tìm gợi ý phù hợp cho bạn...</p>
        </div>
      ) : null;
    }
    return (
      <Reveal as="div" className="cart-suggestions">
        <h3>Có thể bạn cũng thích</h3>
        <div className="cart-suggestions__grid">
          {shown.map((p) => {
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
                  {p.reason && (
                    <p style={{ fontSize: 12, color: "#7a6a58", fontStyle: "italic", margin: "2px 0 6px", lineHeight: 1.4 }}>
                      {p.reason}
                    </p>
                  )}
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
            {cart.map((item, idx) => {
              const isBundle = item.type === "bundle";
              const problem = bundleProblem(item);
              const plusDisabled = isBundle
                ? item.quantity >= (item.stock ?? 0)
                : (item.stock ? item.quantity >= item.stock : false);

              return (
                <Reveal as="div" className="cart-item" key={item.cartKey} delay={Math.min(idx * 60, 300)}>
                  <div className="cart-item-img">
                    {item.image
                      ? <img src={item.image} alt={item.name} onError={e => e.target.style.display = "none"} />
                      : <span>{isBundle ? "🎁" : "🪑"}</span>
                    }
                  </div>
                  <div className="cart-item-info">
                    <h3>
                      {isBundle && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#c8a96e", color: "#1a1208", padding: "2px 8px", borderRadius: 20, marginRight: 8, verticalAlign: "middle" }}>
                          COMBO{item.discountPercent > 0 ? ` -${item.discountPercent}%` : ""}
                        </span>
                      )}
                      {item.name}
                    </h3>
                    {isBundle && item.items?.length > 0 && (
                      <p style={{ fontSize: 12, color: "#7a6a58", margin: "2px 0 4px", lineHeight: 1.5 }}>
                        Gồm: {item.items.map(i => `${i.productName} x${i.quantity}`).join(", ")}
                      </p>
                    )}
                    <p className="cart-item-price">
                      {formatPrice(item.price)}
                      {isBundle && item.originalPrice > item.price && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: "#9a9186", textDecoration: "line-through" }}>
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </p>
                    {problem && (
                      <p style={{ fontSize: 13, color: "#c0392b", margin: "6px 0 0", fontWeight: 600 }}>⚠️ {problem}</p>
                    )}
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                      disabled={plusDisabled}
                    >+</button>
                  </div>
                  <div className="cart-item-total">{formatPrice(item.price * item.quantity)}</div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.cartKey)} title="Xoá">🗑️</button>
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
              <div className="cart-summary-row" style={{ color: "#b3492f", fontWeight: 600 }}>
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
              className="btn-primary-solid btn-full"
              onClick={() => navigate("/checkout")}
              disabled={hasBlockingProblem}
              style={hasBlockingProblem ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
            >
              Tiến hành thanh toán
            </button>
            {hasBlockingProblem && (
              <p style={{ fontSize: 12, color: "#c0392b", margin: "8px 0 0", textAlign: "center" }}>
                Vui lòng xử lý các combo có cảnh báo trước khi thanh toán.
              </p>
            )}
            <Link to="/products" className="cart-continue">← Tiếp tục mua sắm</Link>
          </Reveal>
        </div>

        {renderSuggestions()}
      </div>
    </div>
  );
};

export default Cart;