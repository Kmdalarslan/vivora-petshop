import { useState } from "react";
import { Star, Heart, Plus } from "lucide-react";

export default function ProductCard({ product, categories = [], onAdd, onDetail }) {
  const [liked, setLiked] = useState(false);
  const cat = categories.find((c) => c.id === product.category_id);

  const price = product.sell_price ?? product.price ?? 0;
  const oldPrice = product.old_price ?? product.oldPrice ?? null;
  const imgSrc = product.img;
  const isUrl = imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));

  return (
    <div
      onClick={() => onDetail(product)}
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid rgba(255,255,255,0.6)",
        transition: "transform 0.3s, box-shadow 0.3s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
      }}
    >
      {/* Badge */}
      {product.badge && (
        <span style={{
          position: "absolute", top: 12, left: 12, zIndex: 2,
          background:
            product.badge === "Premium"
              ? "linear-gradient(135deg,#F59E0B,#EF4444)"
              : product.badge === "Yeni"
              ? "linear-gradient(135deg,#10B981,#06B6D4)"
              : product.badge === "İndirim"
              ? "linear-gradient(135deg,#EF4444,#EC4899)"
              : "linear-gradient(135deg,#8B5CF6,#EC4899)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 8, letterSpacing: 0.5,
        }}>
          {product.badge}
        </span>
      )}

      {/* Favori butonu */}
      <button
        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          background: liked ? "#EF4444" : "rgba(255,255,255,0.8)",
          border: "none", borderRadius: "50%",
          width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(4px)", transition: "all 0.2s",
        }}
      >
        <Heart size={16} fill={liked ? "#fff" : "none"} color={liked ? "#fff" : "#999"} />
      </button>

      {/* Ürün resmi */}
      <div style={{
        height: 140,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#E0F7FA,#F0FDF4)",
        overflow: "hidden",
      }}>
        {isUrl ? (
          <img
            src={imgSrc}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <span style={{
          fontSize: 56,
          display: isUrl ? "none" : "flex",
          alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%",
        }}>
          {imgSrc || "📦"}
        </span>
      </div>

      {/* Ürün bilgileri */}
      <div style={{ padding: "14px 16px 16px" }}>
        {cat && (
          <p style={{
            fontSize: 11, color: "#0EA5E9", fontWeight: 600,
            marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            {cat.name}
          </p>
        )}

        <h3 style={{
          fontSize: 14, fontWeight: 700, color: "#1E293B",
          margin: 0, lineHeight: 1.3, minHeight: 36,
        }}>
          {product.name}
        </h3>

        {product.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "8px 0 6px" }}>
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{product.rating}</span>
            {product.reviews && (
              <span style={{ fontSize: 11, color: "#94A3B8" }}>({product.reviews})</span>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0EA5E9" }}>
              {price.toLocaleString("tr-TR")} ₺
            </span>
            {oldPrice && (
              <span style={{
                fontSize: 12, color: "#94A3B8",
                textDecoration: "line-through", marginLeft: 6,
              }}>
                {oldPrice.toLocaleString("tr-TR")} ₺
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            style={{
              background: "linear-gradient(135deg,#0EA5E9,#06B6D4)",
              color: "#fff", border: "none", borderRadius: 12,
              width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "")}
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
