import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./ChatWidget.css";

const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

let uid = 0;
const nextId = () => `m${++uid}`;

const initialMessages = () => [
  { id: nextId(), type: "bot-text", text: "Xin chào! Tôi là trợ lý ảo của LuxWood 👋" },
  { id: nextId(), type: "bot-text", text: "Tôi có thể giúp gì cho bạn?" },
];

// Số lượt trò chuyện gần nhất gửi kèm để AI hiểu ngữ cảnh (VD "còn màu khác không?")
const HISTORY_TURNS = 8;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false); // đang chờ AI trả lời
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, { id: nextId(), ...msg }]);

  // MỌI tin nhắn đều gửi cho AI (Gemini qua Backend). AI có sẵn dữ liệu thật của cửa hàng và TỰ QUYẾT
  // định khi nào kèm thẻ sản phẩm (chỉ khi khách đang tìm/hỏi về sản phẩm). Trước đây Client tự tìm sản phẩm
  // theo từ khoá cho mọi tin nhắn nên gõ "hi" hay "2" cũng ra sản phẩm (khớp nhầm "hiện đại", "2m"...).
  const askAI = async (text, history) => {
    setBusy(true);
    try {
      const res = await api.post("/Chat", { message: text, history });
      pushMessage({ type: "bot-text", text: res.data.reply });
      if (res.data.products?.length > 0) {
        pushMessage({ type: "bot-products", products: res.data.products });
      }
    } catch (err) {
      pushMessage({
        type: "bot-text",
        text: err.response?.data?.message || "Mình chưa trả lời được lúc này. Bạn thử lại sau hoặc xem sản phẩm / liên hệ để được hỗ trợ trực tiếp nhé.",
      });
      pushMessage({ type: "bot-link", label: "Xem tất cả sản phẩm →", to: "/products" });
    } finally {
      setBusy(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    // Lịch sử = các tin nhắn chữ TRƯỚC tin này (messages ở đây chưa gồm tin vừa gõ)
    const history = messages
      .filter((m) => m.type === "bot-text" || m.type === "user-text")
      .slice(-HISTORY_TURNS)
      .map((m) => ({ role: m.type === "user-text" ? "user" : "bot", text: m.text }));

    pushMessage({ type: "user-text", text });
    setInput("");
    askAI(text, history);
  };

  return (
    <div className="chatw">
      {open && (
        <div className="chatw-panel">
          <div className="chatw-header">
            <span>LuxWood</span>
            <button className="chatw-close" onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
          </div>

          <div className="chatw-body">
            {messages.map((m) => {
              if (m.type === "bot-text") {
                return <div className="chatw-bubble chatw-bubble--bot" key={m.id} style={{ whiteSpace: "pre-line" }}>{m.text}</div>;
              }
              if (m.type === "user-text") {
                return <div className="chatw-bubble chatw-bubble--user" key={m.id}>{m.text}</div>;
              }
              if (m.type === "bot-link") {
                return (
                  <Link to={m.to} className="chatw-link-btn" key={m.id} onClick={() => setOpen(false)}>
                    {m.label}
                  </Link>
                );
              }
              if (m.type === "bot-products") {
                return (
                  <div className="chatw-products" key={m.id}>
                    {m.products.map((p) => (
                      <Link
                        to={`/products/${p.id}`}
                        className="chatw-product-card"
                        key={p.id}
                        onClick={() => setOpen(false)}
                      >
                        <div className="chatw-product-img">
                          {p.image
                            ? <img src={p.image} alt={p.name} onError={(e) => (e.target.style.display = "none")} />
                            : <span>🪑</span>}
                        </div>
                        <div className="chatw-product-info">
                          <span className="chatw-product-name">{p.name}</span>
                          <span className="chatw-product-price">
                            {p.discountPercent > 0
                              ? formatPrice(Math.round(p.price * (1 - p.discountPercent / 100)))
                              : formatPrice(p.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              }
              return null;
            })}
            {busy && <div className="chatw-bubble chatw-bubble--bot">Đang trả lời...</div>}
            <div ref={bottomRef} />
          </div>

          <form className="chatw-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || busy} aria-label="Gửi">➤</button>
          </form>
        </div>
      )}

      <button className="chatw-bubble-btn" onClick={() => setOpen((o) => !o)} aria-label="Mở chat hỗ trợ">
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default ChatWidget;