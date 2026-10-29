# 🍲 MealVoice - Accessible Food Delivery & Voice-Assisted Platform

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Frontend-React.js%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-purple?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **MealVoice** is an end-to-end, highly accessible, multi-role food ordering and delivery ecosystem designed to bridge the digital divide for visually impaired users, elderly citizens, and non-tech-savvy customers via voice control and phone-assisted ordering.

---

## 📌 Executive Summary

Modern food delivery platforms often overlook users with visual impairments, motor disabilities, or low technical literacy. **MealVoice** re-imagines food delivery by introducing dual-interface accessibility: an intelligent Web Speech voice assistant on the web application and an integrated Call-Center Agent workflow for phone-assisted ordering.

Built on a robust Node.js/Express REST backend powered by Prisma ORM and a high-performance React + TypeScript frontend, MealVoice connects customers, call agents, restaurant owners, delivery riders, and platform administrators into a unified, synchronized platform.

---

## ✨ Key Features & Capabilities

### 🎙️ 1. Voice & Accessible Ordering System
- **Web Speech Integration**: Speech-to-Text (STT) and Text-to-Speech (TTS) enable full hands-free navigation, item searching, and checkout.
- **Easy Voice Mode**: Simplified UI with high-contrast color palettes, large typography controls, and screen-reader-optimized ARIA labels.
- **Phonetic & Multi-Lingual Support**: Optimized for regional language accents and common acoustic variations.

### 📞 2. Telephonic Call-Agent Assistance
- **Simulated Call Agent Hub**: Call center agents can receive incoming phone orders and place orders on behalf of customers in real-time.
- **Call Records & Logs**: Automated tracking of call duration, transcript notes, customer history, and linked order IDs.

### 👥 3. Multi-Role Ecosystem Matrix

| Role | Access Level & Core Responsibilities |
| :--- | :--- |
| **Customer** | Voice & web browsing, address management, order placement, live tracking, reviews, & support tickets. |
| **Call Agent** | Dedicated inbound call workspace, customer search, manual order booking, call logging. |
| **Restaurant Admin** | Menu management, inventory toggles (veg/non-veg/availability), order acceptance & prep tracking. |
| **Delivery Rider** | Live delivery assignment dashboard, status updates (accepted/picked up/delivered), earnings overview. |
| **Operations Admin** | Order dispatches, system logs, ticket resolutions, refund management, and platform analytics. |
| **Super Admin** | Full platform control, user role management, system metrics, and audit logs. |

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Framework**: React 18 with TypeScript & Vite
- **State & Routing**: React Context API & React Router DOM
- **UI & Accessibility**: Tailwind CSS, Lucide Icons, Web Speech API, ARIA Live Regions
- **HTTP Client**: Axios with centralized error handlers & JWT interceptors

### Backend Architecture
- **Runtime**: Node.js v20+ with Express.js (TypeScript)
- **Database ORM**: Prisma ORM (SQLite / PostgreSQL ready)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security**: CORS protection, environment isolation, input validation

---

## 📐 Database Entity Architecture

The relational schema engineered via Prisma includes:
- **`User` / `Customer` / `Rider`**: Role-based access control (RBAC) with linked profile entities.
- **`Restaurant` / `MenuItem` / `MenuCategory`**: Structured menu catalog with dynamic pricing and availability.
- **`Order` / `OrderItem` / `OrderStatusHistory`**: Complete audit trail for order states from pending to delivered.
- **`Delivery`**: Real-time rider coordinates, timestamp tracking, and estimated delivery timers.
- **`CallRecord`**: Logs for telephone-assisted agent ordering.
- **`SupportTicket` & `Review`**: Integrated customer satisfaction and query resolution mechanisms.

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 🚀 Option A: 1-Click Launch (Windows - Recommended)
Simply double-click or run the included `run.bat` script in the root directory:
```cmd
run.bat
```
This automated launcher will:
1. Verify Node.js and NPM environments.
2. Free up ports `5000` and `3000` from any lingering processes.
3. Automatically install backend and frontend `node_modules` if not already present.
4. Push Prisma database migrations and seed initial demo data if needed.
5. Launch the Backend API and Frontend in separate dedicated console windows.
6. Open your default web browser directly to `http://localhost:3000`.
7. Allow clean, 1-key graceful shutdown of all services when finished.

---

### 🛠️ Option B: Manual Launch Guide

#### 1. Repository Setup
```bash
git clone https://github.com/KARAN1148/Mealvoice.git
cd Mealvoice
```

#### 2. Backend Configuration & Launch
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup Database & Seed Mock Data
npx prisma db push
npm run seed

# Start Backend Server (Runs on http://localhost:5000)
npm run dev
```

#### 3. Frontend Configuration & Launch
```bash
# Navigate to frontend in a new terminal
cd ../frontend

# Install dependencies
npm install

# Start Vite Development Server (Runs on http://localhost:3000)
npm run dev
```

---

## 🌐 API Route Structure Overview

```text
POST   /api/auth/register      - Register new user accounts
POST   /api/auth/login         - Authenticate and receive JWT
GET    /api/restaurants        - Fetch available restaurants & menus
POST   /api/orders             - Create new online or voice orders
POST   /api/agent/orders       - Place call-agent assisted orders
GET    /api/orders/:id/track   - Live status updates for orders
GET    /api/rider/deliveries   - Active delivery tasks for assigned riders
POST   /api/support/tickets    - Submit support queries
```

---

## ♿ Accessibility & WCAG Compliance

MealVoice is engineered following **WCAG 2.1 Level AA Guidelines**:
- **Perceivable**: High-contrast mode, adjustable font sizes (100% to 200%), text alternatives for non-text content.
- **Operable**: Full keyboard-only navigation capability with visible focus indicators.
- **Understandable**: Clear layout structure, predictable interactive feedback, real-time voice prompts.
- **Robust**: Compatible with NVDA, JAWS, and VoiceOver screen readers.

---

## 🔒 Security & Data Integrity

- Passwords hashed using industry-standard `bcryptjs` salt rounds.
- Role-based middleware (`authMiddleware`, `requireRole`) protects sensitive administration routes.
- Sanitized SQL queries executed via Prisma ORM to eliminate SQL injection vulnerabilities.

---

## 📄 License & Attribution

Distributed under the **MIT License**. Created with a commitment to digital inclusion and accessible web experiences for all users.
