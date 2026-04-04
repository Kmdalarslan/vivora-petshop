import { useState } from "react";
import { Star, Plus, Minus, ArrowLeft, ShoppingCart, Truck, Shield, Award } from "lucide-react";

export default function ProductDetail({ product, categories = [], onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const cat = categories.find((c) => c.id === product.category_id);

  const price = product.sell_price ?? product.price ?? 0;
  const oldPrice = product.old_price ?? product.oldPrice ?? null;
  const imgSrc = product.img;
  const isUrl = imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));
  const desc = product.description ?? product.desc ?? "";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "28px 28px 0 0",
          width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto",
          animation: "slideUp 0.35s ease-out",
        }}
      >
        {/* Üst bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 2,
          display: "flex", justifyContent: "space-between",
          padding: "16px 20px 0", background: "#fff",
        }}>
          <button onClick={onClose} style={{
            background: "#F1F5F9", border: "none", borderRadius: 12,
            width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <ArrowLeft size={20} color="#475569" />
          </button>
          {cat && (
            <span style={{
              fontSize: 11, color: "#0EA5E9", fontWeight: 700,
              background: "#E0F2FE", padding: "6px 14px",
              borderRadius: 20, alignSelf: "center",
            }}>
              {cat.name}
            </span>
          )}
        </div>

        {/* Ürün resmi */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 200, background: "linear-gradient(180deg,#E0F7FA,transparent)",
          overflow: "hidden",
        }}>
          {isUrl ? (
            <img
              src={imgSrc}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 100 }}>{imgSrc || "📦"}</span>
          )}
        </div>

        {/* Detaylar */}
        <div style={{ padding: "0 24px 32px" }}>
          {product.badge && (
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
              color: "#fff", fontSize: 11, fontWeight: 700,
              padding: "4px 12px", borderRadius: 8, marginBottom: 8,
            }}>
              {product.badge}
            </span>
          )}

          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", margin: "8px 0" }}>
            {product.name}
          </h2>

          {product.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Star size={14} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontWeight: 700, color: "#1E293B" }}>{product.rating}</span>
              {product.reviews && (
                <span style={{ color: "#94A3B8", fontSize: 13 }}>({product.reviews} değerlendirme)</span>
              )}
            </div>
          )}

          {desc ? (
            <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              {desc}
            </p>
          ) : null}

          <p style={{
            fontSize: 13, fontWeight: 600,
            color: product.stock < 6 ? "#EF4444" : "#10B981",
          }}>
            {product.stock < 6 ? `Son ${product.stock} adet!` : "✓ Stokta var"}
          </p>

          {/* Adet seçimi */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "20px 0", padding: "16px 20px",
            background: "#F8FAFC", borderRadius: 16,
          }}>
            <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Adet:</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
              background: "#E2E8F0", border: "none", borderRadius: 10,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <Minus size={16} />
            </button>
            <span style={{ fontSize: 18, fontWeight: 800, minWidth: 30, textAlign: "center" }}>
              {qty}
            </span>
            <button onClick={() => setQty(qty + 1)} style={{
              background: "#E2E8F0", border: "none", borderRadius: 10,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <Plus size={16} />
            </button>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              {oldPrice && (
                <p style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through", margin: 0 }}>
                  {(oldPrice * qty).toLocaleString("tr-TR")} ₺
                </p>
              )}
              <p style={{ fontSize: 22, fontWeight: 800, color: "#0EA5E9", margin: 0 }}>
                {(price * qty).toLocaleString("tr-TR")} ₺
              </p>
            </div>
          </div>

          {/* Sepete ekle butonu */}
          <button
            onClick={() => { onAdd(product, qty); onClose(); }}
            style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg,#0EA5E9,#06B6D4)",
              color: "#fff", border: "none", borderRadius: 16,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <ShoppingCart size={20} /> Sepete Ekle
          </button>

          {/* Güvence ikonları */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
            {[
              ["Ücretsiz Kargo", <Truck size={16} key="t" />],
              ["Güvenli Ödeme", <Shield size={16} key="s" />],
              ["Kalite Garantisi", <Award size={16} key="a" />],
            ].map(([text, icon], i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "#64748B",
              }}>
                {icon}{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
