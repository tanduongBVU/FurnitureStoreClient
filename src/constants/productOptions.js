// DANH SÁCH CHẤT LIỆU & MÀU SẮC — chỉnh ở ĐÂY là đủ, mọi form/bộ lọc trong project này tự cập nhật.
//
// Cách thêm: thêm giá trị mới vào CUỐI mảng (đừng đổi tên hay xoá giá trị đang có — sản phẩm cũ đã lưu
// đúng chữ đó, đổi tên sẽ làm chúng không còn khớp với ô chọn/bộ lọc). Phần tử ĐẦU TIÊN là giá trị
// mặc định khi thêm sản phẩm hoặc hàng biến thể mới.
//
// LƯU Ý: Admin và Client là 2 project riêng, mỗi project có 1 file này — khi thêm giá trị mới
// phải thêm ở CẢ HAI file để bộ lọc bên Client có đủ giá trị mà Admin cho chọn.
export const MATERIALS = ["Gỗ tự nhiên", "Gỗ công nghiệp", "Kim loại", "Vải nỉ", "Da/Da công nghiệp", "Mây tre đan", "Kính", "Gỗ PDF"];
export const COLORS = ["Nâu gỗ", "Trắng", "Đen", "Xám", "Be/Kem", "Xanh dương", "Xanh lá", "Vàng"];