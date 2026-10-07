# Hızlı Kurulum ve Kontrol Rehberi

[English](REVIEWER_QUICKSTART.md) | [Türkçe](REVIEWER_QUICKSTART_TR.md)

Bu rehber, MySQL veya PostgreSQL'i bilgisayarınıza ayrıca kurmadan, Multi-Database MCP Server projesini Docker ile nasıl çalıştırıp doğrulayacağınızı açıklar.

Projeye genel bakış için ana [README](../README.md) dosyasına bakın.

## Gereksinimler

- Docker Desktop (veya Compose destekli Docker Engine)
- Node.js 22+ ve npm
- Projenin ana klasöründe açılmış bir terminal

Aşağıdaki komutlar Windows PowerShell içindir.

## 1. Ortamı Yapılandırma

Yerel Docker ortam dosyanızı oluşturun:

```powershell
Copy-Item .env.docker.example .env.docker
```

`.env.docker` dosyasını açın ve dört örnek parolayı kendinize ait yerel test parolalarıyla değiştirin.

Varsayılan host portları başka uygulamalar tarafından kullanılıyorsa bu dosyadaki `MYSQL_HOST_PORT` ve `POSTGRES_HOST_PORT` değerlerini değiştirebilirsiniz.

## 2. Veritabanlarını Başlatma

```powershell
docker compose --env-file .env.docker up -d --wait
```

Her iki veritabanı container'ının da `healthy` durumda olduğunu kontrol edin:

```powershell
docker compose --env-file .env.docker ps
```

Dahil edilen Northwind örnek veri setleri, ilk ilklendirme sırasında otomatik olarak yüklenir.

## 3. MCP Server'ı Derleme

```powershell
docker compose --env-file .env.docker --profile mcp build mcp-postgres
```

MySQL ve PostgreSQL MCP servisleri aynı uygulama image'ını kullanır.

## 4. PostgreSQL'i MCP Inspector ile Test Etme

Inspector'ı başlatın:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-postgres
```

Terminalde gösterilen yerel Inspector adresini tarayıcıda açın.

**List Tools** seçeneğine tıklayın ve şu iki aracın mevcut olduğunu kontrol edin:

- `get_tables`
- `query`

Önce `get_tables` aracını çalıştırarak veritabanı şemasını keşfedin.

Ardından `query` aracıyla şu sorguyu çalıştırın:

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Beklenen sonuç: **91 müşteri**.

### Read-Only Korumasını Doğrulama

`query` aracına şu ifadeyi gönderin:

```sql
UPDATE customers
SET country = 'Turkey'
WHERE customer_id = 'ALFKI';
```

MCP server bu veri değiştirme girişimini reddetmelidir.

Kaydın değişmediğini doğrulamak için aşağıdaki sorguyu çalıştırabilirsiniz:

```sql
SELECT customer_id, company_name, country
FROM customers
WHERE customer_id = 'ALFKI';
```

Beklenen ülke bilgisi: `Germany`.

Bu güvenlik kontrollerini production veritabanlarında değil, yalnızca projeyle birlikte gelen örnek veritabanında yapın.

## 5. MySQL'i MCP Inspector ile Test Etme

Önceki Inspector oturumunu `Ctrl + C` ile kapatın.

MySQL MCP servisini başlatın:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-mysql
```

MySQL şemasını incelemek için `get_tables` aracını çalıştırın.

Ardından şu sorguyu çalıştırın:

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Beklenen sonuç: **29 müşteri**.

Örnek müşteri kayıtlarını da getirebilirsiniz:

```sql
SELECT id, company, country_region
FROM customers
LIMIT 5;
```

MySQL ve PostgreSQL Northwind örnekleri farklı şemalar ve kayıtlar kullanır. Sonuçlarının aynı olması beklenmez.

## 6. Otomatik Testleri Çalıştırma

Projenin bağımlılıklarını yükleyin:

```powershell
npm.cmd ci
```

Otomatik kontrolleri çalıştırın:

```powershell
npm.cmd test
npm.cmd run build
```

`test` betiği TypeScript kontrollerini, SQL güvenlik testlerini ve örnek veri dosyalarının bütünlük testlerini zaten çalıştırır. `build` ise uygulamayı derler.

Veri setlerinin tam kayıt sayılarını canlı bir veritabanına karşı doğrulamak için `DB_TYPE` ve `DB_URL` değerlerini yetkili bir read-only bağlantıyla yapılandırın, ardından şu komutu çalıştırın:

```powershell
npm.cmd run test:northwind
```

Bu canlı veri testi, projeyle birlikte gelen Northwind örnek veri setini bekler.

## 7. Ortamı Durdurma

Açık Inspector oturumlarını kapatın; ardından Docker servislerini durdurun:

```powershell
docker compose --env-file .env.docker down
```

Bu komut veritabanı volume'larını korur. Böylece ortam tekrar başlatıldığında örnek veriler kullanılmaya devam eder.

## Sorun Giderme

Bir veritabanı container'ı başlatılamıyorsa durumunu ve loglarını kontrol edin:

```powershell
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs mysql postgres
```

Bir host portu kullanımda ise `.env.docker` dosyasındaki ilgili portu değiştirin.

Docker başlangıç betikleri yalnızca veritabanı veri dizini boş olduğunda çalışır. Var olan volume'lar, container'lar yeniden başlatıldığında mevcut verilerini korur.

**Depolanan verileri bilerek kaldırmak istemiyorsanız Docker volume'larını silmeyin.**

Veri seti ayrıntıları için [Northwind Örnek Veritabanları](NORTHWIND_DATASETS_TR.md) dosyasına bakın.

### macOS / Linux

`Copy-Item` yerine `cp`, `.cmd` uzantılı komutlar yerine `npm` ve `npx` kullanın. Windows biçimindeki dosya yollarını da Unix biçimine uyarlayın.
