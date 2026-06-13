import { useState } from "react";
import { MapPin, Clock, MessageCircle, Navigation } from "lucide-react";
import { supabase } from "../lib/supabase";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Yunus+Emre+Mahallesi+Karadeniz+Caddesi+Hilal+Sitesi+No+11+B+Kocasinan+Kayseri";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [error, setError] = useState("");

  const contactInfo = [
    { icon: <MapPin size={18} />, label: "Adres", value: "Yunus Emre Mah. Karadeniz Cad. Hilal Sitesi No:11/B, Kocasinan / Kayseri", color: "#0EA5E9" },
    { icon: <Clock size={18} />, label: "Çalışma Saatleri", value: "Her gün 09:00 - 21:00", color: "#F59E0B" },
    { icon: <MessageCircle size={18} />, label: "WhatsApp", value: "+90 538 557 9081", color: "#25D366" },
  ];

  const handleSend = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError("Ad ve mesaj alanları zorunludur.");
      return;
    }
    setError("");
    setSending(true);
    const { error: dbError } = await supabase
      .from("messages")
      .insert([{ name: form.name, email: form.email, phone: form.phone, message: form.message }]);
    setSending(false);
    if (dbError) {
      setError("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      return;
    }
    setSent(true);
  };

  return (
    <div style={{ padding: "16px 20px 40px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📬</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", margin: 0 }}>İletişim</h2>
      </div>

      {/* ─── İletişim Bilgileri ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {contactInfo.map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.9)", borderRadius: 16,
              padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: item.color + "15",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.color,
              }}
            >
              {item.icon}
            </div>
            <div>
              <p style={{
                fontSize: 11, color: "#94A3B8", margin: 0,
                fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
              }}>
                {item.label}
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", margin: "2px 0 0" }}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Harita ─── */}
      <div style={{
        background: "rgba(255,255,255,0.9)", borderRadius: 18, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        marginBottom: 28,
      }}>
        <div style={{ width: "100%", height: 200 }}>
          <iframe
            title="Vivora Petshop Konum"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3108.5!2d35.51!3d38.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQzJzEyLjAiTiAzNcKwMzAnMzYuMCJF!5e0!3m2!1str!2str!4v1"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", margin: 0 }}>Vivora Petshop</p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg,#0EA5E9,#06B6D4)",
              color: "#fff", padding: "8px 16px", borderRadius: 10,
              fontSize: 12, fontWeight: 700, textDecoration: "none",
            }}
          >
            <Navigation size={14} /> Yol Tarifi Al
          </a>
        </div>
      </div>

      {/* ─── İletişim Formu ─── */}
      <div style={{
        background: "rgba(255,255,255,0.9)", borderRadius: 20,
        padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Bize Mesaj Gönderin</h3>

        {sent ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <p style={{ fontWeight: 700, color: "#10B981" }}>
              Mesajınız alındı! En kısa sürede dönüş yapacağız.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              placeholder="Ad Soyad *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #F1F5F9", fontSize: 14,
                outline: "none", transition: "border 0.2s", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
              onBlur={(e) => (e.target.style.borderColor = "#F1F5F9")}
            />
            <input
              placeholder="E-posta"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #F1F5F9", fontSize: 14,
                outline: "none", transition: "border 0.2s", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
              onBlur={(e) => (e.target.style.borderColor = "#F1F5F9")}
            />
            <input
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #F1F5F9", fontSize: 14,
                outline: "none", transition: "border 0.2s", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
              onBlur={(e) => (e.target.style.borderColor = "#F1F5F9")}
            />
            <textarea
              placeholder="Mesajınız... *"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #F1F5F9", fontSize: 14,
                outline: "none", resize: "vertical", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
              onBlur={(e) => (e.target.style.borderColor = "#F1F5F9")}
            />
            {error && (
              <p style={{ color: "#EF4444", fontSize: 13, margin: 0, textAlign: "center" }}>{error}</p>
            )}
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: 16,
                background: sending ? "#94A3B8" : "linear-gradient(135deg,#0EA5E9,#06B6D4)",
                color: "#fff", border: "none", borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(14,165,233,0.25)",
              }}
            >
              {sending ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
