export default function AboutPage() {
  const features = [
    {
      icon: "🐠",
      title: "Uzman Kadro",
      desc: "Akvaryum ve evcil hayvan konusunda 10+ yıl deneyimli ekibimizle yanınızdayız.",
    },
    {
      icon: "🚚",
      title: "Hızlı Teslimat",
      desc: "Siparişleriniz özenle paketlenir, canlı hayvanlarda özel taşıma uygulanır.",
    },
    {
      icon: "💎",
      title: "Kalite Garantisi",
      desc: "Tüm ürünlerimiz orijinaldir. Canlı hayvanlarda sağlık garantisi sunuyoruz.",
    },
    {
      icon: "🤝",
      title: "Satış Sonrası Destek",
      desc: "Bakım rehberleri ve WhatsApp destek hattımızla her zaman yanınızdayız.",
    },
  ];

  return (
    <div style={{ padding: "16px 20px 40px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", margin: 0 }}>
          Hakkımızda
        </h2>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 8, lineHeight: 1.7 }}>
          Vivora Petshop olarak, evcil hayvanlarınızın sağlığı ve mutluluğu bizim
          önceliğimizdir. Akvaryum balıkları, kedi-köpek ürünleri ve daha fazlasıyla
          hizmetinizdeyiz.
        </p>
      </div>

      {features.map((item, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.9)", borderRadius: 20,
            padding: "20px 24px", marginBottom: 12,
            display: "flex", gap: 16, alignItems: "flex-start",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <div style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>
              {item.title}
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
