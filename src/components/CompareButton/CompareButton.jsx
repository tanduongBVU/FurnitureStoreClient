import { useCompare } from "../../contexts/CompareContext";

// Nút cân ⚖️ đặt ở góc ảnh sản phẩm, ngay bên trái nút tim (WishlistButton) — bấm để
// thêm/bỏ khỏi danh sách So sánh. Dùng e.preventDefault() + e.stopPropagation() vì phần lớn
// chỗ dùng nút này nằm bên trong 1 thẻ <Link> bao quanh cả card (bấm không được nhảy trang).
// top/right giống hệt tham số của WishlistButton để 2 nút dễ canh cạnh nhau; mặc định lệch
// sang trái 46px (32px width nút + 14px khoảng cách) để không đè lên nút tim.
const CompareButton = ({ product, top = 12, right = 54 }) => {
  const { isInCompare, toggleCompare, isFull } = useCompare();
  const active = isInCompare(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(product);
    if (result === "full") {
      alert("Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc. Hãy bỏ bớt sản phẩm khác trước.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Bỏ khỏi so sánh" : "Thêm vào so sánh"}
      title={active ? "Bỏ khỏi so sánh" : isFull ? "Đã đạt giới hạn 4 sản phẩm" : "Thêm vào so sánh"}
      style={{
        position: "absolute",
        top,
        right,
        zIndex: 3,
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.95)",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        lineHeight: 1,
        cursor: "pointer",
        color: active ? "#a8854a" : "#9a8b78",
        boxShadow: "0 2px 8px rgba(0,0,0,.15)",
        transition: "transform .15s ease, color .15s ease",
      }}
    >
      ⚖️
    </button>
  );
};

export default CompareButton;