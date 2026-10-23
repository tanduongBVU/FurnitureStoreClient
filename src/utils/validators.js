// Bộ hàm kiểm tra dữ liệu nhập — dùng chung cho Client và Admin (copy file này vào src/utils/ của MỖI project).
// Mỗi hàm trả về MỘT "rule": (value, allValues) => chuỗi lỗi, hoặc "" nếu hợp lệ.
// Các rule định dạng (email, phone, url, số...) BỎ QUA giá trị rỗng — muốn bắt buộc nhập thì thêm required() đứng trước.

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

export const required = (msg = "Vui lòng không để trống.") => (v) => (isEmpty(v) ? msg : "");

export const email = (msg = "Email không hợp lệ (ví dụ: ten@gmail.com).") => (v) =>
  isEmpty(v) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? "" : msg;

// Số điện thoại di động Việt Nam: 10 số, đầu 03/05/07/08/09 (hoặc +84 / 84 thay cho số 0). Cho phép khoảng trắng, dấu chấm, gạch ngang.
export const phoneVN = (msg = "Số điện thoại không hợp lệ (10 số, ví dụ: 0912345678).") => (v) => {
  if (isEmpty(v)) return "";
  const cleaned = String(v).replace(/[\s.\-]/g, "");
  return /^(0|\+?84)(3|5|7|8|9)\d{8}$/.test(cleaned) ? "" : msg;
};

export const minLength = (n, msg) => (v) =>
  isEmpty(v) || String(v).trim().length >= n ? "" : msg || `Cần ít nhất ${n} ký tự.`;

export const maxLength = (n, msg) => (v) =>
  isEmpty(v) || String(v).length <= n ? "" : msg || `Tối đa ${n} ký tự.`;

export const number = (msg = "Vui lòng nhập một con số hợp lệ.") => (v) =>
  isEmpty(v) || Number.isFinite(Number(v)) ? "" : msg;

export const integer = (msg = "Vui lòng nhập số nguyên.") => (v) =>
  isEmpty(v) || Number.isInteger(Number(v)) ? "" : msg;

export const minValue = (n, msg) => (v) =>
  isEmpty(v) || Number(v) >= n ? "" : msg || `Giá trị phải từ ${n} trở lên.`;

export const maxValue = (n, msg) => (v) =>
  isEmpty(v) || Number(v) <= n ? "" : msg || `Giá trị không được vượt quá ${n}.`;

// Địa chỉ web bắt đầu bằng http:// hoặc https://
export const url = (msg = "Đường dẫn không hợp lệ (phải bắt đầu bằng http:// hoặc https://).") => (v) => {
  if (isEmpty(v)) return "";
  try {
    const u = new URL(String(v).trim());
    return u.protocol === "http:" || u.protocol === "https:" ? "" : msg;
  } catch {
    return msg;
  }
};

// Giá trị phải trùng với ô khác (VD: xác nhận mật khẩu): sameAs("password", "Mật khẩu xác nhận chưa khớp.")
export const sameAs = (otherField, msg = "Giá trị nhập lại chưa khớp.") => (v, all) =>
  v === all?.[otherField] ? "" : msg;

// Rule tự viết nhanh: custom((v, all) => điều kiện lỗi ? "thông báo" : "")
export const custom = (fn) => fn;