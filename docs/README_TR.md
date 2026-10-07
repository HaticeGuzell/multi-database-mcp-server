
# Multi-Database MCP Server

[English](../README.md) | [Türkçe](README_TR.md)

TypeScript ve TypeORM ile geliştirilmiş, MySQL ve PostgreSQL veritabanlarına standart ve read-only erişim sağlayan bir Model Context Protocol (MCP) sunucusudur.

Bu proje, yapay zeka uygulamalarının veritabanı yapısını dinamik olarak keşfetmesini ve doğrulanmış SQL sorgularını MCP araçları üzerinden çalıştırmasını sağlar.

## Özellikler

- **Çoklu veritabanı desteği:** MySQL ve PostgreSQL.
- **Dinamik şema keşfi:** Tablo ve kolon bilgilerinin önceden tanımlanmasına gerek kalmadan alınması.
- **Read-only sorgulama:** Yalnızca doğrulanmış SELECT sorgularının çalıştırılması.
- **SQL güvenliği:** Veri değiştiren komutların, tehlikeli işlemlerin ve çoklu sorguların engellenmesi.
- **Sonuç sınırı:** Sorgu sonuçlarının en fazla 100 satırla sınırlandırılması.
- **Veritabanı seviyesinde koruma:** Docker ortamında ayrı read-only kullanıcılar.
- **Docker desteği:** Veritabanlarını ve MCP server'ı yerel database kurulumu gerektirmeden çalıştırma.

## MCP Araçları

| Araç | Açıklama |
|---|---|
| `get_tables` | Bağlı veritabanının tablo ve kolon bilgilerini getirir. |
| `query` | Read-only SELECT sorgularını doğrular ve çalıştırır. |

`query` aracı aşağıdaki bilgileri döndürür:

- `rows`: Sorgu sonuçları.
- `rowCount`: Döndürülen satır sayısı.
- `executionTimeMs`: Sorgunun çalışma süresi (milisaniye).

Her MCP server süreci, yapılandırılmış tek bir veritabanına bağlanır.

Doğal dilin SQL'e dönüştürülmesi MCP server'ın değil, bağlı yapay zeka uygulamasının görevidir.

## Sistem Mimarisi

```text
Kullanıcı
   |
Yapay Zeka Uygulaması / LLM
   |
MCP Server
   |-- get_tables
   |-- query
   |     |
   |   SQL Validator
   |
Database Adapter
   |
MySQL / PostgreSQL
```

Projede TypeORM, veritabanı bağlantılarını ve sorguları yönetmek için kullanıldı. MySQL ve PostgreSQL için ayrı adapter'lar bulunuyor.

## Gereksinimler

- Docker Desktop veya Docker Engine + Compose
- Yerel testler ve MCP Inspector için Node.js 22+ ve npm

Docker kullanıldığında MySQL ve PostgreSQL'i ayrıca bilgisayarınıza kurmanız gerekmez.

## Hızlı Kurulum

Aşağıdaki komutlar Windows PowerShell içindir. Komutları projenin ana klasöründe çalıştırın.

### 1. Ortam dosyasını oluşturun

Örnek yapılandırma dosyasını kopyalayın:

```powershell
Copy-Item .env.docker.example .env.docker
```

`.env.docker` dosyasını açın ve dört örnek parolayı kendi yerel test parolalarınızla değiştirin.

### 2. Veritabanlarını başlatın

```powershell
docker compose --env-file .env.docker up -d --wait
```

Çalışma durumlarını kontrol edin:

```powershell
docker compose --env-file .env.docker ps
```

MySQL ve PostgreSQL servislerinin healthy durumunda olması beklenir. Varsayılan host portları MySQL için `127.0.0.1:3307`, PostgreSQL için `127.0.0.1:5433`'tür, çakışma varsa `.env.docker` içerisinden değiştirebilirsiniz.

### 3. MCP Docker image'ını oluşturun

```powershell
docker compose --env-file .env.docker --profile mcp build mcp-postgres
```

Her iki MCP servisi aynı uygulama image'ını kullanır.

### 4. MCP Inspector ile bağlantıyı test edin

PostgreSQL için:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-postgres
```

Terminalde verilen yerel Inspector adresini tarayıcıda açın.

**List Tools** üzerinden `get_tables` ve `query` araçlarını görüntüleyin.

Önce `get_tables` aracını çalıştırın. Ardından `query` ile şu sorguyu deneyin:

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Beklenen PostgreSQL sonucu: **91 müşteri**.

MySQL'i test etmek için mevcut Inspector oturumunu kapatın ve şu komutu çalıştırın:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-mysql
```

Aynı COUNT sorgusu için beklenen MySQL sonucu: **29 müşteri**.

Daha ayrıntılı kurulum ve test adımları için [Reviewer Quick Start](REVIEWER_QUICKSTART.md) dosyasına bakabilirsiniz.

## Örnek Veritabanları

Projede test amacıyla iki farklı Northwind örnek veritabanı bulunur:

| Veritabanı | Tablo | Müşteri | Sipariş | Ürün |
|---|---:|---:|---:|---:|
| PostgreSQL | 14 | 91 | 830 | 77 |
| MySQL | 20 | 29 | 48 | 45 |

Bu veri setlerinin şemaları ve örnek kayıtları farklıdır. Bir veritabanı için hazırlanan sorgular diğerinde değişiklik gerektirebilir.

Ayrıntılar: [Northwind Datasets](NORTHWIND_DATASETS.md).

## Testlerin Çalıştırılması

Önce gerekli paketleri yükleyin:

```powershell
npm.cmd ci
```

Ardından:

```powershell
npm.cmd test
npm.cmd run build
```

`npm.cmd test` TypeScript, SQL güvenliği ve örnek veri dosyalarının bütünlük testlerini, `npm.cmd run build` ise derlemeyi gerçekleştirir.

Canlı veritabanı entegrasyon testleri de bulunmaktadır. Bunlar için ayrıca read-only bağlantı bilgileri yapılandırılmalıdır.

## Kendi Veritabanınızı Kullanma

MCP server yalnızca Northwind verileriyle sınırlı değildir.

Mevcut bir MySQL veya PostgreSQL veritabanına bağlanmak için `.env.example` dosyasını `.env` olarak kopyalayıp aşağıdaki değerleri ayarlayın:

- `DB_TYPE`: `mysql` veya `postgres`
- `DB_URL`: Yetkilendirilmiş read-only veritabanı kullanıcısının bağlantı adresi

Server, bağlandığı veritabanının şemasını dinamik olarak keşfeder.

Harici veri kaynaklarını bağlamadan önce erişim izinlerini ve güvenlik yapılandırmasını kontrol edin.

## Yapay Zeka Uygulamasına Bağlama

MCP server, MCP Inspector ve AnythingLLM gibi uyumlu MCP istemcileriyle kullanılabilir.

AnythingLLM için örnek bağlantı yapılandırması:

[docs/anythingllm_mcp_servers.example.json](anythingllm_mcp_servers.example.json)

Dosya yollarını kendi bilgisayarınızdaki proje konumuna göre düzenleyin.

Türkçe ve İngilizce örnek sorular için [Demo Queries](DEMO_QUERIES.md) dosyasına bakabilirsiniz.

## Ortamı Durdurma

Veritabanı verilerini silmeden Docker servislerini durdurmak için:

```powershell
docker compose --env-file .env.docker down
```

Veriler Docker volume'larında saklanır ve servisler tekrar başlatıldığında korunur. SQL başlangıç dosyaları yalnızca boş/yeni database volume'larına yüklenir. Demo verilerini silmek istemiyorsanız `down -v` kullanmayın.

## Güvenlik

Bu proje, read-only kullanım amacıyla hazırlanmış bir proof of concept (PoC) çalışmasıdır.

SQL doğrulama, sorgu sonuç sınırı ve ayrı veritabanı kullanıcıları gibi korumalar içerir. Ancak production ortamında kimlik doğrulama, kullanıcı yetkilendirmesi, sorgu kaynak limitleri, izleme ve kapsamlı güvenlik kontrollerinin ayrıca değerlendirilmesi gerekir.

Bu demo yapılandırmasını hassas production veritabanlarına doğrudan açmayın.

Ayrıntılar: [Security Notes](SECURITY_NOTES.md).

## Lisans

Projenin özgün uygulama kodu ve dokümantasyonu [MIT Lisansı](../LICENSE) altında paylaşılmaktadır.

Northwind örnek veri setlerinin kendi üçüncü taraf lisansları ve kaynak bildirimleri korunmuştur. Bu dosyalara [docs/third_party/](third_party/) klasöründen ulaşabilirsiniz.
