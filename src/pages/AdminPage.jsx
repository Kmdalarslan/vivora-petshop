import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Edit2, Trash2, Save, X, Lock, Eye, EyeOff, Package, ShoppingBag, Check, Clock, Mail, Users, Copy, BookOpen, Truck, Search } from "lucide-react";

const ADMIN_PASSWORD = "kmd2025";

export default function AdminPage({ onProductsChange }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState("urunler"); // "urunler" | "siparisler" | "mesajlar" | "uyeler" | "blog"

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productSearch, setProductSearch] = useState("");
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
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [memberEditing, setMemberEditing] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberDeleteConfirm, setMemberDeleteConfirm] = useState(null);

  // Blog state
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogEditing, setBlogEditing] = useState(null); // null | "new" | post object
  const [blogForm, setBlogForm] = useState({ title: "", summary: "", content: "", category: "", image: "" });
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogDeleteConfirm, setBlogDeleteConfirm] = useState(null);

  const emptyForm = {
    name: "", sell_price: "", buy_price: "", old_price: "",
    stock: "", category_id: "", img: "", description: "", badge: "", barcode: "",
    free_shipping: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (authed) { fetchData(); fetchOrders(); fetchMessages(); fetchMembers(); fetchBlogPosts(); }
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

  const fetchMessages = async () => {
    setMessagesLoading(true);
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
    setMessagesLoading(false);
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (data) setMembers(data);
    setMembersLoading(false);
  };

  const copyAllEmails = () => {
    const emails = members.filter(m => m.email).map(m => m.email).join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  const sendMailToAll = () => {
    const emails = members.filter(m => m.email).map(m => m.email).join(",");
    window.open(`mailto:${emails}?subject=Vivora Petshop&body=Merhaba değerli müşterimiz,`);
  };

  const openMemberEdit = (m) => {
    setMemberForm({ name: m.name || "", phone: m.phone || "", email: m.email || "", password: m.password || "" });
    setMemberEditing(m);
  };

  const closeMemberEdit = () => {
    setMemberEditing(null);
    setMemberForm({ name: "", phone: "", email: "", password: "" });
  };

  const handleMemberSave = async () => {
    if (!memberForm.name.trim() || !memberForm.phone.trim()) return;
    setMemberSaving(true);
    await supabase.from("members").update({
      name: memberForm.name.trim(),
      phone: memberForm.phone.trim(),
      email: memberForm.email.trim() || null,
      password: memberForm.password.trim() || null,
    }).eq("id", memberEditing.id);
    await fetchMembers();
    setMemberSaving(false);
    closeMemberEdit();
  };

  const handleMemberDelete = async (id) => {
    await supabase.from("members").delete().eq("id", id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMemberDeleteConfirm(null);
  };

  // Blog functions
  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setBlogPosts(data);
    setBlogLoading(false);
  };

  const openBlogNew = () => {
    setBlogForm({ title: "", summary: "", content: "", category: "", image: "" });
    setBlogEditing("new");
  };

  const openBlogEdit = (post) => {
    setBlogForm({
      title: post.title || "",
      summary: post.summary || "",
      content: post.content || "",
      category: post.category || "",
      image: post.image || "",
    });
    setBlogEditing(post);
  };

  const closeBlogEdit = () => {
    setBlogEditing(null);
    setBlogForm({ title: "", summary: "", content: "", category: "", image: "" });
  };

  const handleBlogSave = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) return;
    setBlogSaving(true);
    const payload = {
      title: blogForm.title.trim(),
      summary: blogForm.summary.trim() || null,
      content: blogForm.content.trim(),
      category: blogForm.category.trim() || null,
      image: blogForm.image.trim() || null,
    };
    if (blogEditing === "new") {
      await supabase.from("blog_posts").insert(payload);
    } else {
      await supabase.from("blog_posts").update(payload).eq("id", blogEditing.id);
    }
    await fetchBlogPosts();
    onProductsChange?.();
    setBlogSaving(false);
    closeBlogEdit();
  };

  const handleBlogDelete = async (id) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    await fetchBlogPosts();
    setBlogDeleteConfirm(null);
  };

  const deleteMessage = async (id) => {
    await supabase.from("messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const markMessageRead = async (id) => {
    await supabase.from("messages").update({ is_read: true }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
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
      old_price: product.old_price || "",
      stock: product.stock || "",
      category_id: product.category_id || "",
      img: product.img || "",
      description: product.description || "",
      badge: product.badge || "",
      barcode: product.barcode || "",
      free_shipping: product.free_shipping !== false,
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
      old_price: parseFloat(form.old_price) || null,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      img: form.img.trim() || null,
      description: form.description.trim() || null,
      badge: form.badge.trim() || null,
      barcode: form.barcode.trim() || null,
      free_shipping: form.free_shipping,
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
      {/* Stok Yönetimi Linki */}
      <a href="/stok/" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 0", borderRadius: 12, marginBottom: 12,
        background: "linear-gradient(135deg,#1E293B,#334155)",
        color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14,
      }}>
        <Package size={16} /> Stok Yönetim Paneli
      </a>

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
        <button
          onClick={() => { setActiveTab("mesajlar"); fetchMessages(); }}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 14,
            background: activeTab === "mesajlar" ? "linear-gradient(135deg,#F59E0B,#EF4444)" : "#F1F5F9",
            color: activeTab === "mesajlar" ? "#fff" : "#64748B",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            position: "relative",
          }}
        >
          <Mail size={16} /> Mesajlar
          {messages.length > 0 && (
            <span style={{
              background: "#EF4444", color: "#fff", borderRadius: "50%",
              width: 18, height: 18, fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {messages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("uyeler"); fetchMembers(); }}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 14,
            background: activeTab === "uyeler" ? "linear-gradient(135deg,#8B5CF6,#EC4899)" : "#F1F5F9",
            color: activeTab === "uyeler" ? "#fff" : "#64748B",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Users size={16} /> Üyeler
          {members.length > 0 && (
            <span style={{
              background: "#8B5CF6", color: "#fff", borderRadius: "50%",
              width: 18, height: 18, fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {members.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("blog"); fetchBlogPosts(); }}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 14,
            background: activeTab === "blog" ? "linear-gradient(135deg,#10B981,#0EA5E9)" : "#F1F5F9",
            color: activeTab === "blog" ? "#fff" : "#64748B",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <BookOpen size={16} /> Blog
          {blogPosts.length > 0 && (
            <span style={{
              background: "#10B981", color: "#fff", borderRadius: "50%",
              width: 18, height: 18, fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {blogPosts.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── ÜYELER SEKMESİ ─── */}
      {activeTab === "uyeler" && (
        <div>
          {/* Üst Aksiyon Bar */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap",
          }}>
            <button onClick={copyAllEmails} style={{
              flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13,
              background: copiedEmails ? "#D1FAE5" : "linear-gradient(135deg,#8B5CF6,#EC4899)",
              color: copiedEmails ? "#059669" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <Copy size={15} /> {copiedEmails ? "Kopyalandı!" : "Tüm Mailleri Kopyala"}
            </button>
            <button onClick={sendMailToAll} style={{
              flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13,
              background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Mail size={15} /> Hepsine Mail At
            </button>
          </div>

          {/* Üye Sayısı */}
          <div style={{
            background: "linear-gradient(135deg,#8B5CF6,#EC4899)", borderRadius: 14,
            padding: "14px 18px", marginBottom: 16, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Toplam Üye</span>
            <span style={{ fontWeight: 900, fontSize: 22 }}>{members.length}</span>
          </div>

          {membersLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Yükleniyor...</div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Henüz üye yok</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {members.map((m) => (
                <div key={m.id} style={{
                  background: "rgba(255,255,255,0.9)", borderRadius: 16, padding: "14px 16px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 16,
                  }}>
                    {m.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", margin: 0 }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: "#0EA5E9", margin: "2px 0 0", fontWeight: 600 }}>
                      {m.email || "E-posta yok"}
                    </p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>
                      {m.phone} · {m.created_at ? new Date(m.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {m.email && (
                      <a href={`mailto:${m.email}`} style={{
                        background: "#EFF6FF", border: "none", borderRadius: 10,
                        width: 36, height: 36, display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", textDecoration: "none",
                      }}>
                        <Mail size={15} color="#3B82F6" />
                      </a>
                    )}
                    <a href={`https://wa.me/${m.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{
                      background: "#D1FAE5", border: "none", borderRadius: 10,
                      width: 36, height: 36, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", textDecoration: "none",
                      fontSize: 16,
                    }}>
                      💬
                    </a>
                    <button onClick={() => openMemberEdit(m)} style={{
                      background: "#FFF7ED", border: "none", borderRadius: 10,
                      width: 36, height: 36, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer",
                    }}>
                      <Edit2 size={15} color="#F59E0B" />
                    </button>
                    <button onClick={() => setMemberDeleteConfirm(m)} style={{
                      background: "#FEF2F2", border: "none", borderRadius: 10,
                      width: 36, height: 36, display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer",
                    }}>
                      <Trash2 size={15} color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── ÜYE DÜZENLEME MODALI ─── */}
      {memberEditing && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end",
        }} onClick={(e) => e.target === e.currentTarget && closeMemberEdit()}>
          <div style={{
            background: "#fff", borderRadius: "24px 24px 0 0",
            width: "100%", maxWidth: 500, margin: "0 auto",
            padding: 24, maxHeight: "80vh", overflowY: "auto",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>Üye Düzenle</h3>
              <button onClick={closeMemberEdit} style={{
                background: "#F1F5F9", border: "none", borderRadius: 10,
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <X size={18} color="#475569" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Ad Soyad *</label>
                <input style={inputStyle} placeholder="Ad Soyad" value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Telefon *</label>
                <input style={inputStyle} placeholder="05XX XXX XX XX" value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>E-posta</label>
                <input style={inputStyle} placeholder="ornek@mail.com" value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Şifre</label>
                <input style={inputStyle} placeholder="Yeni şifre (boş bırakılabilir)" value={memberForm.password}
                  onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} />
              </div>
            </div>
            <button onClick={handleMemberSave} disabled={memberSaving || !memberForm.name.trim() || !memberForm.phone.trim()} style={{
              width: "100%", padding: "15px",
              background: memberSaving || !memberForm.name.trim() || !memberForm.phone.trim() ? "#CBD5E1" : "linear-gradient(135deg,#8B5CF6,#EC4899)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: memberSaving ? "not-allowed" : "pointer",
              marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Save size={18} /> {memberSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ─── ÜYE SİLME ONAYI ─── */}
      {memberDeleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 320, animation: "fadeIn 0.2s ease" }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>Üyeyi sil?</h3>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>
              <strong>{memberDeleteConfirm.name}</strong> ({memberDeleteConfirm.phone}) silinecek. Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setMemberDeleteConfirm(null)} style={{
                flex: 1, padding: 12, background: "#F1F5F9", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14,
              }}>İptal</button>
              <button onClick={() => handleMemberDelete(memberDeleteConfirm.id)} style={{
                flex: 1, padding: 12, background: "#EF4444", border: "none", borderRadius: 12, cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14,
              }}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MESAJLAR SEKMESİ ─── */}
      {activeTab === "mesajlar" && (
        <div>
          {messagesLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Yükleniyor...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Henüz mesaj yok</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m) => (
                <div key={m.id} style={{
                  background: m.is_read ? "rgba(255,255,255,0.9)" : "rgba(14,165,233,0.05)", borderRadius: 16, padding: 16,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: m.is_read ? "1px solid #F1F5F9" : "2px solid rgba(14,165,233,0.3)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1E293B" }}>{m.name}</p>
                        {!m.is_read && <span style={{ background: "#0EA5E9", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6 }}>Yeni</span>}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>
                        {m.email && `${m.email} · `}{m.phone && `${m.phone} · `}
                        {new Date(m.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!m.is_read && (
                        <button onClick={() => markMessageRead(m.id)} style={{
                          background: "#D1FAE5", border: "none", borderRadius: 8,
                          padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#059669",
                        }}>
                          Okundu
                        </button>
                      )}
                      <button onClick={() => deleteMessage(m.id)} style={{
                        background: "#FEE2E2", border: "none", borderRadius: 8,
                        width: 32, height: 32, cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* ─── BLOG SEKMESİ ─── */}
      {activeTab === "blog" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>Blog Yönetimi</h2>
              <p style={{ fontSize: 12, color: "#64748B" }}>{blogPosts.length} yazı</p>
            </div>
            <button onClick={openBlogNew} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg,#10B981,#0EA5E9)",
              border: "none", borderRadius: 12, color: "#fff",
              padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              <Plus size={16} /> Yeni Yazı
            </button>
          </div>

          {blogLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Yükleniyor...</div>
          ) : blogPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Henüz blog yazısı yok</p>
              <button onClick={openBlogNew} style={{
                marginTop: 12, padding: "10px 24px", background: "linear-gradient(135deg,#10B981,#0EA5E9)",
                color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer",
              }}>İlk Yazını Ekle</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {blogPosts.map((post) => (
                <div key={post.id} style={{
                  background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)",
                  borderRadius: 16, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,#E0F7FA,#FFF8E1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, overflow: "hidden",
                  }}>
                    {post.image ? (
                      <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.style.display = "none"; }} />
                    ) : "📝"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {post.title}
                    </p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>
                      {post.category || "Genel"} · {new Date(post.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => openBlogEdit(post)} style={{
                      background: "#EFF6FF", border: "none", borderRadius: 10,
                      width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <Edit2 size={15} color="#3B82F6" />
                    </button>
                    <button onClick={() => setBlogDeleteConfirm(post)} style={{
                      background: "#FEF2F2", border: "none", borderRadius: 10,
                      width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <Trash2 size={15} color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── BLOG DÜZENLEME MODALI ─── */}
      {blogEditing !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end",
        }} onClick={(e) => e.target === e.currentTarget && closeBlogEdit()}>
          <div style={{
            background: "#fff", borderRadius: "24px 24px 0 0",
            width: "100%", maxWidth: 768, margin: "0 auto",
            padding: 24, maxHeight: "90vh", overflowY: "auto",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
                {blogEditing === "new" ? "Yeni Blog Yazısı" : "Yazıyı Düzenle"}
              </h3>
              <button onClick={closeBlogEdit} style={{
                background: "#F1F5F9", border: "none", borderRadius: 10,
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <X size={18} color="#475569" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Başlık *</label>
                <input style={inputStyle} placeholder="Blog başlığı" value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Kategori</label>
                <input style={inputStyle} placeholder="Örn: Balık Bakımı, Kedi Sağlığı..." value={blogForm.category}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Özet</label>
                <input style={inputStyle} placeholder="Kısa açıklama (ana sayfada görünür)" value={blogForm.summary}
                  onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Görsel URL</label>
                <input style={inputStyle} placeholder="https://..." value={blogForm.image}
                  onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>İçerik *</label>
                <textarea style={{ ...inputStyle, height: 200, resize: "vertical" }} placeholder="Blog içeriğini buraya yazın..."
                  value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} />
              </div>
            </div>
            <button onClick={handleBlogSave} disabled={blogSaving || !blogForm.title.trim() || !blogForm.content.trim()} style={{
              width: "100%", padding: "15px",
              background: blogSaving || !blogForm.title.trim() || !blogForm.content.trim() ? "#CBD5E1" : "linear-gradient(135deg,#10B981,#0EA5E9)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: blogSaving ? "not-allowed" : "pointer",
              marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Save size={18} /> {blogSaving ? "Kaydediliyor..." : "Yayınla"}
            </button>
          </div>
        </div>
      )}

      {/* ─── BLOG SİLME ONAYI ─── */}
      {blogDeleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 320, animation: "fadeIn 0.2s ease" }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>Yazıyı sil?</h3>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>
              <strong>{blogDeleteConfirm.title}</strong> silinecek. Bu işlem geri alınamaz.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setBlogDeleteConfirm(null)} style={{
                flex: 1, padding: 12, background: "#F1F5F9", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14,
              }}>İptal</button>
              <button onClick={() => handleBlogDelete(blogDeleteConfirm.id)} style={{
                flex: 1, padding: 12, background: "#EF4444", border: "none", borderRadius: 12, cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14,
              }}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ÜRÜNLER SEKMESİ BAŞLIK ─── */}
      {activeTab === "urunler" && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
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
        <div style={{ position: "relative" }}>
          <Search size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            placeholder="Ürün ara..."
            style={{
              width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10,
              border: "2px solid #E2E8F0", fontSize: 14, outline: "none",
              fontFamily: "inherit", background: "#F8FAFC", color: "#1E293B",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#0EA5E9"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
          {productSearch && (
            <button onClick={() => setProductSearch("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center",
            }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      )}

      {/* Ürün Listesi */}
      {activeTab === "urunler" && (loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Yükleniyor...</div>
      ) : (() => {
        const filteredProducts = productSearch.trim()
          ? products.filter(p => (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) || (p.barcode || "").includes(productSearch))
          : products;
        return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {productSearch && <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 4px" }}>{filteredProducts.length} sonuç bulundu</p>}
          {filteredProducts.map((p) => (
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
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
                  {p.free_shipping !== false && <span style={{ color: "#10B981", fontWeight: 700 }}> · 🚚 Ücretsiz Kargo</span>}
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
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
              <p style={{ fontWeight: 600, color: "#64748B" }}>"{productSearch}" için sonuç bulunamadı</p>
            </div>
          )}
        </div>
        );
      })())}

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
                        style={{ width: "100%", height: 180, objectFit: "contain", display: "block", background: "#fafafa" }}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
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
                  <label style={labelStyle}>Eski Fiyat (TL)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    placeholder="İndirim varsa eski fiyat"
                    value={form.old_price}
                    onChange={(e) => setForm({ ...form, old_price: e.target.value })}
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
                  <option value="Kampanya">Kampanya</option>
                  <option value="Öne Çıkan">Öne Çıkan</option>
                  <option value="Yeni">Yeni</option>
                  <option value="Çok Satan">Çok Satan</option>
                  <option value="Premium">Premium</option>
                  <option value="İndirim">İndirim</option>
                </select>
              </div>

              {/* Ücretsiz Kargo */}
              <div>
                <label style={labelStyle}>Kargo Seçeneği</label>
                <div
                  onClick={() => setForm({ ...form, free_shipping: !form.free_shipping })}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12,
                    border: `2px solid ${form.free_shipping ? "#10B981" : "#E2E8F0"}`,
                    background: form.free_shipping ? "#F0FDF4" : "#F8FAFC",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: form.free_shipping ? "#10B981" : "#CBD5E1",
                    position: "relative", transition: "background 0.2s",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#fff", position: "absolute",
                      top: 2, left: form.free_shipping ? 22 : 2,
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: form.free_shipping ? "#059669" : "#64748B" }}>
                      <Truck size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                      1250₺ Üzeri Ücretsiz Kargo
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>
                      {form.free_shipping
                        ? "Bu ürün 1250₺ üzeri siparişlerde ücretsiz kargoya dahildir"
                        : "Bu ürün ücretsiz kargo kapsamında değildir (örn: mamalar)"}
                    </p>
                  </div>
                </div>
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
