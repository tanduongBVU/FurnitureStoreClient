import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import "./MyOrders.css";

// Suy ra màu badge theo nội dung trạng thái (Admin có thể đặt tự do nên không cố định danh sách)
function statusStyle(status = "") {
  const s = status.toLowerCase();
  if (s.includes("huỷ") || s.includes("hủy")) return "status--cancelled";
  if (s.includes("hoàn thành") || s.includes("giao thành công")) return "status--done";
  if (s.includes("giao")) return "status--shipping";
  if (s.includes("xử lý") || s.includes("xác nhận")) return "status--processing";
  return "status--pending";
}

// Gom trạng thái về 4 nhóm để lọc nhanh: processing | shipping | done | cancelled
function statusGroup(status = "") {
  const c = statusStyle(status);
  if (c === "status--cancelled") return "cancelled";
  if (c === "status--done") return "done";
  if (c === "status--shipping") return "shipping";
  return "processing";
}

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "done", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã huỷ" },
];

const formatPrice = (n) => Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
// Nhóm đơn theo tháng để danh sách dài dễ đọc (đơn đã sắp xếp mới → cũ từ Backend)
const monthKey = (d) => {
  const t = new Date(d);
  return `${t.getFullYear()}-${t.getMonth()}`;
};
const monthLabel = (d) => {
  const t = new Date(d);
  return `Tháng ${t.getMonth() + 1}/${t.getFullYear()}`;
};
const formatDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
  " " +
  new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export default function MyOrders() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    api
      .get("/Orders/mine")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  const toggleOrder = (id) => setOpenId((cur) => (cur === id ? null : id));

  const changeFilter = (key) => {
    setFilter(key);
    setOpenId(null);
  };

  // Đếm số đơn theo nhóm trạng thái để hiện trên các nút lọc
  const counts = orders.reduce(
    (acc, o) => {
      acc[statusGroup(o.status)] += 1;
      return acc;
    },
    { processing: 0, shipping: 0, done: 0, cancelled: 0 }
  );
  counts.all = orders.length;

  const visibleOrders = filter === "all" ? orders : orders.filter((o) => statusGroup(o.status) === filter);

  return (
    <div className="myorders-page">
      <div className="myorders-header">
        <div className="section-inner">
          <span className="eyebrow">Tài khoản của bạn</span>
          <h1>Đơn hàng của tôi</h1>
          <p>Tra cứu lịch sử mua hàng và theo dõi trạng thái đơn hàng.</p>
        </div>
      </div>

      <div className="section-inner myorders-body">
        {loading ? (
          <div className="myorders-loading">
            <div className="spinner" />
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="myorders-empty">
            <span className="myorders-empty__icon" aria-hidden="true">⚠️</span>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="myorders-empty">
            <svg className="myorders-empty__svg" viewBox="0 0 48 48" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 15h30l-2 25H11L9 15z" />
              <path d="M17 15v-3a7 7 0 0 1 14 0v3" />
            </svg>
            <h2>Bạn chưa có đơn hàng nào</h2>
            <p>Những đơn hàng bạn đặt sẽ xuất hiện ở đây để bạn theo dõi.</p>
            <Link to="/products" className="btn-dark">Khám phá sản phẩm →</Link>
          </div>
        ) : (
          <>
            {/* ── Bộ lọc theo trạng thái — chỉ hiện nhóm có đơn (và "Tất cả") ── */}
            <div className="orders-filters" role="tablist">
              {FILTERS.filter((f) => f.key === "all" || counts[f.key] > 0).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  className={`orders-filter ${filter === f.key ? "orders-filter--active" : ""}`}
                  onClick={() => changeFilter(f.key)}
                >
                  {f.label}
                  <span className="orders-filter__count">{counts[f.key]}</span>
                </button>
              ))}
            </div>

            {visibleOrders.length === 0 ? (
              <div className="myorders-empty myorders-empty--inline">
                <p>Không có đơn hàng nào ở trạng thái này.</p>
              </div>
            ) : (
              <div className="orders-list">
                <div className="orders-list__head" aria-hidden="true">
                  <span>Đơn hàng</span>
                  <span>Trạng thái</span>
                  <span>Tổng tiền</span>
                </div>
                {visibleOrders.map((o, idx) => {
                  const isOpen = openId === o.id;
                  // Chi tiết giảm giá (chỉ có ở đơn tạo SAU khi có 2 cột này; đơn cũ = 0 nên không hiện)
                  const bundleDiscount = Number(o.bundleDiscount || 0);
                  const couponDiscount = Number(o.couponDiscount || 0);
                  const hasDiscount = bundleDiscount > 0 || couponDiscount > 0;
                  const showMonth = idx === 0 || monthKey(visibleOrders[idx - 1].createdAt) !== monthKey(o.createdAt);
                  return (
                    <Fragment key={o.id}>
                      {showMonth && <div className="orders-month">{monthLabel(o.createdAt)}</div>}
                    {/* Reveal chỉ bọc ở cấp order-card (không bọc riêng order-details bên trong) — vì phần chi tiết
                        ẩn/hiện theo state khi bấm mở, nếu Reveal lại tự theo dõi riêng phần đó, IntersectionObserver có thể
                        chưa kịp trigger lúc vừa bấm mở (phần tử vừa render ra) khiến nó bị đứng khuất không hiện. */}
                    <Reveal
                      as="div"
                      className={`order-card ${isOpen ? "order-card--open" : ""}`}
                      delay={Math.min(idx * 70, 350)}
                    >
                      <button type="button" className="order-summary" onClick={() => toggleOrder(o.id)} aria-expanded={isOpen}>
                        <div className="order-summary__left">
                          <span className="order-code">Đơn hàng #{o.id}</span>
                          <span className="order-date">{formatDate(o.createdAt)}</span>
                        </div>
                        <span className={`order-status ${statusStyle(o.status)}`}>{o.status}</span>
                        <strong className="order-total">{formatPrice(o.total)}</strong>
                        <span className="order-chevron" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </span>
                      </button>

                      {isOpen && (
                        <div className="order-details">
                          <div className="order-items">
                            {o.orderItems.map((item) => (
                              <div className="order-item" key={item.id}>
                                <div className="order-item__img">
                                  {item.product?.image ? (
                                    <img src={item.product.image} alt={item.productName} />
                                  ) : (
                                    <span className="order-item__placeholder">🪑</span>
                                  )}
                                </div>
                                <div className="order-item__info">
                                  <span className="order-item__name">{item.productName}</span>
                                  <span className="order-item__qty">
                                    {formatPrice(item.price)} × {item.quantity}
                                  </span>
                                </div>
                                <strong className="order-item__price">{formatPrice(item.price * item.quantity)}</strong>
                              </div>
                            ))}
                          </div>
                          <div className="order-meta">
                            <div className="order-meta__row">
                              <span>Người nhận</span>
                              <strong>{o.customerName}</strong>
                            </div>
                            <div className="order-meta__row">
                              <span>Số điện thoại</span>
                              <strong>{o.phone}</strong>
                            </div>
                            <div className="order-meta__row">
                              <span>Địa chỉ giao hàng</span>
                              <strong>{o.address}</strong>
                            </div>

                            {hasDiscount && (
                              <>
                                <div className="order-meta__row">
                                  <span>Tạm tính</span>
                                  <strong>{formatPrice(Number(o.total) + bundleDiscount + couponDiscount)}</strong>
                                </div>
                                {bundleDiscount > 0 && (
                                  <div className="order-meta__row">
                                    <span>Giảm giá combo</span>
                                    <strong className="order-meta__discount">−{formatPrice(bundleDiscount)}</strong>
                                  </div>
                                )}
                                {couponDiscount > 0 && (
                                  <div className="order-meta__row">
                                    <span>Mã giảm giá{o.couponCode ? ` (${o.couponCode})` : ""}</span>
                                    <strong className="order-meta__discount">−{formatPrice(couponDiscount)}</strong>
                                  </div>
                                )}
                              </>
                            )}

                            <div className="order-meta__row order-meta__row--total">
                              <span>Tổng cộng</span>
                              <strong>{formatPrice(o.total)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </Reveal>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}