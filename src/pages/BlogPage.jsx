import { BookOpen, ArrowLeft, Calendar } from "lucide-react";

const COLORS = {
  primaryRed: "#E31E24",
  primaryBlue: "#123E85",
  darkText: "#1a1a2e",
  lightPink: "#FED9D9",
};

export default function BlogPage({ posts = [], loading, onBack, onPostDetail }) {
  return (
    <div style={{ padding: "24px 20px 60px", animation: "fadeIn 0.3s ease" }}>
      {/* Başlık */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.darkText, margin: "0 0 4px" }}>Blog & Bilgi</h2>
        <p style={{ color: "#666", fontSize: 14 }}>Evcil dostlarınız için faydalı bilgiler</p>
        <div style={{ width: 60, height: 3, background: COLORS.primaryRed, borderRadius: 2, marginTop: 8 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#666" }}>Henüz yazı yok</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}>
          {posts.map((post, i) => (
            <div
              key={post.id}
              onClick={() => onPostDetail(post)}
              style={{
                background: "#fff", borderRadius: 12, overflow: "hidden",
                border: "2px solid #f0f0f0",
                cursor: "pointer", transition: "all 0.25s",
                animation: `fadeIn 0.4s ease ${i * 0.06}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.primaryBlue;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(18,62,133,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#f0f0f0";
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {post.image && (
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    onError={e => { e.target.parentElement.style.display = "none"; }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  />
                </div>
              )}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {post.category && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: COLORS.primaryRed,
                      background: COLORS.lightPink, padding: "3px 10px", borderRadius: 4,
                    }}>
                      {post.category}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} />
                    {new Date(post.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.darkText, margin: "0 0 6px", lineHeight: 1.3 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, margin: 0 }}>
                  {post.summary}
                </p>
                <span style={{
                  display: "inline-block", marginTop: 10,
                  fontSize: 13, fontWeight: 700, color: COLORS.primaryRed,
                }}>
                  Devamını Oku →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogDetail({ post, onBack }) {
  if (!post) return null;
  return (
    <div style={{ padding: "24px 20px 60px", animation: "fadeIn 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
      <button onClick={onBack} style={{
        background: "#f5f5f5", border: "none", borderRadius: 8,
        padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, color: "#555", marginBottom: 20,
        transition: "background 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#eee"}
        onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}
      >
        <ArrowLeft size={16} /> Geri Dön
      </button>

      {post.image && (
        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, height: 280 }}>
          <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        {post.category && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: COLORS.primaryRed,
            background: COLORS.lightPink, padding: "4px 12px", borderRadius: 4,
          }}>
            {post.category}
          </span>
        )}
        <span style={{ fontSize: 12, color: "#999" }}>
          {new Date(post.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
        </span>
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 900, color: COLORS.darkText, margin: "0 0 20px", lineHeight: 1.3 }}>
        {post.title}
      </h2>

      <div style={{
        background: "#fff", borderRadius: 12, padding: 28,
        border: "1px solid #eee",
      }}>
        <div style={{ fontSize: 15, color: "#333", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
          {post.content}
        </div>
      </div>
    </div>
  );
}
