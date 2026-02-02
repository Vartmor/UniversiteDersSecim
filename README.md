# UniversiteDersSecim

Üniversite öğrencileri için akıllı ders programı planlama uygulaması.

## Özellikler

- **Ders Yönetimi:** Dönem, ders, şube ve saat bloklarını kolayca ekleyin
- **Otomatik Kombinasyon:** Çakışmasız tüm program seçeneklerini otomatik oluşturur
- **Akıllı Filtreleme:** Erken/geç saat, boş gün, öğle arası gibi filtrelerle daraltın
- **Skor Sıralaması:** En iyi programları otomatik sıralama
- **Offline Çalışma:** İnternet bağlantısı gerektirmez, tüm veriler yerel olarak saklanır
- **Gizlilik:** Hiçbir veri sunucuya gönderilmez

## Ekran Görüntüsü

*Yakında eklenecek*

## Kurulum

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### Tauri Masaüstü Uygulaması

```bash
# Masaüstü uygulamasını geliştirme modunda çalıştır
npm run tauri dev

# Production build oluştur
npm run tauri build
```

## Teknolojiler

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Backend:** Tauri v2 (Rust)
- **State Management:** Zustand (localStorage persistance)

## Kullanım

1. Sol panelden **dönem** oluşturun (örn: "2025-2026 Bahar")
2. **Ders ekle** butonuyla derslerinizi girin
3. Her derse **şubeler** ve **ders saatleri** ekleyin
4. **"Kombinasyonları Oluştur"** butonuna tıklayın
5. Sağ paneldeki filtrelerle programları daraltın
6. Beğendiğiniz programları **yıldız** ile işaretleyin

## İlerleme Durumu

- [x] Sprint 1: Çekirdek (veri modeli, UI, CRUD)
- [x] Sprint 2: Motor (kombinasyon algoritması)
- [x] Sprint 3: Filtre & Skor (kısmen)
- [ ] Sprint 4: Export (JSON/PNG/ICS)
- [ ] Sprint 5: Release

Detaylı plan için: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

## Lisans

MIT

## Yazar

**Muhammed Köseoğlu**
