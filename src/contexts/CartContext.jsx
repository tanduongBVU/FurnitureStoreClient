import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const STORAGE_KEY = "luxwood_cart";

// Mỗi tài khoản có giỏ hàng riêng — khách chưa đăng nhập dùng key "guest"
const getStorageKey = (userId) => (userId ? `${STORAGE_KEY}_user_${userId}` : `${STORAGE_KEY}_guest`);

const loadCart = (userId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => loadCart(user?.id));

  // Mỗi khi tài khoản đổi (đăng nhập / đăng xuất / đăng ký tài khoản mới)
  // => nạp lại đúng giỏ hàng của tài khoản đó, không dùng chung nữa
  useEffect(() => {
    setCart(loadCart(user?.id));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(user?.id), JSON.stringify(cart));
  }, [cart, user?.id]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
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
