import { Link, useNavigate } from "react-router-dom";
import { useCompare } from "../../contexts/CompareContext";
import { useCart } from "../../contexts/CartContext";
import Reveal from "../../components/Reveal/Reveal";
import "./Compare.css";

const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
const salePriceOf = (p) => p.price * (1 - (p.discountPercent || 0) / 100);

// Các hàng thuộc tính hiển thị trong bảng — mỗi hàng có nhãn + hàm lấy giá trị từ sản phẩm.
// Tách thành mảng cấu hình để dễ thêm/bớt thuộc tính sau này mà không phải sửa JSX lặp lại.
const ROWS = [
  { label: "Danh mục", render: (p) => p.category || "—" },
  {
    label: "Giá",
    render: (p) =>
      p.discountPercent > 0 ? (
        <span className="compare-price">
          <strong className="compare-price__sale">{formatPrice(salePriceOf(p))}</strong>
          <span className="compare-price__old">{formatPrice(p.price)}</span>
        </span>
      ) : (
        <strong className="compare-price__now">{formatPrice(p.price)}</strong>
      ),
  },
  {
    label: "Đánh giá",
    render: (p) =>
      p.reviewCount > 0 ? `★ ${p.averageRating.toFixed(1)} (${p.reviewCount} đánh giá)` : "Chưa có đánh giá",
  },
  {
    label: "Tình trạng",
    render: (p) =>
      p.stock === 0 ? (
        <span className="compare-stock compare-stock--out">Hết hàng</span>
      ) : (
        <span className="compare-stock compare-stock--in">Còn hàng</span>
      ),
  },
  { label: "Mô tả", render: (p) => p.description || "—" },
];

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars

  if (compareList.length === 0) {
    return (
      <div className="compare-page">
        <div className="section-inner">
          <div className="compare-empty">
            <svg className="compare-empty__svg" viewBox="0 0 48 48" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M24 8v32M14 40h20" />
              <path d="M10 14h28" />
              <path d="M10 14l-6 14a6 6 0 0 0 12 0l-6-14zM38 14l-6 14a6 6 0 0 0 12 0l-6-14z" />
            </svg>
            <h2>Chưa có sản phẩm nào để so sánh</h2>
            <p>Bấm biểu tượng cán cân trên sản phẩm bạn quan tâm để thêm vào đây.</p>
            <Link to="/products" className="btn-dark">Khám phá sản phẩm →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="compare-header">
        <div className="section-inner">
          <span className="eyebrow">So sánh</span>
          <h1>So sánh sản phẩm</h1>
          <p>Đặt cạnh nhau để dễ dàng chọn ra sản phẩm phù hợp nhất.</p>
        </div>
      </div>

      <div className="section-inner compare-body">
        <div className="compare-toolbar">
          <span className="compare-toolbar__count">{compareList.length} sản phẩm đang so sánh</span>
          <button type="button" className="compare-clear-all" onClick={clearCompare}>Xoá tất cả</button>
        </div>

        <Reveal as="div" className="compare-table-wrap">
          <table className="compare-table" data-count={compareList.length}>
            <thead>
              <tr>
                <th className="compare-table__label-col" scope="col"><span className="compare-table__corner">Sản phẩm</span></th>
                {compareList.map((p) => (
                  <th key={p.id} scope="col">
                    <div className="compare-product-head">
                      <button
                        type="button"
                        className="compare-product-remove"
                        onClick={() => removeFromCompare(p.id)}
                        aria-label={`Bỏ ${p.name} khỏi so sánh`}
                        title="Bỏ khỏi so sánh"
                      >
                        ✕
                      </button>
                      <Link to={`/products/${p.id}`} className="compare-product-img">
                        {p.image ? (
                          <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
                        ) : (
                          <span className="compare-product-img__ph">🪑</span>
                        )}
                      </Link>
                      <Link to={`/products/${p.id}`} className="compare-product-name">{p.name}</Link>
                      <button
                        type="button"
                        className="compare-product-add-btn"
                        onClick={() => addToCart({ ...p, price: p.discountPercent > 0 ? salePriceOf(p) : p.price }, 1)}
                        disabled={p.stock === 0}
                      >
                        {p.stock === 0 ? "Hết hàng" : "+ Thêm vào giỏ"}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="compare-table__label-col compare-table__row-label">{row.label}</th>
                  {compareList.map((p) => (
                    <td key={p.id}>{row.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <div className="compare-more">
          <Link to="/products" className="btn-outline">← Tiếp tục khám phá sản phẩm</Link>
        </div>
      </div>
    </div>
  );
};

export default Compare;