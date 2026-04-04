import { useState } from "react";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const contactInfo = [
    { icon: <Phone size={18} />, label: "Telefon", value: "+90 555 123 4567", color: "#10B981" },
    { icon: <MapPin size={18} />, label: "Adres", value: "Ataşehir, İstanbul", color: "#0EA5E9" },
    { icon: <Clock size={18} />, label: "Çalışma Saatleri", value: "Her gün 09:00 - 21:00", color: "#F59E0B" },
    { icon: <MessageCircle size={18} />, label: "WhatsApp", value: "+90 555 123 4567", color: "#25D366" },
  ];

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
                width: 42, height: 42, borderRadius: 12,
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
            {["Ad Soyad", "E-posta", "Telefon"].map((ph, i) => (
              <input
                key={i}
                placeholder={ph}
                style={{
                  padding: "14px 16px", borderRadius: 12,
                  border: "2px solid #F1F5F9", fontSize: 14,
                  outline: "none", transition: "border 0.2s", fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
                onBlur={(e) => (e.target.style.borderColor = "#F1F5F9")}
              />
            ))}
            <textarea
              placeholder="Mesajınız..."
              rows={4}
              style={{
                padding: "14px 16px", borderRadius: 12,
                border: "2px solid #F1F5F9", fontSize: 14,
                outline: "none", resize: "vertical", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0EA5E9")}
              onBlur={(e) => (e.target.style.borderColor = "#F1F5F9")}
            />
            <button
              onClick={() => setSent(true)}
              style={{
                padding: 16,
                background: "linear-gradient(135deg,#0EA5E9,#06B6D4)",
                color: "#fff", border: "none", borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 6px 20px rgba(14,165,233,0.25)",
              }}
            >
              Gönder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
