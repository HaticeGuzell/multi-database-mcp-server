
# Demo Queries

Example natural-language prompts for testing the Multi-Database MCP Server with an MCP-compatible AI client, such as AnythingLLM.

The examples below use the included Northwind sample databases. These are natural-language questions, not predefined SQL queries.

The AI client should discover the database schema using `get_tables` and execute appropriate read-only queries using `query`.

## PostgreSQL — Classic Northwind

The PostgreSQL sample contains 91 customers, 830 orders, and 77 products.

### 1. Database discovery

**English:**
What tables are available in the connected database? Briefly explain what kind of information they contain.

**Türkçe:**
Bağlı veritabanında hangi tablolar var? Genel olarak ne tür bilgiler tutulduğunu kısaca anlatır mısın?

### 2. Basic database statistics

**English:**
How many customers, orders, and products do we have in total?

**Türkçe:**
Toplam kaç müşterimiz, siparişimiz ve ürünümüz var?

### 3. Customer filtering

**English:**
List the company names and customer IDs of our customers located in Germany.

**Türkçe:**
Almanya'daki müşterilerimizin şirket isimlerini ve müşteri kodlarını getir.

### 4. Customer distribution

**English:**
Which five countries have the highest number of customers? Show the customer count for each country.

**Türkçe:**
Müşterilerimiz en çok hangi ülkelerde bulunuyor? En fazla müşteriye sahip beş ülkeyi müşteri sayılarıyla göster.

### 5. Order analysis

**English:**
Show our five customers with the highest number of orders, including their company names, countries, and total order counts.

**Türkçe:**
En fazla sipariş veren beş müşterimizi şirket isimleri, ülkeleri ve toplam sipariş sayılarıyla göster.

### 6. Product analysis

**English:**
Which five products have the highest total quantities ordered?

**Türkçe:**
Toplam sipariş edilen miktara göre en çok satılan beş ürünümüz hangileri?

### 7. Sales analysis

**English:**
Which five customers generated the highest total sales in 1997? Include discounts in the calculation and exclude freight charges.

**Türkçe:**
1997 yılında en yüksek toplam alışveriş tutarına ulaşan beş müşterimiz hangileri? İndirimleri hesaba kat, nakliye ücretlerini dahil etme.

### 8. Monthly sales

**English:**
Show our monthly sales totals for 1997, accounting for discounts and excluding freight charges.

**Türkçe:**
1997 yılındaki satış tutarlarını aylara göre göster. İndirimleri hesaba kat, nakliye ücretlerini dahil etme.

### 9. Follow-up question

Ask this immediately after question 7, in the same conversation.

**English:**
How many orders did the top customer from the previous analysis place in 1997, and to which countries were those orders shipped?

**Türkçe:**
Az önceki analizde ilk sırada çıkan müşterimizin 1997 yılında kaç siparişi vardı? Bu siparişler hangi ülkelere gönderilmiş?

---

## MySQL — Northwind Sample

The MySQL sample contains 29 customers, 48 orders, and 45 products.

This dataset uses a different schema and different sample records from the PostgreSQL version. Discover the schema before querying.

### 1. Database discovery

**English:**
What tables are available in the connected database? Briefly describe the information they contain.

**Türkçe:**
Bağlı veritabanında hangi tablolar var? Ne tür bilgiler tutulduğunu kısaca anlatır mısın?

### 2. Customer information

**English:**
List the company names and customer IDs of customers located in the USA.

**Türkçe:**
ABD'deki müşterilerin şirket isimlerini ve müşteri numaralarını listele.

### 3. Order analysis

**English:**
Show the five customers who have placed the most orders, including their company names and order counts.

**Türkçe:**
En fazla sipariş veren beş müşteriyi şirket isimleri ve sipariş sayılarıyla göster.

### 4. General statistics

**English:**
How many customers, orders, and products are stored in this database?

**Türkçe:**
Bu veritabanında toplam kaç müşteri, sipariş ve ürün bulunuyor?

---

## Read-only Security Demonstration

The MCP server only permits validated read-only SELECT queries.

The following example uses the PostgreSQL sample database.

### Attempt a database modification

**English:**
Update the country of customer ALFKI to Turkey.

**Türkçe:**
ALFKI kodlu müşterinin ülke bilgisini Türkiye olarak günceller misin?

**Expected behavior:** The modification must be rejected. No database record should be changed.

### Verify that the data remains unchanged

**English:**
Retrieve the current company name and country of customer ALFKI directly from the database.

**Türkçe:**
ALFKI kodlu müşterinin güncel şirket ismini ve ülke bilgisini veritabanından tekrar kontrol eder misin?

Expected country: `Germany`.

An AI client may reject a modification request before calling the tool. To independently test server-side validation, submit an UPDATE statement directly through the MCP Inspector's `query` tool and confirm that the server rejects it.

## Notes

- These examples require an MCP-compatible AI client with the appropriate server connected.
s- The `query` tool accepts only validated read-only SELECT statements.
- Results are limited to a maximum of 100 rows per query.
- Actual tool usage and generated SQL depend on the connected AI model.
- MySQL and PostgreSQL use different Northwind variants,s their results should not be expected to match.
