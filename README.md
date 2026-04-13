# YemekApp

YemekApp, hem son kullanıcı (yemek/tarif/topluluk) hem de işletme (sipariş, masa, menü, personel, vardiya, mutfak istasyonları yönetimi) tarafını içeren çift taraflı bir mobil yemek uygulaması prototipidir.

## Yapı

- **Saf vanilla JS** — framework yok
- **Tek sayfa uygulaması (SPA)** — `index.html` üzerinden yüklenir
- **İki telefon kabuğu** — `#phone` (kullanıcı) ve `#bizPhone` (işletme)
- **Bileşen mimarisi** — `js/` klasörü altında özellik bazlı dosyalar
- **Sayfalar** — `pages/` klasöründe HTML parçaları, runtime'da fetch ile yüklenir
- **Tema** — `styles.css` içinde tasarım token'ları (renk, tipografi, gölge, radius)
- **Türkçe arayüz** ve **Iconify Solar** ikon seti

## Roller (İşletme)

- **İşletme Sahibi** — Tüm yetkiler
- **Şube Müdürü** — Şube yönetimi
- **Mutfak Sorumlusu** — Sadece kendi istasyonu
- **Garson** — Atanan masalar
- **Kasiyer** — Sipariş & ödeme
- **Kurye** — Atanan teslimatlar

## Çalıştırma

`index.html` dosyasını bir tarayıcıda açmak yeterli. Yerel bir HTTP sunucusu kullanmak önerilir:

```bash
python3 -m http.server 8000
```

Sonra `http://localhost:8000` adresine git.
