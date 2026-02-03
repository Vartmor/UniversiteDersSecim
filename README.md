# Ders Seçim

> Üniversite öğrencileri için akıllı ders programı planlama uygulaması

[![Release](https://img.shields.io/github/v/release/Vartmor/UniversiteDersSecim?style=flat-square)](https://github.com/Vartmor/UniversiteDersSecim/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

## Özellikler

- **Ders Yönetimi:** Dönem, ders, şube ve saat bloklarını kolayca ekleyin
- **Otomatik Kombinasyon:** Çakışmasız tüm program seçeneklerini otomatik oluşturur
- **Akıllı Filtreleme:** Erken/geç saat, boş gün, öğle arası gibi filtrelerle daraltın
- **Skor Sıralaması:** En iyi programları otomatik sıralama
- **Export:** JSON, ICS (takvim), PNG formatlarında dışa aktarma
- **Klavye Kısayolları:** Ctrl+N, Ctrl+G, Ctrl+E, Esc
- **Offline Çalışma:** İnternet bağlantısı gerektirmez
- **Gizlilik:** Hiçbir veri sunucuya gönderilmez

## Kurulum

### Hazır İndirme (Önerilen)

[**Releases**](https://github.com/Vartmor/UniversiteDersSecim/releases) sayfasından işletim sisteminize uygun dosyayı indirin:

| Platform | Dosya |
|----------|-------|
| Windows | `.msi` veya `.exe` |
| macOS | `.dmg` |
| Linux | `.deb` veya `.AppImage` |

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
- Tauri CLI (`npm install -g @tauri-apps/cli`)

## Kullanım

1. Sol üstten **dönem** oluşturun (örn: "2025-2026 Bahar")
2. **+ Ders Ekle** butonuyla derslerinizi girin
3. Her derse **şubeler** ve **ders saatleri** ekleyin
4. **"Kombinasyonları Oluştur"** butonuna tıklayın
5. Sağ paneldeki filtrelerle programları daraltın
6. Beğendiğiniz programları **yıldız** ile işaretleyin
7. **Dışa Aktar** ile JSON/ICS/PNG olarak kaydedin

### Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| `Ctrl+N` | Yeni ders ekle |
| `Ctrl+G` | Kombinasyon oluştur |
| `Ctrl+E` | Dışa aktar |
| `Esc` | Modal kapat |

## Teknolojiler

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Backend:** Tauri v2 (Rust)
- **State:** Zustand (localStorage persistence)

## Katkıda Bulunma

Pull request'lerinizi bekliyoruz!

## Lisans

MIT © [Muhammed Köseoğlu](https://github.com/Vartmor)
