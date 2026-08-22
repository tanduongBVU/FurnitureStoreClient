import { useNavigate } from "react-router-dom";
import { useCompare } from "../../contexts/CompareContext";
import "./CompareBar.css";

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare, totalItems, maxCompare } = useCompare();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar__inner">
        <div className="compare-bar__thumbs">
          {compareList.map((p) => (
            <div className="compare-bar__thumb" key={p.id}>
              {p.image ? (
                <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
              ) : (
                <span>🪑</span>
              )}
              <button
                className="compare-bar__thumb-remove"
                onClick={() => removeFromCompare(p.id)}
                aria-label={`Bỏ ${p.name} khỏi so sánh`}
              >
                ✕
              </button>
            </div>
          ))}
          {/* Ô trống hiển thị chỗ còn lại, gợi ý khách có thể thêm tiếp bao nhiêu sản phẩm nữa */}
          {Array.from({ length: maxCompare - totalItems }).map((_, i) => (
            <div className="compare-bar__thumb compare-bar__thumb--empty" key={`empty-${i}`} />
          ))}
        </div>

        <div className="compare-bar__actions">
          <span className="compare-bar__count">{totalItems}/{maxCompare} sản phẩm</span>
          <button className="compare-bar__clear" onClick={clearCompare}>Xoá hết</button>
          <button
            className="compare-bar__cta"
            onClick={() => navigate("/compare")}
            disabled={totalItems < 2}
            title={totalItems < 2 ? "Chọn thêm ít nhất 2 sản phẩm để so sánh" : ""}
          >
            So sánh ngay →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;