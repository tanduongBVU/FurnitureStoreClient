import { useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import Reveal from "../../components/Reveal/Reveal";
import "./About.css";

// ── Data (các phần chưa đưa vào CMS — sửa trực tiếp ở đây khi cần) ──

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

// Lấy chữ cái đầu từ tên để hiển thị avatar khi chưa có ảnh thật
function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

// ── Component ─────────────────────────────────────────
export default function About() {
  const { get } = useSettings();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Đội ngũ lãnh đạo — nội dung lấy từ Admin → Giao diện, có fallback giữ nguyên giá trị cũ
  const team = [
    {
      image: get("aboutpage.team.member1.image", ""),
      name: get("aboutpage.team.member1.name", "Nguyễn Minh Khoa"),
      role: get("aboutpage.team.member1.role", "Giám đốc điều hành"),
      exp: get("aboutpage.team.member1.exp", "20 năm kinh nghiệm"),
    },
    {
      image: get("aboutpage.team.member2.image", ""),
      name: get("aboutpage.team.member2.name", "Trần Thị Lan Anh"),
      role: get("aboutpage.team.member2.role", "Giám đốc Thiết kế"),
      exp: get("aboutpage.team.member2.exp", "15 năm kinh nghiệm"),
    },
    {
      image: get("aboutpage.team.member3.image", ""),
      name: get("aboutpage.team.member3.name", "Lê Hoàng Phúc"),
      role: get("aboutpage.team.member3.role", "Trưởng xưởng sản xuất"),
      exp: get("aboutpage.team.member3.exp", "18 năm kinh nghiệm"),
    },
    {
      image: get("aboutpage.team.member4.image", ""),
      name: get("aboutpage.team.member4.name", "Phạm Thu Hà"),
      role: get("aboutpage.team.member4.role", "Trưởng phòng Kinh doanh"),
      exp: get("aboutpage.team.member4.exp", "12 năm kinh nghiệm"),
    },
  ];

  // Ảnh banner đầu trang và ảnh xưởng sản xuất giờ là 2 key riêng biệt
  const bannerImage = get("aboutpage.banner.image", "");
  const companyImage = get("aboutpage.company.image", "");
  // Ảnh minh hoạ cho mục "Vì sao chọn chúng tôi?" — đặt dưới đoạn mô tả bên cột trái,
  // trước đây khoảng trống này để trắng trơn khi cột phải (danh sách 4 lý do) dài hơn nhiều
  const whyUsImage = get("aboutpage.whyus.image", "");

  return (
    <div className="about-page">

      {/* ── BANNER (full-bleed, nội dung canh giữa) ── */}
      {/* Không bọc Reveal — đây là phần đầu trang, luôn hiện ngay khi vào trang,
          không cần chờ cuộn tới mới hiện. */}
      <section className="about-banner">
        <div className="about-banner-bg">
          {bannerImage ? (
            <img src={bannerImage} alt="Showroom LuxWood" className="about-banner-bg-img" />
          ) : (
            <div className="about-banner-bg-placeholder">
              <span style={{ fontSize: 72 }}>🏠</span>
              <p>Ảnh showroom</p>
            </div>
          )}
        </div>
        <div className="about-banner-overlay" />
        <div className="about-banner__content">
          <span className="eyebrow" style={{ color: "#c8a96e" }}>Về chúng tôi</span>
          <h1>
            {get("aboutpage.banner.title", "Nghệ thuật kiến tạo\nkhông gian sống")
              .split("\n")
              .map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
          </h1>
          <p>{get("aboutpage.banner.description", "Hơn 15 năm đồng hành cùng hàng nghìn gia đình Việt Nam trong hành trình tạo nên tổ ấm hoàn hảo.")}</p>
          <div className="about-banner__stats">
            <div className="banner-stat">
              <strong>{get("aboutpage.banner.stat1Number", "15+")}</strong>
              <span>{get("aboutpage.banner.stat1Label", "Năm kinh nghiệm")}</span>
            </div>
            <div className="banner-stat-divider" />
            <div className="banner-stat">
              <strong>{get("aboutpage.banner.stat2Number", "500+")}</strong>
              <span>{get("aboutpage.banner.stat2Label", "Sản phẩm")}</span>
            </div>
            <div className="banner-stat-divider" />
            <div className="banner-stat">
              <strong>{get("aboutpage.banner.stat3Number", "10.000+")}</strong>
              <span>{get("aboutpage.banner.stat3Label", "Khách hàng")}</span>
            </div>
            <div className="banner-stat-divider" />
            <div className="banner-stat">
              <strong>{get("aboutpage.banner.stat4Number", "200+")}</strong>
              <span>{get("aboutpage.banner.stat4Label", "Dự án lớn")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── GIỚI THIỆU CÔNG TY ── */}
      <section className="company-section">
        <div className="section-inner two-col">
          <Reveal as="div" className="company-img" direction="left">
            {companyImage ? (
              <img src={companyImage} alt="Xưởng sản xuất LuxWood" className="img-real tall" />
            ) : (
              <div className="img-placeholder tall">
                <span style={{ fontSize: 56 }}>🪵</span>
                <p>Ảnh xưởng sản xuất</p>
              </div>
            )}
            <div className="img-badge">
              <strong>{get("aboutpage.company.year", "2009")}</strong>
              <span>Năm thành lập</span>
            </div>
          </Reveal>
          <Reveal as="div" className="company-text" direction="right" delay={120}>
            <span className="eyebrow">Câu chuyện của chúng tôi</span>
            <h2>{get("aboutpage.company.title", "Từ xưởng mộc nhỏ đến thương hiệu nội thất hàng đầu")}</h2>
            <p>{get("aboutpage.company.paragraph1", "LuxWood được thành lập năm 2009 bởi nghệ nhân Nguyễn Minh Khoa với niềm đam mê về gỗ và khát vọng mang đến những sản phẩm nội thất chất lượng cao cho người Việt.")}</p>
            <p>{get("aboutpage.company.paragraph2", "Từ một xưởng mộc nhỏ tại Bình Dương với 5 thợ lành nghề, chúng tôi đã phát triển thành doanh nghiệp với hơn 200 nhân sự, showroom tại TP.HCM và Hà Nội, phục vụ hàng nghìn khách hàng trên toàn quốc.")}</p>
            <p>{get("aboutpage.company.paragraph3", "Mỗi sản phẩm LuxWood là sự kết hợp giữa kỹ thuật gia công hiện đại và tay nghề thủ công tinh xảo — tạo nên những tác phẩm vừa đẹp, vừa bền, vừa mang hơi thở tự nhiên.")}</p>
            <Link to="/products" className="btn-dark">Khám phá sản phẩm →</Link>
          </Reveal>
        </div>
      </section>

      {/* ── SỨ MỆNH - TẦM NHÌN ── */}
      <section className="mission-section">
        <div className="section-inner">
          <div className="mission-grid">
            <Reveal as="div" className="mission-card mission-card--dark" delay={0}>
              <span className="mission-icon">🎯</span>
              <h3>Sứ mệnh</h3>
              <p>Mang đến những sản phẩm nội thất gỗ tự nhiên chất lượng cao, giúp mỗi gia đình Việt Nam có được không gian sống đẹp, bền vững và đậm chất riêng.</p>
            </Reveal>
            <Reveal as="div" className="mission-card mission-card--gold" delay={100}>
              <span className="mission-icon">🔭</span>
              <h3>Tầm nhìn</h3>
              <p>Trở thành thương hiệu nội thất gỗ tự nhiên uy tín hàng đầu Đông Nam Á vào năm 2030, được khách hàng tin tưởng và lựa chọn vì chất lượng và giá trị bền vững.</p>
            </Reveal>
            <Reveal as="div" className="mission-card mission-card--light" delay={200}>
              <span className="mission-icon">💡</span>
              <h3>Triết lý</h3>
              <p>Chúng tôi tin rằng một ngôi nhà đẹp không chỉ đến từ thiết kế — mà từ những vật liệu chân thật, tự nhiên và câu chuyện đằng sau mỗi món đồ.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── GIÁ TRỊ CỐT LÕI ── */}
      <section className="values-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Nền tảng của chúng tôi</span>
            <h2>Giá trị cốt lõi</h2>
          </Reveal>
          <div className="values-grid">
            {values.map((v, i) => (
              <Reveal as="div" className="value-card" key={i} delay={Math.min(i * 80, 320)}>
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── VÌ SAO CHỌN CHÚNG TÔI ── */}
      <section className="whyus-section">
        <div className="section-inner two-col">
          <Reveal as="div" className="whyus-text" direction="left">
            <span className="eyebrow">Lợi thế của LuxWood</span>
            <h2>Vì sao chọn chúng tôi?</h2>
            <p>Chúng tôi không chỉ bán sản phẩm — chúng tôi cung cấp trải nghiệm hoàn chỉnh từ lúc bạn bước vào showroom đến khi đặt chiếc ghế cuối cùng vào nhà.</p>
            {whyUsImage ? (
              <img
                src={whyUsImage}
                alt="Vì sao chọn LuxWood"
                className="whyus-img"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="whyus-img-placeholder">
                <span style={{ fontSize: 48 }}>🏗️</span>
              </div>
            )}
          </Reveal>
          <div className="whyus-list">
            {whyUs.map((w, i) => (
              <Reveal as="div" className="whyus-item" key={i} direction="right" delay={Math.min(i * 90, 360)}>
                <span className="whyus-num">{w.num}</span>
                <div>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUY TRÌNH (dạng timeline/sơ đồ lịch trình — đường kẻ nối các mốc, zigzag
          trái-phải — thay cho lưới 6 card rời rạc trước đây) ── */}
      <section className="process-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Cách chúng tôi làm việc</span>
            <h2>Quy trình làm việc</h2>
          </Reveal>
          <div className="process-timeline">
            {steps.map((s, i) => (
              <Reveal
                as="div"
                className={`process-timeline-item ${i % 2 === 0 ? "process-timeline-item--left" : "process-timeline-item--right"}`}
                key={i}
                delay={Math.min(i * 90, 450)}
                direction={i % 2 === 0 ? "left" : "right"}
              >
                <div className="process-timeline-dot">{s.step}</div>
                <div className="process-timeline-card">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ĐỘI NGŨ ── */}
      <section className="team-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Con người LuxWood</span>
            <h2>Đội ngũ lãnh đạo</h2>
          </Reveal>
          <div className="team-grid">
            {team.map((t, i) => (
              <Reveal as="div" className="team-card" key={i} delay={Math.min(i * 80, 320)}>
                {t.image ? (
                  <img src={t.image} alt={t.name} className="team-avatar-real" />
                ) : (
                  <>
                    <div className="team-avatar">{getInitials(t.name)}</div>
                    <div className="team-img-placeholder">
                      <span style={{ fontSize: 40 }}>👤</span>
                    </div>
                  </>
                )}
                <h3>{t.name}</h3>
                <span className="team-role">{t.role}</span>
                <span className="team-exp">{t.exp}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DỰ ÁN TIÊU BIỂU ── */}
      <section className="projects-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Công trình nổi bật</span>
            <h2>Dự án tiêu biểu</h2>
          </Reveal>
          <div className="projects-grid">
            {projects.map((p, i) => {
              // Ảnh dự án lấy từ CMS (Admin → Giao diện Client → Trang Giới thiệu →
              // "Dự án tiêu biểu"). Key theo đúng thứ tự mảng `projects` phía trên
              // (project1..project6). Nếu Admin chưa nhập URL, giữ nguyên emoji
              // placeholder cũ như trước — không để trống trơn xấu xí.
              const projectImage = get(`aboutpage.project${i + 1}.image`, "");
              return (
                <Reveal as="div" className="project-card" key={i} delay={Math.min((i % 3) * 90, 270)}>
                  <div className="project-img-placeholder">
                    {projectImage ? (
                      <img
                        src={projectImage}
                        alt={p.name}
                        className="project-img-real"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <span style={{ fontSize: 40 }}>{p.icon}</span>
                    )}
                  </div>
                  <div className="project-info">
                    <span className="project-year">{p.year}</span>
                    <h3>{p.name}</h3>
                    <span className="project-type">{p.type}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <Reveal as="div" className="section-header">
            <span className="eyebrow" style={{ color: "#c8a96e" }}>Phản hồi thực tế</span>
            <h2 style={{ color: "#fff" }}>Khách hàng nói gì về chúng tôi</h2>
          </Reveal>
          <Reveal as="div" className="testimonial-box" delay={120}>
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
          </Reveal>
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
          <Reveal as="div" className="section-header">
            <span className="eyebrow">Hệ sinh thái LuxWood</span>
            <h2>Đối tác & Chứng nhận</h2>
          </Reveal>
          <div className="partners-grid">
            {partners.map((p, i) => (
              <Reveal as="div" className="partner-card" key={i} delay={Math.min(i * 60, 300)}>
                <span className="partner-icon">{p.icon}</span>
                <span className="partner-name">{p.name}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <Reveal as="div" className="section-inner" style={{ textAlign: "center" }}>
          <h2>Sẵn sàng tạo nên không gian sống trong mơ?</h2>
          <p>Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/products" className="btn-dark">Xem sản phẩm</Link>
            <a href="tel:0909123456" className="btn-outline-dark">Gọi ngay: 0909 123 456</a>
          </div>
        </Reveal>
      </section>

    </div>
  );
}