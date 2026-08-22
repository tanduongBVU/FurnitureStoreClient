import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CompareContext = createContext(null);
const STORAGE_KEY = "luxwood_compare";
const MAX_COMPARE = 4;

// Mỗi tài khoản có danh sách so sánh riêng — khách chưa đăng nhập dùng key "guest"
// (giống hệt cơ chế của CartContext/WishlistContext)
const getStorageKey = (userId) => (userId ? `${STORAGE_KEY}_user_${userId}` : `${STORAGE_KEY}_guest`);

const loadCompare = (userId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CompareProvider = ({ children }) => {
  const { user } = useAuth();
  const [compareList, setCompareList] = useState(() => loadCompare(user?.id));

  // Đổi tài khoản (đăng nhập/đăng xuất/đổi acc) → nạp lại đúng danh sách của tài khoản đó
  useEffect(() => {
    setCompareList(loadCompare(user?.id));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user?.id), JSON.stringify(compareList));
  }, [compareList, user?.id]);

  const isInCompare = (id) => compareList.some((item) => item.id === id);

  // Trả về "full" nếu đã đạt giới hạn và sản phẩm này chưa có trong danh sách —
  // để nút bấm ở FE có thể báo cho khách biết vì sao không thêm được, thay vì im lặng bỏ qua.
  const toggleCompare = (product) => {
    let result = "added";
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        result = "removed";
        return prev.filter((item) => item.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) {
        result = "full";
        return prev;
      }
      // Chỉ lưu field cần cho bảng so sánh, không lưu nguyên object (tránh dữ liệu
      // cũ/lệch nếu sản phẩm đổi giá/tên sau này) — giống nguyên tắc của Wishlist.
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          discountPercent: product.discountPercent || 0,
          stock: product.stock,
          description: product.description || "",
          averageRating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
        },
      ];
    });
    return result;
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const totalItems = compareList.length;
  const isFull = totalItems >= MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{
        compareList,
        isInCompare,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        totalItems,
        isFull,
        maxCompare: MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare phải được dùng bên trong CompareProvider");
  return ctx;
};