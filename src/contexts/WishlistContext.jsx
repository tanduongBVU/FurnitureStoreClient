import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);
const STORAGE_KEY = "luxwood_wishlist";

// Mỗi tài khoản có wishlist riêng — khách chưa đăng nhập dùng key "guest"
// (giống hệt cơ chế của CartContext, tránh lặp lại lỗi giỏ hàng dùng chung 1 key trước đây)
const getStorageKey = (userId) => (userId ? `${STORAGE_KEY}_user_${userId}` : `${STORAGE_KEY}_guest`);

const loadWishlist = (userId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => loadWishlist(user?.id));

  // Đổi tài khoản (đăng nhập/đăng xuất/đổi acc) → nạp lại đúng wishlist của tài khoản đó
  useEffect(() => {
    setWishlist(loadWishlist(user?.id));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user?.id), JSON.stringify(wishlist));
  }, [wishlist, user?.id]);

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      // Chỉ lưu những field cần thiết để hiển thị lại ở trang Wishlist,
      // không lưu nguyên object sản phẩm (tránh dữ liệu cũ/lệch nếu sản phẩm đổi sau này)
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        discountPercent: product.discountPercent || 0,
        stock: product.stock,
      }];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const clearWishlist = () => setWishlist([]);

  const totalItems = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist, totalItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist phải được dùng bên trong WishlistProvider");
  return ctx;
};