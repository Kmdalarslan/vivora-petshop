# 🐠 Vivora Petshop — E-Ticaret Web Sitesi

## Hızlı Başlangıç

### 1. Gereksinimler
- **Node.js** (v18+): https://nodejs.org adresinden LTS sürümünü indirin
- **VS Code**: https://code.visualstudio.com

### 2. Kurulum
```bash
cd vivora-petshop
npm install
npm run dev
```
Tarayıcıda `http://localhost:3000` açılacak.

### 3. Yayına Alma (Build)
```bash
npm run build
```
`dist/` klasöründeki dosyaları hosting servisine yükleyin.

---

## Dosya Yapısı

```
src/
├── data/
│   ├── categories.js    ← Kategorileri buradan düzenleyin
│   ├── products.js      ← Ürünleri buradan düzenleyin
│   └── helpers.js       ← Fiyat formatlama vs.
├── components/
│   ├── Bubbles.jsx      ← Arkaplan baloncuk animasyonu
│   ├── ProductCard.jsx  ← Ürün kartı bileşeni
│   ├── ProductDetail.jsx← Ürün detay modalı
│   └── CartPanel.jsx    ← Sepet paneli
├── pages/
│   ├── HomePage.jsx     ← Ana sayfa
│   ├── ShopPage.jsx     ← Mağaza / katalog
│   ├── AboutPage.jsx    ← Hakkımızda
│   └── ContactPage.jsx  ← İletişim formu
├── App.jsx              ← Ana uygulama (routing, state)
├── main.jsx             ← React giriş noktası
└── styles.css           ← Animasyonlar ve global stiller
```

## Sık Yapılan Düzenlemeler

### Yeni Ürün Ekleme
`src/data/products.js` dosyasını açın, diziye yeni obje ekleyin:
```js
{
  id: 21,                    // Benzersiz numara
  name: "Melek Balığı",      // Ürün adı
  cat: "baliklar",           // Kategori id'si
  price: 120,                // Fiyat (TL)
  oldPrice: 150,             // Eski fiyat (opsiyonel)
  img: "🐠",                // Emoji veya resim
  rating: 4.6,               // Puan
  reviews: 42,               // Değerlendirme sayısı
  badge: "Yeni",             // Rozet (opsiyonel)
  desc: "Zarif melek balığı", // Açıklama
  stock: 10,                 // Stok
},
```

### Yeni Kategori Ekleme
`src/data/categories.js` dosyasına ekleyin:
```js
{
  id: "surungen",
  name: "Sürüngenler",
  icon: "🦎",
  color: "#84CC16",
  desc: "Kaplumbağa, iguana & daha fazlası",
  count: 5,
},
```

### İletişim Bilgilerini Güncelleme
`src/pages/ContactPage.jsx` dosyasındaki `contactInfo` dizisini düzenleyin.

### WhatsApp Numarası
`src/App.jsx` dosyasının altındaki WhatsApp linkini güncelleyin:
```
href="https://wa.me/905551234567"
```

### Logo Değiştirme
`public/logo.png` dosyasını değiştirin.

---

## VS Code Önerilen Eklentiler
- **ES7+ React/Redux/React-Native snippets** — Hızlı kod şablonları
- **Prettier** — Otomatik kod formatlama
- **Auto Rename Tag** — HTML tag'lerini otomatik yeniden adlandırma
- **Turkish Language Pack** — Türkçe arayüz
