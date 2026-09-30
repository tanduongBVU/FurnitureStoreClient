import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./ServiceList.css";

// Nội dung dán từ nguồn khác (Gemini, Google Docs, web...) vào trình soạn thảo thường bị
// Quill đổi khoảng trắng thành "&nbsp;" (khoảng trắng KHÔNG ngắt dòng) — trình duyệt không
// tìm được chỗ xuống dòng nên chữ chạy dài tràn ra khỏi khung. Đổi lại thành khoảng trắng
// thường TRƯỚC khi hiển thị. Riêng đoạn trống kiểu <p>&nbsp;</p> (Admin cố ý để tạo dòng
// trắng) đổi thành <p><br></p> để vẫn giữ nguyên khoảng cách, không bị xẹp mất.
const cleanContentHtml = (html) =>
  (html || "")
    .replace(/<p>(\s|&nbsp;|\u00a0)*<\/p>/g, "<p><br></p>")
    .replace(/&nbsp;|\u00a0/g, " ");

const ServiceDetail = () => {
  const { type, id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/Services/${id}`)
      .then((res) => setService(res.data))
      .catch(() => setError("Không tìm thấy dịch vụ này."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="service-list-page">
        <div className="loading-box"><div className="spinner" /><p>Đang tải...</p></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-list-page">
        <div className="section-inner">
          <div className="empty-box">
            ⚠️ {error || "Không tìm thấy dịch vụ này."}
            <div style={{ marginTop: 16 }}>
              <Link to={`/services/${type}`} className="btn-outline">← Quay lại danh sách</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-list-page">
      <div className="service-detail-hero">
        {service.image ? (
          <img src={service.image} alt={service.title} className="service-detail-hero__img" />
        ) : null}
        <div className="service-detail-hero__overlay" />
        <div className="section-inner service-detail-hero__content">
          <Link to={`/services/${type}`} className="service-detail-back">← Quay lại danh sách</Link>
          <h1>{service.title}</h1>
        </div>
      </div>

      <div className="section-inner service-detail-body">
        <Reveal as="div" className="service-detail-content">
          <p className="service-detail-summary">{service.shortDescription}</p>
          {service.content ? (
            <div
              className="service-detail-html"
              dangerouslySetInnerHTML={{ __html: cleanContentHtml(service.content) }}
            />
          ) : (
            <p>Chưa có nội dung chi tiết cho dịch vụ này.</p>
          )}
        </Reveal>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/contact" className="btn-dark">Liên hệ tư vấn →</Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;