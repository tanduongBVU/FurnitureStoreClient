import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Reveal from "../../components/Reveal/Reveal";
import "./Blog.css";

const CATEGORIES = ["Tất cả", "Mẹo trang trí", "Bảo quản gỗ", "Xu hướng nội thất", "Câu chuyện thương hiệu"];

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc category từ URL (?category=Mẹo trang trí) — cho phép link thẳng từ nơi khác
  const [category, setCategory] = useState(() => {
    const fromUrl = searchParams.get("category");
    return CATEGORIES.includes(fromUrl) ? fromUrl : "Tất cả";
  });

  useEffect(() => {
    api.get("/BlogPosts")
      .then(res => setPosts(res.data))
      .catch(() => setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    const next = CATEGORIES.includes(fromUrl) ? fromUrl : "Tất cả";
    setCategory(prev => (prev !== next ? next : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCategoryClick = (c) => {
    setCategory(c);
    if (c === "Tất cả") {
      searchParams.delete("category");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ category: c }, { replace: true });
    }
  };

  const filtered = posts.filter(p => category === "Tất cả" || p.category === category);
  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  // Bài đầu tiên của danh sách đang hiển thị được làm "bài nổi bật" (khổ lớn), các bài còn lại xếp lưới bên dưới
  const [featured, ...rest] = filtered;

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="section-inner">
          <span className="eyebrow">Cẩm nang LuxWood</span>
          <h1>Blog & Cẩm Nang Nội Thất</h1>
          <p>Mẹo hay, xu hướng và kiến thức chăm sóc nội thất từ đội ngũ LuxWood</p>
        </div>
      </div>

      <div className="section-inner blog-list-body">
        <div className="blog-category-tabs" role="tablist">
          {CATEGORIES.map(c => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              className={`blog-cat-tab ${category === c ? "blog-cat-tab--active" : ""}`}
              onClick={() => handleCategoryClick(c)}
            >{c}</button>
          ))}
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" /><p>Đang tải bài viết...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-box">Chưa có bài viết nào ở chủ đề này. Quay lại sau nhé!</div>
        ) : (
          <>
            {/* Bài nổi bật */}
            <Reveal as="div" key={featured.id}>
              <Link to={`/blog/${featured.id}`} className="blog-featured">
                <div className="blog-featured-img">
                  {featured.thumbnail
                    ? <img src={featured.thumbnail} alt={featured.title} onError={e => e.target.style.display = "none"} />
                    : <span className="blog-card-img-placeholder">📝</span>
                  }
                </div>
                <div className="blog-featured-body">
                  <span className="blog-card-cat">{featured.category}</span>
                  <h2>{featured.title}</h2>
                  <p className="blog-card-excerpt">{featured.excerpt}</p>
                  <div className="blog-card-meta">
                    <span>{featured.author || "LuxWood"}</span>
                    <span>•</span>
                    <span>{formatDate(featured.createdAt)}</span>
                  </div>
                  <span className="blog-readmore">Đọc bài viết <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            </Reveal>

            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map((post, idx) => (
                  <Reveal as="div" key={post.id} delay={Math.min((idx % 9) * 60, 400)}>
                  <Link to={`/blog/${post.id}`} className="blog-card">
                    <div className="blog-card-img">
                      {post.thumbnail
                        ? <img src={post.thumbnail} alt={post.title} onError={e => e.target.style.display = "none"} />
                        : <span className="blog-card-img-placeholder">📝</span>
                      }
                    </div>
                    <div className="blog-card-body">
                      <span className="blog-card-cat">{post.category}</span>
                      <h3>{post.title}</h3>
                      <p className="blog-card-excerpt">{post.excerpt}</p>
                      <div className="blog-card-meta">
                        <span>{post.author || "LuxWood"}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;