# Üniversite Ders Seçim

> Üniversite öğrencileri için akıllı ders programı planlama uygulaması

[![Release](https://img.shields.io/github/v/release/Vartmor/UniversiteDersSecim?style=flat-square&color=0ea5e9)](https://github.com/Vartmor/UniversiteDersSecim/releases)
[![License](https://img.shields.io/github/license/Vartmor/UniversiteDersSecim?style=flat-square&color=22c55e)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blueviolet?style=flat-square)](https://github.com/Vartmor/UniversiteDersSecim/releases)

<!-- 
📸 EKRAN GÖRÜNTÜLERİ
-->
![Ana Ekran](docs/screenshots/main.png)

## ✨ Özellikler

- **Ders Yönetimi:** Dönem, ders, şube ve saat bloklarını kolayca ekleyin
- **Otomatik Kombinasyon:** Çakışmasız tüm program seçeneklerini otomatik oluşturur
- **Akıllı Filtreleme:** Erken/geç saat, boş gün, öğle arası gibi filtrelerle daraltın
- **Skor Sıralaması:** En iyi programları otomatik sıralama
- **Export:** JSON, ICS (takvim), PNG formatlarında dışa aktarma
- **Klavye Kısayolları:** Hızlı erişim için Ctrl+N, Ctrl+G, Ctrl+E
- **Offline Çalışma:** İnternet bağlantısı gerektirmez
- **Gizlilik:** Hiçbir veri sunucuya gönderilmez

## 📥 Kurulum

### Hazır İndirme (Önerilen)

[**Releases**](https://github.com/Vartmor/UniversiteDersSecim/releases) sayfasından işletim sisteminize uygun dosyayı indirin:

| Platform | Dosya |
|----------|-------|
| 🪟 Windows | `.msi` veya `.exe` |
| 🍎 macOS | `.dmg` |
| 🐧 Linux | `.deb` veya `.AppImage` |

### Kaynak Koddan Derleme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run tauri dev

# Production build
npm run tauri build
```

**Gereksinimler:**
- Node.js 18+
- Rust (rustup ile kurulum)
- Tauri CLI

## 🚀 Kullanım

1. Sol üstten **dönem** oluşturun (örn: "2025-2026 Bahar")
2. **+ Ders Ekle** butonuyla derslerinizi girin
3. Her derse **şubeler** ve **ders saatleri** ekleyin
4. **"Kombinasyonları Oluştur"** butonuna tıklayın
5. Sağ paneldeki filtrelerle programları daraltın
6. Beğendiğiniz programları **yıldız** ile işaretleyin
7. **Dışa Aktar** ile JSON/ICS/PNG olarak kaydedin

### ⌨️ Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Ctrl+N` | Yeni ders ekle |
| `Ctrl+G` | Kombinasyon oluştur |
| `Ctrl+E` | Dışa aktar |
| `Esc` | Modal kapat |

## 🛠️ Teknolojiler

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Backend:** Tauri v2 (Rust)
- **State:** Zustand

## 📄 Lisans

Bu proje açık kaynaklıdır.

## 👤 Yazar

**Muhammed Köseoğlu** - [@Vartmor](https://github.com/Vartmor)
