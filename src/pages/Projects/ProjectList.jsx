import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./ProjectList.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/Projects")
      .then((res) => setProjects(res.data))
      .catch(() => setError("Không thể tải danh sách dự án. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="project-list-page">
      <div className="project-list-hero">
        <div className="section-inner">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Dịch vụ</span>
          <h1>Dự Án Kiến Trúc</h1>
          <p>Những công trình LuxWood đã đồng hành cùng khách hàng</p>
        </div>
      </div>

      <div className="section-inner project-list-body">
        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải dự án...</p></div>
        ) : projects.length === 0 ? (
          <div className="empty-box">Hiện chưa có dự án nào được đăng. Quay lại sau nhé!</div>
        ) : (
          <div className="project-grid">
            {projects.map((p, idx) => (
              <Reveal as="div" key={p.id} delay={Math.min((idx % 6) * 80, 400)}>
                <Link to={`/projects/${p.id}`} className="project-card">
                  <div className="project-card__img">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title} onError={(e) => (e.target.style.display = "none")} />
                    ) : (
                      <span className="project-card__placeholder">🏛️</span>
                    )}
                    {p.category && <span className="project-card__tag">{p.category}</span>}
                  </div>
                  <div className="project-card__body">
                    <h3>{p.title}</h3>
                    <div className="project-card__meta">
                      {p.location && <span>📍 {p.location}</span>}
                      {p.year && <span>📅 {p.year}</span>}
                    </div>
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

export default ProjectList;