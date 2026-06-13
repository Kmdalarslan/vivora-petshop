import ProductCard from "../components/ProductCard";

const COLORS = {
  primaryRed: "#E31E24",
  primaryBlue: "#123E85",
  darkText: "#1a1a2e",
};

export default function ShopPage({ products, categories, activeCat, onCatChange, onAddToCart, onProductDetail, loading, favorites = [], onToggleFavorite }) {
  const rootCats = categories.filter((c) => !c.parent_id);
  const selectedCat = activeCat ? categories.find((c) => c.id === activeCat) : null;
  const isChild = selectedCat && selectedCat.parent_id;
  const activeRootId = isChild ? selectedCat.parent_id : activeCat;
  const subCats = activeRootId
    ? categories.filter((c) => c.parent_id === activeRootId)
    : [];
  const activeRootCat = activeRootId ? categories.find((c) => c.id === activeRootId) : null;

  return (
    <div style={{ padding: "20px", animation: "fadeIn 0.3s ease" }}>
      {/* ─── Üst Kategori Filtreleri ─── */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        paddingBottom: 8, WebkitOverflowScrolling: "touch",
      }}>
        <button
          onClick={() => onCatChange(null)}
          style={{
            background: !activeCat ? COLORS.primaryRed : "#fff",
            color: !activeCat ? "#fff" : COLORS.darkText,
            border: !activeCat ? "none" : "2px solid #eee",
            borderRadius: 8, padding: "10px 20px",
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
              background: activeRootId === cat.id ? COLORS.primaryRed : "#fff",
              color: activeRootId === cat.id ? "#fff" : COLORS.darkText,
              border: activeRootId === cat.id ? "none" : "2px solid #eee",
              borderRadius: 8, padding: "10px 20px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ─── Alt Kategori Filtreleri ─── */}
      {subCats.length > 0 && (
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          paddingBottom: 8, WebkitOverflowScrolling: "touch",
          marginTop: 8,
        }}>
          <button
            onClick={() => onCatChange(activeRootId)}
            style={{
              background: activeCat === activeRootId ? COLORS.primaryBlue : "#fff",
              color: activeCat === activeRootId ? "#fff" : "#666",
              border: `1px solid ${activeCat === activeRootId ? COLORS.primaryBlue : "#ddd"}`,
              borderRadius: 20, padding: "6px 16px",
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
                background: activeCat === sub.id ? COLORS.primaryBlue : "#fff",
                color: activeCat === sub.id ? "#fff" : "#666",
                border: `1px solid ${activeCat === sub.id ? COLORS.primaryBlue : "#ddd"}`,
                borderRadius: 20, padding: "6px 16px",
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
        <div style={{ marginBottom: 16, marginTop: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, margin: 0 }}>
            {selectedCat && isChild
              ? `${activeRootCat.name} › ${selectedCat.name}`
              : activeRootCat.name}
          </h2>
          <div style={{ width: 50, height: 3, background: COLORS.primaryRed, borderRadius: 2, marginTop: 6 }} />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#999", fontSize: 14 }}>
          Ürünler yükleniyor...
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>
            {products.length} ürün bulundu
          </p>

          {/* ─── Ürün Gridi ─── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}>
            {products.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeIn 0.35s ease ${i * 0.03}s both` }}>
                <ProductCard
                  product={p}
                  categories={categories}
                  onAdd={onAddToCart}
                  onDetail={onProductDetail}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 700, color: COLORS.darkText }}>Ürün bulunamadı</p>
              <p style={{ fontSize: 13, color: "#999" }}>Farklı bir arama veya kategori deneyin.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
