import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Trash2, Printer, ArrowLeft, Fish, Loader2, Download, PlusCircle, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import baliklar from "../data/baliklar";

// ─── localStorage hook ───
function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

// ─── Tek Etiket ───
function Etiket({ item }) {
  return (
    <div style={{
      width: "70mm", height: "40mm", border: "1.5px solid #000", position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden", padding: "3mm", background: "#fff", pageBreakInside: "avoid",
    }}>
      {/* 4 köşe üçgen */}
      {[
        { top: 0, left: 0, clipPath: "polygon(0 0, 100% 0, 0 100%)" },
        { top: 0, right: 0, clipPath: "polygon(0 0, 100% 0, 100% 100%)" },
        { bottom: 0, left: 0, clipPath: "polygon(0 0, 0 100%, 100% 100%)" },
        { bottom: 0, right: 0, clipPath: "polygon(100% 0, 0 100%, 100% 100%)" },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: "8mm", height: "8mm", background: "#000", ...s }} />
      ))}
      {/* Üst çizgi + diamond */}
      <div style={{ display: "flex", alignItems: "center", gap: "2mm", marginBottom: "1.5mm", width: "80%" }}>
        <span style={{ flex: 1, height: "0.5px", background: "#000" }} />
        <span style={{ fontSize: 6, color: "#000" }}>&#9670;</span>
        <span style={{ flex: 1, height: "0.5px", background: "#000" }} />
      </div>
      {/* Balık adı */}
      <div style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 13,
        textTransform: "uppercase", letterSpacing: 1, color: "#000",
      }}>{item.ad}</div>
      {/* Bilimsel isim */}
      <div style={{
        fontFamily: "'Playfair Display', serif", fontStyle: "italic",
        fontSize: 8, color: "#666", marginBottom: "1mm",
      }}>{item.bilimsel}</div>
      {/* Noktalı ayraç */}
      <div style={{ fontSize: 5, color: "#999", letterSpacing: 2, margin: "1mm 0" }}>
        ••••••••••••••••••••
      </div>
      {/* Fiyat */}
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
        fontSize: 22, color: "#000", lineHeight: 1,
      }}>{Number(item.fiyat).toFixed(0)}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 7, color: "#666" }}>₺/{item.birim || "adet"}</div>
    </div>
  );
}

// ─── XSS koruması ───
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ─── Print fonksiyonu ───
function printEtiketler(liste) {
  const win = window.open("", "_blank");
  if (!win) return alert("Popup engellenmiş, lütfen izin verin.");

  const html = liste.map(item => `
    <div class="etiket">
      <div class="c c-tl"></div><div class="c c-tr"></div>
      <div class="c c-bl"></div><div class="c c-br"></div>
      <div class="ust"><span class="line"></span><span class="dia">&#9670;</span><span class="line"></span></div>
      <div class="ad">${esc(item.ad)}</div>
      <div class="bil">${esc(item.bilimsel)}</div>
      <div class="ayrac">••••••••••••••••••••</div>
      <div class="fiyat">${Number(item.fiyat).toFixed(0)}</div>
      <div class="birim">₺/${esc(item.birim || "adet")}</div>
    </div>
  `).join("");

  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Vivora Petshop - Fiyat Etiketleri</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:15mm}
body{font-family:'DM Sans',sans-serif}
.grid{display:grid;grid-template-columns:repeat(3,70mm);gap:8mm;justify-content:center}
.etiket{width:70mm;height:40mm;border:1.5px solid #000;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:3mm;page-break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{position:absolute;width:8mm;height:8mm;background:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c-tl{top:0;left:0;clip-path:polygon(0 0,100% 0,0 100%)}
.c-tr{top:0;right:0;clip-path:polygon(0 0,100% 0,100% 100%)}
.c-bl{bottom:0;left:0;clip-path:polygon(0 0,0 100%,100% 100%)}
.c-br{bottom:0;right:0;clip-path:polygon(100% 0,0 100%,100% 100%)}
.ust{display:flex;align-items:center;gap:2mm;margin-bottom:1.5mm;width:80%}
.line{flex:1;height:.5px;background:#000}
.dia{font-size:6px;color:#000}
.ad{font-family:'Playfair Display',serif;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px}
.bil{font-family:'Playfair Display',serif;font-style:italic;font-size:8px;color:#666;margin-bottom:1mm}
.ayrac{font-size:5px;color:#999;letter-spacing:2px;margin:1mm 0}
.fiyat{font-family:'DM Sans',sans-serif;font-weight:300;font-size:22px;line-height:1}
.birim{font-family:'DM Sans',sans-serif;font-size:7px;color:#666}
</style></head><body>
<div class="grid">${html}</div>
<script>
document.fonts.ready.then(function(){
  setTimeout(function(){ window.print(); }, 300);
});
<\/script>
</body></html>`);
  win.document.close();
}

// ─── PDF İndirme ───
function pdfIndir(liste) {
  const container = document.createElement("div");
  container.style.cssText = "position:absolute;left:-9999px;top:0";
  container.innerHTML = `
    <style>
      .pdf-grid{display:grid;grid-template-columns:repeat(3,70mm);gap:8mm;justify-content:center;padding:15mm}
      .pdf-etiket{width:70mm;height:40mm;border:1.5px solid #000;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:3mm}
      .pdf-c{position:absolute;width:8mm;height:8mm;background:#000}
      .pdf-c-tl{top:0;left:0;clip-path:polygon(0 0,100% 0,0 100%)}
      .pdf-c-tr{top:0;right:0;clip-path:polygon(0 0,100% 0,100% 100%)}
      .pdf-c-bl{bottom:0;left:0;clip-path:polygon(0 0,0 100%,100% 100%)}
      .pdf-c-br{bottom:0;right:0;clip-path:polygon(100% 0,0 100%,100% 100%)}
      .pdf-ust{display:flex;align-items:center;gap:2mm;margin-bottom:1.5mm;width:80%}
      .pdf-line{flex:1;height:.5px;background:#000}
      .pdf-dia{font-size:6px;color:#000}
      .pdf-ad{font-family:'Playfair Display',serif;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px}
      .pdf-bil{font-family:'Playfair Display',serif;font-style:italic;font-size:8px;color:#666;margin-bottom:1mm}
      .pdf-ayrac{font-size:5px;color:#999;letter-spacing:2px;margin:1mm 0}
      .pdf-fiyat{font-family:'DM Sans',sans-serif;font-weight:300;font-size:22px;line-height:1}
      .pdf-birim{font-family:'DM Sans',sans-serif;font-size:7px;color:#666}
    </style>
    <div class="pdf-grid">
      ${liste.map(item => `
        <div class="pdf-etiket">
          <div class="pdf-c pdf-c-tl"></div><div class="pdf-c pdf-c-tr"></div>
          <div class="pdf-c pdf-c-bl"></div><div class="pdf-c pdf-c-br"></div>
          <div class="pdf-ust"><span class="pdf-line"></span><span class="pdf-dia">&#9670;</span><span class="pdf-line"></span></div>
          <div class="pdf-ad">${esc(item.ad)}</div>
          <div class="pdf-bil">${esc(item.bilimsel)}</div>
          <div class="pdf-ayrac">••••••••••••••••••••</div>
          <div class="pdf-fiyat">${Number(item.fiyat).toFixed(0)}</div>
          <div class="pdf-birim">₺/${esc(item.birim || "adet")}</div>
        </div>
      `).join("")}
    </div>`;
  document.body.appendChild(container);

  html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: "vivora-etiketler.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container.querySelector(".pdf-grid"))
    .save()
    .then(() => document.body.removeChild(container));
}

// ─── ANA SAYFA ───
export default function EtiketPage({ onBack }) {
  const [arama, setArama] = useState("");
  const [secili, setSecili] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [birim, setBirim] = useState("adet");
  const [resim, setResim] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [liste, setListe] = useLocalStorage("vivora-etiket-liste", []);
  const [ozelBaliklar, setOzelBaliklar] = useLocalStorage("vivora-ozel-baliklar", []);
  const [ozelForm, setOzelForm] = useState(false);
  const [ozelAd, setOzelAd] = useState("");
  const [ozelBilimsel, setOzelBilimsel] = useState("");

  const tumBaliklar = [...baliklar, ...ozelBaliklar];

  const filtreli = arama.trim()
    ? tumBaliklar.filter(b =>
        b.ad.toLowerCase().includes(arama.toLowerCase()) ||
        b.bilimsel.toLowerCase().includes(arama.toLowerCase())
      )
    : tumBaliklar;

  // Wikimedia resim çek
  useEffect(() => {
    if (!secili) return;
    setResim(null);
    setYukleniyor(true);
    const encoded = encodeURIComponent(secili.bilimsel.replace(/ /g, "_"));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
      .then(r => r.json())
      .then(d => setResim(d.thumbnail?.source || null))
      .catch(() => setResim(null))
      .finally(() => setYukleniyor(false));
  }, [secili]);

  const handleEkle = () => {
    const f = parseFloat(fiyat);
    if (!secili || !f || f <= 0) return;
    setListe(prev => [...prev, { ad: secili.ad, bilimsel: secili.bilimsel, fiyat: f, birim }]);
    setFiyat("");
    setBirim("adet");
  };

  const handleSil = (i) => setListe(prev => prev.filter((_, idx) => idx !== i));
  const handleGuncelle = (i, f) => {
    if (f > 0) setListe(prev => prev.map((it, idx) => idx === i ? { ...it, fiyat: f } : it));
  };

  const S = {
    page: { fontFamily: "'DM Sans', sans-serif", background: "#fafafa", minHeight: "100vh", padding: "0 20px 60px" },
    header: { display: "flex", alignItems: "center", gap: 12, padding: "20px 0", borderBottom: "1px solid #ddd", marginBottom: 24 },
    title: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, letterSpacing: 1 },
    subtitle: { fontSize: 12, color: "#888", fontWeight: 400 },
    content: { display: "flex", gap: 24 },
    left: { width: 280, flexShrink: 0 },
    right: { flex: 1, minWidth: 0 },
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ccc", borderRadius: 6, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" },
    list: { listStyle: "none", padding: 0, marginTop: 8, maxHeight: "60vh", overflowY: "auto", border: "1px solid #eee", borderRadius: 6 },
    item: { padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", display: "flex", flexDirection: "column" },
    card: { display: "flex", gap: 20, padding: 20, border: "1.5px solid #ddd", borderRadius: 8, marginBottom: 24, background: "#fff" },
    imgBox: { width: 120, height: 120, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", borderRadius: 6, overflow: "hidden" },
    btn: { padding: "8px 16px", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 },
    btnSm: { background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 18, padding: "0 4px" },
    row: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: "1px solid #f0f0f0" },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 70mm)", gap: "8mm", marginTop: 24 },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        {onBack && (
          <button onClick={onBack} style={{ ...S.btn, background: "transparent", color: "#000", padding: "6px" }}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 style={S.title}>Vivora Petshop <span style={S.subtitle}>Fiyat Etiketi</span></h1>
        </div>
      </div>

      <div style={S.content}>
        {/* Sol panel - Arama */}
        <aside style={S.left}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#999" }} />
            <input
              style={{ ...S.input, paddingLeft: 36 }}
              placeholder="Balık adı veya bilimsel isim..."
              value={arama}
              onChange={e => setArama(e.target.value)}
            />
          </div>
          {/* Özel balık ekle */}
          {!ozelForm ? (
            <button
              onClick={() => setOzelForm(true)}
              style={{ width: "100%", marginTop: 8, padding: "8px 12px", background: "#fff", border: "1.5px dashed #ccc", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: "#666", fontFamily: "'DM Sans', sans-serif" }}
            >
              <PlusCircle size={15} /> Özel Balık Ekle
            </button>
          ) : (
            <div style={{ marginTop: 8, padding: 12, background: "#fff", border: "1.5px solid #ddd", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Yeni Balık</span>
                <button onClick={() => { setOzelForm(false); setOzelAd(""); setOzelBilimsel(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}><X size={16} /></button>
              </div>
              <input
                placeholder="Balık adı (ör: Blue Dragon)"
                value={ozelAd}
                onChange={e => setOzelAd(e.target.value)}
                style={{ ...S.input, marginBottom: 6, fontSize: 13 }}
              />
              <input
                placeholder="Bilimsel isim (opsiyonel)"
                value={ozelBilimsel}
                onChange={e => setOzelBilimsel(e.target.value)}
                style={{ ...S.input, marginBottom: 8, fontSize: 13 }}
              />
              <button
                onClick={() => {
                  if (!ozelAd.trim()) return;
                  const yeni = { ad: ozelAd.trim(), bilimsel: ozelBilimsel.trim() || "-", ozel: true };
                  setOzelBaliklar(prev => [...prev, yeni]);
                  setSecili(yeni);
                  setOzelAd(""); setOzelBilimsel(""); setOzelForm(false);
                }}
                style={{ width: "100%", padding: "7px 12px", background: "#000", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Ekle
              </button>
            </div>
          )}

          <ul style={S.list}>
            {filtreli.map((b, i) => (
              <li
                key={i}
                style={{
                  ...S.item,
                  background: secili?.bilimsel === b.bilimsel && secili?.ad === b.ad ? "#f0f0f0" : "transparent",
                }}
                onClick={() => setSecili(b)}
              >
                <span style={{ fontWeight: 500, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                  {b.ad}
                  {b.ozel && <span style={{ fontSize: 9, background: "#eee", borderRadius: 3, padding: "1px 4px", color: "#888" }}>özel</span>}
                  {b.ozel && (
                    <button
                      onClick={e => { e.stopPropagation(); setOzelBaliklar(prev => prev.filter(p => p.ad !== b.ad || p.bilimsel !== b.bilimsel)); if (secili?.ad === b.ad) setSecili(null); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", marginLeft: "auto", padding: 0 }}
                    ><Trash2 size={12} /></button>
                  )}
                </span>
                <span style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>{b.bilimsel}</span>
              </li>
            ))}
            {filtreli.length === 0 && (
              <li style={{ padding: 20, textAlign: "center", color: "#999" }}>Sonuç bulunamadı</li>
            )}
          </ul>
        </aside>

        {/* Sağ panel */}
        <main style={S.right}>
          {/* Seçili balık kartı */}
          {secili && (
            <div style={S.card}>
              <div style={S.imgBox}>
                {yukleniyor ? (
                  <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "#999" }} />
                ) : resim ? (
                  <img src={resim} alt={secili.ad} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                ) : (
                  <Fish size={40} style={{ color: "#ccc" }} />
                )}
              </div>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>{secili.ad}</h2>
                <p style={{ fontStyle: "italic", color: "#888", fontSize: 13, marginBottom: 16 }}>{secili.bilimsel}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number" min="0" step="0.01" placeholder="Fiyat (₺)"
                    value={fiyat} onChange={e => setFiyat(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEkle()}
                    style={{ ...S.input, width: 120 }}
                  />
                  <select
                    value={birim} onChange={e => setBirim(e.target.value)}
                    style={{ ...S.input, width: 90, cursor: "pointer" }}
                  >
                    <option value="adet">Adet</option>
                    <option value="çift">Çift</option>
                    <option value="zeri">Zeri</option>
                    <option value="düzine">Düzine</option>
                    <option value="kg">Kg</option>
                  </select>
                  <button onClick={handleEkle} style={S.btn}>
                    <Plus size={16} /> Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {!secili && (
            <div style={{ textAlign: "center", padding: 60, color: "#ccc" }}>
              <Fish size={48} />
              <p style={{ marginTop: 12, fontSize: 14 }}>Soldaki listeden bir balık seçin</p>
            </div>
          )}

          {/* Liste + Önizleme */}
          {liste.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>
                  Etiket Listesi ({liste.length})
                </h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => pdfIndir(liste)} style={{ ...S.btn, background: "#333" }}>
                    <Download size={16} /> PDF İndir
                  </button>
                  <button onClick={() => printEtiketler(liste)} style={S.btn}>
                    <Printer size={16} /> Yazdır
                  </button>
                </div>
              </div>

              {/* Düzenlenebilir liste */}
              <div style={{ border: "1px solid #eee", borderRadius: 6, marginBottom: 24, background: "#fff" }}>
                {liste.map((item, i) => (
                  <div key={i} style={S.row}>
                    <span style={{ flex: 1, fontWeight: 500 }}>{item.ad}</span>
                    <input
                      type="number" min="0" step="0.01" value={item.fiyat}
                      onChange={e => handleGuncelle(i, parseFloat(e.target.value))}
                      style={{ width: 80, padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, textAlign: "right", fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <select
                      value={item.birim || "adet"}
                      onChange={e => setListe(prev => prev.map((it, idx) => idx === i ? { ...it, birim: e.target.value } : it))}
                      style={{ padding: "4px 6px", border: "1px solid #ccc", borderRadius: 4, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                    >
                      <option value="adet">₺/Adet</option>
                      <option value="çift">₺/Çift</option>
                      <option value="zeri">₺/Zeri</option>
                      <option value="düzine">₺/Düzine</option>
                      <option value="kg">₺/Kg</option>
                    </select>
                    <button onClick={() => handleSil(i)} style={S.btnSm} title="Sil">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Etiket grid önizleme */}
              <div style={S.grid}>
                {liste.map((item, i) => <Etiket key={i} item={item} />)}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Spin animation for loader */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
