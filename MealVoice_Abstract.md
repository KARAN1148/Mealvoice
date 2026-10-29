# MealVoice — Abstract

**Title:** MealVoice: An Accessible, Voice-Assisted & Telephonically-Integrated Independent Food Delivery Platform

**Authors / Developers:** MealVoice Development Team

**Platform Type:** Full-Stack, Multi-Role Food Delivery Ecosystem

**Technology Domain:** Accessible Web Technology, Human-Computer Interaction, REST API Architecture, Real-Time Order Management

---

## Abstract

### 1. Background & Motivation

Contemporary food delivery platforms — while technologically sophisticated — have systematically overlooked a significant segment of the population. Visually impaired users, elderly citizens, individuals with limited motor capabilities, and non-tech-savvy customers face severe barriers when attempting to navigate modern touch-first, visually complex food delivery applications. The assumption that every user owns a smartphone and possesses the digital literacy required to interact with multi-layered UIs creates an invisible yet profound accessibility gap.

**MealVoice** is conceived to directly address and dismantle this accessibility gap. It is an end-to-end, independently operated food delivery ecosystem that does not depend on third-party food marketplaces. Instead, it owns and orchestrates its entire service chain: restaurant network, delivery rider fleet, customer ordering platform, intelligent order management engine, and a dedicated telephonic call-center workflow — all unified under a single, synchronized platform architecture.

---

### 2. Problem Statement

Existing food delivery solutions fail to serve the following underserved user cohorts:

| User Cohort | Core Barrier |
|:---|:---|
| **Visually Impaired Users** | Screen-reader incompatibility, low-contrast UI, lack of voice navigation |
| **Elderly Citizens** | Overly complex multi-step interfaces, small font sizes, tech-unfamiliarity |
| **Non-Tech-Savvy Customers** | Cognitive overload from feature-dense apps, absence of guided ordering |
| **Users Without Smartphones** | Total exclusion from digital food delivery services |
| **Users with Motor Disabilities** | Reliance on precise touch gestures, inaccessible interactive elements |

MealVoice proposes a dual-interface accessibility model: a **voice-driven web application** for those capable of minimal digital interaction and a **telephonic call-agent workflow** for those who cannot or do not use smartphones at all.

---

### 3. Objectives

The primary objectives of the MealVoice platform are:

1. **Bridge the digital divide** by extending food delivery access to users traditionally excluded from app-based ecosystems.
2. **Implement voice-first ordering** utilizing the Web Speech API (Speech-to-Text & Text-to-Speech) for hands-free, screen-reader-compatible interaction.
3. **Establish a telephonic ordering channel** where trained call-center agents place orders on behalf of phone-in customers through a dedicated agent workspace.
4. **Design an accessible UI** following WCAG 2.1 Level AA guidelines, supporting high-contrast palettes, scalable typography, full keyboard navigation, and screen-reader ARIA optimization.
5. **Build a multi-role, enterprise-grade backend** supporting six distinct user roles (Customer, Call Agent, Restaurant Admin, Delivery Rider, Operations Admin, Super Admin) with robust JWT-based Role-Based Access Control (RBAC).
6. **Deliver real-time order lifecycle management** from placement to delivery, with comprehensive audit trails and live status propagation across all roles simultaneously.

---

### 4. System Architecture

#### 4.1 Frontend Architecture

The MealVoice frontend is engineered as a high-performance Single Page Application (SPA) using **React 18 with TypeScript** and **Vite** as the build toolchain. The UI is styled with **Tailwind CSS** augmented by vanilla CSS for custom accessibility tokens, ensuring a responsive, accessibility-tuned design system.

**Core Frontend Modules:**

- **`AuthContext`**: Centralized authentication state managing JWT tokens, active user sessions, and role-specific route guarding.
- **`CartContext`**: Real-time shopping cart state with item accumulation, pricing computation, and checkout flow management.
- **`AccessibilityContext`**: Dynamic toggles for High-Contrast Mode, Easy Mode font scaling (up to 200%), and screen-reader optimizations.
- **`DemoModeContext`**: An embedded live-simulation engine enabling real-time feature demonstrations without backend dependency during presentations.

**Navigation & Routing**: React Router v6 with role-aware protected routes that redirect unauthorized access based on the authenticated user's role profile.

#### 4.2 Backend Architecture

The backend is built on **Node.js v20+ with Express.js** written in TypeScript, exposing a well-structured REST API consumed by the React frontend.

**Core Backend Services:**

| Service | Responsibility |
|:---|:---|
| **`OrderService`** | Unified order creation engine shared identically across online, voice, easy-order, and phone-call workflows |
| **`riderAssignmentService`** | Automatic distance-based delivery rider allocation algorithm |
| **`pricingService`** | Dynamic delivery fee computation based on distance tiers |
| **`smsService`** | Mock SMS notification dispatch for order status updates |
| **`paymentService`** | Abstract payment layer supporting Cash on Delivery, Mock UPI, and Mock Card transactions |

**Authentication & Security**: JSON Web Tokens (JWT) with `bcryptjs` password hashing for secure credential storage. Middleware layers (`authMiddleware`, `requireRole`) enforce fine-grained route-level access control. Prisma ORM eliminates SQL injection risks through parameterized query abstraction.

#### 4.3 Database Architecture

The relational data model, engineered through **Prisma ORM** with SQLite (development) and PostgreSQL (production-ready), encompasses the following key entities:

```
User ──────┬──── Customer (profile, language preference)
           ├──── Rider (vehicle, availability, earnings)
           └──── CallAgent / RestaurantAdmin / Admin

Restaurant ─┬──── MenuCategory
             └──── MenuItem (price, veg/non-veg, availability)

Order ──────┬──── OrderItem
            ├──── OrderStatusHistory (full audit trail)
            ├──── Delivery (rider coordinates, timestamps)
            ├──── Payment (method, reference, status)
            └──── CallRecord (if source = PHONE_CALL)

SupportTicket ──── Review (linked to Customer & Order)
```

The `Order` entity features a `source` enum (`ONLINE`, `PHONE_CALL`, `EASY_ORDER`, `AGENT`) which is the architectural cornerstone enabling the platform's accessibility impact analytics.

---

### 5. Key Features & Innovations

#### 5.1 Voice-Assisted Ordering System

The **Web Speech API** integration allows users to speak natural-language food commands directly in the browser. The system parses utterances such as *"I want two biryanis from MealVoice Kitchen"* and automatically populates the restaurant, item, and quantity fields, jumping the user directly to address confirmation.

- **Speech-to-Text (STT)**: Live microphone capture with `en-IN` locale optimization for Indian English accents.
- **Text-to-Speech (TTS)**: Audible readback of order confirmations and step instructions.
- **Graceful Fallback**: Simulated voice command execution for browsers without native Speech API support, ensuring universal compatibility.

#### 5.2 Easy Order Mode (`/easy-order`)

A purpose-built, ultra-simplified 6-step wizard interface designed for elderly and low-digital-literacy users:

1. **Step 1 — Meal Category Selection**: Large card-based selection (Breakfast, Lunch, Dinner, Snacks, Beverages, Desserts) with high-contrast, oversized typography.
2. **Step 2 — Restaurant Selection**: Streamlined list of up to 5 nearby restaurants with clear names, cuisine type, and a single prominent selection control.
3. **Step 3 — Food Item Selection**: Items displayed as large, tappable cards with name and price — no clutter.
4. **Step 4 — Quantity Control**: Single large `+` / `−` control with massive numeral display (5xl font).
5. **Step 5 — Delivery Address**: Full-width textarea with pre-populated address for minimal re-entry.
6. **Step 6 — Order Confirmation**: Full order summary with restaurant, item, quantity, total cost, and a single large green `[Place Order Now]` button with an animated confirmation glow.

A persistent `[Call Me For Help]` button (`tel:1800-472-6326`) is embedded at every step, ensuring no user is ever left without a human support option.

#### 5.3 Telephonic Call-Agent Workflow (`/agent`)

A dedicated **Call Center Dashboard** enables agents to:
- Simulate incoming phone calls with caller ID display and `[Answer]` / `[Reject]` controls.
- Perform instant customer lookup by phone number, retrieving saved addresses, favorite items, and complete order history.
- Use `[Repeat Last Order]` for single-click re-orders — critical for elderly customers with fixed food preferences.
- Create new phone orders through a structured form with direct menu search, delivery note fields, address specification, and payment method selection.
- All phone orders are routed through the same core `OrderService` with `source: PHONE_CALL` tagging, ensuring consistent processing and visibility in admin dashboards.

#### 5.4 Multi-Role Ecosystem

| Role | Dashboard Location | Core Capabilities |
|:---|:---|:---|
| **Customer** | `/`, `/restaurants`, `/orders/:id` | Browse, voice-order, track, review, raise tickets |
| **Call Agent** | `/agent` | Receive calls, lookup customers, place phone orders, log calls |
| **Restaurant Admin** | `/restaurant` | Manage menus, accept orders, update prep status |
| **Delivery Rider** | `/rider` | View assigned deliveries, update delivery status, track earnings |
| **Operations Admin** | `/admin` | Monitor KPIs, view accessibility impact analytics, manage tickets |
| **Super Admin** | `/super-admin` | Full platform control, user role management, audit logs |

#### 5.5 Real-Time Order Lifecycle Tracking

Orders progress through a clearly defined, role-synchronized status pipeline:

```
PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP
       → ASSIGNED → RIDER_ACCEPTED → AT_RESTAURANT
       → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

Each transition is recorded in `OrderStatusHistory` with a timestamp, creating a complete, immutable audit trail visible to all stakeholders simultaneously.

---

### 6. Accessibility & WCAG 2.1 Compliance

MealVoice is engineered in full adherence to **WCAG 2.1 Level AA** guidelines across all four accessibility principles:

| WCAG Principle | MealVoice Implementation |
|:---|:---|
| **Perceivable** | High-contrast color palette, adjustable font sizes (100%–200%), text alternatives for all non-text content, `aria-live` regions for dynamic announcements |
| **Operable** | Complete keyboard-only navigation, visible focus indicators on all interactive elements, large click/tap targets in Easy Mode |
| **Understandable** | Consistent layout structure across all pages, predictable interactive feedback, real-time voice prompts for state changes |
| **Robust** | Tested for compatibility with NVDA, JAWS, and VoiceOver screen readers; semantic HTML5 landmark regions |

---

### 7. API Design

The MealVoice REST API follows resource-oriented design principles with consistent JSON response schemas:

```
POST   /api/auth/register       →  Register new user accounts
POST   /api/auth/login          →  Authenticate & receive JWT
GET    /api/restaurants         →  Fetch restaurants & menus
POST   /api/orders              →  Create online or voice orders
POST   /api/agent/orders        →  Place call-agent assisted orders
GET    /api/orders/:id/track    →  Live order status updates
GET    /api/rider/deliveries    →  Active delivery tasks for riders
POST   /api/support/tickets     →  Submit customer support queries
GET    /api/admin/analytics     →  Order source breakdown & KPIs
```

---

### 8. Demo Credentials

For evaluation and demonstration purposes, the following seeded accounts are available:

| Role | Email | Password |
|:---|:---|:---|
| Customer | `customer@mealvoice.demo` | `demo1234` |
| Call Agent | `agent@mealvoice.demo` | `demo1234` |
| Restaurant Admin | `restaurant@mealvoice.demo` | `demo1234` |
| Delivery Rider | `rider@mealvoice.demo` | `demo1234` |
| Operations Admin | `admin@mealvoice.demo` | `demo1234` |

---

### 9. Conclusion

MealVoice represents a paradigm shift in food delivery platform design — one that places **digital inclusion** at its architectural core rather than treating accessibility as a post-launch afterthought. By combining a voice-first web interface, a simplified step-by-step Easy Order wizard, and a fully staffed telephonic call-agent channel, MealVoice extends the reach of food delivery services to populations that have been systematically excluded from the digital economy.

The platform's enterprise-grade, multi-role architecture — backed by a robust Node.js/TypeScript backend, Prisma ORM, JWT-based RBAC, and a React 18 frontend — demonstrates that accessibility and technical sophistication are not mutually exclusive. MealVoice is a proof-of-concept for the next generation of inclusive digital services, where the answer to *"Food delivery for everyone"* is not a slogan but a measurable, implementable engineering commitment.

---

**Repository:** [github.com/KARAN1148/Mealvoice](https://github.com/KARAN1148/Mealvoice)
**License:** MIT License
**Compliance Standard:** WCAG 2.1 Level AA
**Tagline:** *"Food delivery for everyone — App or Call."*
