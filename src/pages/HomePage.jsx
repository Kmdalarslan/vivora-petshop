import { ChevronRight, Truck, Sparkles } from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function HomePage({ onNavigate, onCategorySelect, onAddToCart, onProductDetail, products = [], categories = [], loading }) {
  // Sadece ana kategoriler (parent_id yok)
  const rootCats = categories.filter(c => !c.parent_id);

  // Badge'li ürünler — öne çıkanlar
  const featured = products.filter(p => p.badge).slice(0, 4);

  // İlk kategorinin ürünleri (varsa)
  const firstCat = rootCats[0];
  const firstCatProducts = firstCat
    ? products.filter(p => p.category_id === firstCat.id).slice(0, 4)
    : [];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* ─── Hero Banner ─── */}
      <div style={{
        margin: "16px 16px 0", borderRadius: 24, padding: "32px 24px",
        background: "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 40%, #10B981 100%)",
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.15, transform: "rotate(15deg)" }}>🐠</div>
        <div style={{ position: "absolute", bottom: -10, left: -10, fontSize: 80, opacity: 0.1 }}>🐱</div>

        <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
          Vivora Petshop
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>
          Evcil Dostlarınız İçin En İyisi
        </h2>
        <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5, marginBottom: 20, maxWidth: 280 }}>
          Balıklar, kediler, köpekler ve daha fazlası — hepsi bir tık uzağınızda!
        </p>
        <button
          onClick={() => onNavigate("shop")}
          style={{
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
            color: "#fff", border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 14, padding: "12px 24px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          Alışverişe Başla <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── Kargo Bilgisi ─── */}
      <div style={{
        margin: "16px 16px 0", borderRadius: 14, padding: "12px 16px",
        background: "linear-gradient(90deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))",
        border: "1px solid rgba(16,185,129,0.2)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Truck size={18} color="#10B981" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>
          500₺ üzeri siparişlerde ücretsiz kargo!
        </span>
      </div>

      {/* ─── Kategoriler ─── */}
      {rootCats.length > 0 && (
        <div style={{ padding: "24px 16px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>Kategoriler</h2>
            <button
              onClick={() => onNavigate("shop")}
              style={{ background: "none", border: "none", color: "#0EA5E9", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}
            >
              Tümü <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {rootCats.map((cat, i) => {
              const count = products.filter(p => p.category_id === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  style={{
                    background: "rgba(255,255,255,0.9)", borderRadius: 18,
                    padding: "18px 12px", textAlign: "center", cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.25s",
                    animation: `fadeIn 0.4s ease ${i * 0.06}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,165,233,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginBottom: 2 }}>{cat.name}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{count} ürün</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Öne Çıkan Ürünler ─── */}
      {featured.length > 0 && (
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>Öne Çıkan Ürünler</h2>
            <button onClick={() => onNavigate("shop")} style={{ background: "none", border: "none", color: "#0EA5E9", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
              Tümü <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {featured.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.08}s both` }}>
                <ProductCard product={p} categories={categories} onAdd={onAddToCart} onDetail={onProductDetail} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Promo Banner ─── */}
      <div style={{
        margin: "16px", borderRadius: 20, padding: "24px",
        background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
        color: "#fff", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <Sparkles size={28} style={{ marginBottom: 8 }} />
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Yeni Üyelere %10 İndirim!</h3>
        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>Hemen üye olun, ilk siparişinize özel fırsatı yakalayın.</p>
        <button style={{
          background: "rgba(255,255,255,0.25)", backdropFilter: "blur(10px)",
          color: "#fff", border: "2px solid rgba(255,255,255,0.4)",
          borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          Üye Ol
        </button>
      </div>

      {/* ─── İlk Kategorinin Ürünleri ─── */}
      {firstCat && firstCatProducts.length > 0 && (
        <div style={{ padding: "8px 16px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>📦 {firstCat.name}</h2>
            <button onClick={() => onCategorySelect(firstCat.id)} style={{ background: "none", border: "none", color: "#0EA5E9", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
              Tümü <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {firstCatProducts.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.08}s both` }}>
                <ProductCard product={p} categories={categories} onAdd={onAddToCart} onDetail={onProductDetail} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>
          Yükleniyor...
        </div>
      )}
    </div>
  );
}
