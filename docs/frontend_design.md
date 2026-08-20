# Frontend Design

The frontend is built as a single Next.js (App Router) application, logically split into two domains using Next.js Route Groups.

## 1. Route Groups

### Customer Domain `(customer)`
- **Path:** `/`
- **Focus:** Mobile-first, fast, frictionless experience.
- **Key Routes:**
  - `/` (Home/Menu)
  - `/cart`
  - `/checkout`
  - `/order-status`
- **Features:**
  - Reads table ID from URL/session context.
  - Displays categorised menu items.
  - Maintains cart state locally using React Context.

### Restaurant Domain `(admin)`
- **Path:** `/admin`
- **Focus:** Desktop/Tablet-first dashboard.
- **Key Routes:**
  - `/admin/login`
  - `/admin/dashboard` (Kitchen display)
  - `/admin/menu` (Menu management)
- **Features:**
  - Protected routes requiring authentication.
  - Connects to backend WebSockets (`/api/ws/kitchen`) for real-time order updates.
  - Uses TanStack Query for server state management (fetching orders, mutating order statuses).

## 2. Component Architecture

We utilize `shadcn/ui` for accessible, styled base components (buttons, dialogs, cards) combined with Tailwind CSS for layout and custom styling.

```text
/web/src/components
├── /ui             # Base shadcn/ui components (e.g., Button, Card, Input)
└── /domain         # Business-specific components
    ├── /menu       # MenuItemCard, MenuCategoryList
    ├── /cart       # CartDrawer, CartItem
    └── /kitchen    # KitchenOrderCard, OrderStatusBoard
```

## 3. State Management

- **Local State (Cart):** Managed via a custom React Context (`CartProvider`). This keeps the customer's cart fast and reactive without constant server trips.
- **Server State (Menus, Orders):** Managed via TanStack Query (`useQuery`, `useMutation`). This provides caching, automatic refetching, and simplified async state handling.
