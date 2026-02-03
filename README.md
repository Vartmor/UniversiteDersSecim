# Üniversite Ders Seçim

Üniversite öğrencileri için geliştirilmiş, çakışmasız ders programı kombinasyonları oluşturan masaüstü uygulaması.

[![Demo](https://img.shields.io/badge/Demo-Web%20Versiyonu-ff6b6b?style=flat-square)](https://vartmor.github.io/UniversiteDersSecim/)
[![Release](https://img.shields.io/github/v/release/Vartmor/UniversiteDersSecim?style=flat-square&color=0ea5e9)](https://github.com/Vartmor/UniversiteDersSecim/releases)
[![License](https://img.shields.io/badge/license-GPL--3.0-22c55e?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Web-blueviolet?style=flat-square)](https://github.com/Vartmor/UniversiteDersSecim/releases)

---

## Ekran Görüntüsü

![Ana Ekran](docs/screenshots/main.png)

---

## Kurulum

### Web Versiyonu (Kurulum Gerektirmez)

Uygulamayı tarayıcınızda hemen kullanmaya başlayabilirsiniz:

**[https://vartmor.github.io/UniversiteDersSecim/](https://vartmor.github.io/UniversiteDersSecim/)**

Web versiyonu tüm özellikleri destekler. Verileriniz tarayıcınızın yerel depolama alanında saklanır.

---

### Masaüstü Uygulaması İndirme

Uygulamayı bilgisayarınıza kurmak için aşağıdaki adımları izleyin:

1. [Releases](https://github.com/Vartmor/UniversiteDersSecim/releases) sayfasına gidin.
2. En son sürümü bulun.
3. İşletim sisteminize uygun dosyayı indirin:

| İşletim Sistemi | İndirilecek Dosya | Açıklama |
|-----------------|-------------------|----------|
| Windows | `.msi` | Windows Installer paketi |
| macOS (Apple Silicon) | `_aarch64.dmg` | M1, M2, M3 işlemcili Mac'ler için |
| macOS (Intel) | `_x64.dmg` | Intel işlemcili Mac'ler için |
| Linux (Debian/Ubuntu) | `.deb` | apt ile kurulabilir |
| Linux (Diğer) | `.AppImage` | Tüm dağıtımlarda çalışır |

4. İndirdiğiniz dosyayı çalıştırın ve kurulum sihirbazını takip edin.

**Windows Kullanıcıları İçin Önemli Not:**

Uygulama henüz dijital olarak imzalanmamıştır. Bu nedenle Windows Defender veya antivirüs programınız uyarı verebilir. Bu bir güvenlik tehdidi değildir. Uygulama açık kaynak kodludur ve zararlı kod içermez. Kaynak kodunu bu sayfada inceleyebilirsiniz.

Uyarıyı geçmek için:
- Windows SmartScreen uyarısında "Daha fazla bilgi" ve ardından "Yine de çalıştır" seçeneğini tıklayın.
- Antivirüs programınızda dosyayı güvenilir olarak işaretleyin.

---

### Kaynak Koddan Derleme

Geliştirici olarak kaynak koddan derlemek istiyorsanız:

**Gereksinimler:**
- Node.js 18 veya üzeri
- Rust (rustup ile kurulum önerilir)
- Tauri CLI

**Adımlar:**

```bash
# 1. Depoyu klonlayın
git clone https://github.com/Vartmor/UniversiteDersSecim.git
cd UniversiteDersSecim

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme modunda çalıştırın
npm run tauri dev

# 4. Veya production build oluşturun
npm run tauri build
```

---

## Uygulama Nedir?

Üniversite Ders Seçim, öğrencilerin dönemlik ders programlarını planlamalarına yardımcı olan bir masaüstü uygulamasıdır. Uygulama, girdiğiniz derslerin tüm şubelerini ve ders saatlerini analiz ederek çakışmayan tüm olası program kombinasyonlarını otomatik olarak oluşturur.

### Temel Özellikler

- **Dönem ve Ders Yönetimi:** Birden fazla dönem oluşturabilir, her döneme istediğiniz kadar ders ekleyebilirsiniz.
- **Şube ve Saat Tanımlama:** Her ders için birden fazla şube tanımlayabilir, her şubeye haftalık ders saatlerini girebilirsiniz.
- **Otomatik Kombinasyon Oluşturma:** Uygulama, tüm şube ve saat bilgilerini kullanarak çakışmayan program kombinasyonlarını saniyeler içinde hesaplar.
- **Akıllı Filtreleme:** Oluşturulan kombinasyonları çeşitli kriterlere göre filtreleyebilirsiniz (erken dersler, geç dersler, boş günler, öğle arası vb.).
- **Skor Sistemi:** Her kombinasyon, tercihlerinize göre puanlanır ve en uygun programlar üst sıralarda gösterilir.
- **Favoriler:** Beğendiğiniz programları yıldızlayarak favorilere ekleyebilirsiniz.
- **Dışa Aktarma:** Seçtiğiniz programı JSON, ICS (takvim) veya PNG formatında dışa aktarabilirsiniz.

### Gizlilik ve Güvenlik

Bu uygulama tamamen çevrimdışı çalışır. Girdiğiniz tüm veriler yalnızca kendi bilgisayarınızda saklanır, hiçbir veri internet üzerinden herhangi bir sunucuya gönderilmez.

---

## Kullanım Kılavuzu

### Adım 1: Dönem Oluşturma

Uygulamayı açtığınızda sol üst köşedeki "Dönem" butonuna tıklayın ve yeni bir dönem oluşturun (örneğin: "2025-2026 Bahar Dönemi").

### Adım 2: Ders Ekleme

"Ders Ekle" butonuna tıklayarak derslerinizi girin. Her ders için:
- Ders kodu (örn: MAT201)
- Ders adı (örn: Lineer Cebir)
- Haftalık ders saati
- Zorunlu/seçmeli durumu

### Adım 3: Şube ve Saat Bilgisi Girme

Her ders için mevcut şubeleri ekleyin. Her şube için:
- Şube numarası veya adı
- Öğretim üyesi (isteğe bağlı)
- Haftalık ders saatleri (gün, başlangıç saati, bitiş saati, derslik)

### Adım 4: Kombinasyon Oluşturma

Tüm ders ve şube bilgilerini girdikten sonra "Kombinasyonları Oluştur" butonuna tıklayın. Uygulama, çakışmayan tüm olası program kombinasyonlarını hesaplayacaktır.

### Adım 5: Filtreleme ve Seçim

Sağ paneldeki filtrelerle sonuçları daraltın:
- Belirli günlerde ders olmasını istemiyorsanız o günleri devre dışı bırakın
- Erken veya geç saatlerdeki dersleri filtreleyin
- Öğle arası tercihinizi belirtin

Beğendiğiniz programları yıldız ikonuna tıklayarak favorilere ekleyin.

### Adım 6: Dışa Aktarma

Seçtiğiniz programı dışa aktarmak için "Dışa Aktar" butonunu kullanın:
- **JSON:** Tüm verileri yedeklemek veya başka bir bilgisayara aktarmak için
- **ICS:** Google Calendar, Apple Calendar veya Outlook'a aktarmak için
- **PNG:** Programın görsel olarak kaydedilmiş halini almak için

---

## Klavye Kısayolları

| Kısayol | İşlev |
|---------|-------|
| Ctrl+N | Yeni ders ekleme penceresini açar |
| Ctrl+G | Kombinasyonları oluşturur |
| Ctrl+E | Dışa aktarma penceresini açar |
| Esc | Açık pencereyi kapatır |

---

## Teknik Bilgiler

Bu uygulama aşağıdaki teknolojiler kullanılarak geliştirilmiştir:

| Katman | Teknoloji |
|--------|-----------|
| Kullanıcı Arayüzü | React 19, TypeScript, Tailwind CSS |
| Masaüstü Çerçevesi | Tauri v2 (Rust) |
| Durum Yönetimi | Zustand |

---

## Lisans

Bu proje GNU General Public License v3.0 altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

---

[En Yukarı Dön](#üniversite-ders-seçim)
