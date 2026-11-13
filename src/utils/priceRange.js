// Giá hiển thị trong DANH SÁCH sản phẩm (thẻ sản phẩm, khuyến mãi, yêu thích, so sánh...).
//
// Sản phẩm CÓ biến thể: mỗi biến thể có giá riêng, nên hiện khoảng "giá nhỏ nhất – giá lớn nhất"
// (Backend trả displayPrice = giá nhỏ nhất, displayPriceMax = giá lớn nhất). Nếu mọi biến thể cùng giá
// thì hiện 1 giá. Sản phẩm KHÔNG có biến thể: hiện price như cũ. Giảm giá (discountPercent) áp cho từng đầu khoảng.
const fmt = (n) => Number(n).toLocaleString("vi-VN");

export const priceBounds = (p) => {
  const hasV = !!p.hasVariants && p.displayPrice != null;
  const min = hasV ? Number(p.displayPrice) : Number(p.price);
  const max = hasV && p.displayPriceMax != null ? Number(p.displayPriceMax) : min;
  return { min, max };
};

const rangeText = (min, max) => (min === max ? `${fmt(min)} ₫` : `${fmt(min)} – ${fmt(max)} ₫`);

// Giá gốc (chưa giảm)
export const originalPriceText = (p) => {
  const { min, max } = priceBounds(p);
  return rangeText(min, max);
};

// Giá sau giảm (làm tròn từng đầu khoảng tới đồng)
export const salePriceText = (p) => {
  const { min, max } = priceBounds(p);
  const f = (n) => Math.round(n * (1 - (p.discountPercent || 0) / 100));
  return rangeText(f(min), f(max));
};

// Sản phẩm có biến thể thì phải vào trang chi tiết để chọn chất liệu/màu — không thêm nhanh vào giỏ được
export const needsVariantChoice = (p) => !!p.hasVariants;