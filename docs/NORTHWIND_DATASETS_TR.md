# Northwind Örnek Veritabanları

[English](NORTHWIND_DATASETS.md) | [Türkçe](NORTHWIND_DATASETS_TR.md)

Bu proje, MySQL ve PostgreSQL adapter'larını test etmek için iki Northwind örnek veritabanı içerir.

Her iki veri seti de herkese açık örnek verilerden oluşur ve yalnızca demo ve geliştirme amacıyla kullanılır. Şirket veya production verisi içermezler.

## Dahil Edilen Veri Setleri

| Veritabanı | Veri seti | Tablo | Müşteri | Sipariş | Sipariş detayı | Ürün |
|---|---|---:|---:|---:|---:|---:|
| PostgreSQL | Classic Northwind | 14 | 91 | 830 | 2.155 | 77 |
| MySQL | Access 2010 / MyWind tabanlı Northwind | 20 | 29 | 48 | 58 | 45 |

İki veritabanı farklı şemalar ve örnek kayıtlar kullanır.

MySQL veri setinde `Company A` gibi örnek şirket isimleri bulunur. Bu veri seti, PostgreSQL sürümündeki kayıtların birebir MySQL kopyası değildir.

Bu nedenle bir veritabanı için yazılan sorguların diğerinde çalışması için uyarlanması gerekebilir.

## Veritabanlarının İlk Kurulumu

Örnek şemalar ve veriler, Docker veritabanı container'ları ilk kez başlatılıp ilklendirildiğinde otomatik olarak yüklenir.

Başlangıç dosyaları şu klasörlerde bulunur:

- `docker/postgres/init/`
- `docker/mysql/init/`

Veritabanlarını başlatmak için ana [README](../README.md) dosyasındaki kurulum talimatlarını takip edin.

**Not:** Docker başlangıç betikleri yalnızca ilgili veritabanının veri dizini boş olduğunda çalışır. Bir SQL dosyasını değiştirmek, mevcut Docker volume'undaki veritabanını otomatik olarak güncellemez.

## Üçüncü Taraf Lisansları

Northwind veri setlerinin orijinal lisans ve kaynak bildirimleri korunmuştur:

- [PostgreSQL Northwind Lisansı](third_party/northwind-postgres-LICENSE.txt)
- [MySQL Northwind Lisansı](third_party/northwind-mysql-LICENSE.txt)

Proje kökündeki [MIT Lisansı](../LICENSE), projenin özgün uygulama kodu ve dokümantasyonu için geçerlidir. Dahil edilen üçüncü taraf veri setleri kendi lisans koşullarına tabi olmaya devam eder.
