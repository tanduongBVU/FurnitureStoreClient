import { useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";

// ── Data ──────────────────────────────────────────────

const values = [
  { icon: "🌿", title: "Tự nhiên", desc: "Chỉ sử dụng gỗ tự nhiên có chứng nhận FSC, thân thiện với môi trường." },
  { icon: "✦", title: "Tinh xảo", desc: "Từng chi tiết được gia công thủ công bởi nghệ nhân lành nghề trên 20 năm kinh nghiệm." },
  { icon: "🤝", title: "Tận tâm", desc: "Đồng hành cùng khách hàng từ tư vấn, thiết kế đến lắp đặt và bảo hành." },
  { icon: "♻️", title: "Bền vững", desc: "Cam kết phát triển bền vững, giảm thiểu lãng phí trong từng công đoạn sản xuất." },
];

const whyUs = [
  { num: "01", title: "Chất liệu nhập khẩu", desc: "Gỗ óc chó, gỗ sồi Mỹ và Châu Âu được kiểm định nghiêm ngặt trước khi đưa vào sản xuất." },
  { num: "02", title: "Bảo hành 5 năm", desc: "Cam kết bảo hành toàn bộ sản phẩm trong 5 năm, bảo trì miễn phí trọn đời." },
  { num: "03", title: "Thiết kế theo yêu cầu", desc: "Đội ngũ thiết kế riêng, sẵn sàng tùy chỉnh kích thước, màu sắc theo không gian của bạn." },
  { num: "04", title: "Giao hàng & lắp đặt", desc: "Miễn phí giao hàng nội thành, lắp đặt chuyên nghiệp tại nhà trong vòng 48 giờ." },
];

const steps = [
  { step: "01", title: "Tư vấn", desc: "Tiếp nhận yêu cầu, khảo sát không gian và tư vấn phương án phù hợp." },
  { step: "02", title: "Thiết kế", desc: "Đội ngũ thiết kế lên bản vẽ 3D, điều chỉnh theo ý kiến khách hàng." },
  { step: "03", title: "Sản xuất", desc: "Gia công tại xưởng với máy móc hiện đại kết hợp thủ công tinh xảo." },
  { step: "04", title: "Kiểm định", desc: "Kiểm tra chất lượng 100% sản phẩm trước khi xuất xưởng." },
  { step: "05", title: "Giao & Lắp đặt", desc: "Giao hàng đúng hẹn, lắp đặt hoàn thiện tại công trình." },
  { step: "06", title: "Bảo hành", desc: "Theo dõi, hỗ trợ và bảo hành dài hạn sau khi bàn giao." },
];

const team = [
  { name: "Nguyễn Minh Khoa", role: "Giám đốc điều hành", exp: "20 năm kinh nghiệm", avatar: "NMK" },
  { name: "Trần Thị Lan Anh", role: "Giám đốc Thiết kế", exp: "15 năm kinh nghiệm", avatar: "TLA" },
  { name: "Lê Hoàng Phúc", role: "Trưởng xưởng sản xuất", exp: "18 năm kinh nghiệm", avatar: "LHP" },
  { name: "Phạm Thu Hà", role: "Trưởng phòng Kinh doanh", exp: "12 năm kinh nghiệm", avatar: "PTH" },
];

const projects = [
  { name: "Biệt thự Vinhomes Grand Park", type: "Nội thất toàn bộ", year: "2024", icon: "🏡" },
  { name: "Khách sạn The Reverie Saigon", type: "Nội thất phòng Suite", year: "2023", icon: "🏨" },
  { name: "Văn phòng FPT Software HCM", type: "Nội thất văn phòng", year: "2023", icon: "🏢" },
  { name: "Nhà hàng Cham Charm", type: "Nội thất nhà hàng", year: "2022", icon: "🍽️" },
  { name: "Showroom Mercedes-Benz Q7", type: "Nội thất showroom", year: "2022", icon: "🚗" },
  { name: "Căn hộ Landmark 81 T42", type: "Nội thất căn hộ cao cấp", year: "2021", icon: "🏙️" },
];

const testimonials = [
  { name: "Chị Ngọc Hân", role: "Chủ căn hộ Vinhomes", text: "LuxWood đã biến căn hộ của tôi thành một không gian sống mơ ước. Chất lượng gỗ tuyệt vời, đội ngũ thi công chuyên nghiệp và đúng tiến độ.", rating: 5 },
  { name: "Anh Thanh Tùng", role: "Giám đốc khách sạn", text: "Hơn 200 phòng khách sạn được LuxWood hoàn thiện nội thất chỉ trong 3 tháng. Kết quả vượt mong đợi, khách hàng của chúng tôi rất hài lòng.", rating: 5 },
  { name: "Chị Bảo Châu", role: "Kiến trúc sư", text: "Tôi đã giới thiệu LuxWood cho rất nhiều khách hàng của mình. Chất lượng và dịch vụ luôn nhất quán, xứng đáng là đối tác tin cậy.", rating: 5 },
];

const partners = [
  { name: "Hafele", icon: "⚙️" },
  { name: "Blum", icon: "🔩" },
  { name: "Hettich", icon: "🛠️" },
  { name: "FSC Certified", icon: "🌲" },
  { name: "PEFC", icon: "♻️" },
  { name: "ISO 9001", icon: "✅" },
];

// ── Component ─────────────────────────────────────────
export default function About() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="about-page">

      {/* ── BANNER ── */}
      <section className="about-banner">
        <div className="about-banner__content">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Về chúng tôi</span>
          <h1>Nghệ thuật kiến tạo<br />không gian sống</h1>
          <p>Hơn 15 năm đồng hành cùng hàng nghìn gia đình Việt Nam trong hành trình tạo nên tổ ấm hoàn hảo.</p>
          <div className="about-banner__stats">
            <div className="banner-stat"><strong>15+</strong><span>Năm kinh nghiệm</span></div>
            <div className="banner-stat-divider" />
            <div className="banner-stat"><strong>500+</strong><span>Sản phẩm</span></div>
            <div className="banner-stat-divider" />
            <div className="banner-stat"><strong>10.000+</strong><span>Khách hàng</span></div>
            <div className="banner-stat-divider" />
            <div className="banner-stat"><strong>200+</strong><span>Dự án lớn</span></div>
          </div>
        </div>
        <div className="about-banner__img">
          <div className="banner-img-placeholder">
            <span style={{ fontSize: 72 }}>🏠</span>
            <p>Ảnh showroom</p>
          </div>
        </div>
      </section>

      {/* ── GIỚI THIỆU CÔNG TY ── */}
      <section className="company-section">
        <div className="section-inner two-col">
          <div className="company-img">
            <div className="img-placeholder tall">
              <span style={{ fontSize: 56 }}>🪵</span>
              <p>Ảnh xưởng sản xuất</p>
            </div>
            <div className="img-badge">
              <strong>2009</strong>
              <span>Năm thành lập</span>
            </div>
          </div>
          <div className="company-text">
            <span className="eyebrow">Câu chuyện của chúng tôi</span>
            <h2>Từ xưởng mộc nhỏ đến thương hiệu nội thất hàng đầu</h2>
            <p>LuxWood được thành lập năm 2009 bởi nghệ nhân Nguyễn Minh Khoa với niềm đam mê về gỗ và khát vọng mang đến những sản phẩm nội thất chất lượng cao cho người Việt.</p>
            <p>Từ một xưởng mộc nhỏ tại Bình Dương với 5 thợ lành nghề, chúng tôi đã phát triển thành doanh nghiệp với hơn 200 nhân sự, showroom tại TP.HCM và Hà Nội, phục vụ hàng nghìn khách hàng trên toàn quốc.</p>
            <p>Mỗi sản phẩm LuxWood là sự kết hợp giữa kỹ thuật gia công hiện đại và tay nghề thủ công tinh xảo — tạo nên những tác phẩm vừa đẹp, vừa bền, vừa mang hơi thở tự nhiên.</p>
            <Link to="/products" className="btn-dark">Khám phá sản phẩm →</Link>
          </div>
        </div>
      </section>

      {/* ── SỨ MỆNH - TẦM NHÌN ── */}
      <section className="mission-section">
        <div className="section-inner">
          <div className="mission-grid">
            <div className="mission-card mission-card--dark">
              <span className="mission-icon">🎯</span>
              <h3>Sứ mệnh</h3>
              <p>Mang đến những sản phẩm nội thất gỗ tự nhiên chất lượng cao, giúp mỗi gia đình Việt Nam có được không gian sống đẹp, bền vững và đậm chất riêng.</p>
            </div>
            <div className="mission-card mission-card--gold">
              <span className="mission-icon">🔭</span>
              <h3>Tầm nhìn</h3>
              <p>Trở thành thương hiệu nội thất gỗ tự nhiên uy tín hàng đầu Đông Nam Á vào năm 2030, được khách hàng tin tưởng và lựa chọn vì chất lượng và giá trị bền vững.</p>
            </div>
            <div className="mission-card mission-card--light">
              <span className="mission-icon">💡</span>
              <h3>Triết lý</h3>
              <p>Chúng tôi tin rằng một ngôi nhà đẹp không chỉ đến từ thiết kế — mà từ những vật liệu chân thật, tự nhiên và câu chuyện đằng sau mỗi món đồ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GIÁ TRỊ CỐT LÕI ── */}
      <section className="values-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Nền tảng của chúng tôi</span>
            <h2>Giá trị cốt lõi</h2>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VÌ SAO CHỌN CHÚNG TÔI ── */}
      <section className="whyus-section">
        <div className="section-inner two-col">
          <div className="whyus-text">
            <span className="eyebrow">Lợi thế của LuxWood</span>
            <h2>Vì sao chọn chúng tôi?</h2>
            <p>Chúng tôi không chỉ bán sản phẩm — chúng tôi cung cấp trải nghiệm hoàn chỉnh từ lúc bạn bước vào showroom đến khi đặt chiếc ghế cuối cùng vào nhà.</p>
          </div>
          <div className="whyus-list">
            {whyUs.map((w, i) => (
              <div className="whyus-item" key={i}>
                <span className="whyus-num">{w.num}</span>
                <div>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUY TRÌNH ── */}
      <section className="process-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Cách chúng tôi làm việc</span>
            <h2>Quy trình làm việc</h2>
          </div>
          <div className="process-grid">
            {steps.map((s, i) => (
              <div className="process-card" key={i}>
                <span className="process-step">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="process-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ĐỘI NGŨ ── */}
      <section className="team-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Con người LuxWood</span>
            <h2>Đội ngũ lãnh đạo</h2>
          </div>
          <div className="team-grid">
            {team.map((t, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar">{t.avatar}</div>
                <div className="team-img-placeholder">
                  <span style={{ fontSize: 40 }}>👤</span>
                </div>
                <h3>{t.name}</h3>
                <span className="team-role">{t.role}</span>
                <span className="team-exp">{t.exp}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DỰ ÁN TIÊU BIỂU ── */}
      <section className="projects-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Công trình nổi bật</span>
            <h2>Dự án tiêu biểu</h2>
          </div>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div className="project-card" key={i}>
                <div className="project-img-placeholder">
                  <span style={{ fontSize: 40 }}>{p.icon}</span>
                </div>
                <div className="project-info">
                  <span className="project-year">{p.year}</span>
                  <h3>{p.name}</h3>
                  <span className="project-type">{p.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow" style={{ color: "#c8a96e" }}>Phản hồi thực tế</span>
            <h2 style={{ color: "#fff" }}>Khách hàng nói gì về chúng tôi</h2>
          </div>
          <div className="testimonial-box">
            <div className="testimonial-stars">
              {"★".repeat(testimonials[activeTestimonial].rating)}
            </div>
            <blockquote>"{testimonials[activeTestimonial].text}"</blockquote>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                {testimonials[activeTestimonial].name.split(" ").pop()[0]}
              </div>
              <div>
                <strong>{testimonials[activeTestimonial].name}</strong>
                <span>{testimonials[activeTestimonial].role}</span>
              </div>
            </div>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`tdot ${i === activeTestimonial ? "tdot--active" : ""}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── ĐỐI TÁC ── */}
      <section className="partners-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Hệ sinh thái LuxWood</span>
            <h2>Đối tác & Chứng nhận</h2>
          </div>
          <div className="partners-grid">
            {partners.map((p, i) => (
              <div className="partner-card" key={i}>
                <span className="partner-icon">{p.icon}</span>
                <span className="partner-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <h2>Sẵn sàng tạo nên không gian sống trong mơ?</h2>
          <p>Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/products" className="btn-dark">Xem sản phẩm</Link>
            <a href="tel:0909123456" className="btn-outline-dark">Gọi ngay: 0909 123 456</a>
          </div>
        </div>
      </section>

    </div>
  );
}
