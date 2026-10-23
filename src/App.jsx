import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./styles/global-effects.css";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CompareProvider } from "./contexts/CompareContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Products from "./pages/Products/Products";
import ProductDetail from "./pages/Products/ProductDetail";
import Sale from "./pages/Sale/Sale";
import Wishlist from "./pages/Wishlist/Wishlist";
import Compare from "./pages/Compare/Compare";
import Contact from "./pages/Contact/Contact";
import ServiceList from "./pages/Services/ServiceList";
import ServiceDetail from "./pages/Services/ServiceDetail";
import BlogList from "./pages/Blog/BlogList";
import BlogDetail from "./pages/Blog/BlogDetail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import MyOrders from "./pages/Orders/MyOrders";
import MyAccount from "./pages/Account/MyAccount";

// Mỗi lần ĐỔI TRANG (đường dẫn hoặc tham số tìm kiếm trên URL, VD ?category=...) thì cuộn về đầu trang.
// Dùng behavior "instant" để không bị hiệu ứng cuộn mượt (scroll-behavior: smooth) kéo dài làm khách
// thấy trang trượt từ cuối lên đầu.
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);
  return null;
};

const App = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <ScrollToTop />
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/sale" element={<Sale />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/services/:type" element={<ServiceList />} />
                  <Route path="/services/:type/:id" element={<ServiceDetail />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/account" element={<MyAccount />} />
                </Route>
              </Routes>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;