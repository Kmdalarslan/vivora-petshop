import { Star, Heart, ShoppingCart } from "lucide-react";

const COLORS = {
  primaryRed: "#E31E24",
  primaryBlue: "#123E85",
  darkText: "#1a1a2e",
  green: "#2DC00F",
  lightPink: "#FED9D9",
};

export default function ProductCard({ product, categories = [], onAdd, onDetail, isFavorite, onToggleFavorite }) {
  const cat = categories.find((c) => c.id === product.category_id);

  const price = product.sell_price ?? product.price ?? 0;
  const oldPrice = product.old_price ?? product.oldPrice ?? null;
  const imgSrc = product.image_url || product.img;
  const isUrl = imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));

  const discountPercent = oldPrice && oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null;

  return (
    <div
      onClick={() => onDetail(product)}
      style={{
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        border: "2px solid #f0f0f0",
        transition: "all 0.3s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.primaryRed;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(227,30,36,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#f0f0f0";
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* İndirim Badge */}
      {discountPercent && (
        <span style={{
          position: "absolute", top: 10, left: 10, zIndex: 2,
          background: COLORS.primaryRed,
          color: "#fff", fontSize: 12, fontWeight: 800,
          padding: "4px 8px", borderRadius: 4,
        }}>
          %{discountPercent}
        </span>
      )}

      {/* Badge */}
      {product.badge && !discountPercent && (
        <span style={{
          position: "absolute", top: 10, left: 10, zIndex: 2,
          background: product.badge === "Yeni" ? COLORS.green
            : product.badge === "Premium" ? COLORS.primaryBlue
            : COLORS.primaryRed,
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 4,
        }}>
          {product.badge}
        </span>
      )}

      {/* Favori butonu */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
        style={{
          position: "absolute", top: 10, right: 10, zIndex: 2,
          background: isFavorite ? COLORS.primaryRed : "#fff",
          border: isFavorite ? "none" : "1px solid #eee",
          borderRadius: "50%",
          width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Heart size={15} fill={isFavorite ? "#fff" : "none"} color={isFavorite ? "#fff" : "#999"} />
      </button>

      {/* Ürün resmi */}
      <div
        style={{
          height: 180,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#fafafa",
          overflow: "hidden",
          padding: 16,
          position: "relative",
        }}
      >
        {isUrl ? (
          <img
            src={imgSrc}
            alt={product.name}
            style={{
              maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
              transition: "transform 0.3s ease",
            }}
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
            fontSize: 11, color: COLORS.primaryBlue, fontWeight: 600,
            marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            {cat.name}
          </p>
        )}

        <h3 style={{
          fontSize: 14, fontWeight: 600, color: COLORS.darkText,
          margin: 0, lineHeight: 1.3, minHeight: 36,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {product.name}
        </h3>

        {/* Yıldız puanı */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, margin: "8px 0 6px" }}>
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} size={12}
              fill={star <= (product.rating || 4) ? "#F59E0B" : "#e0e0e0"}
              color={star <= (product.rating || 4) ? "#F59E0B" : "#e0e0e0"}
            />
          ))}
          {product.reviews && (
            <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>({product.reviews})</span>
          )}
        </div>

        {/* Fiyat ve Sepete Ekle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            {oldPrice && (
              <span style={{
                fontSize: 12, color: "#bbb",
                textDecoration: "line-through", display: "block", lineHeight: 1,
              }}>
                {oldPrice.toLocaleString("tr-TR")} ₺
              </span>
            )}
            <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.primaryRed }}>
              {price.toLocaleString("tr-TR")} ₺
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            style={{
              background: COLORS.primaryRed,
              color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 12px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              cursor: "pointer",
              fontSize: 11, fontWeight: 700,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#c41a1f"}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.primaryRed}
          >
            <ShoppingCart size={14} /> Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
