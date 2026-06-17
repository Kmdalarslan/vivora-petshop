import { useState, useCallback, useEffect, useRef } from "react";
import { ShoppingCart, Search, Home, Grid3X3, Info, MessageCircle, User, BookOpen, Phone, HelpCircle, Tag, ChevronDown, X, Menu, Instagram, Youtube, Heart, MapPin, Package, Edit2, Trash2, Plus, LogOut, Save, ChevronRight } from "lucide-react";

// Supabase
import { supabase } from "./lib/supabase";

// Components
import ProductDetail from "./components/ProductDetail";
import CartPanel from "./components/CartPanel";

// Pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import BlogPage, { BlogDetail } from "./pages/BlogPage";
import EtiketPage from "./pages/EtiketPage";

const LOGO_URL = "/logo.png";

// Renk paleti - atakanpetshop tarzı
const COLORS = {
  primaryRed: "#E31E24",
  primaryBlue: "#123E85",
  darkBlue: "#0D2B5E",
  lightPink: "#FED9D9",
  green: "#2DC00F",
  darkText: "#1a1a2e",
  grayText: "#666",
  lightGray: "#f8f8f8",
  border: "#eee",
  white: "#fff",
};

export default function App() {
  // ─── State ───
  const [page, setPage] = useState("home");
  const [logoTaps, setLogoTaps] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [detailProduct, setDetailProductRaw] = useState(null);
  const openProductDetail = useCallback((product) => {
    if (product) {
      setDetailProductRaw(product);
      window.history.pushState({ detail: true, page: page }, "");
    } else {
      setDetailProductRaw(null);
    }
  }, [page]);
  const closeProductDetail = useCallback(() => {
    setDetailProductRaw(null);
    if (window.history.state?.detail) {
      window.history.back();
    }
  }, []);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupForm, setSignupForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [signupStatus, setSignupStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navHoverCat, setNavHoverCat] = useState(null);
  const [navHoverSub, setNavHoverSub] = useState(null);
  const navHoverTimeout = useRef(null);

  // ─── Üyelik State ───
  const [member, setMember] = useState(() => {
    const saved = localStorage.getItem("vivora_member");
    return saved ? JSON.parse(saved) : null;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [memberOrders, setMemberOrders] = useState([]);
  const [profileTab, setProfileTab] = useState("info");
  const [footerTaps, setFooterTaps] = useState(0);
  const footerTapTimer = useRef(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vivora_favorites") || "[]"); } catch { return []; }
  });
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vivora_addresses") || "[]"); } catch { return []; }
  });
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ title: "", fullAddress: "", city: "", district: "", phone: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", email: "" });

  const saveFavorites = (list) => { setFavorites(list); localStorage.setItem("vivora_favorites", JSON.stringify(list)); };
  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) saveFavorites(favorites.filter(id => id !== productId));
    else saveFavorites([...favorites, productId]);
  };
  const saveAddresses = (list) => { setAddresses(list); localStorage.setItem("vivora_addresses", JSON.stringify(list)); };

  // ─── Blog State ───
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogDetailPost, setBlogDetailPost] = useState(null);

  // ─── Supabase'den veri çek + gerçek zamanlı dinle ───
  useEffect(() => {
    fetchData();
    fetchBlogPosts();
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

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setBlogPosts(data);
    setBlogLoading(false);
  };

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

  // ─── Tarayıcı Geri Butonu Yönetimi ───
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (state) {
        if (state.detail) {
          // Geri gelince detayı kapat
          setDetailProductRaw(null);
        } else if (state.page) {
          setPage(state.page);
          setActiveCat(state.activeCat || null);
          setBlogDetailPost(null);
          setDetailProductRaw(null);
        }
      } else {
        // En başa dön
        setPage("home");
        setActiveCat(null);
        setDetailProductRaw(null);
        setBlogDetailPost(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    // Hash ile gizli sayfa erişimi
    if (window.location.hash === "#etiket") {
      setPage("etiket");
      window.history.replaceState({ page: "etiket" }, "");
    } else if (!window.history.state) {
      window.history.replaceState({ page: "home" }, "");
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ─── Navigasyon ───
  const navigate = (p) => {
    setPage(p);
    setMobileMenuOpen(false);
    if (p === "home") {
      setActiveCat(null);
      setSearch("");
    }
    if (p !== "blog") {
      setBlogDetailPost(null);
    }
    window.history.pushState({ page: p }, "");
  };

  const goCategory = (catId) => {
    setActiveCat(catId);
    setPage("shop");
    setMobileMenuOpen(false);
    window.history.pushState({ page: "shop", activeCat: catId }, "");
  };

  const [signupError, setSignupError] = useState("");
  const [signupFieldErrors, setSignupFieldErrors] = useState({});
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^0[5]\d{9}$/.test(phone.replace(/\s/g, ""));
  const validateName = (name) => name.trim().length >= 3 && /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(name.trim());

  const handleSignup = async () => {
    setSignupError("");
    const errors = {};
    if (!signupForm.name.trim()) errors.name = "Ad soyad zorunlu.";
    else if (!validateName(signupForm.name)) errors.name = "Geçerli bir ad soyad girin (en az 3 harf, sadece harf).";
    if (!signupForm.phone.trim()) errors.phone = "Telefon zorunlu.";
    else if (!validatePhone(signupForm.phone)) errors.phone = "Geçerli bir telefon girin (05XX XXX XX XX).";
    if (!signupForm.email.trim()) errors.email = "E-posta zorunlu.";
    else if (!validateEmail(signupForm.email.trim())) errors.email = "Geçerli bir e-posta girin.";
    if (!signupForm.password.trim()) errors.password = "Şifre zorunlu.";
    else if (signupForm.password.trim().length < 4) errors.password = "Şifre en az 4 karakter olmalı.";
    setSignupFieldErrors(errors);
    if (Object.keys(errors).length > 0) { setSignupStatus("error"); return; }
    setSignupStatus("sending");
    const { data: existingPhone } = await supabase.from("members").select("id").eq("phone", signupForm.phone.trim());
    if (existingPhone && existingPhone.length > 0) {
      setSignupError("Bu telefon numarası zaten kayıtlı.");
      setSignupStatus("error");
      return;
    }
    const { data: existingEmail } = await supabase.from("members").select("id").eq("email", signupForm.email.trim());
    if (existingEmail && existingEmail.length > 0) {
      setSignupError("Bu e-posta adresi zaten kayıtlı.");
      setSignupStatus("error");
      return;
    }
    const { data, error } = await supabase.from("members").insert([{
      name: signupForm.name, phone: signupForm.phone, email: signupForm.email.trim(), password: signupForm.password
    }]).select();
    if (error) { setSignupError("Bir hata oluştu, tekrar deneyin."); setSignupStatus("error"); return; }
    const m = data[0];
    setMember(m);
    localStorage.setItem("vivora_member", JSON.stringify(m));
    setSignupStatus("done");
  };

  const handleLogin = async () => {
    if (!loginForm.phone.trim() || !loginForm.password.trim()) return;
    setLoginError("");
    const { data } = await supabase.from("members").select("*").eq("phone", loginForm.phone.trim()).eq("password", loginForm.password.trim());
    if (!data || data.length === 0) { setLoginError("Telefon veya şifre hatalı"); return; }
    const m = data[0];
    setMember(m);
    localStorage.setItem("vivora_member", JSON.stringify(m));
    setShowLogin(false);
    setLoginForm({ phone: "", password: "" });
    setToast("Hoş geldiniz, " + m.name);
    setTimeout(() => setToast(null), 2000);
  };

  const GOOGLE_CLIENT_ID = "672445300186-gh0bg8i41rn9tn230r395278brcsnhvm.apps.googleusercontent.com";

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      // JWT decode (base64)
      const payload = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
      const { name, email } = payload;
      if (!email) return;

      // E-posta ile üye ara
      const { data: existing } = await supabase.from("members").select("*").eq("email", email);
      if (existing && existing.length > 0) {
        // Mevcut üye - giriş yap
        const m = existing[0];
        setMember(m);
        localStorage.setItem("vivora_member", JSON.stringify(m));
        setShowLogin(false);
        setShowSignup(false);
        setToast("Hoş geldiniz, " + m.name);
        setTimeout(() => setToast(null), 2000);
      } else {
        // Yeni üye oluştur
        const { data, error } = await supabase.from("members").insert([{
          name: name || "Google Kullanıcı",
          phone: "",
          email,
          password: null,
        }]).select();
        if (error) { setToast("Giriş hatası"); setTimeout(() => setToast(null), 2000); return; }
        const m = data[0];
        setMember(m);
        localStorage.setItem("vivora_member", JSON.stringify(m));
        setShowLogin(false);
        setShowSignup(false);
        setSignupStatus("done");
        setToast("Hoş geldiniz, " + m.name);
        setTimeout(() => setToast(null), 2000);
      }
    } catch (err) {
      setToast("Google giriş hatası"); setTimeout(() => setToast(null), 2000);
    }
  };

  const triggerGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      setToast("Google yükleniyor, tekrar deneyin"); setTimeout(() => setToast(null), 2000);
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });
    window.google.accounts.id.prompt();
  };

  const handleLogout = () => {
    setMember(null);
    localStorage.removeItem("vivora_member");
    setMemberOrders([]);
    if (page === "profile") setPage("home");
  };

  const loadMemberOrders = async () => {
    if (!member) return;
    const { data } = await supabase.from("orders").select("*").eq("customer_phone", member.phone).order("created_at", { ascending: false });
    if (data) setMemberOrders(data);
  };

  useEffect(() => { if (member) loadMemberOrders(); }, [member]);

  // ─── Ürün Filtreleme ───
  const filteredProducts = products.filter((p) => {
    let matchCat = true;
    if (activeCat) {
      const selCat = categories.find((c) => c.id === activeCat);
      if (selCat && !selCat.parent_id) {
        const childIds = categories.filter((c) => c.parent_id === activeCat).map((c) => c.id);
        matchCat = p.category_id === activeCat || childIds.includes(p.category_id);
      } else {
        matchCat = p.category_id === activeCat;
      }
    }
    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  const rootCats = categories.filter(c => !c.parent_id);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setPage("shop");
    }
  };

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
        {/* ═══════════════ ÜST BAR (Top Bar) ═══════════════ */}
        <div style={{
          background: COLORS.primaryBlue,
          color: "#fff",
          fontSize: 12,
          padding: "6px 0",
        }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "0 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                onClick={() => navigate("shop")}>
                <Tag size={12} /> Kampanyalar
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                onClick={() => navigate("contact")}>
                <HelpCircle size={12} /> Yardım
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="tel:+905385579081" style={{ color: "#fff", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 12 }}>
                <Phone size={12} /> 0538 557 90 81
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <a href="https://www.instagram.com/vivora.pet" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", opacity: 0.8, transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.8}>
                <Instagram size={14} />
              </a>
              <a href="https://www.tiktok.com/@vivora.petshop" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", opacity: 0.8, transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.8}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@V%C4%B0VORA.Canl%C4%B1.D%C3%BCnyas%C4%B1" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", opacity: 0.8, transition: "opacity 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.8}>
                <Youtube size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ═══════════════ ANA HEADER ═══════════════ */}
        <header style={{
          background: COLORS.white,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          {/* Logo + Arama + Hesap + Sepet */}
          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "12px 20px",
            display: "flex", alignItems: "center", gap: 20,
          }}>
            {/* Hamburger (mobil) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "none", padding: 4,
              }}
              className="mobile-menu-btn"
            >
              <Menu size={24} color={COLORS.darkText} />
            </button>

            {/* Logo */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}
              onClick={() => {
                const next = logoTaps + 1;
                setLogoTaps(next);
                if (next >= 5) { setPage("admin"); setLogoTaps(0); }
                else navigate("home");
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, overflow: "hidden",
                border: `2px solid ${COLORS.primaryRed}`,
              }}>
                <img
                  src={LOGO_URL}
                  alt="Vivora"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: COLORS.primaryRed, margin: 0, lineHeight: 1 }}>
                  Vivora
                </h1>
                <p style={{
                  fontSize: 10, color: COLORS.primaryBlue, fontWeight: 700,
                  margin: 0, letterSpacing: 2, textTransform: "uppercase",
                }}>
                  Petshop
                </p>
              </div>
            </div>

            {/* Arama Çubuğu */}
            <form onSubmit={handleSearchSubmit} style={{
              flex: 1, display: "flex", maxWidth: 500,
              border: `2px solid ${COLORS.primaryRed}`,
              borderRadius: 8, overflow: "hidden",
            }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün arayın..."
                style={{
                  flex: 1, padding: "10px 16px", border: "none", fontSize: 14,
                  outline: "none", fontFamily: "inherit", background: COLORS.white,
                }}
              />
              <button type="submit" style={{
                background: COLORS.primaryRed, border: "none",
                padding: "0 18px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Search size={18} color="#fff" />
              </button>
            </form>

            {/* Hesap & Sepet */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
              {/* Hesap */}
              <button
                onClick={() => member ? navigate("profile") : setShowLogin(true)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  color: COLORS.primaryBlue,
                }}
              >
                <User size={22} />
                <span style={{ fontSize: 10, fontWeight: 600 }}>
                  {member ? member.name.split(" ")[0] : "Giriş Yap"}
                </span>
              </button>

              {/* Sepet */}
              <button
                onClick={() => setShowCart(true)}
                style={{
                  background: COLORS.primaryRed, border: "none", borderRadius: 10,
                  padding: "8px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  color: "#fff", position: "relative",
                }}
              >
                <ShoppingCart size={20} />
                <div>
                  <span style={{ fontSize: 10, fontWeight: 600, display: "block" }}>Sepetim</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>
                    {cartCount} Ürün
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Kategori Navigasyonu */}
          <div style={{
            background: COLORS.primaryBlue,
            position: "relative",
          }}>
            <div style={{
              maxWidth: 1200, margin: "0 auto", padding: "0 20px",
              display: "flex", alignItems: "center",
              overflowX: "auto",
            }}>
              <button
                onClick={() => navigate("home")}
                style={{
                  background: page === "home" ? COLORS.primaryRed : "transparent",
                  border: "none", color: "#fff",
                  padding: "12px 18px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: 0.5,
                  transition: "background 0.2s",
                }}
              >
                ANASAYFA
              </button>
              {rootCats.map(cat => (
                <div
                  key={cat.id}
                  style={{ position: "relative" }}
                  onMouseEnter={() => {
                    clearTimeout(navHoverTimeout.current);
                    setNavHoverCat(cat.id);
                    setNavHoverSub(null);
                  }}
                  onMouseLeave={() => {
                    navHoverTimeout.current = setTimeout(() => { setNavHoverCat(null); setNavHoverSub(null); }, 250);
                  }}
                >
                  <button
                    onClick={() => goCategory(cat.id)}
                    style={{
                      background: navHoverCat === cat.id ? COLORS.primaryRed
                        : (activeCat === cat.id && page === "shop") ? COLORS.primaryRed
                        : "transparent",
                      border: "none", color: "#fff",
                      padding: "12px 18px", cursor: "pointer",
                      fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: 0.5,
                      transition: "background 0.2s",
                      display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    {cat.name}
                    <ChevronDown size={12} style={{
                      transition: "transform 0.2s",
                      transform: navHoverCat === cat.id ? "rotate(180deg)" : "rotate(0)",
                    }} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => navigate("blog")}
                style={{
                  background: page === "blog" ? COLORS.primaryRed : "transparent",
                  border: "none", color: "#fff",
                  padding: "12px 18px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: 0.5,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (page !== "blog") e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { if (page !== "blog") e.currentTarget.style.background = "transparent"; }}
              >
                BLOG
              </button>
              <button
                onClick={() => navigate("about")}
                style={{
                  background: page === "about" ? COLORS.primaryRed : "transparent",
                  border: "none", color: "#fff",
                  padding: "12px 18px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: 0.5,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (page !== "about") e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { if (page !== "about") e.currentTarget.style.background = "transparent"; }}
              >
                HAKKIMIZDA
              </button>
              <button
                onClick={() => navigate("contact")}
                style={{
                  background: page === "contact" ? COLORS.primaryRed : "transparent",
                  border: "none", color: "#fff",
                  padding: "12px 18px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: 0.5,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (page !== "contact") e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { if (page !== "contact") e.currentTarget.style.background = "transparent"; }}
              >
                İLETİŞİM
              </button>
            </div>

            {/* ═══ Mega Menü Dropdown ═══ */}
            {navHoverCat && (() => {
              const hovCat = categories.find(c => c.id === navHoverCat);
              if (!hovCat) return null;
              const childIds = categories.filter(c => c.parent_id === navHoverCat).map(c => c.id);
              const subCats = categories.filter(c => c.parent_id === navHoverCat);
              const activeSub = navHoverSub ? categories.find(c => c.id === navHoverSub) : null;
              const catProds = navHoverSub
                ? products.filter(p => p.category_id === navHoverSub).slice(0, 8)
                : products.filter(p => p.category_id === navHoverCat || childIds.includes(p.category_id)).slice(0, 8);
              return (
                <div
                  onMouseEnter={() => {
                    clearTimeout(navHoverTimeout.current);
                    setNavHoverCat(navHoverCat);
                  }}
                  onMouseLeave={() => {
                    navHoverTimeout.current = setTimeout(() => { setNavHoverCat(null); setNavHoverSub(null); }, 250);
                  }}
                  style={{
                    position: "absolute",
                    top: "100%", left: 0, right: 0,
                    zIndex: 99,
                    background: "#fff",
                    borderTop: `3px solid ${COLORS.primaryRed}`,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div style={{
                    maxWidth: 1200, margin: "0 auto", padding: "24px 20px",
                    display: "flex", gap: 24,
                  }}>
                    {/* Sol: Alt kategoriler */}
                    {subCats.length > 0 && (
                      <div style={{
                        minWidth: 180, borderRight: "1px solid #eee", paddingRight: 24,
                      }}>
                        <p style={{
                          fontSize: 14, fontWeight: 800, color: COLORS.primaryBlue,
                          marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5,
                        }}>
                          {hovCat.name}
                        </p>
                        {subCats.map(sub => (
                          <div
                            key={sub.id}
                            onClick={() => { goCategory(sub.id); setNavHoverCat(null); setNavHoverSub(null); }}
                            onMouseEnter={() => setNavHoverSub(sub.id)}
                            style={{
                              padding: "8px 12px", cursor: "pointer",
                              borderRadius: 6, fontSize: 13, fontWeight: 600,
                              color: navHoverSub === sub.id ? COLORS.primaryRed : "#444",
                              background: navHoverSub === sub.id ? COLORS.lightPink : "transparent",
                              transition: "all 0.15s",
                              display: "flex", alignItems: "center", gap: 8,
                            }}
                          >
                            {sub.image && (
                              <img src={sub.image} alt="" style={{
                                width: 24, height: 24, borderRadius: "50%", objectFit: "cover",
                              }} onError={e => e.target.style.display = "none"} />
                            )}
                            {sub.name}
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8" }}>›</span>
                          </div>
                        ))}
                        <div
                          onClick={() => { goCategory(navHoverCat); setNavHoverCat(null); }}
                          style={{
                            padding: "8px 12px", cursor: "pointer",
                            borderRadius: 6, fontSize: 13, fontWeight: 700,
                            color: COLORS.primaryRed, marginTop: 8,
                            borderTop: "1px solid #eee", paddingTop: 12,
                          }}
                        >
                          Tümünü Gör →
                        </div>
                      </div>
                    )}

                    {/* Sağ: Ürünler grid */}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 800, color: COLORS.primaryBlue,
                        marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5,
                      }}>
                        {activeSub ? activeSub.name : subCats.length > 0 ? "Popüler Ürünler" : hovCat.name}
                      </p>
                      {catProds.length > 0 ? (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                          gap: 12,
                        }}>
                          {catProds.map(p => {
                            const price = p.sell_price ?? p.price ?? 0;
                            const imgSrc = p.img;
                            const isUrl = imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));
                            return (
                              <div
                                key={p.id}
                                onClick={() => { openProductDetail(p); setNavHoverCat(null); }}
                                style={{
                                  textAlign: "center", cursor: "pointer",
                                  padding: 8, borderRadius: 8,
                                  border: "1px solid #f0f0f0",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = COLORS.primaryRed;
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = "#f0f0f0";
                                  e.currentTarget.style.transform = "";
                                  e.currentTarget.style.boxShadow = "";
                                }}
                              >
                                <div style={{
                                  height: 70, display: "flex", alignItems: "center",
                                  justifyContent: "center", marginBottom: 6,
                                }}>
                                  {isUrl ? (
                                    <img src={imgSrc} alt={p.name} style={{
                                      maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                                    }} onError={e => e.target.style.display = "none"} />
                                  ) : (
                                    <span style={{ fontSize: 32 }}>{imgSrc || "📦"}</span>
                                  )}
                                </div>
                                <p style={{
                                  fontSize: 11, fontWeight: 600, color: "#333",
                                  margin: "0 0 4px", lineHeight: 1.2,
                                  display: "-webkit-box", WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical", overflow: "hidden",
                                }}>
                                  {p.name}
                                </p>
                                <p style={{
                                  fontSize: 13, fontWeight: 800, color: COLORS.primaryRed, margin: 0,
                                }}>
                                  {price.toLocaleString("tr-TR")} ₺
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: "#999", fontSize: 13 }}>Bu kategoride henüz ürün yok.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </header>

        {/* ═══════════════ MOBİL MENÜ ═══════════════ */}
        {mobileMenuOpen && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.5)",
          }} onClick={() => setMobileMenuOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 280, height: "100%", background: "#fff",
              overflowY: "auto", animation: "slideRight 0.3s ease",
              padding: "20px 0",
            }}>
              <div style={{ padding: "0 20px 16px", borderBottom: `2px solid ${COLORS.primaryRed}`, marginBottom: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.primaryRed }}>Vivora Petshop</h3>
              </div>
              {[
                { label: "Anasayfa", action: () => navigate("home") },
                ...rootCats.map(c => ({ label: c.name, action: () => goCategory(c.id) })),
                { label: "Blog", action: () => navigate("blog") },
                { label: "Hakkımızda", action: () => navigate("about") },
                { label: "İletişim", action: () => navigate("contact") },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 20px", border: "none", background: "none",
                  fontSize: 14, fontWeight: 600, color: COLORS.darkText,
                  cursor: "pointer", borderBottom: "1px solid #f0f0f0",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.lightPink}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════ SAYFALAR ═══════════════ */}
        <main style={{ maxWidth: 1200, margin: "0 auto" }}>
          {page === "home" && (
            <HomePage
              onNavigate={navigate}
              onCategorySelect={goCategory}
              onAddToCart={addToCart}
              onProductDetail={openProductDetail}
              products={products}
              categories={categories}
              loading={loadingProducts}
              blogPosts={blogPosts}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {page === "shop" && (
            <ShopPage
              products={filteredProducts}
              categories={categories}
              activeCat={activeCat}
              onCatChange={setActiveCat}
              onAddToCart={addToCart}
              onProductDetail={openProductDetail}
              loading={loadingProducts}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {page === "about" && (
            <div style={{ animation: "fadeIn 0.3s ease", padding: "0 20px" }}>
              <AboutPage />
            </div>
          )}

          {page === "contact" && (
            <div style={{ animation: "fadeIn 0.3s ease", padding: "0 20px" }}>
              <ContactPage />
            </div>
          )}

          {page === "blog" && !blogDetailPost && (
            <BlogPage
              posts={blogPosts}
              loading={blogLoading}
              onBack={() => navigate("home")}
              onPostDetail={(post) => setBlogDetailPost(post)}
            />
          )}

          {page === "blog" && blogDetailPost && (
            <BlogDetail
              post={blogDetailPost}
              onBack={() => setBlogDetailPost(null)}
            />
          )}

          {page === "admin" && (
            <AdminPage onProductsChange={() => { fetchProducts(); fetchBlogPosts(); }} />
          )}

          {page === "etiket" && (
            <EtiketPage onBack={() => navigate("home")} />
          )}

          {/* ═══════════════ PROFİL SAYFASI ═══════════════ */}
          {page === "profile" && member && (
            <div style={{ padding: "24px 20px 60px", animation: "fadeIn 0.3s ease", maxWidth: 600, margin: "0 auto" }}>
              {/* Üst Profil Kartı */}
              <div style={{ background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryRed})`, borderRadius: 16, padding: 24, color: "#fff", display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={28} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{member.name}</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.8 }}>{member.phone}{member.email ? ` · ${member.email}` : ""}</p>
                </div>
              </div>

              {/* Profil Sekmeleri */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "info", label: "Hesap Bilgileri", icon: <User size={18} />, color: "#3B82F6" },
                  { key: "favorites", label: "Favori Ürünler", icon: <Heart size={18} />, color: "#EF4444" },
                  { key: "orders", label: "Siparişlerim", icon: <Package size={18} />, color: "#F59E0B" },
                  { key: "addresses", label: "Adreslerim", icon: <MapPin size={18} />, color: "#10B981" },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setProfileTab(tab.key)} style={{
                    padding: "14px 12px", borderRadius: 12, border: profileTab === tab.key ? `2px solid ${tab.color}` : "2px solid #eee",
                    background: profileTab === tab.key ? `${tab.color}10` : "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
                  }}>
                    <div style={{ color: tab.color }}>{tab.icon}</div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: profileTab === tab.key ? tab.color : "#475569" }}>{tab.label}</span>
                    {tab.key === "favorites" && favorites.length > 0 && (
                      <span style={{ marginLeft: "auto", background: "#EF4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{favorites.length}</span>
                    )}
                    {tab.key === "orders" && memberOrders.length > 0 && (
                      <span style={{ marginLeft: "auto", background: "#F59E0B", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{memberOrders.length}</span>
                    )}
                    {tab.key === "addresses" && addresses.length > 0 && (
                      <span style={{ marginLeft: "auto", background: "#10B981", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{addresses.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ─── HESAP BİLGİLERİ ─── */}
              {profileTab === "info" && (
                <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.darkText, margin: 0 }}>Hesap Bilgileri</h3>
                    {!editingProfile && (
                      <button onClick={() => { setEditingProfile(true); setProfileForm({ name: member.name || "", phone: member.phone || "", email: member.email || "" }); }}
                        style={{ background: "#EFF6FF", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>
                        <Edit2 size={13} /> Düzenle
                      </button>
                    )}
                  </div>
                  {editingProfile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Ad Soyad</label>
                        <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>Telefon</label>
                        <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, textTransform: "uppercase" }}>E-posta</label>
                        <input value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setEditingProfile(false)} style={{ flex: 1, padding: 12, background: "#F1F5F9", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#64748B" }}>İptal</button>
                        <button onClick={async () => {
                          if (!profileForm.name.trim() || !profileForm.phone.trim()) return;
                          await supabase.from("members").update({ name: profileForm.name.trim(), phone: profileForm.phone.trim(), email: profileForm.email.trim() || null }).eq("id", member.id);
                          const updated = { ...member, name: profileForm.name.trim(), phone: profileForm.phone.trim(), email: profileForm.email.trim() || null };
                          setMember(updated);
                          localStorage.setItem("vivora_member", JSON.stringify(updated));
                          setEditingProfile(false);
                          setToast("Bilgiler güncellendi");
                          setTimeout(() => setToast(null), 2000);
                        }} style={{ flex: 1, padding: 12, background: COLORS.primaryBlue, border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Save size={14} /> Kaydet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { label: "Ad Soyad", value: member.name },
                        { label: "Telefon", value: member.phone },
                        { label: "E-posta", value: member.email || "Belirtilmemiş" },
                        { label: "Üyelik Tarihi", value: member.created_at ? new Date(member.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }) : "-" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1px solid #f0f0f0" : "none" }}>
                          <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.darkText }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── FAVORİ ÜRÜNLER ─── */}
              {profileTab === "favorites" && (
                <div>
                  {favorites.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
                      <Heart size={40} color="#E2E8F0" style={{ marginBottom: 12 }} />
                      <p style={{ color: "#94A3B8", fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Favori ürününüz yok</p>
                      <p style={{ color: "#CBD5E1", fontSize: 13, margin: "0 0 16px" }}>Ürünlerdeki kalp ikonuna tıklayarak favorilere ekleyin</p>
                      <button onClick={() => navigate("shop")} style={{ padding: "10px 24px", background: COLORS.primaryRed, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Ürünlere Git</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {products.filter(p => favorites.includes(p.id)).map(p => {
                        const price = p.sell_price ?? p.price ?? 0;
                        const imgSrc = p.img;
                        const isUrl = imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/"));
                        return (
                          <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #eee", display: "flex", alignItems: "center", gap: 12 }}>
                            <div onClick={() => openProductDetail(p)} style={{ width: 56, height: 56, borderRadius: 10, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", overflow: "hidden" }}>
                              {isUrl ? <img src={imgSrc} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 28 }}>{imgSrc || "📦"}</span>}
                            </div>
                            <div onClick={() => openProductDetail(p)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.darkText, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                              <p style={{ fontSize: 15, fontWeight: 800, color: COLORS.primaryRed, margin: "4px 0 0" }}>{price.toLocaleString("tr-TR")} ₺</p>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button onClick={() => addToCart(p)} style={{ background: `${COLORS.primaryRed}15`, border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <ShoppingCart size={16} color={COLORS.primaryRed} />
                              </button>
                              <button onClick={() => toggleFavorite(p.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <Trash2 size={16} color="#EF4444" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── SİPARİŞLERİM ─── */}
              {profileTab === "orders" && (
                <div>
                  {memberOrders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
                      <Package size={40} color="#E2E8F0" style={{ marginBottom: 12 }} />
                      <p style={{ color: "#94A3B8", fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Henüz siparişiniz yok</p>
                      <p style={{ color: "#CBD5E1", fontSize: 13, margin: "0 0 16px" }}>Sipariş verdikçe burada görünecek</p>
                      <button onClick={() => navigate("shop")} style={{ padding: "10px 24px", background: COLORS.primaryRed, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Alışverişe Başla</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {memberOrders.map(o => (
                        <div key={o.id} style={{ background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #eee" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
                              {new Date(o.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                              background: o.status === "Tamamlandı" ? "#D1FAE5" : o.status === "İptal" ? "#FEE2E2" : "#FEF3C7",
                              color: o.status === "Tamamlandı" ? "#059669" : o.status === "İptal" ? "#DC2626" : "#D97706",
                            }}>{o.status}</span>
                          </div>
                          {o.items && o.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                              <span style={{ fontSize: 13, color: "#555" }}>{item.name} x{item.qty}</span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} ₺</span>
                            </div>
                          ))}
                          <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Toplam</span>
                            <span style={{ fontWeight: 800, fontSize: 16, color: COLORS.primaryRed }}>{o.total?.toFixed(2)} ₺</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── ADRESLERİM ─── */}
              {profileTab === "addresses" && (
                <div>
                  <button onClick={() => { setEditingAddress("new"); setAddressForm({ title: "", fullAddress: "", city: "", district: "", phone: "" }); }}
                    style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px dashed #CBD5E1", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#64748B", marginBottom: 12 }}>
                    <Plus size={18} /> Yeni Adres Ekle
                  </button>
                  {addresses.length === 0 && !editingAddress && (
                    <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
                      <MapPin size={40} color="#E2E8F0" style={{ marginBottom: 12 }} />
                      <p style={{ color: "#94A3B8", fontSize: 15, fontWeight: 600, margin: 0 }}>Kayıtlı adresiniz yok</p>
                    </div>
                  )}
                  {addresses.map((addr, idx) => (
                    <div key={idx} style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #eee", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <MapPin size={18} color="#059669" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.darkText, margin: "0 0 4px" }}>{addr.title || "Adres"}</p>
                        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>{addr.fullAddress}</p>
                        <p style={{ fontSize: 12, color: "#94A3B8", margin: "4px 0 0" }}>{addr.district}, {addr.city}{addr.phone ? ` · ${addr.phone}` : ""}</p>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { setEditingAddress(idx); setAddressForm({ ...addr }); }}
                          style={{ background: "#EFF6FF", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Edit2 size={14} color="#3B82F6" />
                        </button>
                        <button onClick={() => { const newList = addresses.filter((_, i) => i !== idx); saveAddresses(newList); }}
                          style={{ background: "#FEF2F2", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Adres Formu */}
                  {editingAddress !== null && (
                    <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "2px solid #10B981", marginTop: 10 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: COLORS.darkText, margin: "0 0 14px" }}>{editingAddress === "new" ? "Yeni Adres" : "Adresi Düzenle"}</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input placeholder="Adres Başlığı (Ev, İş...)" value={addressForm.title} onChange={e => setAddressForm(f => ({ ...f, title: e.target.value }))}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                        <textarea placeholder="Açık Adres" value={addressForm.fullAddress} onChange={e => setAddressForm(f => ({ ...f, fullAddress: e.target.value }))}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 60 }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <input placeholder="İl" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                            style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                          <input placeholder="İlçe" value={addressForm.district} onChange={e => setAddressForm(f => ({ ...f, district: e.target.value }))}
                            style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                        </div>
                        <input placeholder="Telefon (isteğe bağlı)" value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <button onClick={() => setEditingAddress(null)} style={{ flex: 1, padding: 12, background: "#F1F5F9", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#64748B" }}>İptal</button>
                        <button onClick={() => {
                          if (!addressForm.fullAddress.trim() || !addressForm.city.trim()) { setToast("Adres ve il zorunlu"); setTimeout(() => setToast(null), 2000); return; }
                          if (editingAddress === "new") {
                            saveAddresses([...addresses, { ...addressForm }]);
                          } else {
                            const newList = [...addresses]; newList[editingAddress] = { ...addressForm }; saveAddresses(newList);
                          }
                          setEditingAddress(null);
                          setToast("Adres kaydedildi"); setTimeout(() => setToast(null), 2000);
                        }} style={{ flex: 1, padding: 12, background: "#10B981", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Save size={14} /> Kaydet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Destek & Çıkış */}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <a href="https://wa.me/905385579081" target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, padding: "14px", borderRadius: 12, background: "#25D366", color: "#fff",
                  textDecoration: "none", textAlign: "center", fontWeight: 700, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <MessageCircle size={18} /> Destek
                </a>
                <button onClick={handleLogout} style={{
                  flex: 1, padding: "14px", borderRadius: 12, background: "#FEF2F2", color: "#EF4444",
                  border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <LogOut size={18} /> Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer style={{
          background: COLORS.primaryBlue, color: "#fff", marginTop: 40,
          padding: "40px 20px 20px",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 30, marginBottom: 30,
            }}>
              {/* Mağaza bilgisi */}
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, color: COLORS.primaryRed }}>Vivora Petshop</h3>
                <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.8 }}>
                  Evcil dostlarınız için en kaliteli ürünleri uygun fiyatlarla sunuyoruz. Kayseri'nin güvenilir petshop'u.
                </p>
              </div>
              {/* Hızlı Linkler */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Hızlı Linkler</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Anasayfa", action: () => navigate("home") },
                    { label: "Mağaza", action: () => navigate("shop") },
                    { label: "Blog", action: () => navigate("blog") },
                    { label: "Hakkımızda", action: () => navigate("about") },
                    { label: "İletişim", action: () => navigate("contact") },
                  ].map((l, i) => (
                    <span key={i} onClick={l.action} style={{ fontSize: 13, opacity: 0.7, cursor: "pointer", transition: "opacity 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >{l.label}</span>
                  ))}
                </div>
              </div>
              {/* İletişim */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>İletişim</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, opacity: 0.8 }}>
                  <span>Yunus Emre Mah. Karadeniz Cad.</span>
                  <span>Hilal Sitesi No:11/B Kocasinan/Kayseri</span>
                  <span>Tel: 0538 557 90 81</span>
                </div>
                {/* Sosyal Medya */}
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <a href="https://www.instagram.com/vivora.pet" target="_blank" rel="noopener noreferrer"
                    style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#E1306C"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  >
                    <Instagram size={20} color="#fff" />
                  </a>
                  <a href="https://www.tiktok.com/@vivora.petshop" target="_blank" rel="noopener noreferrer"
                    style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#000"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/@V%C4%B0VORA.Canl%C4%B1.D%C3%BCnyas%C4%B1" target="_blank" rel="noopener noreferrer"
                    style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FF0000"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  >
                    <Youtube size={20} color="#fff" />
                  </a>
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 16, textAlign: "center" }}>
              <p
                style={{ fontSize: 12, opacity: 0.5, cursor: "default", userSelect: "none" }}
                onClick={() => {
                  const next = footerTaps + 1;
                  clearTimeout(footerTapTimer.current);
                  if (next >= 3) { setPage("etiket"); setFooterTaps(0); window.history.pushState({ page: "etiket" }, ""); }
                  else {
                    setFooterTaps(next);
                    footerTapTimer.current = setTimeout(() => setFooterTaps(0), 2000);
                  }
                }}
              >© 2025 Vivora Petshop. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ═══════════════ MODALLER ═══════════════ */}
      {detailProduct && (
        <ProductDetail
          product={detailProduct}
          categories={categories}
          onClose={closeProductDetail}
          onAdd={addToCart}
        />
      )}

      {showCart && (
        <CartPanel
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdate={updateQty}
          onRemove={removeItem}
          member={member}
        />
      )}

      {/* ═══════════════ ÜYELİK MODALI ═══════════════ */}
      {showSignup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowSignup(false); setSignupStatus(null); setSignupForm({ name: "", phone: "", email: "", password: "" }); setSignupFieldErrors({}); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            {signupStatus === "done" ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>✓</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: COLORS.darkText, margin: "0 0 8px" }}>Hoş Geldiniz!</h3>
                <p style={{ color: "#666", fontSize: 14, margin: "0 0 16px" }}>Üyeliğiniz başarıyla oluşturuldu!</p>
                <button onClick={() => { setShowSignup(false); setSignupStatus(null); setSignupForm({ name: "", phone: "", email: "", password: "" }); setSignupFieldErrors({}); navigate("profile"); }} style={{
                  padding: "12px 32px", background: COLORS.primaryRed, color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}>Profilime Git</button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, margin: "0 0 4px" }}>Üye Ol</h3>
                  <p style={{ color: "#999", fontSize: 13, margin: 0 }}>Kampanyalardan ve yeniliklerden haberdar olun!</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <input placeholder="Ad Soyad *" value={signupForm.name} onChange={e => { setSignupForm(f => ({ ...f, name: e.target.value })); setSignupFieldErrors(fe => ({ ...fe, name: undefined })); }}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `2px solid ${signupFieldErrors.name ? "#EF4444" : "#eee"}`, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = signupFieldErrors.name ? "#EF4444" : COLORS.primaryRed} onBlur={e => e.target.style.borderColor = signupFieldErrors.name ? "#EF4444" : "#eee"} />
                    {signupFieldErrors.name && <p style={{ color: "#EF4444", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{signupFieldErrors.name}</p>}
                  </div>
                  <div>
                    <input placeholder="Telefon * (05XX XXX XX XX)" value={signupForm.phone} onChange={e => { setSignupForm(f => ({ ...f, phone: e.target.value })); setSignupFieldErrors(fe => ({ ...fe, phone: undefined })); }}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `2px solid ${signupFieldErrors.phone ? "#EF4444" : "#eee"}`, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = signupFieldErrors.phone ? "#EF4444" : COLORS.primaryRed} onBlur={e => e.target.style.borderColor = signupFieldErrors.phone ? "#EF4444" : "#eee"} />
                    {signupFieldErrors.phone && <p style={{ color: "#EF4444", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{signupFieldErrors.phone}</p>}
                  </div>
                  <div>
                    <input placeholder="E-posta *" type="email" value={signupForm.email} onChange={e => { setSignupForm(f => ({ ...f, email: e.target.value })); setSignupFieldErrors(fe => ({ ...fe, email: undefined })); }}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `2px solid ${signupFieldErrors.email ? "#EF4444" : "#eee"}`, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = signupFieldErrors.email ? "#EF4444" : COLORS.primaryRed} onBlur={e => e.target.style.borderColor = signupFieldErrors.email ? "#EF4444" : "#eee"} />
                    {signupFieldErrors.email && <p style={{ color: "#EF4444", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{signupFieldErrors.email}</p>}
                  </div>
                  <div>
                    <input placeholder="Şifre * (en az 4 karakter)" type="password" value={signupForm.password} onChange={e => { setSignupForm(f => ({ ...f, password: e.target.value })); setSignupFieldErrors(fe => ({ ...fe, password: undefined })); }}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `2px solid ${signupFieldErrors.password ? "#EF4444" : "#eee"}`, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = signupFieldErrors.password ? "#EF4444" : COLORS.primaryRed} onBlur={e => e.target.style.borderColor = signupFieldErrors.password ? "#EF4444" : "#eee"} />
                    {signupFieldErrors.password && <p style={{ color: "#EF4444", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{signupFieldErrors.password}</p>}
                  </div>
                  {signupStatus === "error" && signupError && <p style={{ color: COLORS.primaryRed, fontSize: 13, margin: 0, textAlign: "center" }}>{signupError}</p>}
                  <button onClick={handleSignup} disabled={signupStatus === "sending"} style={{
                    padding: 14, background: signupStatus === "sending" ? "#ccc" : COLORS.primaryRed,
                    color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700,
                    cursor: signupStatus === "sending" ? "not-allowed" : "pointer",
                  }}>{signupStatus === "sending" ? "Kaydediliyor..." : "Üye Ol"}</button>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "#eee" }} />
                    <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>veya</span>
                    <div style={{ flex: 1, height: 1, background: "#eee" }} />
                  </div>
                  <button onClick={triggerGoogleLogin} style={{
                    width: "100%", padding: 12, background: "#fff", border: "2px solid #eee", borderRadius: 8,
                    fontSize: 14, fontWeight: 700, color: "#333", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#4285F4"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#eee"}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    Google ile Kayıt Ol
                  </button>
                  <p style={{ textAlign: "center", fontSize: 13, color: "#999", margin: 0 }}>
                    Zaten üye misiniz? <button onClick={() => { setShowSignup(false); setShowLogin(true); }} style={{ background: "none", border: "none", color: COLORS.primaryBlue, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Giriş Yap</button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ GİRİŞ MODALI ═══════════════ */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => { setShowLogin(false); setLoginError(""); setLoginForm({ phone: "", password: "" }); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.lightPink, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <User size={24} color={COLORS.primaryRed} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: COLORS.darkText, margin: "0 0 4px" }}>Giriş Yap</h3>
              <p style={{ color: "#999", fontSize: 13, margin: 0 }}>Hesabınıza giriş yapın</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Telefon" value={loginForm.phone} onChange={e => setLoginForm(f => ({ ...f, phone: e.target.value }))}
                style={{ padding: "12px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = COLORS.primaryRed} onBlur={e => e.target.style.borderColor = "#eee"} />
              <input placeholder="Şifre" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ padding: "12px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = COLORS.primaryRed} onBlur={e => e.target.style.borderColor = "#eee"} />
              {loginError && <p style={{ color: COLORS.primaryRed, fontSize: 13, margin: 0, textAlign: "center" }}>{loginError}</p>}
              <button onClick={handleLogin} disabled={!loginForm.phone.trim() || !loginForm.password.trim()} style={{
                padding: 14, background: !loginForm.phone.trim() || !loginForm.password.trim() ? "#ddd" : COLORS.primaryRed,
                color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700,
                cursor: !loginForm.phone.trim() || !loginForm.password.trim() ? "not-allowed" : "pointer",
              }}>Giriş Yap</button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#eee" }} />
                <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>veya</span>
                <div style={{ flex: 1, height: 1, background: "#eee" }} />
              </div>
              <button onClick={triggerGoogleLogin} style={{
                width: "100%", padding: 12, background: "#fff", border: "2px solid #eee", borderRadius: 8,
                fontSize: 14, fontWeight: 700, color: "#333", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4285F4"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#eee"}
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Google ile Giriş Yap
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "#999", margin: 0 }}>
                Hesabınız yok mu? <button onClick={() => { setShowLogin(false); setShowSignup(true); }} style={{ background: "none", border: "none", color: COLORS.primaryRed, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Üye Ol</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TOAST BİLDİRİMİ ═══════════════ */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          zIndex: 2000,
          background: COLORS.green, color: "#fff",
          padding: "12px 24px", borderRadius: 8,
          fontSize: 13, fontWeight: 600,
          animation: "toastIn 0.3s ease",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(45,192,15,0.3)",
        }}>
          ✓ <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toast}</span> sepete eklendi
        </div>
      )}

      {/* ═══════════════ WHATSAPP BUTONU ═══════════════ */}
      <a
        href="https://wa.me/905385579081"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200,
          width: 56, height: 56, borderRadius: "50%",
          background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(37,211,102,0.4)", textDecoration: "none",
          animation: "pulse 2s infinite",
        }}
      >
        <MessageCircle size={26} color="#fff" fill="#fff" />
      </a>
    </>
  );
}
