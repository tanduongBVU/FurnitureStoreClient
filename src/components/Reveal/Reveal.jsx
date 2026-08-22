import { useReveal } from "../../hooks/useReveal";
import "./Reveal.css";

// Bọc quanh bất kỳ nội dung nào để tự thêm hiệu ứng fade + trượt khi cuộn tới.
//
// Cách dùng:
//   <Reveal><h2>Tiêu đề</h2></Reveal>
//   <Reveal direction="left" delay={150}><div className="card">...</div></Reveal>
//   <Reveal as="section" className="products-grid">...</Reveal>
//
// Props:
//   direction: "up" (mặc định) | "down" | "left" | "right" | "fade"
//   delay: số mili-giây trễ trước khi chạy hiệu ứng (dùng để so le nhiều phần tử)
//   as: thẻ HTML render ra (mặc định "div")
const Reveal = ({ children, as: Tag = "div", delay = 0, direction = "up", className = "", style, ...rest }) => {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${direction} ${visible ? "reveal--visible" : ""} ${className}`}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;