import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2, Send } from "lucide-react";
import { formatPrice } from "../data/helpers";
import { supabase } from "../lib/supabase";

const ADMIN_WHATSAPP = "905385579081"; // Mağaza WhatsApp numarası

export default function CartPanel({ cart, onClose, onUpdate, onRemove, member }) {
  const [orderForm, setOrderForm] = useState(false);
  const [name, setName] = useState(member?.name || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = cart.reduce((s, i) => s + (i.sell_price || 0) * i.qty, 0);
  const memberDiscount = member ? subtotal * 0.10 : 0;
  const shipping = subtotal > 500 ? 0 : 29.9;
  const total = subtotal - memberDiscount + shipping;

  const handleOrder = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSending(true);

    const items = cart.map((i) => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      price: i.sell_price || 0,
    }));

    // Supabase orders tablosuna kaydet
    try {
      await supabase.from("orders").insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        items,
        total,
        note: note.trim() || null,
        status: "Bekliyor",
      });
    } catch (e) { /* tablo yoksa sessizce geç */ }

    // WhatsApp mesajı oluştur ve gönder
    const itemsText = cart
      .map((i) => `• ${i.name} x${i.qty} = ${formatPrice((i.sell_price || 0) * i.qty)}`)
      .join("\n");
    const msg = encodeURIComponent(
      `🛒 Yeni Sipariş!\n\n👤 ${name.trim()}\n📞 ${phone.trim()}${note.trim() ? `\n📝 ${note.trim()}` : ""}\n\n${itemsText}\n\n${shipping === 0 ? "🚚 Kargo: Ücretsiz" : `🚚 Kargo: ${formatPrice(shipping)}`}\n💰 Toplam: ${formatPrice(total)}`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, "_blank");

    setSending(false);
    setSuccess(true);
  };

  // ─── Başarı ekranı ───
  if (success) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "flex-end",
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", width: "100%", maxWidth: 420, height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 40, textAlign: "center",
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>
            Siparişiniz Alındı!
          </h3>
          <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24, lineHeight: 1.6 }}>
            Siparişiniz WhatsApp üzerinden iletildi.<br />
            En kısa sürede sizinle iletişime geçeceğiz.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: "14px 40px",
              background: "linear-gradient(135deg,#10B981,#06B6D4)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            Tamam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", width: "100%", maxWidth: 420,
          height: "100%", overflow: "auto",
          animation: "slideRight 0.3s ease-out",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* ─── Başlık ─── */}
        <div
          style={{
            position: "sticky", top: 0, background: "#fff", zIndex: 2,
            padding: "20px 24px", borderBottom: "1px solid #F1F5F9",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            {orderForm ? "📋 İletişim Bilgileri" : <><ShoppingCart size={22} /> Sepetim</>}
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            {orderForm && (
              <button
                onClick={() => setOrderForm(false)}
                style={{
                  background: "#F1F5F9", border: "none", borderRadius: 10,
                  padding: "8px 14px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: "#475569",
                }}
              >
                ← Geri
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "#F1F5F9", border: "none", borderRadius: 12,
                width: 40, height: 40,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ─── Boş sepet ─── */}
        {cart.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>Sepetiniz boş</p>
            <p style={{ fontSize: 13, color: "#94A3B8" }}>Ürünleri keşfetmeye başlayın!</p>
          </div>
        )}

        {/* ─── Sipariş Formu ─── */}
        {cart.length > 0 && orderForm && (
          <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
            {/* Sipariş özeti */}
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 10, textTransform: "uppercase" }}>
                Sipariş Özeti
              </p>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>{item.name} × {item.qty}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {formatPrice((item.sell_price || 0) * item.qty)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Toplam</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#0EA5E9" }}>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Form alanları */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Ad Soyad *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp / Telefon *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  type="tel"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
              <div>
                <label style={labelStyle}>Not (isteğe bağlı)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Özel istek veya not..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", height: "auto" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 16, textAlign: "center", lineHeight: 1.5 }}>
              📲 Siparişiniz WhatsApp üzerinden mağazamıza iletilecek.<br />
              Ödeme ve teslimat için sizinle iletişime geçeceğiz.
            </p>

            <button
              onClick={handleOrder}
              disabled={sending || !name.trim() || !phone.trim()}
              style={{
                width: "100%", padding: 16, marginTop: 16,
                background:
                  sending || !name.trim() || !phone.trim()
                    ? "#CBD5E1"
                    : "linear-gradient(135deg,#25D366,#128C7E)",
                color: "#fff", border: "none", borderRadius: 16,
                fontSize: 16, fontWeight: 700,
                cursor: sending || !name.trim() || !phone.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Send size={18} />
              {sending ? "Gönderiliyor..." : "WhatsApp ile Sipariş Ver"}
            </button>
          </div>
        )}

        {/* ─── Sepet Listesi ─── */}
        {cart.length > 0 && !orderForm && (
          <>
            <div style={{ padding: "16px 24px", flex: 1, overflowY: "auto" }}>
              {cart.map((item) => {
                const isUrl = item.img && item.img.startsWith("http");
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", gap: 14, padding: "16px 0",
                      borderBottom: "1px solid #F8FAFC", alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 56, height: 56, borderRadius: 14, background: "#F8FAFC",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 30, flexShrink: 0, overflow: "hidden",
                      }}
                    >
                      {isUrl ? (
                        <img
                          src={item.img}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        item.img || "📦"
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 700, color: "#1E293B", margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#0EA5E9", margin: "4px 0 0" }}>
                        {formatPrice((item.sell_price || 0) * item.qty)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => onUpdate(item.id, item.qty - 1)}
                        style={{
                          background: "#F1F5F9", border: "none", borderRadius: 8,
                          width: 30, height: 30,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center", fontSize: 14 }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onUpdate(item.id, item.qty + 1)}
                        style={{
                          background: "#F1F5F9", border: "none", borderRadius: 8,
                          width: 30, height: 30,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", padding: 4 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Toplam & Ödeme */}
            <div style={{
              background: "#fff", padding: "20px 24px", borderTop: "1px solid #F1F5F9",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#64748B", fontSize: 14 }}>Ara Toplam</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(subtotal)}</span>
              </div>
              {member && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#F59E0B", fontSize: 14, fontWeight: 600 }}>Üye İndirimi (%10)</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#F59E0B" }}>-{formatPrice(memberDiscount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#64748B", fontSize: 14 }}>Kargo</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#10B981" }}>
                  {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "2px solid #F1F5F9" }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Toplam</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#0EA5E9" }}>
                  {formatPrice(total)}
                </span>
              </div>
              <button
                onClick={() => setOrderForm(true)}
                style={{
                  width: "100%", padding: 16, marginTop: 16,
                  background: "linear-gradient(135deg,#10B981,#06B6D4)",
                  color: "#fff", border: "none", borderRadius: 16,
                  fontSize: 16, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                }}
              >
                Sipariş Ver →
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
                1250₺ üzeri siparişlerde ücretsiz kargo!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: "#475569", marginBottom: 6,
};

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "2px solid #E2E8F0", fontSize: 14, outline: "none",
  fontFamily: "inherit", background: "#F8FAFC", color: "#1E293B",
  boxSizing: "border-box", transition: "border-color 0.2s",
};
