import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import "./ProductReviews.css";

// Hiện dãy sao — dùng chung cho cả hiển thị (readOnly) và bộ chọn khi gửi đánh giá
const Stars = ({ value, onChange, readOnly = false, size = 16 }) => (
  <div className={`pr-stars ${readOnly ? "" : "pr-stars--interactive"}`}>
    {[1, 2, 3, 4, 5].map(n => (
      <span
        key={n}
        style={{ fontSize: size }}
        className={`pr-star ${n <= value ? "pr-star--filled" : ""}`}
        onClick={readOnly ? undefined : () => onChange(n)}
      >
        ★
      </span>
    ))}
  </div>
);

const ProductReviews = ({ productId }) => {
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [canReview, setCanReview] = useState(false);
  const [reason, setReason] = useState("");
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    api.get(`/Reviews/product/${productId}`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setCheckingEligibility(true);
    api.get(`/Reviews/can-review/${productId}`)
      .then(res => {
        setCanReview(res.data.canReview);
        setReason(res.data.reason);
      })
      .catch(() => {
        setCanReview(false);
        setReason("");
      })
      .finally(() => setCheckingEligibility(false));
  }, [isLoggedIn, productId]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setSendError("Vui lòng chọn số sao đánh giá!");
      return;
    }
    setSending(true);
    setSendError("");
    try {
      await api.post("/Reviews", { productId, rating, comment });
      setSent(true);
      setCanReview(false);
      setRating(0);
      setComment("");
    } catch (err) {
      setSendError(err.response?.data?.message || "Lỗi khi gửi đánh giá! Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  return (
    <div className="pr-section">
      <div className="pr-header">
        <h2>Đánh giá từ khách hàng</h2>
        {reviews.length > 0 && (
          <div className="pr-summary">
            <Stars value={Math.round(avgRating)} readOnly size={20} />
            <span className="pr-summary-text">
              <strong>{avgRating.toFixed(1)}</strong>/5 ({reviews.length} đánh giá)
            </span>
          </div>
        )}
      </div>

      {/* Danh sách review */}
      {loading ? (
        <p className="pr-loading">Đang tải đánh giá...</p>
      ) : reviews.length === 0 ? (
        <p className="pr-empty">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
      ) : (
        <div className="pr-list">
          {reviews.map(r => (
            <div className="pr-item" key={r.id}>
              <div className="pr-item-head">
                <span className="pr-item-name">{r.userName}</span>
                <span className="pr-item-date">{formatDate(r.createdAt)}</span>
              </div>
              <Stars value={r.rating} readOnly size={14} />
              {r.comment && <p className="pr-item-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Form gửi đánh giá / trạng thái điều kiện */}
      <div className="pr-form-wrap">
        {!isLoggedIn ? (
          <p className="pr-note">
            <Link to="/login">Đăng nhập</Link> để đánh giá sản phẩm này.
          </p>
        ) : sent ? (
          <p className="pr-note pr-note--success">
            ✓ Đã gửi đánh giá! Đánh giá của bạn sẽ hiện công khai sau khi được duyệt.
          </p>
        ) : checkingEligibility ? (
          <p className="pr-note">Đang kiểm tra...</p>
        ) : !canReview ? (
          <p className="pr-note">{reason}</p>
        ) : (
          <form className="pr-form" onSubmit={handleSubmit}>
            <h3>Viết đánh giá của bạn</h3>
            {sendError && <p className="pr-note pr-note--error">⚠️ {sendError}</p>}
            <div className="pr-form-row">
              <label>Số sao</label>
              <Stars value={rating} onChange={setRating} size={26} />
            </div>
            <div className="pr-form-row">
              <label htmlFor="pr-comment">Nhận xét (không bắt buộc)</label>
              <textarea
                id="pr-comment"
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              />
            </div>
            <button type="submit" className="pr-submit-btn" disabled={sending}>
              {sending ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;