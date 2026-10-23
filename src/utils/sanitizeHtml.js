import DOMPurify from "dompurify";

// Lọc HTML "Thông tin chi tiết" do Admin/Nhân viên soạn TRƯỚC KHI hiển thị cho khách.
// Nhân viên cũng soạn được nội dung này nên KHÔNG tin tuyệt đối: chặn script, onclick, iframe,
// javascript:... (chống chèn mã độc / XSS). Chỉ giữ lại những thẻ và thuộc tính cần cho
// chữ định dạng, danh sách, bảng, ảnh, link.

const ALLOWED_TAGS = [
  "p", "br", "hr", "span", "div",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
  "h1", "h2", "h3", "h4", "blockquote", "pre", "code",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
];
const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel", "class", "style", "colspan", "rowspan", "width", "height"];

// Chỉ cho phép đúng 2 thuộc tính style mà trình soạn thảo tạo ra (màu chữ, màu nền), với giá trị an toàn —
// chặn url(...), position:fixed... có thể dùng để phủ giả mạo lên trang.
const SAFE_STYLE_VALUE = /^[#a-zA-Z0-9(),.\s%-]+$/;
const SAFE_CLASS = /^ql-[\w-]+$/; // chỉ giữ class của Quill (căn lề, thụt lề...)

let hookInstalled = false;
const installHook = () => {
  if (hookInstalled) return;
  hookInstalled = true;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    // Link luôn mở tab mới, không để trang đích điều khiển trang của mình
    if (node.tagName === "A" && node.hasAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }

    if (node.hasAttribute("style")) {
      const kept = [];
      node.getAttribute("style").split(";").forEach((decl) => {
        const i = decl.indexOf(":");
        if (i < 0) return;
        const prop = decl.slice(0, i).trim().toLowerCase();
        const val = decl.slice(i + 1).trim();
        if ((prop === "color" || prop === "background-color") && SAFE_STYLE_VALUE.test(val)) {
          kept.push(`${prop}: ${val}`);
        }
      });
      if (kept.length) node.setAttribute("style", kept.join("; "));
      else node.removeAttribute("style");
    }

    if (node.hasAttribute("class")) {
      const classes = node.getAttribute("class").split(/\s+/).filter((c) => SAFE_CLASS.test(c));
      if (classes.length) node.setAttribute("class", classes.join(" "));
      else node.removeAttribute("class");
    }
  });
};

export const sanitizeRichHtml = (html) => {
  installHook();

  // Quill hay đổi khoảng trắng thành "&nbsp;" (không ngắt dòng) làm chữ chạy dài tràn khung —
  // đổi lại khoảng trắng thường, giữ nguyên đoạn trống <p>&nbsp;</p> thành <p><br></p>.
  const normalized = String(html || "")
    .replace(/<p>(\s|&nbsp;|\u00a0)*<\/p>/g, "<p><br></p>")
    .replace(/&nbsp;|\u00a0/g, " ");

  const clean = DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  // Bọc mỗi bảng trong khung cuộn ngang để bảng rộng không làm vỡ trang trên điện thoại
  return clean
    .replace(/<table/gi, '<div class="pd-table-wrap"><table')
    .replace(/<\/table>/gi, "</table></div>");
};