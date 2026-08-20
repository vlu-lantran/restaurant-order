# Architecture Overview

This document outlines the high-level architecture of the Restaurant Ordering System. The system is designed as a modern, containerized monorepo with separate frontend, backend, and infrastructure services.

## 1. Application Domains

The system serves two primary domains:

- **Customer Domain (Mobile-First):** 
  - Accessed via scanning a physical QR code at a table.
  - Zero-friction browsing: No user authentication required.
  - Features: Menu browsing, cart management, seamless checkout experience.
- **Restaurant Domain (Desktop-First):**
  - Secured dashboard for kitchen and waitstaff.
  - Requires user authentication.
  - Features: Real-time order state management (Pending -> Cooking -> Ready -> Served), menu editing, table management.

## 2. Monorepo Structure

The repository is divided into three core services:

```text
/restaurant-ordering
├── /api       # Backend Service (Python/FastAPI)
├── /deploy    # Infrastructure & Orchestration (Docker Compose)
└── /web       # Frontend Client (Next.js)
```

## 3. Technology Stack

### Frontend (`/web`)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query (server state), React Context (local cart state)

### Backend (`/api`)
- **Framework:** Python / FastAPI
- **Database ORM:** SQLAlchemy (Async)
- **Migrations:** Alembic
- **Architecture Pattern:** Domain-Driven Design (DDD)

### Infrastructure (`/deploy`)
- **Orchestrator:** Docker Compose
- **Relational DB:** PostgreSQL (Menus, Orders, Transactions)
- **In-Memory Store/Broker:** Redis (Cart sessions, WebSocket Pub/Sub)
- **Reverse Proxy:** Nginx (Routing traffic to `/api` and `/web`)

## 4. Core Operational Flows

1. **Session Initialization:**
   - User scans QR code (e.g., `https://domain.com/?table=12`).
   - Frontend initializes a cart session linked to that table via the backend.
2. **Order Submission:**
   - Frontend submits cart payload to the REST API (`POST /api/orders`).
   - Backend validates the order, stores it in PostgreSQL, and publishes a "new order" event to Redis.
3. **Workflow Broadcast (Real-time):**
   - The FastAPI WebSocket manager listens to Redis.
   - Upon receiving the event, it broadcasts the update to all connected Restaurant Domain clients.
   - The kitchen dashboard updates instantly without a page refresh.
