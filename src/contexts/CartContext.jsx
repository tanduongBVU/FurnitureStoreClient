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

  // ── COMBO ──────────────────────────────────────────────────────────────────────
  // Combo là 1 DÒNG RIÊNG trong giỏ (type: "bundle"), KHÔNG còn tách thành các dòng sản
  // phẩm lẻ như trước. Lý do: tách ra thì dòng sản phẩm lẻ trùng cartKey với sản phẩm khách
  // mua riêng sẽ bị GỘP vào nhau và mất/lẫn giá giảm của combo. Giữ nguyên là 1 dòng thì
  // giá combo (finalPrice từ server) luôn đi đúng đường; lúc đặt hàng Client chỉ gửi
  // bundleId + số lượng, server tự tính tiền.
  //
  // Trả về { ok, message } để nơi gọi báo lỗi cho khách khi combo hết hàng / vượt tồn kho.
  const addBundleToCart = (bundle, quantity = 1) => {
    if (!bundle.isAvailable) {
      const names = bundle.outOfStockItems?.length ? `: ${bundle.outOfStockItems.join(", ")}` : "";
      return { ok: false, message: `Combo tạm hết hàng${names}.` };
    }

    const cartKey = `bundle-${bundle.id}`;
    const max = bundle.maxQuantity ?? 0;
    const inCart = cart.find(item => item.cartKey === cartKey)?.quantity ?? 0;

    if (inCart + quantity > max) {
      return {
        ok: false,
        message: inCart > 0
          ? `Trong giỏ đã có ${inCart} combo, kho chỉ còn đủ cho ${max} combo.`
          : `Kho chỉ còn đủ cho ${max} combo.`,
      };
    }

    const fresh = {
      price: bundle.finalPrice,
      originalPrice: bundle.subtotal,
      discountPercent: bundle.discountPercent,
      stock: max,
      isAvailable: true,
      outOfStockItems: [],
      removed: false,
      items: (bundle.items || []).map(i => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
      })),
    };

    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, ...fresh, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartKey,
          type: "bundle",
          bundleId: bundle.id,
          name: bundle.name,
          image: bundle.image || bundle.items?.[0]?.productImage || "",
          quantity,
          ...fresh,
        },
      ];
    });

    return { ok: true };
  };

  // Đồng bộ các dòng combo trong giỏ với dữ liệu MỚI NHẤT từ GET /api/bundles (giá, tồn kho,
  // còn bán hay không). Giỏ hàng lưu ở localStorage nên có thể đã cũ — hàm này gọi khi mở
  // trang Giỏ hàng. Không có gì đổi thì trả lại đúng mảng cũ (không render lại, không lặp vô hạn).
  const syncBundleLines = (bundles) => {
    setCart(prev => {
      let changed = false;
      const next = prev.map(item => {
        if (item.type !== "bundle") return item;

        const b = bundles.find(x => x.id === item.bundleId);
        const merged = b
          ? {
              ...item,
              name: b.name,
              price: b.finalPrice,
              originalPrice: b.subtotal,
              discountPercent: b.discountPercent,
              stock: b.maxQuantity,
              isAvailable: b.isAvailable,
              outOfStockItems: b.outOfStockItems || [],
              removed: false,
              items: (b.items || []).map(i => ({
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
              })),
            }
          // Không còn trong danh sách combo đang bán (Admin đã ẩn/xoá)
          : { ...item, removed: true, isAvailable: false, stock: 0, outOfStockItems: [] };

        if (JSON.stringify(merged) !== JSON.stringify(item)) {
          changed = true;
          return merged;
        }
        return item;
      });
      return changed ? next : prev;
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

  // Id của MỌI sản phẩm đang có trong giỏ (kể cả sản phẩm nằm trong combo) — dùng cho gợi ý.
  const cartProductIds = [
    ...new Set(
      cart.flatMap(item =>
        item.type === "bundle" ? (item.items || []).map(i => i.productId) : [item.id]
      )
    ),
  ].filter(id => id != null);

  return (
    <CartContext.Provider value={{
      cart, addToCart, addBundleToCart, syncBundleLines,
      removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice, cartProductIds,
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