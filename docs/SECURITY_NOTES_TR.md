# Güvenlik Notları

[English](SECURITY_NOTES.md) | [Türkçe](SECURITY_NOTES_TR.md)

Multi-Database MCP Server, MySQL ve PostgreSQL veritabanları için read-only bir proof of concept (PoC) olarak tasarlanmıştır.

Yetkisiz veri değiştirme riskini azaltmak amacıyla uygulama seviyesinde SQL doğrulaması ve veritabanı seviyesinde erişim kısıtlamaları içerir.

Bu proje geliştirme ve demo amaçlıdır. Hassas veya production verileriyle kullanılmadan önce ek güvenlik önlemleri gereklidir.

## Uygulanan Güvenlik Kontrolleri

### Read-Only SQL Doğrulaması

`query` aracı, SQL ifadelerini çalıştırmadan önce `src/security/validateQuery.ts` dosyasındaki doğrulayıcıyı kullanır.

Doğrulayıcı:

- Yalnızca SELECT ifadelerini kabul eder.
- Veri değiştirme ve yönetim komutlarını reddeder.
- Belirli tehlikeli SQL fonksiyonlarını engeller.
- SQL yorumlarını ve birden fazla ifadeden oluşan sorguları reddeder.
- Sonuçlara en fazla 100 satır sınırı uygular.

### Veritabanı Seviyesinde İzinler

Projeyle birlikte gelen Docker veritabanları, özel read-only hesaplar kullanır:

| Veritabanı | Kullanıcı |
|---|---|
| MySQL | `mcp_reader` |
| PostgreSQL | `mcp_reader_pg` |

Bu kullanıcılara örnek tablolarda yalnızca SELECT erişimi verilmiştir.

PostgreSQL okuyucu hesabında ayrıca `default_transaction_read_only` etkinleştirilmiştir.

### Yerel Docker Yapılandırması

- Veritabanı host portları varsayılan olarak `127.0.0.1` adresine bağlanır.
- Yerel parolalar, Git'e dahil edilmeyen `.env.docker` dosyasında saklanır.
- MCP runtime container'ı root olmayan bir kullanıcıyla çalışır.

## Güvenlik Sınırlamaları

Mevcut SQL doğrulayıcı, kısıtlayıcı pattern tabanlı kontroller kullanır. Tam kapsamlı bir SQL parser değildir ve kabul edilen her sorgunun zararsız olduğunu garanti edemez.

100 satırlık çıktı sınırı döndürülen satır sayısını kontrol eder; ancak veritabanında taranan veri miktarını, sorgu karmaşıklığını veya çalışma süresini sınırlandırmaz.

Bu sürümde aşağıdaki özellikler bulunmaz:

- Kullanıcı veya departman bazında yetkilendirme.
- Satır veya kolon seviyesinde erişim politikaları.
- Kapsamlı sorgu maliyeti ve çalışma süresi limitleri.
- Merkezi denetim (audit) kayıtları.
- Uzak MCP bağlantıları için kimlik doğrulama.

MCP server şu anda yerel stdio transport kullanır. Paylaşılan veya uzaktan erişilebilir bir servis olarak dağıtılması için ek kimlik doğrulama, yetkilendirme ve ağ güvenliği kontrolleri gerekir.

## Veri Gizliliği

MCP araçları, yapılandırılan veritabanı hesabının erişebildiği bütün verileri döndürebilir.

Bir yapay zekâ uygulamasına bağlandığında oluşturulan SQL ve dönen sorgu sonuçları, seçilen AI servisi tarafından işlenebilir.

Demo dışındaki veritabanlarını bağlamadan önce ilgili kurumun veri koruma ve yapay zekâ kullanım politikalarını inceleyin.

Kimlik bilgilerini, API anahtarlarını, özel veritabanı kayıtlarını veya gizli bilgiler içeren ortam dosyalarını Git'e kesinlikle eklemeyin.

## Production Ortamı İçin Değerlendirmeler

Projeyi production kullanımına uyarlamadan önce şu geliştirmeleri değerlendirin:

- Sağlam bir SQL parser ve SQL dialect'lerine uygun doğrulama.
- Ayrıntılı veritabanı erişim izinleri.
- Kimlik doğrulama ve kullanıcı seviyesinde yetkilendirme.
- Sorgu çalışma süresi ve kaynak limitleri.
- Denetim kayıtları ve izleme.
- Güvenli secret yönetimi.
- Dağıtım ortamına uygun bir güvenlik incelemesi.

Uygulama seviyesindeki doğrulama iyileştirilse bile veritabanı seviyesinde en az yetki (least privilege) ilkesi korunmalıdır.

## Güvenlik Sorunlarının Bildirilmesi

Bir güvenlik açığı fark ederseniz parolaları, token'ları veya hassas verileri herkese açık GitHub issue'larında paylaşmayın.

Hassas ayrıntıları açıklamadan önce repository sahibiyle özel bir iletişim kanalı üzerinden iletişime geçin.
