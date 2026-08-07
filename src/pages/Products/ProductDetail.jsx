import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    setQuantity(1);
    api.get(`/Products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError("Không tìm thấy sản phẩm này."))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  if (loading) return (
    <div className="pd-page">
      <div className="loading-box"><div className="spinner" /><p>Đang tải sản phẩm...</p></div>
    </div>
  );

  if (error || !product) return (
    <div className="pd-page">
      <div className="pd-empty">
        <p>⚠️ {error || "Không tìm thấy sản phẩm."}</p>
        <Link to="/products" className="btn-outline">← Quay lại danh sách sản phẩm</Link>
      </div>
    </div>
  );

  return (
    <div className="pd-page">
      <div className="section-inner">
        <div className="pd-breadcrumb">
          <Link to="/products">Sản phẩm</Link> <span>/</span> <span>{product.name}</span>
        </div>

        <div className="pd-layout">
          <div className="pd-image">
            {product.image
              ? <img src={product.image} alt={product.name} onError={e => e.target.style.display = "none"} />
              : <span className="pd-image-placeholder">🪑</span>
            }
            {product.isBestSeller && <span className="pd-tag">Bán chạy</span>}
          </div>

          <div className="pd-info">
            <span className="pd-cat">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="pd-price">{formatPrice(product.price)}</p>

            <p className="pd-desc">{product.description || "Chưa có mô tả cho sản phẩm này."}</p>

            <div className="pd-stock">
              {product.stock === 0
                ? <span className="pd-stock--out">Hết hàng</span>
                : product.stock <= 3
                  ? <span className="pd-stock--low">Chỉ còn {product.stock} sản phẩm</span>
                  : <span className="pd-stock--ok">Còn hàng ({product.stock} sản phẩm)</span>
              }
            </div>

            {product.stock > 0 && (
              <>
                <div className="pd-qty">
                  <span>Số lượng</span>
                  <div className="qty-control">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <input
                      type="number"
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={e => {
                        const v = Number(e.target.value);
                        if (v >= 1 && v <= product.stock) setQuantity(v);
                      }}
                    />
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                  </div>
                </div>

                <div className="pd-actions">
                  <button className="btn-outline" onClick={handleAddToCart}>
                    {added ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                  </button>
                  <button className="btn-primary-solid" onClick={handleBuyNow}>Mua ngay</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
