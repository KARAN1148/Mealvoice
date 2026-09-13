# GRANDCONNECT FOOD — Full-Stack Implementation Plan

**Tagline**: *"Food delivery for everyone — App or Call."*

GrandConnect Food is an independent food delivery platform that does **not** rely on third-party food marketplaces. It owns its restaurant network, delivery riders, customer ordering platform, order management system, delivery assignment engine, and customer support call center.

---

## 1. Core Architecture & Tech Stack

### Backend Stack
- **Runtime & Language**: Node.js v20 + TypeScript
- **Framework**: Express.js REST API
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: JWT token authentication with Role-Based Access Control (RBAC)
- **Roles**: `CUSTOMER`, `CALL_AGENT`, `RESTAURANT_ADMIN`, `RIDER`, `OPERATIONS_ADMIN`, `SUPER_ADMIN`
- **Core Services**:
  - `OrderService`: Central order engine used identically by both Online and Phone Call agent workflows.
  - `riderAssignmentService`: Automatic distance-based allocation algorithm.
  - `pricingService`: Distance-based delivery fee computation.
  - `smsService`: Mock SMS dispatch engine for order updates.
  - `paymentService`: Abstract payment layer supporting COD, Mock UPI, and Mock Card.

### Frontend Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS + Tailwind CSS (accessibility-tuned palette, high-contrast, scalable fonts)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State & Context**:
  - `AuthContext`: Manages logged-in user, JWT, and active role.
  - `CartContext`: Manages customer cart state and checkout totals.
  - `AccessibilityContext`: Toggles High-Contrast Mode & Easy Mode font sizes.
  - `DemoModeContext`: Drives live simulation steps and dev toolbar.

---

## 2. Key Modules & Differentiators

### A. Phone Call Order System (`/agent`)
- Dedicated Call Center / Agent Dashboard.
- **Incoming Call Simulator**: Displays caller phone number with `[Answer]` and `[Reject]` controls.
- **Customer Lookup**: Automatically retrieves existing customer profile, saved addresses, favorite items, and past orders.
- **Fast Re-order**: `[Repeat Last Order]` button to create repeat orders in seconds.
- **New Phone Order Form**: Direct item selection, custom delivery notes, address specification, payment choice.
- **Unified Backend**: Sends `source: PHONE_CALL` or `source: AGENT` to the core `OrderService`.

### B. Easy Order Mode (`/easy-order`)
- Designed for users who struggle with complex smartphone applications.
- Large cards, enlarged text, simple step-by-step wizard:
  1. What to eat (Breakfast, Lunch, Dinner, Snacks, Beverages, Desserts)
  2. Select restaurant
  3. Select item
  4. Specify quantity
  5. Enter delivery address
  6. Confirm order
- **Voice Ordering Prototype**: Micro-button `[🎙 Start Voice Ordering]` utilizing Web Speech API to parse natural voice commands like *"I want two biryanis from GrandConnect Kitchen"*.
- Prominent `[Call Me For Help]` and `[Call to Order]` fallbacks.

### C. Restaurant Dashboard (`/restaurant`)
- Real-time order stream displaying badges for `ONLINE`, `PHONE`, `EASY_ORDER`, `AGENT`.
- Status progression: `[Accept]` (CONFIRMED) → `[Start Preparing]` (PREPARING) → `[Mark Ready]` (READY_FOR_PICKUP).

### D. Rider Dashboard (`/rider`)
- Active deliveries, earnings summary, pickup and delivery instructions.
- Status progression: `ASSIGNED` → `RIDER_ACCEPTED` → `AT_RESTAURANT` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`.
- Interactive SVG Mock GPS tracking map displaying rider movement along route.

### E. Operations / Admin Dashboard (`/admin`)
- Operations KPIs: Total Orders, Revenue, Active Riders, Active Restaurants, Average Delivery Time.
- **Accessibility Impact Chart**: Visual breakdown of orders by source (`ONLINE`, `PHONE_CALL`, `EASY_ORDER`, `AGENT`), highlighting the startup's core market differentiator.

### F. Customer Experience (`/`, `/restaurants`, `/orders/:id`, `/profile`, `/support`)
- Landing page emphasizing the core story: *"Food delivery shouldn't require a smartphone."*
- Real-time visual timeline order tracking (`Order Placed` → `Confirmed` → `Preparing` → `Ready` → `Picked Up` → `Delivered`).
- Support page with call connection and ticket filing.

---

## 3. Database Schema (Prisma)

- **User**: Authentication, email, phone, hashed password, role.
- **Customer**: Customer profile, preferred language, user relation.
- **Address**: Customer delivery addresses with street, landmark, city, postal code.
- **Restaurant**: Name, cuisine, rating, delivery time, fee, veg status, image URL.
- **MenuCategory & MenuItem**: Grouped menu catalog with veg/non-veg flags and price.
- **Order & OrderItem**: Central order table storing `source` enum, `status` enum, monetary breakdown, payment method, delivery address.
- **OrderStatusHistory**: Audit trail of order status changes with timestamps.
- **Rider & Delivery**: Rider profiles, vehicle details, assigned deliveries, timeline timestamps.
- **CallRecord**: Call center metrics, caller phone, agent ID, duration, resulting order ID.
- **Payment**: Payment transaction status, method, reference.
- **SupportTicket**: Customer/order issues logged for support resolution.

---

## 4. Verification Plan

### Automated Verification
1. Build check for backend (`tsc`).
2. Build check for frontend Vite app (`npm run build`).
3. Seed data verification: Ensure 10 restaurants, 100+ menu items, customers, riders, agents, and orders populate cleanly.

### Manual / Interactive Verification
1. **Phone Order Flow**: Log in as `CALL_AGENT` (`agent@grandconnect.demo`), simulate incoming call, create phone order, verify order number format `GC-2026-XXXXXX`, and confirm it appears in Restaurant & Admin dashboards.
2. **Easy Order & Voice Flow**: Navigate to `/easy-order`, complete the wizard, test voice input or mock fallbacks.
3. **Restaurant & Rider Lifecycle**: Accept order as restaurant admin, mark ready, verify auto-assignment to rider, step through rider delivery steps to `DELIVERED`.
4. **Admin Source Breakdown**: Verify accessibility impact chart renders order source percentages dynamically.

---

## 5. Demo Accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@grandconnect.demo` | `demo1234` |
| Call Agent | `agent@grandconnect.demo` | `demo1234` |
| Restaurant Admin | `restaurant@grandconnect.demo` | `demo1234` |
| Rider | `rider@grandconnect.demo` | `demo1234` |
| Operations Admin | `admin@grandconnect.demo` | `demo1234` |
