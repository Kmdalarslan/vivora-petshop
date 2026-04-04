import { useState, useCallback, useEffect } from "react";
import { ShoppingCart, Search, Home, Grid3X3, Info, MessageCircle } from "lucide-react";

// Supabase
import { supabase } from "./lib/supabase";

// Components
import Bubbles from "./components/Bubbles";
import ProductDetail from "./components/ProductDetail";
import CartPanel from "./components/CartPanel";

// Pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";

// Logo dosyası — public/ klasörüne koyun
// import logoUrl from "/logo.png";
const LOGO_URL = "/logo.png";

export default function App() {
  // ─── State ───
  const [page, setPage] = useState("home");
  const [logoTaps, setLogoTaps] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ─── Supabase'den veri çek + gerçek zamanlı dinle ───
  useEffect(() => {
    fetchData();

    // Ürünlerde değişiklik olunca otomatik güncelle
    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchData = async () => {
    setLoadingProducts(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("id"),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
    setLoadingProducts(false);
  };

  const fetchProducts = fetchData;

  // ─── Sepet İşlemleri ───
  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    setToast(product.name);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const updateQty = (id, qty) => {
    if (qty < 1) return setCart((prev) => prev.filter((i) => i.id !== id));
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ─── Navigasyon ───
  const navigate = (p) => {
    setPage(p);
    if (p === "home") {
      setActiveCat(null);
      setSearch("");
    }
  };

  const goCategory = (catId) => {
    setActiveCat(catId);
    setPage("shop");
  };

  // ─── Ürün Filtreleme ───
  const filteredProducts = products.filter((p) => {
    let matchCat = true;
    if (activeCat) {
      const selCat = categories.find((c) => c.id === activeCat);
      if (selCat && !selCat.parent_id) {
        // Üst kategori: kendi ürünleri + alt kategorilerin ürünleri
        const childIds = categories.filter((c) => c.parent_id === activeCat).map((c) => c.id);
        matchCat = p.category_id === activeCat || childIds.includes(p.category_id);
      } else {
        // Alt kategori: sadece o kategorinin ürünleri
        matchCat = p.category_id === activeCat;
      }
    }
    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  return (
    <>
      <Bubbles />

      <div style={{
        position: "relative", zIndex: 1, paddingBottom: 80,
        maxWidth: 768, margin: "0 auto",
      }}>
        {/* ═══════════════ HEADER ═══════════════ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.5)",
          padding: "12px 16px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Logo */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              onClick={() => {
              const next = logoTaps + 1;
              setLogoTaps(next);
              if (next >= 5) { setPage("admin"); setLogoTaps(0); }
              else navigate("home");
            }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}>
                <img
                  src={LOGO_URL}
                  alt="Vivora"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 900, color: "#1E293B", margin: 0, lineHeight: 1 }}>
                  Vivora
                </h1>
                <p style={{
                  fontSize: 10, color: "#0EA5E9", fontWeight: 700,
                  margin: 0, letterSpacing: 2, textTransform: "uppercase",
                }}>
                  Petshop
                </p>
              </div>
            </div>

            {/* Sağ butonlar */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                style={{
                  background: showSearch ? "#0EA5E9" : "#F1F5F9",
                  border: "none", borderRadius: 12,
                  width: 42, height: 42,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <Search size={18} color={showSearch ? "#fff" : "#475569"} />
              </button>
              <button
                onClick={() => setShowCart(true)}
                style={{
                  background: "#F1F5F9", border: "none", borderRadius: 12,
                  width: 42, height: 42,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", position: "relative",
                }}
              >
                <ShoppingCart size={18} color="#475569" />
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "linear-gradient(135deg,#EF4444,#EC4899)",
                    color: "#fff", fontSize: 10, fontWeight: 800,
                    minWidth: 20, height: 20, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 5px",
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Arama çubuğu */}
          {showSearch && (
            <div style={{ marginTop: 12, animation: "fadeIn 0.2s ease" }}>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (page !== "shop") setPage("shop");
                }}
                placeholder="Ürün ara..."
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  border: "2px solid #E2E8F0", fontSize: 14,
                  outline: "none", fontFamily: "inherit", background: "#F8FAFC",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          )}
        </header>

        {/* ═══════════════ SAYFALAR ═══════════════ */}
        {page === "home" && (
          <HomePage
            onNavigate={navigate}
            onCategorySelect={goCategory}
            onAddToCart={addToCart}
            onProductDetail={setDetailProduct}
            products={products}
            categories={categories}
            loading={loadingProducts}
          />
        )}

        {page === "shop" && (
          <ShopPage
            products={filteredProducts}
            categories={categories}
            activeCat={activeCat}
            onCatChange={setActiveCat}
            onAddToCart={addToCart}
            onProductDetail={setDetailProduct}
            loading={loadingProducts}
          />
        )}

        {page === "about" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <AboutPage />
          </div>
        )}

        {page === "contact" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <ContactPage />
          </div>
        )}

        {page === "admin" && (
          <AdminPage onProductsChange={fetchProducts} />
        )}

        {/* ═══════════════ ALT NAVİGASYON ═══════════════ */}
        <nav style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 768, zIndex: 100,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex", justifyContent: "space-around",
          padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
        }}>
          {[
            { id: "home", icon: <Home size={20} />, label: "Ana Sayfa" },
            { id: "shop", icon: <Grid3X3 size={20} />, label: "Mağaza" },
            { id: "about", icon: <Info size={20} />, label: "Hakkımızda" },
            { id: "contact", icon: <MessageCircle size={20} />, label: "İletişim" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 2, padding: "6px 12px", borderRadius: 12,
                color: page === item.id ? "#0EA5E9" : "#94A3B8",
                transition: "all 0.2s",
              }}
            >
              {item.icon}
              <span style={{ fontSize: 10, fontWeight: page === item.id ? 800 : 600 }}>
                {item.label}
              </span>
              {page === item.id && (
                <div style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: "#0EA5E9", marginTop: 1,
                }} />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══════════════ MODALLER ═══════════════ */}
      {detailProduct && (
        <ProductDetail
          product={detailProduct}
          categories={categories}
          onClose={() => setDetailProduct(null)}
          onAdd={addToCart}
        />
      )}

      {showCart && (
        <CartPanel
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdate={updateQty}
          onRemove={removeItem}
        />
      )}

      {/* ═══════════════ TOAST BİLDİRİMİ ═══════════════ */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
          zIndex: 2000,
          background: "rgba(30,41,59,0.92)", backdropFilter: "blur(10px)",
          color: "#fff", padding: "12px 24px", borderRadius: 16,
          fontSize: 13, fontWeight: 600,
          animation: "toastIn 0.3s ease",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          ✓{" "}
          <span style={{
            maxWidth: 200, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {toast}
          </span>{" "}
          sepete eklendi
        </div>
      )}

      {/* ═══════════════ WHATSAPP BUTONU ═══════════════ */}
      <a
        href="https://wa.me/905551234567"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: 90, right: 16, zIndex: 200,
          width: 52, height: 52, borderRadius: "50%",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(37,211,102,0.4)", textDecoration: "none",
          animation: "pulse 2s infinite",
        }}
      >
        <MessageCircle size={24} color="#fff" fill="#fff" />
      </a>
    </>
  );
}
