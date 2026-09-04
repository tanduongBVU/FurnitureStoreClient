// Component hiện sao đánh giá trung bình gọn trong card sản phẩm (Products/Sale/Home).
// Nhận avg (số thập phân, VD 4.3) và count (số lượng review đã duyệt).
const RatingStars = ({ avg = 0, count = 0, size = 13 }) => {
  const hasRating = count > 0;

  // Làm tròn về mốc .0 hoặc .5 gần nhất để vẽ sao (đầy / nửa / rỗng)
  const rounded = Math.round(avg * 2) / 2;

  const stars = Array.from({ length: 5 }, (_, i) => {
    const idx = i + 1;
    if (rounded >= idx) return "full";
    if (rounded >= idx - 0.5) return "half";
    return "empty";
  });

  return (
    <div
      className="rating-stars"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: size,
        // FIX: trước đây khi count === 0, component return null (không render gì cả),
        // khiến khối này MẤT HẲN khoảng trống layout — đẩy phần giá/nút "Thêm vào giỏ"
        // của card đó lên cao hơn hẳn so với card bên cạnh có đánh giá, gây lệch hàng
        // trong lưới sản phẩm. Giờ luôn render đúng cấu trúc DOM (giữ nguyên khoảng
        // trống), chỉ ẩn về mặt hình ảnh bằng visibility khi chưa có đánh giá nào —
        // không ai nhìn thấy sao rỗng vô nghĩa, nhưng layout luôn đồng nhất.
        visibility: hasRating ? "visible" : "hidden",
      }}
      title={hasRating ? `${avg.toFixed(1)} / 5 (${count} đánh giá)` : undefined}
    >
      <span style={{ display: "flex", lineHeight: 1 }}>
        {stars.map((type, i) => (
          <span
            key={i}
            style={{
              color: type === "empty" ? "#d8d0c2" : "#e0a63a",
              position: "relative",
              display: "inline-block",
              width: "1em",
            }}
          >
            {type === "half" ? (
              <>
                <span style={{ position: "absolute", inset: 0, overflow: "hidden", width: "50%", color: "#e0a63a" }}>★</span>
                <span style={{ color: "#d8d0c2" }}>★</span>
              </>
            ) : (
              "★"
            )}
          </span>
        ))}
      </span>
      <span style={{ color: "#9a9186", fontSize: size - 2 }}>({count})</span>
    </div>
  );
};

export default RatingStars;