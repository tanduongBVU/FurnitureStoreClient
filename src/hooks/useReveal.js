import { useEffect, useRef, useState } from "react";

// Hook theo dõi khi 1 phần tử cuộn vào khung nhìn (dùng IntersectionObserver)
// để kích hoạt hiệu ứng fade/trượt. Chỉ kích hoạt 1 LẦN rồi ngừng theo dõi luôn
// (tránh hiệu ứng lặp lại gây rối mắt khi người dùng cuộn lên cuộn xuống).
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Trình duyệt quá cũ không hỗ trợ IntersectionObserver → hiện luôn, không lỗi
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, visible];
}