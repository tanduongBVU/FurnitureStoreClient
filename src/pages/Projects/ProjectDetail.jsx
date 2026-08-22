import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./ProjectList.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/Projects/${id}`)
      .then((res) => {
        setProject(res.data);
        setActiveImage(0);
      })
      .catch(() => setError("Không tìm thấy dự án này."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="project-list-page">
        <div className="loading-box"><div className="spinner" /><p>Đang tải...</p></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-list-page">
        <div className="section-inner">
          <div className="empty-box">
            ⚠️ {error || "Không tìm thấy dự án này."}
            <div style={{ marginTop: 16 }}>
              <Link to="/projects" className="btn-outline">← Quay lại danh sách</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Images lưu dạng chuỗi URL phân tách bằng dấu phẩy (xem Project.cs) — tách ra thành
  // mảng, lọc bỏ chuỗi rỗng (tránh dấu phẩy thừa ở đầu/cuối tạo ra phần tử rỗng).
  const gallery = (project.images || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  const displayImages = gallery.length > 0 ? gallery : project.coverImage ? [project.coverImage] : [];

  return (
    <div className="project-list-page">
      <div className="project-detail-hero">
        <div className="section-inner">
          <Link to="/projects" className="project-detail-back">← Quay lại danh sách</Link>
          <span className="eyebrow" style={{ color: "#c8a96e" }}>{project.category}</span>
          <h1>{project.title}</h1>
          <div className="project-detail-meta">
            {project.location && <span>📍 {project.location}</span>}
            {project.year && <span>📅 {project.year}</span>}
          </div>
        </div>
      </div>

      <div className="section-inner project-detail-body">
        {displayImages.length > 0 && (
          <Reveal as="div" className="project-gallery">
            <div className="project-gallery__main">
              <img src={displayImages[activeImage]} alt={project.title} onError={(e) => (e.target.style.display = "none")} />
            </div>
            {displayImages.length > 1 && (
              <div className="project-gallery__thumbs">
                {displayImages.map((url, i) => (
                  <button
                    key={i}
                    className={`project-gallery__thumb ${i === activeImage ? "project-gallery__thumb--active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={url} alt={`${project.title} ${i + 1}`} onError={(e) => (e.target.style.display = "none")} />
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        )}

        <Reveal as="div" className="project-detail-content" delay={100}>
          <p className="project-detail-summary">{project.shortDescription}</p>
          {project.content ? (
            <div className="project-detail-html" dangerouslySetInnerHTML={{ __html: project.content }} />
          ) : null}
        </Reveal>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/contact" className="btn-dark">Liên hệ tư vấn dự án tương tự →</Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;