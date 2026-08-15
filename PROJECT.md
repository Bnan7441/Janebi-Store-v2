# Janebi Arena E-Commerce Platform — Technical Architecture & Implementation Spec

## 1. System Overview
Janebi Arena is a modern, high-concurrency Iranian e-commerce platform built for mobile & digital accessories. It features end-to-end atomic inventory tracking, role-based access control, Iranian normalization utilities, Drizzle ORM SQLite persistence in WAL mode, Dockerized container deployment, and a full-featured customer & administrative UI.

- **Live URL:** https://janebiarena.ir
- **Alternative:** https://www.janebiarena.ir
- **Server Host IP:** 45.82.137.67 (Ubuntu 24.04 LTS)
- **Repository:** https://github.com/Bnan7441/Janebi-Store (Private)

---

## 2. Technology Stack & Runtime Specifications

### Backend Runtime
- **Engine:** Node.js 22 (Alpine Linux base in Docker)
- **Framework:** Express 5.x
- **Database Engine:** `better-sqlite3` 13.x with WAL (Write-Ahead Logging) mode and 5000ms busy timeout.
- **ORM & Schema:** Drizzle ORM with schema defined in `server/db/schema.ts`.
- **Validation Engine:** Zod runtime validation via `server/middleware/validate.ts`.
- **Authentication:** Stateless JWT Access/Refresh tokens with bcrypt password hashing.
- **Reverse Proxy:** Nginx 1.24 with Gzip compression and Let's Encrypt SSL.

### Frontend Runtime
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** TailwindCSS v4 with custom dark mode variables in `src/index.css`.
- **Routing:** React Router DOM v7 (SPA mode).
- **Animations:** Motion (Framer Motion 12).
- **Icons:** Lucide React.

---

## 3. Database Schema Design & Entities

| Table | Primary Key | Description | Key Relationships |
| :--- | :--- | :--- | :--- |
| `users` | `id` (TEXT) | Customer & Admin accounts, roles, phone, password hash | 1-to-many with addresses, orders, cart_items, wishlist_items |
| `addresses` | `id` (TEXT) | User shipping addresses, default flag | Foreign key `user_id -> users.id` |
| `products` | `id` (INT Auto) | Catalog items, price, discount, rating, `stockQuantity`, SKU | 1-to-many with product_features, reviews, order_items |
| `product_features` | `id` (INT Auto) | Bullet-point product features | Foreign key `product_id -> products.id` (Cascading) |
| `orders` | `id` (TEXT) | Placed orders, tracking status, pricing totals, shipping info | Foreign key `user_id -> users.id`, 1-to-many with order_items |
| `order_items` | `id` (INT Auto) | Line items snapshot at purchase time | Foreign keys `order_id -> orders.id`, `product_id -> products.id` |
| `coupons` | `code` (TEXT) | Percentage or fixed discount coupons, minimum cart threshold | Standalone validation lookup |
| `reviews` | `id` (TEXT) | Customer reviews, ratings, verification badges | Foreign keys `product_id -> products.id`, `user_id -> users.id` |
| `cart_items` | `id` (TEXT) | User active shopping cart items | Foreign keys `user_id -> users.id`, `product_id -> products.id` |
| `wishlist_items` | `id` (TEXT) | User wishlist marked items | Foreign keys `user_id -> users.id`, `product_id -> products.id` |

---

## 4. API Endpoints & Contracts

### Public & Auth API (`/api/auth`)
- `POST /api/auth/register` — Register new user with Iranian phone validation and password hashing.
- `POST /api/auth/login` — Login with phone & password; returns JWT token and sanitized user object.
- `GET /api/auth/me` — Retrieve currently authenticated user payload from Bearer token.

### Products & Catalog API (`/api/products`)
- `GET /api/products` — Filter products by category, brand, search keyword, price range, inStock, and sort.
- `GET /api/products/:id` — Retrieve product details including features.
- `GET /api/products/:id/reviews` — Retrieve customer reviews for product.
- `POST /api/products/:id/reviews` — Submit new verified/unverified review.

### Cart & Wishlist API (`/api/cart`, `/api/wishlist`)
- `GET /api/cart` — List authenticated user's cart items with full product details.
- `POST /api/cart` — Add item to cart with quantity validation.
- `PUT /api/cart/:productId` — Update item quantity.
- `DELETE /api/cart/:productId` — Remove item from cart.
- `GET /api/wishlist` — List user's saved items.
- `POST /api/wishlist` — Toggle/add item to wishlist.
- `DELETE /api/wishlist/:productId` — Remove item from wishlist.

### Orders & Checkout API (`/api/orders`)
- `POST /api/orders` — Place order in atomic transaction (deduplicates items, clamps discounts, decrements stock).
- `GET /api/orders` — List authenticated user's order history.
- `GET /api/orders/:id` — Get specific order details with strict tenant isolation.
- `POST /api/orders/:id/cancel` — Cancel order and automatically restore product stock quantities.

### User Profile & Address API (`/api/users`)
- `GET /api/users/me` — Get user profile and loyalty points.
- `PUT /api/users/me` — Update name/email.
- `PUT /api/users/me/password` — Change password with bcrypt verification of existing password.
- `GET /api/users/me/addresses` — List user addresses.
- `POST /api/users/me/addresses` — Add address (first address auto-set to default).
- `PUT /api/users/me/addresses/:id` — Update existing address.
- `PUT /api/users/me/addresses/:id/default` — Atomically switch default address flag.
- `DELETE /api/users/me/addresses/:id` — Delete address with safe promotion of remaining address.

### Admin API (`/api/admin` — Protected by `requireAdmin`)
- `GET /api/admin/stats` — Summary metrics (revenue, order counts, users, low stock items).
- `GET /api/admin/orders` — List all customer orders with pagination & status filters.
- `PUT /api/admin/orders/:id/status` — Update order lifecycle state.
- `GET /api/admin/products` — List all products with numerical stock counts.
- `POST /api/admin/products` — Create new product with features.
- `PUT /api/admin/products/:id` — Update product details and stock.
- `DELETE /api/admin/products/:id` — Cascade delete product and related cart/wishlist/review records.
- `GET /api/admin/coupons` — List all discount coupons.
- `POST /api/admin/coupons` — Create coupon.
- `DELETE /api/admin/coupons/:code` — Delete coupon.
- `GET /api/admin/users` — List registered users and roles.
- `PUT /api/admin/users/:id/role` — Promote/demote user roles.

---

## 5. Automated Verification & Quality Metrics

```
========================================================================================
  Test Files:      19 passed (19/19)
  Total Tests:     230 passed (230/230, 100% Pass Rate, 0 Failed, 0 Flaky)
  TypeScript Lint: tsc --noEmit -> 0 Errors (Clean)
  Production Build: npm run build -> Success (Exit Code 0)
========================================================================================
```

- **API & Security Coverage:** 169 tests covering 400/401/403/404 responses, RBAC protection, and JWT integrity.
- **Concurrency & Stress Testing:** 14 tests verifying zero-overselling under 50-100 parallel checkout requests and transaction rollback integrity.
- **Unit & Normalization Tests:** 43 tests verifying Persian/Arabic digit conversion, Iranian mobile format validation, price formatters, and Zod schemas.
- **E2E Customer Journey:** 4 tests simulating the full customer lifecycle from registration to fulfillment.

---

## 6. Deployment & Server Infrastructure

```
                                [ Cloud Client / Browser ]
                                            │
                                            ▼ HTTPS (443) / HTTP (80)
                                [ Nginx 1.24 Reverse Proxy ]
                              (Let's Encrypt SSL + Gzip Engine)
                                            │
                                            ▼ Proxy http://127.0.0.1:3000
                               [ Docker: janebi-store-app ]
                              (Node.js 22 + Express 5 Server)
                                    │               │
                     Static Assets (Vite SPA)   REST APIs (Drizzle ORM)
                                                    │
                                                    ▼
                                         [ SQLite Database ]
                                        (./data/janebi.db - WAL)
```

---

## 7. Default Administrative Credentials
- **Admin Portal URL:** `https://janebiarena.ir/admin/products`
- **Phone:** `09120000000`
- **Password:** `admin123`
