import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./ChatWidget.css";

const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + " ₫";

// Nội dung FAQ tĩnh — CHỈNH LẠI cho đúng chính sách thật của LuxWood trước khi dùng thật,
// đây chỉ là nội dung mẫu để có sẵn khung sườn.
const FAQ = {
  "Chính sách đổi trả": "LuxWood hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng, với điều kiện sản phẩm còn nguyên vẹn, chưa qua sử dụng. Vui lòng liên hệ hotline hoặc trang Liên hệ để được hướng dẫn chi tiết.",
  "Vận chuyển & giao hàng": "Thời gian giao hàng dự kiến 3–7 ngày làm việc tuỳ khu vực. Nội thành giao nhanh trong 24–48h với các sản phẩm có sẵn.",
  "Phương thức thanh toán": "Hiện hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản ngân hàng. Thanh toán online qua VNPay/Momo sẽ sớm được cập nhật.",
  "Giờ làm việc": "LuxWood hỗ trợ khách hàng từ 8:00 – 21:00 tất cả các ngày trong tuần, kể cả cuối tuần và ngày lễ.",
};

// Các từ đệm/hư từ tiếng Việt phổ biến khi khách gõ nguyên câu thay vì từ khoá — loại bỏ
// trước khi thử tìm lại theo từng từ, để "tui muốn xem sofa" vẫn tìm ra "sofa".
// Mở rộng thêm nhóm từ đệm hay xuất hiện trong CÂU HỎI CHUNG (không phải tên sản phẩm) —
// trước đây thiếu nhóm này nên "hiện tại bên mình có bao nhiêu sản phẩm" còn sót lại từ
// "hiện" sau khi lọc, và "hiện" tình cờ khớp vào tên "Sofa da hiện đại ZP147" (sai bét).
const STOPWORDS = new Set([
  "tui", "tôi", "mình", "em", "shop", "cửa", "hàng",
  "muốn", "mún", "cần", "kiếm", "tìm", "xem", "hỏi", "coi",
  "các", "những", "loại", "mẫu", "sản", "phẩm",
  "cho", "về", "là", "có", "bán", "giúp", "với", "nhé", "ạ", "dùm", "giùm",
  "ơi", "hi", "hello", "chào",
  // Nhóm mở rộng — từ đệm/liên từ hay gặp trong câu hỏi chung, KHÔNG mang nghĩa sản phẩm
  "hiện", "tại", "bên", "đang", "bao", "nhiêu", "mấy", "vậy", "giờ", "rồi",
  "đó", "này", "đây", "sao", "thế", "nào", "được", "ra", "lại", "đã", "sẽ",
  "thật", "quá", "khá", "hơi", "rất", "luôn", "thôi", "à", "nha", "nhỉ",
]);

// Các mẫu câu hỏi rõ ràng là hỏi CHUNG (số lượng, khái niệm, chính sách...) chứ không phải
// đang tìm 1 sản phẩm cụ thể — gặp các mẫu này thì bỏ qua tìm kiếm sản phẩm luôn, chuyển
// thẳng sang hỏi AI (AI đã có dữ liệu thật để trả lời chính xác), tránh vòng dò từ khoá dễ
// trúng nhầm như đã gặp phải.
const GENERAL_QUESTION_PATTERNS = [
  /bao nhiêu/i,
  /có (bao nhiêu|mấy)/i,
  /là gì/i,
  /(như thế nào|thế nào)/i,
  /ở đâu/i,
  /khi nào/i,
  /tại sao|vì sao/i,
  /bao lâu/i,
];

// Câu càng dài (nhiều từ) càng có khả năng là câu hỏi/tư vấn thay vì tên sản phẩm đang gõ —
// khách tìm sản phẩm thường gõ ngắn gọn (VD: "sofa nỉ xám", "bàn ăn 6 ghế"). Vượt ngưỡng
// này thì bỏ qua bước dò-từng-từ-khoá (rủi ro trúng nhầm từ đệm cao hơn hẳn so với lợi ích).
const MAX_WORDS_FOR_KEYWORD_FALLBACK = 5;

const extractKeywords = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .sort((a, b) => b.length - a.length);

let uid = 0;
const nextId = () => `m${++uid}`;

const initialMessages = () => [
  { id: nextId(), type: "bot-text", text: "Xin chào! Tôi là trợ lý ảo của LuxWood 👋" },
  { id: nextId(), type: "bot-text", text: "Tôi có thể giúp gì cho bạn?" },
  { id: nextId(), type: "bot-quickreplies" },
];

const searchOnce = async (q) => {
  const res = await api.get(`/Products/search?q=${encodeURIComponent(q)}`);
  return res.data;
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false); // đang tìm sản phẩm HOẶC đang chờ AI trả lời
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, { id: nextId(), ...msg }]);

  const handleQuickReply = (key) => {
    if (key === "search") {
      pushMessage({ type: "user-text", text: "Tìm sản phẩm" });
      pushMessage({ type: "bot-text", text: "Bạn muốn tìm sản phẩm gì? Gõ tên hoặc danh mục vào ô bên dưới (VD: sofa, bàn ăn, phòng ngủ...)." });
    } else if (key === "orders") {
      pushMessage({ type: "user-text", text: "Tra cứu đơn hàng" });
      pushMessage({ type: "bot-text", text: "Bạn có thể xem lịch sử đơn hàng của mình tại đây. Nếu chưa đăng nhập, hệ thống sẽ yêu cầu đăng nhập trước." });
      pushMessage({ type: "bot-link", label: "Xem đơn hàng của tôi →", to: "/orders" });
    } else if (key === "faq") {
      pushMessage({ type: "user-text", text: "Câu hỏi thường gặp" });
      pushMessage({ type: "bot-text", text: "Bạn muốn hỏi về vấn đề nào?" });
      pushMessage({ type: "bot-faq-buttons" });
    }
  };

  const handleFaqClick = (question) => {
    pushMessage({ type: "user-text", text: question });
    pushMessage({ type: "bot-text", text: FAQ[question] });
  };

  // Gọi AI (Gemini qua Backend) — dùng khi tìm sản phẩm thật không ra kết quả, hoặc khi câu
  // hỏi rõ ràng là câu hỏi chung (xem GENERAL_QUESTION_PATTERNS) — để xử lý FAQ tự do, tư
  // vấn, số liệu chung... mà bộ FAQ tĩnh/tìm kiếm sản phẩm không phù hợp để trả lời.
  const askAI = async (query) => {
    try {
      const res = await api.post("/Chat", { message: query });
      pushMessage({ type: "bot-text", text: res.data.reply });
    } catch {
      pushMessage({
        type: "bot-text",
        text: "Mình chưa có câu trả lời phù hợp cho việc này. Bạn có thể xem sản phẩm hoặc liên hệ để được hỗ trợ trực tiếp nhé.",
      });
      pushMessage({ type: "bot-link", label: "Xem tất cả sản phẩm →", to: "/products" });
    }
  };

  // Thử tìm sản phẩm thật trước (nhanh, chính xác, miễn phí) — CHỈ khi câu hỏi không phải
  // dạng câu hỏi chung rõ ràng, và không quá dài (xem 2 hằng số ở trên). Nếu không ra kết
  // quả nào (kể cả sau khi tách từ khoá, khi đủ điều kiện thử) mới chuyển sang hỏi AI.
  const runProductSearch = async (query) => {
    setBusy(true);
    try {
      const looksLikeGeneralQuestion = GENERAL_QUESTION_PATTERNS.some((re) => re.test(query));
      const wordCount = query.trim().split(/\s+/).length;

      let results = looksLikeGeneralQuestion ? [] : await searchOnce(query);
      let matchedTerm = query;

      if (
        results.length === 0 &&
        !looksLikeGeneralQuestion &&
        wordCount <= MAX_WORDS_FOR_KEYWORD_FALLBACK
      ) {
        const keywords = extractKeywords(query);
        for (const kw of keywords) {
          results = await searchOnce(kw);
          if (results.length > 0) {
            matchedTerm = kw;
            break;
          }
        }
      }

      if (results.length > 0) {
        pushMessage({
          type: "bot-text",
          text: matchedTerm === query
            ? `Tìm thấy ${results.length} sản phẩm phù hợp:`
            : `Tìm thấy ${results.length} sản phẩm khớp với "${matchedTerm}":`,
        });
        pushMessage({ type: "bot-products", products: results });
        return;
      }

      // Không tìm ra sản phẩm nào khớp (hoặc là câu hỏi chung/quá dài ngay từ đầu) —
      // chuyển sang hỏi AI thay vì báo "không tìm thấy" cụt lủn hoặc trúng nhầm từ đệm.
      await askAI(query);
    } catch {
      pushMessage({ type: "bot-text", text: "Có lỗi xảy ra, vui lòng thử lại sau." });
    } finally {
      setBusy(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    pushMessage({ type: "user-text", text });
    setInput("");

    if (text.length < 2) {
      pushMessage({ type: "bot-text", text: "Bạn gõ rõ hơn giúp mình với (ít nhất 2 ký tự) nhé." });
      return;
    }
    runProductSearch(text);
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
                return <div className="chatw-bubble chatw-bubble--bot" key={m.id}>{m.text}</div>;
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
              if (m.type === "bot-quickreplies") {
                return (
                  <div className="chatw-quickreplies" key={m.id}>
                    <button onClick={() => handleQuickReply("search")}>🔍 Tìm sản phẩm</button>
                    <button onClick={() => handleQuickReply("orders")}>📦 Tra cứu đơn hàng</button>
                    <button onClick={() => handleQuickReply("faq")}>💬 Câu hỏi thường gặp</button>
                  </div>
                );
              }
              if (m.type === "bot-faq-buttons") {
                return (
                  <div className="chatw-quickreplies chatw-quickreplies--wrap" key={m.id}>
                    {Object.keys(FAQ).map((q) => (
                      <button key={q} onClick={() => handleFaqClick(q)}>{q}</button>
                    ))}
                  </div>
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
                              ? formatPrice(p.price * (1 - p.discountPercent / 100))
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
            {busy && <div className="chatw-bubble chatw-bubble--bot">Đang xử lý...</div>}
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