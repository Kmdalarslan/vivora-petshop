import ProductCard from "../components/ProductCard";

export default function ShopPage({ products, categories, activeCat, onCatChange, onAddToCart, onProductDetail, loading }) {
  // Sadece üst kategoriler
  const rootCats = categories.filter((c) => !c.parent_id);

  // Seçili kategorinin bilgisi
  const selectedCat = activeCat ? categories.find((c) => c.id === activeCat) : null;
  const isChild = selectedCat && selectedCat.parent_id;
  const activeRootId = isChild ? selectedCat.parent_id : activeCat;

  // Seçili üst kategorinin alt kategorileri
  const subCats = activeRootId
    ? categories.filter((c) => c.parent_id === activeRootId)
    : [];

  const activeRootCat = activeRootId ? categories.find((c) => c.id === activeRootId) : null;

  return (
    <div style={{ padding: "16px", animation: "fadeIn 0.3s ease" }}>
      {/* ─── Üst Kategori Filtreleri ─── */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        paddingBottom: 8, WebkitOverflowScrolling: "touch",
      }}>
        <button
          onClick={() => onCatChange(null)}
          style={{
            background: !activeCat
              ? "linear-gradient(135deg,#0EA5E9,#06B6D4)"
              : "rgba(255,255,255,0.9)",
            color: !activeCat ? "#fff" : "#475569",
            border: "none", borderRadius: 12, padding: "10px 18px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
          }}
        >
          Tümü
        </button>
        {rootCats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCatChange(cat.id)}
            style={{
              background: activeRootId === cat.id
                ? "linear-gradient(135deg,#0EA5E9,#06B6D4)"
                : "rgba(255,255,255,0.9)",
              color: activeRootId === cat.id ? "#fff" : "#475569",
              border: "none", borderRadius: 12, padding: "10px 18px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ─── Alt Kategori Filtreleri (varsa) ─── */}
      {subCats.length > 0 && (
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          paddingBottom: 8, WebkitOverflowScrolling: "touch",
          marginTop: 6,
        }}>
          <button
            onClick={() => onCatChange(activeRootId)}
            style={{
              background: activeCat === activeRootId
                ? "rgba(14,165,233,0.15)"
                : "rgba(255,255,255,0.7)",
              color: activeCat === activeRootId ? "#0EA5E9" : "#64748B",
              border: `1px solid ${activeCat === activeRootId ? "#0EA5E9" : "rgba(0,0,0,0.08)"}`,
              borderRadius: 20, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
            }}
          >
            Tümü
          </button>
          {subCats.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onCatChange(sub.id)}
              style={{
                background: activeCat === sub.id
                  ? "rgba(14,165,233,0.15)"
                  : "rgba(255,255,255,0.7)",
                color: activeCat === sub.id ? "#0EA5E9" : "#64748B",
                border: `1px solid ${activeCat === sub.id ? "#0EA5E9" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 20, padding: "6px 14px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
              }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Seçili kategori başlığı */}
      {activeRootCat && (
        <div style={{ marginBottom: 12, marginTop: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>
            {selectedCat && isChild
              ? `${activeRootCat.name} › ${selectedCat.name}`
              : activeRootCat.name}
          </h2>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>
          Ürünler yükleniyor...
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 12 }}>
            {products.length} ürün bulundu
          </p>

          {/* ─── Ürün Gridi ─── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {products.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.35s ease ${i * 0.04}s both` }}>
                <ProductCard
                  product={p}
                  categories={categories}
                  onAdd={onAddToCart}
                  onDetail={onProductDetail}
                />
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 700, color: "#475569" }}>Ürün bulunamadı</p>
              <p style={{ fontSize: 13, color: "#94A3B8" }}>Farklı bir arama veya kategori deneyin.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
