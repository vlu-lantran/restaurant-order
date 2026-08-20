# API Design (Backend)

The backend API is built with FastAPI, utilizing async SQLAlchemy for database operations. It follows Domain-Driven Design (DDD) to keep concerns separated.

## 1. Domain Structure

```text
/api/app/domain
├── /menu       # Menu items, categories, pricing, availability
├── /orders     # Order creation, status updates, history
└── /tables     # Table sessions, QR code generation
```

## 2. Core Endpoints

### Menus
- `GET /api/menus` - Retrieve the current active menu for customers.
- `POST /api/menus` - (Admin) Add new menu items.
- `PUT /api/menus/{id}` - (Admin) Update menu items.

### Tables & Sessions
- `GET /api/tables/{id}/session` - Initialize or retrieve a session for a specific table.

### Orders
- `POST /api/orders` - Submit a new order from the customer cart.
- `GET /api/orders` - (Admin) Retrieve current active orders.
- `PATCH /api/orders/{id}` - (Admin) Update order status (Pending -> Cooking -> Ready -> Served).

## 3. Real-Time Communication (WebSockets)

- **Endpoint:** `WS /api/ws/kitchen`
- **Purpose:** Provide real-time updates to the Restaurant Domain (kitchen/waitstaff dashboard).
- **Mechanism:**
  - When an order is created or its status changes, the backend publishes an event to Redis.
  - The WebSocket manager subscribes to these Redis channels.
  - Events are broadcasted to all authenticated clients connected to `/api/ws/kitchen`.

## 4. Database Schema (Detailed)

- **menu_items:** `id` (PK), `name` (String, Index), `description` (String), `price` (Numeric 10,2), `category` (String, Index), `image_url` (String), `is_active` (Boolean)
- **tables:** `id` (PK), `table_number` (Integer, Unique, Index), `current_session_id` (String)
- **orders:** `id` (PK), `table_id` (FK->tables.id), `session_id` (String), `status` (String, Index), `total_amount` (Numeric 10,2), `created_at` (DateTime)
- **order_items:** `id` (PK), `order_id` (FK->orders.id), `menu_item_id` (FK->menu_items.id), `quantity` (Integer), `notes` (String), `price_at_time` (Numeric 10,2)
