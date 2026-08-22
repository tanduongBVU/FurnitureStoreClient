import { useWishlist } from "../../contexts/WishlistContext";

// Nút trái tim đặt ở góc ảnh sản phẩm — bấm để thêm/bỏ khỏi Yêu thích.
// Dùng e.preventDefault() + e.stopPropagation() vì phần lớn chỗ dùng nút này
// nằm bên trong 1 thẻ <Link> bao quanh cả card (bấm tim không được nhảy sang trang chi tiết).
const WishlistButton = ({ product, top = 12, right = 12 }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      aria-label={active ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      title={active ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
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
        fontSize: 16,
        lineHeight: 1,
        cursor: "pointer",
        color: active ? "#e0245e" : "#9a8b78",
        boxShadow: "0 2px 8px rgba(0,0,0,.15)",
        transition: "transform .15s ease, color .15s ease",
      }}
    >
      {active ? "♥" : "♡"}
    </button>
  );
};

export default WishlistButton;