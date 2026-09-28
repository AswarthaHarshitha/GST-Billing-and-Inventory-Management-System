# GST Billing & Inventory Management System

A billing and stock-management application for a wholesale grocery business (sugar, atta, edible oil, rice). It generates GST-compliant invoices — automatically choosing CGST + SGST for intrastate sales and IGST for interstate sales from the customer's state code — deducts stock as invoices are raised, and produces GSTR-1 / GSTR-3B summaries for filing.

**Stack:** Spring Boot 3 (Java 17, Spring Data JPA, H2, Lombok) · React · REST

---

## 🚀 Quick Start

### Requirements
- Java 17+ (builds on 17 through 25)
- Maven 3.6+
- Node.js 18+

---

## Step 1 — Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at: http://localhost:8080

H2 Console: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:wholesaledb
- Username: sa
- Password: (leave blank)

---

## Step 2 — Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend opens at: http://localhost:3000

---

## 📦 What's Pre-loaded

### Products (auto-seeded on startup):
| Product           | HSN   | GST | Unit |
|-------------------|-------|-----|------|
| Sugar             | 1701  | 5%  | KG   |
| Wheat Flour (Atta)| 1101  | 0%  | KG   |
| Refined Sunflower Oil | 1512 | 5% | LTR |
| Rice (Sona Masoori) | 1006 | 5% | KG  |
| Rice (Basmati)    | 1006  | 5%  | KG   |
| Groundnut Oil     | 1508  | 5%  | LTR  |
| Palm Oil          | 1511  | 5%  | LTR  |
| Salt (Iodised)    | 2501  | 0%  | KG   |

### Customers seeded on startup:
- Ravi Kirana Store (AP — Intrastate → CGST+SGST)
- Lakshmi General Stores (AP — Intrastate)
- Sri Venkateshwara Traders (Telangana — Interstate → IGST)

---

## 🧾 Features

- **GST Invoice**: Auto CGST+SGST for AP, IGST for other states
- **Stock Management**: Deducted automatically on billing
- **GST Report**: GSTR-1 and GSTR-3B format summaries
- **HSN Summary**: Table 12 for GSTR-1 filing
- **B2B Report**: Table 4 for registered buyers
- **Print Invoice**: Browser print / Save as PDF
- **Low Stock Alert**: Dashboard warning
- **H2 Console**: View DB directly at /h2-console

---

## 🔧 Customize

Edit these files for your business:

1. **Your GSTIN** — `backend/src/main/java/com/wholesale/gst/service/InvoiceService.java`
   - Change `SELLER_GSTIN` and `SELLER_STATE_CODE`

2. **Business Name/Address** — `frontend/src/pages/InvoiceView.js`
   - Search for "Your Business Name"

3. **Add Products** — Use the Products page in the UI

---

## 📂 Project Structure

```
GST-Billing-and-Inventory-Management-System/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/wholesale/gst/
│       ├── GstApplication.java
│       ├── model/          (Product, Customer, Invoice, InvoiceItem)
│       ├── repository/     (Product, Customer, Invoice repositories)
│       ├── service/        (InvoiceService — GST logic)
│       ├── controller/     (REST APIs)
│       └── config/         (DataLoader, WebConfig/CORS)
└── frontend/
    ├── package.json
    └── src/
        ├── App.js + App.css
        ├── api.js
        └── pages/
            ├── Dashboard.js
            ├── Products.js
            ├── Customers.js
            ├── NewInvoice.js
            ├── InvoiceList.js
            ├── InvoiceView.js
            └── GstReport.js
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/products | All products |
| POST | /api/products | Add product |
| GET | /api/customers | All customers |
| POST | /api/customers | Add customer |
| GET | /api/invoices | All invoices |
| POST | /api/invoices | Create invoice (auto GST) |
| GET | /api/invoices/range?from=&to= | Filter by date |
| GET | /api/reports/dashboard | This month summary |
| GET | /api/reports/gst-summary?from=&to= | GST report |

