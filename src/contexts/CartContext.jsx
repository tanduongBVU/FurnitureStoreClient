import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const STORAGE_KEY = "luxwood_cart";

const getStorageKey = (userId) => (userId ? `${STORAGE_KEY}_user_${userId}` : `${STORAGE_KEY}_guest`);

const loadCart = (userId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    const parsed = saved ? JSON.parse(saved) : [];
    // Tương thích ngược: giỏ hàng lưu TRƯỚC KHI có tính năng biến thể chưa có field
    // cartKey — tự gán bằng đúng id sản phẩm, giữ nguyên hành vi cũ (không biến thể =
    // 1 dòng duy nhất cho mỗi sản phẩm, y hệt trước đây).
    return parsed.map(item => ({ ...item, cartKey: item.cartKey || String(item.id) }));
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => loadCart(user?.id));

  useEffect(() => {
    setCart(loadCart(user?.id));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user?.id), JSON.stringify(cart));
  }, [cart, user?.id]);

  // variant (tuỳ chọn): { id, name, price, stock } — nếu truyền vào, dòng giỏ hàng này
  // được coi là "sản phẩm + biến thể cụ thể", tách biệt hoàn toàn với biến thể khác
  // của CÙNG sản phẩm đó (VD: "Sofa - Da thật" và "Sofa - Vải nỉ" là 2 dòng riêng,
  // không gộp số lượng vào nhau) nhờ cartKey khác nhau.
  const addToCart = (product, quantity = 1, variant = null) => {
    const cartKey = variant ? `${product.id}-v${variant.id}` : String(product.id);
    const price = variant ? variant.price : product.price;
    const stock = variant ? variant.stock : product.stock;
    const displayName = variant ? `${product.name} - ${variant.name}` : product.name;

    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartKey,
          id: product.id,
          variantId: variant?.id ?? null,
          variantName: variant?.name ?? null,
          name: displayName,
          price,
          image: product.image,
          stock,
          quantity,
        },
      ];
    });
  };

  // Đổi sang dùng cartKey thay vì id — để xoá/sửa ĐÚNG DÒNG biến thể đang thao tác,
  // không lỡ đụng vào biến thể khác của cùng 1 sản phẩm.
  const removeFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => (item.cartKey === cartKey ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong CartProvider");
  return ctx;
};