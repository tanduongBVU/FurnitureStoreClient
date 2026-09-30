import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./Blog.css";

// Nội dung dán từ nguồn khác (Gemini, Google Docs, web...) vào trình soạn thảo thường bị
// Quill đổi khoảng trắng thành "&nbsp;" (khoảng trắng KHÔNG ngắt dòng) — trình duyệt không
// tìm được chỗ xuống dòng nên chữ chạy dài tràn ra khỏi khung, gây thanh cuộn ngang cho cả
// trang. Đổi lại thành khoảng trắng thường TRƯỚC khi hiển thị. Riêng đoạn trống kiểu
// <p>&nbsp;</p> (Admin cố ý để tạo dòng trắng) đổi thành <p><br></p> để vẫn giữ nguyên
// khoảng cách, không bị xẹp mất.
const cleanContentHtml = (html) =>
  (html || "")
    .replace(/<p>(\s|&nbsp;|\u00a0)*<\/p>/g, "<p><br></p>")
    .replace(/&nbsp;|\u00a0/g, " ");

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/BlogPosts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setError("Không tìm thấy bài viết này."))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  if (loading) return (
    <div className="blog-page">
      <div className="loading-box"><div className="spinner" /><p>Đang tải bài viết...</p></div>
    </div>
  );

  if (error || !post) return (
    <div className="blog-page">
      <div className="section-inner">
        <div className="empty-box">
          ⚠️ {error || "Không tìm thấy bài viết."}
          <div style={{ marginTop: 16 }}>
            <Link to="/blog" className="btn-outline">← Quay lại Cẩm nang</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="blog-page">
      <Reveal as="div" className="section-inner blog-detail" direction="fade">
        <div className="blog-breadcrumb">
          <Link to="/blog">Cẩm nang</Link> <span>/</span> <span>{post.title}</span>
        </div>

        <span className="blog-detail-cat">{post.category}</span>
        <h1 className="blog-detail-title">{post.title}</h1>
        <div className="blog-detail-meta">
          <span>{post.author || "LuxWood"}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {post.thumbnail && (
          <div className="blog-detail-img">
            <img src={post.thumbnail} alt={post.title} onError={e => e.target.style.display = "none"} />
          </div>
        )}

        {/* Nội dung soạn từ rich text editor bên Admin (đã qua Authorize, chỉ Admin/Nhân viên
            mới tạo/sửa được) — không nhận nội dung này trực tiếp từ khách nên an toàn để render HTML.
            Vẫn dọn "&nbsp;" trước khi hiển thị để chữ xuống dòng đúng, không tràn khung. */}
        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: cleanContentHtml(post.content) }}
        />

        <div className="blog-detail-back">
          <Link to="/blog" className="btn-outline">← Quay lại Cẩm nang</Link>
        </div>
      </Reveal>
    </div>
  );
};

export default BlogDetail;