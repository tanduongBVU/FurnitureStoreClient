import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./ServiceList.css";

// Nhãn hiển thị + mô tả hero theo từng loại dịch vụ — component này dùng chung route
// /services/:type nên cần tra map để hiện đúng tiêu đề/mô tả theo type trên URL.
const TYPE_META = {
  "thi-cong": {
    title: "Dịch Vụ Thi Công",
    subtitle: "Đội ngũ thi công chuyên nghiệp, đảm bảo tiến độ và chất lượng công trình",
  },
  "thiet-ke": {
    title: "Dịch Vụ Thiết Kế",
    subtitle: "Tư vấn và thiết kế không gian sống theo phong cách riêng của bạn",
  },
};

const ServiceList = () => {
  const { type } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const meta = TYPE_META[type] || { title: "Dịch Vụ", subtitle: "" };

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/Services?type=${encodeURIComponent(type)}`)
      .then((res) => setServices(res.data))
      .catch(() => setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="service-list-page">
      <div className="service-list-hero">
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Dịch vụ</span>
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
      </div>

      <div className="section-inner service-list-body">
        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải dịch vụ...</p></div>
        ) : services.length === 0 ? (
          <div className="empty-box">Hiện chưa có dịch vụ nào trong mục này. Quay lại sau nhé!</div>
        ) : (
          <div className="service-grid">
            {services.map((s, idx) => (
              <Reveal as="div" key={s.id} delay={Math.min((idx % 6) * 80, 400)}>
                <Link to={`/services/${type}/${s.id}`} className="service-card">
                  <div className="service-card__img">
                    {s.image ? (
                      <img src={s.image} alt={s.title} onError={(e) => (e.target.style.display = "none")} />
                    ) : (
                      <span className="service-card__placeholder">🏗️</span>
                    )}
                  </div>
                  <div className="service-card__body">
                    <h3>{s.title}</h3>
                    <p>{s.shortDescription}</p>
                    <span className="service-card__more">Xem chi tiết →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;