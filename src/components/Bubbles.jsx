// Arkaplan baloncuk animasyonu
export default function Bubbles() {
  const colors = [
    "rgba(14,165,233,0.08)",
    "rgba(236,72,153,0.06)",
    "rgba(16,185,129,0.07)",
    "rgba(245,158,11,0.06)",
  ];

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[i % 4]}, transparent)`,
            width: 60 + Math.random() * 140,
            height: 60 + Math.random() * 140,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatBubble ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
