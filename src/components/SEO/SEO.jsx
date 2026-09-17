// Component dùng chung để đặt <title>/<meta> cho từng trang — React 19 tự động "hoist"
// (nhấc) các thẻ title/meta/link render bên trong bất kỳ component nào lên đúng
// <head> của trang, dù component đó nằm sâu bao nhiêu tầng. Không cần react-helmet
// hay bất kỳ thư viện ngoài nào (chỉ cần từ React 19 trở lên).
//
// Cách dùng: đặt <SEO ... /> ở đầu JSX của bất kỳ trang nào cần tuỳ chỉnh SEO/chia sẻ.
// Khi rời trang đó (unmount), React tự gỡ các thẻ này đi — không lo trang sau bị dính
// tiêu đề/mô tả của trang trước.
const SEO = ({ title, description, image, url, type = "website" }) => {
  const fullTitle = title ? `${title} — LuxWood` : "LuxWood — Nội thất cao cấp, tinh tế từng đường nét";

  // Cắt mô tả tối đa ~160 ký tự — đây là giới hạn hiển thị phổ biến của Google/Facebook,
  // mô tả dài hơn sẽ bị cắt xén xấu ở khung xem trước.
  const desc = description
    ? description.length > 160 ? description.slice(0, 157) + "..." : description
    : "LuxWood - Nội thất cao cấp, thiết kế tinh tế cho không gian sống của bạn.";

  const ogImage = image || "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80&auto=format&fit=crop";
  const ogUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Open Graph — dùng cho Facebook, Zalo, Messenger... */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="LuxWood" />

      {/* Twitter Card — 1 số nền tảng (kể cả vài trình nhúng link khác) đọc thẻ này
          thay vì Open Graph, thêm vào cho chắc, không tốn công thêm là bao. */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
};

export default SEO;