import { useState, useRef } from "react";
import { Star, Plus, Minus, ArrowLeft, ShoppingCart, Truck, Shield, Award, ZoomIn } from "lucide-react";

const COLORS = {
  primaryRed: "#E31E24",
  primaryBlue: "#123E85",
};

export default function ProductDetail({ product, categories = [], onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomTip, setShowZoomTip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const imgContainerRef = useRef(null);
  const cat = categories.find((c) => c.id === product.category_id);

  const price = product.sell_price ?? product.price ?? 0;
  const oldPrice = product.old_price ?? product.oldPrice ?? null;
  const imgSrc = product.image_url || product.img;
  const isUrl = imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));
  const desc = product.description ?? product.desc ?? "";

  const handleImageClick = () => {
    if (zoomLevel >= 3) {
      setZoomLevel(1);
    } else {
      setZoomLevel(prev => prev + 1);
    }
  };

  const handleMouseMove = (e) => {
    if (!imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const zoomLabels = { 1: "Yakınlaştır", 2: "2x Zoom", 3: "3x Zoom" };

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
              fontSize: 11, color: COLORS.primaryBlue, fontWeight: 700,
              background: "#E0F2FE", padding: "6px 14px",
              borderRadius: 20, alignSelf: "center",
            }}>
              {cat.name}
            </span>
          )}
        </div>

        {/* Ürün resmi - Büyüteç özellikli */}
        <div
          ref={imgContainerRef}
          onClick={isUrl ? handleImageClick : undefined}
          onMouseEnter={() => isUrl && setShowZoomTip(true)}
          onMouseLeave={() => { setShowZoomTip(false); setZoomLevel(1); }}
          onMouseMove={handleMouseMove}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 320, background: "#fafafa",
            overflow: "hidden", padding: 16,
            position: "relative",
            cursor: isUrl ? "zoom-in" : "default",
          }}
        >
          {isUrl ? (
            <img
              src={imgSrc}
              alt={product.name}
              style={{
                maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                transform: `scale(${zoomLevel})`,
                transformOrigin: imgContainerRef.current
                  ? `${(mousePos.x / imgContainerRef.current.offsetWidth) * 100}% ${(mousePos.y / imgContainerRef.current.offsetHeight) * 100}%`
                  : "center center",
                transition: "transform 0.3s ease",
              }}
            />
          ) : (
            <span style={{ fontSize: 100 }}>{imgSrc || "📦"}</span>
          )}

          {/* Büyüteç ikonu + yazı (fare yanında) */}
          {isUrl && showZoomTip && (
            <div style={{
              position: "absolute",
              left: Math.min(mousePos.x + 16, (imgContainerRef.current?.offsetWidth || 300) - 110),
              top: Math.min(mousePos.y - 12, (imgContainerRef.current?.offsetHeight || 320) - 30),
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              fontSize: 11, fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 6,
              display: "flex", alignItems: "center", gap: 5,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 5,
              transition: "left 0.05s, top 0.05s",
            }}>
              <ZoomIn size={13} />
              {zoomLevel >= 3 ? "Sıfırla" : zoomLabels[zoomLevel]}
            </div>
          )}

          {/* Zoom seviye göstergesi */}
          {zoomLevel > 1 && (
            <div style={{
              position: "absolute", bottom: 8, right: 8,
              background: COLORS.primaryRed,
              color: "#fff", fontSize: 11, fontWeight: 800,
              padding: "4px 10px", borderRadius: 4, zIndex: 5,
            }}>
              {zoomLevel}x
            </div>
          )}
        </div>

        {/* Detaylar */}
        <div style={{ padding: "0 24px 32px" }}>
          {product.badge && (
            <span style={{
              display: "inline-block",
              background: product.badge === "Kampanya" ? COLORS.primaryRed
                : product.badge === "Yeni" ? "#2DC00F"
                : COLORS.primaryBlue,
              color: "#fff", fontSize: 11, fontWeight: 700,
              padding: "4px 12px", borderRadius: 6, marginBottom: 8,
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
              <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.primaryRed, margin: 0 }}>
                {(price * qty).toLocaleString("tr-TR")} ₺
              </p>
            </div>
          </div>

          {/* Sepete ekle butonu */}
          <button
            onClick={() => { onAdd(product, qty); onClose(); }}
            style={{
              width: "100%", padding: "16px",
              background: COLORS.primaryRed,
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(227,30,36,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <ShoppingCart size={20} /> Sepete Ekle
          </button>

          {/* Ücretsiz Kargo Bilgisi */}
          {product.free_shipping !== false && (
            <div style={{
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: 10, padding: "10px 14px", marginTop: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Truck size={16} color="#059669" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
                1.250₺ üzeri siparişlerde ücretsiz kargo!
              </span>
            </div>
          )}

          {/* Güvence ikonları */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
            {[
              ...(product.free_shipping !== false ? [["Ücretsiz Kargo", <Truck size={16} key="t" />]] : []),
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
