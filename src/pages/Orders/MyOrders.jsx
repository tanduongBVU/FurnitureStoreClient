import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
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

const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
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

  return (
    <div className="myorders-page">
      <div className="myorders-header">
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Tài khoản của bạn</span>
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
            <span style={{ fontSize: 40 }}>⚠️</span>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="myorders-empty">
            <span style={{ fontSize: 48 }}>🛍️</span>
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link to="/products" className="btn-dark">Khám phá sản phẩm →</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => {
              const isOpen = openId === o.id;
              return (
                <div className={`order-card ${isOpen ? "order-card--open" : ""}`} key={o.id}>
                  <button className="order-summary" onClick={() => toggleOrder(o.id)}>
                    <div className="order-summary__left">
                      <span className="order-code">Đơn hàng #{o.id}</span>
                      <span className="order-date">{formatDate(o.createdAt)}</span>
                    </div>
                    <div className="order-summary__right">
                      <span className={`order-status ${statusStyle(o.status)}`}>{o.status}</span>
                      <strong className="order-total">{formatPrice(o.total)}</strong>
                      <span className="order-chevron">{isOpen ? "▲" : "▼"}</span>
                    </div>
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
                                <span style={{ fontSize: 22 }}>🪑</span>
                              )}
                            </div>
                            <div className="order-item__info">
                              <span className="order-item__name">{item.productName}</span>
                              <span className="order-item__qty">Số lượng: {item.quantity}</span>
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
                        <div className="order-meta__row order-meta__row--total">
                          <span>Tổng cộng</span>
                          <strong>{formatPrice(o.total)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
