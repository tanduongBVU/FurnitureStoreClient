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
        <span style={{ display: "flex", flexDirection: "column" }}>
          <strong style={{ color: "#b91c1c" }}>{formatPrice(salePriceOf(p))}</strong>
          <span style={{ fontSize: 12, color: "#9a9186", textDecoration: "line-through" }}>
            {formatPrice(p.price)}
          </span>
        </span>
      ) : (
        <strong>{formatPrice(p.price)}</strong>
      ),
  },
  {
    label: "Đánh giá",
    render: (p) =>
      p.reviewCount > 0 ? `★ ${p.averageRating.toFixed(1)} (${p.reviewCount} đánh giá)` : "Chưa có đánh giá",
  },
  {
    label: "Tình trạng",
    render: (p) => (p.stock === 0 ? <span style={{ color: "#b91c1c" }}>Hết hàng</span> : "Còn hàng"),
  },
  { label: "Mô tả", render: (p) => p.description || "—" },
];

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (compareList.length === 0) {
    return (
      <div className="compare-page">
        <div className="section-inner">
          <div className="compare-empty">
            <span style={{ fontSize: 48 }}>⚖️</span>
            <h2>Chưa có sản phẩm nào để so sánh</h2>
            <p>Bấm biểu tượng ⚖️ trên sản phẩm bạn quan tâm để thêm vào đây.</p>
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
          <span className="eyebrow" style={{ color: "#c8a96e" }}>So sánh</span>
          <h1>So sánh sản phẩm</h1>
          <p>Đặt cạnh nhau để dễ dàng chọn ra sản phẩm phù hợp nhất.</p>
        </div>
      </div>

      <div className="section-inner compare-body">
        <div className="compare-toolbar">
          <button className="compare-clear-all" onClick={clearCompare}>Xoá tất cả</button>
        </div>

        <Reveal as="div" className="compare-table-wrap">
          <table className="compare-table" data-count={compareList.length}>
            <thead>
              <tr>
                <th className="compare-table__label-col">Sản phẩm</th>
                {compareList.map((p) => (
                  <th key={p.id}>
                    <div className="compare-product-head">
                      <button
                        className="compare-product-remove"
                        onClick={() => removeFromCompare(p.id)}
                        aria-label={`Bỏ ${p.name} khỏi so sánh`}
                      >
                        ✕
                      </button>
                      <Link to={`/products/${p.id}`} className="compare-product-img">
                        {p.image ? (
                          <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
                        ) : (
                          <span style={{ fontSize: 32 }}>🪑</span>
                        )}
                      </Link>
                      <Link to={`/products/${p.id}`} className="compare-product-name">{p.name}</Link>
                      <button
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
                  <td className="compare-table__label-col compare-table__row-label">{row.label}</td>
                  {compareList.map((p) => (
                    <td key={p.id}>{row.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/products" className="btn-outline">← Tiếp tục khám phá sản phẩm</Link>
        </div>
      </div>
    </div>
  );
};

export default Compare;