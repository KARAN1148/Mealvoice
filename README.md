# MealVoice Food — Full-Stack Food Delivery Platform

**"Food delivery for everyone — App or Call."**

An independent, accessibility-first food delivery company that owns its complete ecosystem: restaurant network, delivery riders, ordering platform, order management, delivery tracking, and phone call center.

---

## 🚀 Project Overview

MealVoice Food is differentiated from services like Swiggy or Zomato by serving THREE customer groups:

| Group | Type | How They Order |
|---|---|---|
| **Group 1** | No smartphone | Call the MealVoice number. Agent places order. |
| **Group 2** | App-uncomfortable users | Use simplified **Easy Order Mode** with large buttons + voice |
| **Group 3** | Smartphone callers | Call MealVoice to have human agent place order instantly |
| **Group 4** | Comfortable app users | Full online ordering experience |

## ✨ Core Features

- ✅ **Unified Order Engine** — Phone call orders + online orders use the exact same `OrderService`
- ✅ **Call Center Agent Dashboard** — Incoming call simulation, customer lookup, fast re-order
- ✅ **Easy Order Mode** — Step-by-step wizard, large buttons, high-contrast, voice speech input
- ✅ **Voice Ordering** — Web Speech API prototype for natural language ordering
- ✅ **Restaurant Kitchen Dashboard** — Live order stream (PENDING → CONFIRMED → PREPARING → READY)
- ✅ **Rider Dashboard** — Delivery state machine + interactive simulated GPS map
- ✅ **Admin/Operations Dashboard** — Accessibility Impact Analytics + source breakdown charts
- ✅ **Real-time Order Tracking** — Auto-updating status timeline with mock GPS map
- ✅ **Mock SMS Notifications** — `smsService.ts` sends simulated SMS on order events
- ✅ **Mock Payment System** — COD, Mock UPI, Mock Card via `paymentService.ts`
- ✅ **Automatic Rider Assignment** — `riderAssignmentService.ts` assigns best available rider when order is READY
- ✅ **Accessibility Modes** — Easy Mode (larger UI), High Contrast toggle, aria-labels
- ✅ **Demo Toolbar** — Floating Dev Control Panel to switch roles and simulate calls
- ✅ **Full Seed Data** — 10 restaurants, 100+ menu items, 50+ customers, 20 riders, 100+ orders across all sources

---

## 🏗️ Architecture

```
frontend/              React + TypeScript + Vite + Tailwind CSS
  src/
    pages/             All route-level page components
    components/        Reusable UI components (Navbar, StatusBadge, Map, etc.)
    context/           AuthContext, CartContext, AccessibilityContext, DemoModeContext
    api/               API client wrapper
    types/             TypeScript interfaces

backend/               Node.js + Express + TypeScript
  src/
    controllers/       Route handler functions
    routes/            Express router definitions
    services/          Core business logic:
                         orderService.ts (UNIFIED ORDER ENGINE)
                         smsService.ts (mock SMS)
                         paymentService.ts (mock payment)
                         riderAssignmentService.ts (rider allocation)
                         pricingService.ts (delivery fee calculation)
    middleware/        JWT auth, error handler
    utils/             Logger, JWT helpers
    config/            Environment config
  prisma/
    schema.prisma      Full database schema
    seed.ts            Realistic demo seed data
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons |
| Backend | Node.js v20, Express.js, TypeScript |
| Database | SQLite (via Prisma ORM — production-ready to swap to PostgreSQL) |
| Auth | JWT tokens, bcryptjs password hashing |
| ORM | Prisma v5 |

---

## 🗄️ Database Schema

| Model | Description |
|---|---|
| `User` | All platform users with role (CUSTOMER, CALL_AGENT, RESTAURANT_ADMIN, RIDER, OPERATIONS_ADMIN, SUPER_ADMIN) |
| `Customer` | Customer profile, preferences, addresses |
| `Address` | Customer delivery addresses |
| `Restaurant` | Restaurant details, cuisine, hours, fees |
| `MenuCategory` / `MenuItem` | Grouped food catalog |
| `Order` | **Core order table** — stores `source` (ONLINE/PHONE_CALL/EASY_ORDER/AGENT) and full status lifecycle |
| `OrderItem` | Items within each order |
| `OrderStatusHistory` | Audit trail of status changes |
| `Rider` | Rider profile, vehicle, earnings |
| `Delivery` | Delivery assignment with GPS timestamps |
| `Payment` | Payment record with method and status |
| `CallRecord` | Phone call metadata linking customer, agent, and order |
| `Notification` | User notification history |
| `SupportTicket` | Customer support ticket system |

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+ 
- Git

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Database & Seed
```bash
cd backend
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### Step 3: Start Backend Server
```bash
cd backend
npx ts-node src/index.ts
```
Backend will run on: http://localhost:5000

### Step 4: Install Frontend Dependencies  
```bash
cd frontend
npm install
```

### Step 5: Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

---

## 🌐 Environment Variables

**backend/.env:**
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="mealvoice_super_secret_jwt_key_2026"
NODE_ENV="development"
```

---

## 👤 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@mealvoice.demo` | `demo1234` |
| Call Agent | `agent@mealvoice.demo` | `demo1234` |
| Restaurant Admin | `restaurant@mealvoice.demo` | `demo1234` |
| Rider | `rider@mealvoice.demo` | `demo1234` |
| Operations Admin | `admin@mealvoice.demo` | `demo1234` |

---

## 🎭 Full Demo Flow

### Scenario: Customer calls because they don't have a smartphone

1. **Open** http://localhost:3000
2. Click **Demo Controls** (floating button, bottom-right)
3. Click **"Simulate Incoming Phone Call"** — switches you to Call Agent and shows INCOMING CALL screen
4. Click **[Answer Call]** — system looks up customer in database
5. Either repeat last order OR fill the **New Phone Order Form**
6. Click **[Submit Phone Order]** — creates order using unified `OrderService`
7. Switch to **Restaurant Admin** (via Demo Controls) — see the new PHONE_CALL order appear
8. Click **[Accept]** → **[Start Preparing]** → **[Mark Ready]**
9. System automatically runs `riderAssignmentService` and assigns a rider
10. Switch to **Rider** (via Demo Controls) — see assigned delivery
11. Click **[Accept]** → **[At Restaurant]** → **[Picked Up]** → **[Delivered]**
12. Switch to **Admin** (via Demo Controls) — see Phone Orders +1, Revenue updated, Accessibility Impact chart updated

---

## 📡 API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT token |
| POST | `/api/auth/register` | Register new customer |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/restaurants` | List all restaurants (supports search & filter) |
| GET | `/api/restaurants/:id` | Restaurant menu and details |
| GET | `/api/restaurants/orders` | Restaurant admin order stream |
| PUT | `/api/restaurants/orders/:id/status` | Update order status (accept/prepare/ready) |
| POST | `/api/orders` | Create online order (UNIFIED ENGINE) |
| GET | `/api/orders/:id` | Get order details + status history |
| PUT | `/api/orders/:id/status` | Update order status |
| POST | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/call-orders/customer-lookup` | Lookup customer by phone number |
| POST | `/api/call-orders/customer` | Create phone customer profile |
| POST | `/api/call-orders` | Create phone call order (UNIFIED ENGINE) |
| GET | `/api/call-orders` | Get all phone/agent orders |
| GET | `/api/rider/deliveries` | Get rider deliveries |
| POST | `/api/rider/deliveries/:id/accept` | Accept delivery assignment |
| PUT | `/api/rider/deliveries/:id/status` | Update delivery status |
| GET | `/api/admin/dashboard` | Ops dashboard data + accessibility analytics |
| GET | `/api/admin/analytics` | Order source breakdown |
| GET | `/api/customers/profile` | Customer profile + order history |
| POST | `/api/support/ticket` | Create support ticket |
| GET | `/api/support/sms-logs` | View recent mock SMS notifications |
| GET | `/api/health` | Health check |

---

## 🔮 Future Production Integrations

| Feature | Integration |
|---|---|
| Real SMS | Twilio, AWS SNS, or MSG91 (Indian) via `smsService.ts` |
| Real Payments | Razorpay, PayU, or Stripe via `paymentService.ts` |
| GPS Tracking | Google Maps API or HERE Maps |
| Real-time Events | Socket.IO or Firebase Realtime Database |
| Database | Migrate SQLite → PostgreSQL (change `DATABASE_URL` in .env) |
| Phone/IVR System | Twilio Voice, Exotel (Indian) for actual inbound calls |
| Push Notifications | Firebase FCM |
| Voice NLP | Google Dialogflow or Whisper API for better voice command parsing |

---

## 🎯 Key Differentiator

> Traditional food delivery requires a smartphone app. MealVoice doesn't.

```
PHONE → Human Agent → SAME BACKEND → Restaurant → Rider → Customer
 APP  → Online Order → SAME BACKEND → Restaurant → Rider → Customer
EASY  → Simple UI   → SAME BACKEND → Restaurant → Rider → Customer
```

Every order — regardless of how it originates — flows through the same unified backend `OrderService`, creating a single coherent delivery ecosystem visible in the Admin Dashboard's **Accessibility Impact Analytics**.
