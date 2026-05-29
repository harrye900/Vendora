# Vendora — Product Design & Development Phases

## Product Overview

Vendora is a WhatsApp-first commerce platform for SMEs and social sellers.

The platform helps sellers:

* Create orders
* Generate payment links
* Collect customer shipping information
* Track payments automatically
* Manage shipping and delivery
* Send WhatsApp order updates

### Main Workflow

```
Customer sends message on WhatsApp
↓
Seller creates order
↓
System generates payment link
↓
Customer opens checkout page
↓
Customer enters: name, phone number, delivery address
↓
Customer pays online
↓
Payment verified automatically
↓
Order status changes to PAID
↓
Seller ships item
↓
Seller updates order to SHIPPED
↓
Customer receives WhatsApp notification
↓
Seller updates order to DELIVERED
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, React Router, Axios |
| Backend | ASP.NET Core Web API, Entity Framework Core, JWT Authentication |
| Database | PostgreSQL |
| Payments | Paystack API |
| Messaging | WhatsApp Cloud API |
| Deployment | Frontend → Vercel, Backend → Render/Railway/Azure, DB → Supabase PostgreSQL |

---

## Phase 1 — Project Setup ✅

**Goal:** Initialize frontend and backend architecture.

### Frontend
- [x] React app (Vite)
- [x] Tailwind CSS
- [x] React Router
- [x] Axios API service layer
- [x] Layout system

### Backend
- [x] ASP.NET Core Web API
- [x] PostgreSQL + Entity Framework Core
- [x] JWT Authentication
- [x] CORS configured
- [x] Swagger API docs

---

## Phase 2 — Authentication System

**Goal:** Allow sellers to create accounts and log in.

### APIs
```
POST /api/auth/register
POST /api/auth/login
```

### Database: Users Table
| Field | Type |
|-------|------|
| Id | Guid |
| BusinessName | string |
| Email | string |
| PasswordHash | string |
| PhoneNumber | string |
| CreatedAt | DateTime |

---

## Phase 3 — Seller Dashboard

**Goal:** Provide overview of business activity.

- Total Orders
- Pending Payments
- Paid Orders
- Shipped / Delivered Orders
- Revenue Summary
- Recent orders table

---

## Phase 4 — Order Management

**Goal:** Allow sellers to create and manage orders.

### APIs
```
GET    /api/orders
POST   /api/orders
GET    /api/orders/{id}
PATCH  /api/orders/{id}
```

### Order Statuses

| Payment Status | Delivery Status |
|---------------|----------------|
| Pending | Processing |
| Paid | Shipped |
| Failed | Delivered |
| Refunded | Cancelled |

---

## Phase 5 — Payment Link Generation

**Goal:** Generate payment links using Paystack.

```
Seller creates order → Backend creates Paystack session → Checkout URL generated → Seller sends link to customer
```

### API
```
POST /api/payments/create-link
```

---

## Phase 6 — Customer Checkout Page

**Goal:** Allow customers to enter delivery details and pay.

**Route:** `/checkout/{orderId}`

### Customer Form Fields
- Full Name
- Phone Number
- Address
- City
- State

---

## Phase 7 — Payment Webhook Automation

**Goal:** Automatically verify payments and update orders.

### API
```
POST /api/payments/webhook
```

When payment succeeds:
- PaymentStatus → PAID
- Send WhatsApp confirmation

---

## Phase 8 — WhatsApp Notifications

**Goal:** Send automated WhatsApp updates.

| Event | Message |
|-------|---------|
| Payment received | "Your payment has been received successfully." |
| Order shipped | "Your order has been shipped." |
| Order delivered | "Your order has been delivered." |

---

## Phase 9 — Delivery Management

**Goal:** Track shipment and delivery progress.

- Mark order as shipped/delivered
- Delivery timeline
- Shipping notes

---

## Phase 10 — Customer Management

**Goal:** Store and manage customer data.

- Customer profiles
- Order history
- Customer search
- Repeat customer tracking

---

## Phase 11 — Analytics & Reporting

**Goal:** Provide business insights.

- Revenue tracking
- Sales reports
- Best-selling products
- Order trends

---

## Phase 12 — Inventory Management

**Goal:** Track product inventory.

- Add products
- Update stock
- Low stock alerts
- Product catalog

---

## Phase 13 — AI Assistant

**Goal:** AI-powered seller assistance.

- Suggested replies
- AI order extraction from messages
- Smart customer support
- OpenAI API integration

---

## Phase 14 — Instagram & Multi-Channel Support

**Goal:** Support Instagram and additional channels.

- Instagram DM integration
- Unified inbox
- Multi-channel conversations

---

## Database Schema

### Users
`Id, BusinessName, Email, PasswordHash, PhoneNumber, CreatedAt`

### Orders
`Id, UserId, ProductName, Amount, PaymentStatus, DeliveryStatus, CheckoutUrl, PaymentReference, CreatedAt`

### Customers
`Id, OrderId, Name, Phone, Address, City, State`

### Payments
`Id, OrderId, Provider, Reference, Amount, Status, PaidAt`

### Products
`Id, UserId, Name, Price, Stock`

---

## MVP Priority

Build ONLY these first:

1. ✅ Authentication
2. Seller Dashboard
3. ✅ Order Management (API ready)
4. Payment Link Generation
5. Checkout Page
6. Payment Webhook
7. WhatsApp Notifications
8. Delivery Status Updates

---

## MVP Goal

```
Create Order → Generate Payment Link → Customer Pays → Order Auto-Marked Paid → Seller Ships → Customer Receives Updates
```

---

## Project Structure

```
Vendora/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Orders.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── vite.config.js
├── backend/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   └── OrdersController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── DTOs/
│   │   └── AuthDtos.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Order.cs
│   │   ├── Customer.cs
│   │   └── Payment.cs
│   ├── Services/
│   ├── Program.cs
│   └── appsettings.json
└── README.md
```

---

## Running Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet run
```

Backend runs on `http://localhost:5000` | Frontend on `http://localhost:5173`
