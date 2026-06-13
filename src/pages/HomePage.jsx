import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Truck, Heart, Shield, Clock, BookOpen, MapPin, Navigation, Star, Zap, Gift, Tag } from "lucide-react";
import ProductCard from "../components/ProductCard";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Yunus+Emre+Mahallesi+Karadeniz+Caddesi+Hilal+Sitesi+No+11+B+Kocasinan+Kayseri";

const COLORS = {
  primaryRed: "#E31E24",
  primaryBlue: "#123E85",
  darkText: "#1a1a2e",
  green: "#2DC00F",
  lightPink: "#FED9D9",
};

// Hero slider verileri
const HERO_SLIDES = [
  {
    bg: "linear-gradient(135deg, #123E85 0%, #1a5cb5 100%)",
    title: "Evcil Dostlarınız İçin En İyisi",
    subtitle: "Kaliteli ürünler, uygun fiyatlar",
    btnText: "Alışverişe Başla",
    emoji: "🐾",
  },
  {
    bg: "linear-gradient(135deg, #E31E24 0%, #ff4757 100%)",
    title: "Yeni Sezon Ürünleri",
    subtitle: "En yeni mama ve aksesuar çeşitleri",
    btnText: "Keşfet",
    emoji: "🐱",
  },
  {
    bg: "linear-gradient(135deg, #2DC00F 0%, #10B981 100%)",
    title: "Ücretsiz Kargo Fırsatı",
    subtitle: "Mama hariç tüm ürünlerde 1.250₺ üzeri siparişlerde kargo bedava!",
    btnText: "Fırsatları Gör",
    emoji: "🚚",
  },
];

export default function HomePage({ onNavigate, onCategorySelect, onAddToCart, onProductDetail, products = [], categories = [], loading, blogPosts = [], favorites = [], onToggleFavorite }) {
  const rootCats = categories.filter(c => !c.parent_id);
  const kampanyaProducts = products.filter(p => p.badge === "Kampanya").slice(0, 8);
  const oneCikanProducts = products.filter(p => p.badge === "Öne Çıkan").slice(0, 8);
  const yeniProducts = products.filter(p => p.badge === "Yeni").slice(0, 8);
  const latestPosts = blogPosts.slice(0, 3);

  // Hero slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* ─── Hero Banner / Slider ─── */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: 0, height: 320,
        margin: 0,
      }}>
        {HERO_SLIDES.map((slide, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            background: slide.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: currentSlide === i ? 1 : 0,
            transition: "opacity 0.8s ease",
            padding: "40px 60px",
          }}>
            <div style={{ maxWidth: 600, textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>{slide.emoji}</div>
              <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
                {slide.subtitle}
              </p>
              <button
                onClick={() => onNavigate("shop")}
                style={{
                  background: "#fff", color: COLORS.primaryRed,
                  border: "none", borderRadius: 8,
                  padding: "14px 36px", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", transition: "transform 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}
              >
                {slide.btnText} <ChevronRight size={16} style={{ verticalAlign: "middle" }} />
              </button>
            </div>
          </div>
        ))}

        {/* Slider kontrolleri */}
        <button onClick={prevSlide} style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.3)", border: "none", borderRadius: "50%",
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(4px)", zIndex: 2,
        }}>
          <ChevronLeft size={20} color="#fff" />
        </button>
        <button onClick={nextSlide} style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.3)", border: "none", borderRadius: "50%",
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(4px)", zIndex: 2,
        }}>
          <ChevronRight size={20} color="#fff" />
        </button>

        {/* Slider dots */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 2 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{
              width: currentSlide === i ? 24 : 8, height: 8,
              borderRadius: 4, border: "none",
              background: currentSlide === i ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer", transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* ─── Ücretsiz Kargo Bilgilendirme Bandı ─── */}
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
        padding: "14px 20px",
        borderBottom: "1px solid #eee",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          flexWrap: "wrap", maxWidth: 1200, margin: "0 auto",
        }}>
          <Truck size={22} color="#fff" />
          <p style={{
            margin: 0, color: "#fff", fontSize: 14, fontWeight: 700,
            textAlign: "center",
          }}>
            Mama hariç tüm ürünlerde 1.250₺ üzeri siparişlerinizde <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 4 }}>KARGO ÜCRETSİZ!</span>
          </p>
          <Gift size={18} color="#fff" />
        </div>
      </div>

      {/* ─── Avantaj Bandı ─── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #eee",
        padding: "16px 20px",
      }}>
        <div style={{
          display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap",
        }}>
          {[
            { icon: <Gift size={20} color={COLORS.green} />, text: "Mama Hariç 1250₺ Üzeri Ücretsiz Kargo" },
            { icon: <Shield size={20} color={COLORS.primaryBlue} />, text: "Güvenli Alışveriş" },
            { icon: <Truck size={20} color={COLORS.primaryRed} />, text: "Hızlı Kargo" },
            { icon: <Clock size={20} color="#F59E0B" />, text: "7/24 Destek" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.icon}
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.darkText }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Kampanya Ürünleri ─── */}
      {kampanyaProducts.length > 0 && (
        <div style={{ padding: "16px 20px 24px", background: COLORS.lightPink }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.primaryRed, display: "flex", alignItems: "center", gap: 8 }}>
              <Tag size={22} color={COLORS.primaryRed} /> Kampanyalı Ürünler
            </h2>
            <button onClick={() => onNavigate("shop")} style={{
              background: COLORS.primaryRed, border: "none", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              padding: "8px 16px", borderRadius: 6,
            }}>
              Tümünü Gör <ChevronRight size={14} />
            </button>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}>
            {kampanyaProducts.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.06}s both` }}>
                <ProductCard product={p} categories={categories} onAdd={onAddToCart} onDetail={onProductDetail} isFavorite={favorites.includes(p.id)} onToggleFavorite={onToggleFavorite} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Öne Çıkan Ürünler ─── */}
      {oneCikanProducts.length > 0 && (
        <div style={{ padding: "24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={22} color={COLORS.primaryRed} /> Öne Çıkan Ürünler
            </h2>
            <button onClick={() => onNavigate("shop")} style={{
              background: "none", border: `1px solid ${COLORS.primaryRed}`, color: COLORS.primaryRed,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 14px", borderRadius: 6,
            }}>
              Tümünü Gör <ChevronRight size={14} />
            </button>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}>
            {oneCikanProducts.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.06}s both` }}>
                <ProductCard product={p} categories={categories} onAdd={onAddToCart} onDetail={onProductDetail} isFavorite={favorites.includes(p.id)} onToggleFavorite={onToggleFavorite} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Neden Vivora? ─── */}
      <div style={{
        background: COLORS.lightPink,
        padding: "40px 20px", margin: "0",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, textAlign: "center", marginBottom: 24 }}>
          Neden Vivora Petshop?
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16, maxWidth: 1200, margin: "0 auto",
        }}>
          {[
            { icon: <Shield size={28} color={COLORS.primaryBlue} />, title: "Güvenilir Ürünler", desc: "Tüm ürünlerimiz orijinal ve kalite kontrollüdür." },
            { icon: <Truck size={28} color={COLORS.primaryRed} />, title: "Hızlı Kargo", desc: "Siparişleriniz aynı gün kargoya verilir." },
            { icon: <Heart size={28} color="#EC4899" />, title: "Hayvan Sevgisi", desc: "Her ürünümüz dostlarınız düşünülerek seçilir." },
            { icon: <Clock size={28} color="#F59E0B" />, title: "7/24 Destek", desc: "WhatsApp üzerinden her zaman ulaşabilirsiniz." },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 12, padding: "24px 20px",
              textAlign: "center",
              border: "1px solid #f0f0f0",
              animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
            }}>
              <div style={{ marginBottom: 12 }}>{item.icon}</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.darkText, marginBottom: 6 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Yeni Ürünler ─── */}
      {yeniProducts.length > 0 && (
        <div style={{ padding: "32px 20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={22} color="#F59E0B" /> Yeni Ürünler
            </h2>
            <button onClick={() => onNavigate("shop")} style={{
              background: "none", border: `1px solid ${COLORS.primaryRed}`, color: COLORS.primaryRed,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 14px", borderRadius: 6,
            }}>
              Tümünü Gör <ChevronRight size={14} />
            </button>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}>
            {yeniProducts.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
                <ProductCard product={p} categories={categories} onAdd={onAddToCart} onDetail={onProductDetail} isFavorite={favorites.includes(p.id)} onToggleFavorite={onToggleFavorite} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Blog Bölümü ─── */}
      {latestPosts.length > 0 && (
        <div style={{ padding: "32px 20px 24px", background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={22} color={COLORS.primaryBlue} /> Blog & Bilgi
            </h2>
            <button onClick={() => onNavigate("blog")} style={{
              background: "none", border: `1px solid ${COLORS.primaryBlue}`, color: COLORS.primaryBlue,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 14px", borderRadius: 6,
            }}>
              Tümünü Gör <ChevronRight size={14} />
            </button>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {latestPosts.map((post, i) => (
              <div key={post.id} onClick={() => onNavigate("blog")} style={{
                background: "#fff", borderRadius: 12, overflow: "hidden",
                border: "2px solid #f0f0f0",
                cursor: "pointer", transition: "all 0.25s",
                animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
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
                  <div style={{ height: 160, overflow: "hidden" }}>
                    <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.parentElement.style.display = "none"; }} />
                  </div>
                )}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    {post.category && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: COLORS.primaryRed,
                        background: COLORS.lightPink, padding: "3px 8px", borderRadius: 4,
                      }}>{post.category}</span>
                    )}
                    <span style={{ fontSize: 10, color: "#999" }}>
                      {new Date(post.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.darkText, marginBottom: 6, lineHeight: 1.3 }}>{post.title}</p>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{post.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Konum ─── */}
      <div style={{ padding: "32px 20px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={22} color={COLORS.primaryRed} /> Mağazamız
        </h2>
        <div style={{
          background: "#fff", borderRadius: 12, overflow: "hidden",
          border: "2px solid #f0f0f0",
        }}>
          <div style={{ width: "100%", height: 250, background: "#E2E8F0" }}>
            <iframe
              title="Vivora Petshop Konum"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3108.5!2d35.51!3d38.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQzJzEyLjAiTiAzNcKwMzAnMzYuMCJF!5e0!3m2!1str!2str!4v1"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.darkText, marginBottom: 4 }}>Vivora Petshop</p>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                Yunus Emre Mahallesi, Karadeniz Caddesi,
                Hilal Sitesi No:11/B, Kocasinan / Kayseri
              </p>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: COLORS.primaryRed,
                color: "#fff", padding: "12px 24px", borderRadius: 8,
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}
            >
              <Navigation size={16} /> Yol Tarifi Al
            </a>
          </div>
        </div>
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#999", fontSize: 14 }}>
          Yükleniyor...
        </div>
      )}
    </div>
  );
}
