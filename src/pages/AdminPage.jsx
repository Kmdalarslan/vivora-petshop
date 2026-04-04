import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Edit2, Trash2, Save, X, Lock, Eye, EyeOff, Package, ShoppingBag, Check, Clock } from "lucide-react";

const ADMIN_PASSWORD = "vivora2024";

export default function AdminPage({ onProductsChange }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState("urunler"); // "urunler" | "siparisler"

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | product object
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filename, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename);
    return urlData.publicUrl;
  };

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const emptyForm = {
    name: "", sell_price: "", buy_price: "",
    stock: "", category_id: "", img: "", description: "", badge: "", barcode: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (authed) { fetchData(); fetchOrders(); }
  }, [authed]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("id"),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
    setLoading(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
    setOrdersLoading(false);
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      sell_price: product.sell_price || "",
      buy_price: product.buy_price || "",
      stock: product.stock || "",
      category_id: product.category_id || "",
      img: product.img || "",
      description: product.description || "",
      badge: product.badge || "",
      barcode: product.barcode || "",
    });
    setEditing(product);
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditing("new");
  };

  const closeEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      sell_price: parseFloat(form.sell_price) || 0,
      buy_price: parseFloat(form.buy_price) || 0,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      img: form.img.trim() || null,
      description: form.description.trim() || null,
      badge: form.badge.trim() || null,
      barcode: form.barcode.trim() || null,
    };

    if (editing === "new") {
      await supabase.from("products").insert(payload);
    } else {
      await supabase.from("products").update(payload).eq("id", editing.id);
    }

    await fetchData();
    onProductsChange?.();
    setSaving(false);
    closeEdit();
  };

  const handleDelete = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    await fetchData();
    onProductsChange?.();
    setDeleteConfirm(null);
  };

  const getCatName = (id) => categories.find((c) => c.id === id)?.name || "-";

  // ─── Login Ekranı ───
  if (!authed) {
    return (
      <div style={{
        minHeight: "80vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
          borderRadius: 24, padding: 40, width: "100%", maxWidth: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Lock size={24} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1E293B" }}>Admin Paneli</h2>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Devam etmek için şifreyi girin</p>
          </div>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Şifre"
              style={{
                width: "100%", padding: "14px 48px 14px 16px",
                borderRadius: 14, border: `2px solid ${pwError ? "#EF4444" : "#E2E8F0"}`,
                fontSize: 15, outline: "none", fontFamily: "inherit",
                background: "#F8FAFC",
              }}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#94A3B8",
                display: "flex", alignItems: "center",
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {pwError && (
            <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>Yanlış şifre</p>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  // ─── Admin Paneli ───
  return (
    <div style={{ padding: 16, animation: "fadeIn 0.3s ease" }}>
      {/* Sekmeler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("urunler")}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 14,
            background: activeTab === "urunler" ? "linear-gradient(135deg,#0EA5E9,#6366F1)" : "#F1F5F9",
            color: activeTab === "urunler" ? "#fff" : "#64748B",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Package size={16} /> Ürünler
        </button>
        <button
          onClick={() => { setActiveTab("siparisler"); fetchOrders(); }}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 14,
            background: activeTab === "siparisler" ? "linear-gradient(135deg,#10B981,#06B6D4)" : "#F1F5F9",
            color: activeTab === "siparisler" ? "#fff" : "#64748B",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            position: "relative",
          }}
        >
          <ShoppingBag size={16} /> Siparişler
          {orders.filter((o) => o.status === "Bekliyor").length > 0 && (
            <span style={{
              background: "#EF4444", color: "#fff", borderRadius: "50%",
              width: 18, height: 18, fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {orders.filter((o) => o.status === "Bekliyor").length}
            </span>
          )}
        </button>
      </div>

      {/* ─── SİPARİŞLER SEKMESİ ─── */}
      {activeTab === "siparisler" && (
        <div>
          {ordersLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Yükleniyor...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Henüz sipariş yok</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((order) => {
                const isPending = order.status === "Bekliyor";
                const itemsArr = Array.isArray(order.items) ? order.items : [];
                return (
                  <div key={order.id} style={{
                    background: "rgba(255,255,255,0.9)", borderRadius: 16, padding: "16px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    border: `2px solid ${isPending ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.3)"}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 15, color: "#1E293B", margin: 0 }}>
                          👤 {order.customer_name}
                        </p>
                        <p style={{ fontSize: 13, color: "#0EA5E9", margin: "2px 0 0", fontWeight: 600 }}>
                          📞 {order.customer_phone}
                        </p>
                        <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>
                          {new Date(order.created_at).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: isPending ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                        color: isPending ? "#D97706" : "#059669",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {isPending ? <Clock size={11} /> : <Check size={11} />}
                        {order.status}
                      </span>
                    </div>

                    <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                      {itemsArr.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span style={{ fontSize: 13, color: "#475569" }}>{item.name} × {item.qty}</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {((item.price || 0) * item.qty).toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                      ))}
                      {order.note && (
                        <p style={{ fontSize: 12, color: "#64748B", marginTop: 6, paddingTop: 6, borderTop: "1px solid #E2E8F0", margin: "6px 0 0" }}>
                          📝 {order.note}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: "#0EA5E9" }}>
                        💰 {(order.total || 0).toLocaleString("tr-TR")} ₺
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          href={`https://wa.me/${order.customer_phone?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "7px 12px", borderRadius: 9, border: "none",
                            background: "#25D366", color: "#fff",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                          }}
                        >
                          💬 WhatsApp
                        </a>
                        {isPending ? (
                          <button
                            onClick={() => updateOrderStatus(order.id, "Tamamlandı")}
                            style={{
                              padding: "7px 12px", borderRadius: 9, border: "none",
                              background: "rgba(16,185,129,0.15)", color: "#059669",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <Check size={13} /> Tamamla
                          </button>
                        ) : (
                          <button
                            onClick={() => updateOrderStatus(order.id, "Bekliyor")}
                            style={{
                              padding: "7px 12px", borderRadius: 9, border: "none",
                              background: "rgba(245,158,11,0.12)", color: "#D97706",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            Bekliyor'a Al
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ÜRÜNLER SEKMESİ BAŞLIK ─── */}
      {activeTab === "urunler" && (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>Ürün Yönetimi</h2>
          <p style={{ fontSize: 12, color: "#64748B" }}>{products.length} ürün</p>
        </div>
        <button
          onClick={openNew}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
            border: "none", borderRadius: 12, color: "#fff",
            padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>
      )}

      {/* Ürün Listesi */}
      {activeTab === "urunler" && (loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Yükleniyor...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((p) => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)",
              borderRadius: 16, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              {/* Resim veya placeholder */}
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: "#F1F5F9", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
              }}>
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : "📦"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 700, fontSize: 14, color: "#1E293B",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {p.name}
                </p>
                <p style={{ fontSize: 12, color: "#64748B" }}>
                  {getCatName(p.category_id)} · {p.sell_price} TL · Stok: {p.stock}
                </p>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(p)}
                  style={{
                    background: "#EFF6FF", border: "none", borderRadius: 10,
                    width: 36, height: 36, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <Edit2 size={15} color="#3B82F6" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(p)}
                  style={{
                    background: "#FEF2F2", border: "none", borderRadius: 10,
                    width: 36, height: 36, display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <Trash2 size={15} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* ─── Düzenleme Modal ─── */}
      {editing !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end",
        }}
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div style={{
            background: "#fff", borderRadius: "24px 24px 0 0",
            width: "100%", maxWidth: 768, margin: "0 auto",
            padding: 24, maxHeight: "90vh", overflowY: "auto",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
                {editing === "new" ? "Yeni Ürün Ekle" : "Ürünü Düzenle"}
              </h3>
              <button onClick={closeEdit} style={{
                background: "#F1F5F9", border: "none", borderRadius: 10,
                width: 36, height: 36, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}>
                <X size={18} color="#475569" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Resim Yükleme */}
              <div>
                <label style={labelStyle}>Ürün Resmi</label>
                <input
                  id="img-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImg(true);
                    try {
                      const url = await uploadImage(file);
                      setForm((f) => ({ ...f, img: url }));
                    } catch (err) {
                      alert("Yükleme başarısız: " + err.message + "\n\nSupabase Storage'da 'product-images' bucket'ı oluşturmanız gerekiyor.");
                    }
                    setUploadingImg(false);
                    e.target.value = "";
                  }}
                />
                {/* Yükleme alanı */}
                <div
                  onClick={() => document.getElementById("img-file-input").click()}
                  style={{
                    width: "100%", borderRadius: 14,
                    border: "2px dashed #E2E8F0", cursor: "pointer",
                    overflow: "hidden", position: "relative",
                    background: "#F8FAFC", transition: "border-color 0.2s",
                    minHeight: form.img ? "auto" : 120,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0EA5E9")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
                >
                  {uploadingImg ? (
                    <div style={{ padding: 32, textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                      <p style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Yükleniyor...</p>
                    </div>
                  ) : form.img ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <img
                        src={form.img}
                        alt=""
                        style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        transition: "background 0.2s",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.35)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0)")}
                      >
                        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, opacity: 0, transition: "opacity 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                        >
                          🖼 Değiştir
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 32, textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 2 }}>Resim yükle</p>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>Tıkla veya seç</p>
                    </div>
                  )}
                </div>
                {/* Resmi kaldır */}
                {form.img && !uploadingImg && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, img: "" })); }}
                    style={{
                      marginTop: 6, background: "none", border: "none",
                      color: "#EF4444", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", padding: 0,
                    }}
                  >
                    ✕ Resmi kaldır
                  </button>
                )}
              </div>

              {/* Ürün Adı */}
              <div>
                <label style={labelStyle}>Ürün Adı *</label>
                <input
                  style={inputStyle}
                  placeholder="Ürün adı"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Fiyatlar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Satış Fiyatı (TL)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="0"
                    value={form.sell_price}
                    onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Alış Fiyatı (TL)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="0"
                    value={form.buy_price}
                    onChange={(e) => setForm({ ...form, buy_price: e.target.value })}
                  />
                </div>
              </div>

              {/* Stok & Kategori */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Stok</label>
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  >
                    <option value="">Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Barkod */}
              <div>
                <label style={labelStyle}>Barkod</label>
                <input
                  style={inputStyle}
                  placeholder="Barkod numarası"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                />
              </div>

              {/* Rozet */}
              <div>
                <label style={labelStyle}>Rozet</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                >
                  <option value="">Yok</option>
                  <option value="Çok Satan">Çok Satan</option>
                  <option value="Yeni">Yeni</option>
                  <option value="Premium">Premium</option>
                  <option value="İndirim">İndirim</option>
                </select>
              </div>

              {/* Açıklama */}
              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea
                  style={{ ...inputStyle, height: 80, resize: "vertical" }}
                  placeholder="Ürün açıklaması..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              style={{
                width: "100%", padding: "15px",
                background: saving || !form.name.trim()
                  ? "#CBD5E1"
                  : "linear-gradient(135deg,#0EA5E9,#6366F1)",
                border: "none", borderRadius: 14, color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                marginTop: 20, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              <Save size={18} />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Silme Onayı ─── */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 320,
            animation: "fadeIn 0.2s ease",
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>
              Ürünü sil?
            </h3>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>
              <strong>{deleteConfirm.name}</strong> silinecek. Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: 12, background: "#F1F5F9",
                  border: "none", borderRadius: 12, cursor: "pointer",
                  fontWeight: 700, fontSize: 14,
                }}
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                style={{
                  flex: 1, padding: 12, background: "#EF4444",
                  border: "none", borderRadius: 12, cursor: "pointer",
                  color: "#fff", fontWeight: 700, fontSize: 14,
                }}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
};

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "2px solid #E2E8F0", fontSize: 14, outline: "none",
  fontFamily: "inherit", background: "#F8FAFC", color: "#1E293B",
};
