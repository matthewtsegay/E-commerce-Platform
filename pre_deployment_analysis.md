# 🛒 Nebi Store — Full Pre-Deployment Analysis
> **Date:** April 29, 2026  
> **Scope:** Backend (Django/DRF) + Frontend (Next.js 15)  
> **Goal:** Identify everything that must be fixed before going live as a quality product and portfolio showcase.

---

## 🔴 ROOT CAUSE: Why the First Page Is Slow

You noticed the site takes a long time to render the very first page. Here is the **complete, layered explanation**:

### Layer 1 — The Biggest Problem: Two API calls in parallel on the Homepage

The homepage (`app/page.tsx`) renders two heavy components simultaneously:

| Component | API Call | Problem |
|---|---|---|
| `HeroProductSlides.tsx` | `GET /store/products/` | Fetches **ALL products** just to `.slice(0, 8)` on the client |
| `FeaturedProducts.tsx` | `GET /store/products/?is_on_sale=true&limit=4` | Also fetches all products (backend ignores `limit`) |

Both calls happen inside `useEffect` — meaning they run **after the page has already painted** (client-side data fetching). The browser:
1. Loads the HTML shell (instant)
2. Downloads JavaScript bundle (slow on first load)
3. Hydrates React (medium)
4. *Then* fires both API calls
5. Shows spinners while waiting
6. Finally renders products

**This is the waterfall problem.** The user sees a loading spinner for 1–3 seconds on every page load.

### Layer 2 — Backend responds slowly on first request

- **`DEBUG=True` in `.env`** — Django is running in debug mode. Django Debug Toolbar middleware is active on every request, adding significant overhead.
- **`SilkyMiddleware` is running** — Silk profiling middleware intercepts and records every request. This adds database writes per request.
- **`page_size = 2` in pagination** — This is critically small. The Hero slider fetches `GET /store/products/` which is paginated to only **2 results** per page, but the client does `.slice(0, 8)`. So you get 2 products displayed when you expect 8.
- **`cache_page(5 * 60)` on product list** — This only caches with `LocMemCache` (in-memory, per-process), which resets on every server restart. It does NOT survive Gunicorn workers in production.
- **ContentType query inside `get_queryset`** — `ContentType.objects.get_for_model(Product)` runs a DB query on every single API request from an authenticated user.

### Layer 3 — Frontend renders everything as Client Components

Every page (`'use client'`) including the homepage itself. This means:
- Next.js cannot pre-render any content on the server
- The user receives an empty HTML shell (no content in `<body>`)
- Google/Bing/bots see an empty page (SEO destroyed)
- Cold start on every navigation requires the full React hydration cycle

---

## 🔴 CRITICAL ISSUES (Fix Before Deploy)

### Backend

#### B-CRITICAL-1: `DEBUG=True` in production `.env`
**File:** `backend/.env` line 2  
```
DEBUG=True  ← This must be False in production
```
Django debug mode: exposes full stack traces to users, disables caching optimizations, loads Debug Toolbar, Silk middleware. **Never ship with `DEBUG=True`.**

#### B-CRITICAL-2: `page_size = 2` in pagination
**File:** `backend/store/pagination.py`  
```python
class DefaultPagination(PageNumberPagination):
    page_size = 2  ← Should be at least 20-50
```
This breaks the Hero slider (shows 2 products instead of 8) and forces the frontend to make multiple paginated requests to get enough products. **This is both a bug and a performance killer.**

#### B-CRITICAL-3: `silk` and `debug_toolbar` in `INSTALLED_APPS` always (including production path)
**File:** `backend/storefront/settings/common.py` lines 33–35  
Both `silk` and `debug_toolbar` are in `INSTALLED_APPS` unconditionally. `production.py` inherits from `common.py` and does not remove them. In production, this means:
- All the debug/profiling code is loaded
- DB tables for Silk are still being written to
- Memory overhead from unused middleware code

#### B-CRITICAL-4: Secret key exposed in `.env` and committed to git
**File:** `backend/.env` line 3  
The `SECRET_KEY` is committed to the repository. Once pushed to GitHub (public or private), this is a **critical security breach** — anyone with access can forge session tokens, CSRF tokens, and signed cookies.

#### B-CRITICAL-5: `ALLOWED_HOSTS` doesn't include production domain
**File:** `backend/.env` line 4  
```
ALLOWED_HOSTS=localhost,127.0.0.1
```
When you deploy to a real server, Django will reject all requests with `400 Bad Request` because your domain is not in the allowed list.

#### B-CRITICAL-6: `UpdataOrderSerializer` has `read_only_fields` bug
**File:** `backend/store/serializers.py` line 228-232  
```python
class UpdataOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['payment_status']
        read_only_fields = ['payment_status']  ← Bug! Field is both writable and read-only
```
This means admin can never update payment status via PATCH — it will always be ignored silently.

#### B-CRITICAL-7: Email backend points to localhost SMTP (broken in production)
**File:** `backend/.env` lines 16-17  
```
EMAIL_HOST=localhost
EMAIL_PORT=2525
```
No real SMTP server is configured. Order confirmation emails, password reset, registration emails — all will silently fail in production. Mailtrap is configured but commented out.

---

### Frontend

#### F-CRITICAL-1: All pages are `'use client'` — no Server-Side Rendering
The homepage `app/page.tsx` imports `Hero` and `FeaturedProducts` which are both `'use client'`. This means Next.js renders the page as a pure SPA — **no SSR, no SEO, slow first load**.

#### F-CRITICAL-2: `HeroProductSlides` fetches ALL products — no server-side limit
**File:** `frontend/components/home/HeroProductSlides.tsx` line 28  
```typescript
const response = await api.get('/store/products/');  // Fetches ALL products
const list = extractList<Product>(response.data).slice(0, 8);  // Throws away most
```
This is wasteful — the backend should limit this to 8.

#### F-CRITICAL-3: Cart ID is `'temp-id'` for new items
**File:** `frontend/lib/store.ts` line 65  
```typescript
set({ cart: { id: currentCart?.id || 'temp-id', items, total_price } });
```
When no cart exists yet, the cart ID becomes `'temp-id'` — a literal string. When the user tries to checkout, the backend will reject this invalid UUID with a `400` error.

#### F-CRITICAL-4: Token stored in `localStorage` — XSS vulnerable
**File:** `frontend/lib/api-client.ts` lines 15-18  
JWT access tokens in `localStorage` are readable by any JavaScript on the page (including injected scripts from CDN attacks, third-party libraries, etc.). Use `httpOnly` cookies instead.

#### F-CRITICAL-5: Hardcoded `collection_id=1,2,3` in homepage
**File:** `frontend/app/page.tsx` lines 77, 88, 95  
```typescript
href="/products?collection_id=1"  // What if collection 1 doesn't exist?
href="/products?collection_id=2"
href="/products?collection_id=3"
```
These links will silently show empty product lists if those collection IDs don't exist in the database.

---

## 🟡 HIGH PRIORITY ISSUES

### Backend

#### B-HIGH-1: `ContentType.objects.get_for_model()` query in hot path
**File:** `backend/store/views.py` lines 106-109  
```python
content_type=ContentType.objects.get_for_model(Product)
```
This runs a DB query on **every single authenticated product-list request**. Use `ContentType.objects.get_for_model(Product, for_concrete_model=False)` and cache the result as a module-level variable.

#### B-HIGH-2: `get_is_liked` triggers N+1 query in serializer
**File:** `backend/store/serializers.py` line 77  
```python
return obj.likes.filter(user=user).exists()
```
This runs one extra DB query **per product** when serializing. The view already annotates `is_liked` via `Exists()` subquery — but the serializer ignores it and runs its own query. Fix: read from `obj.__dict__` first.

#### B-HIGH-3: `is_currently_on_sale` property hits the DB
**File:** `backend/store/models.py` line 94  
```python
return self.discount_active or self.promotions.exists()
```
`self.promotions.exists()` runs a query unless promotions are prefetched. Since the queryset does prefetch promotions, this is semi-safe — but the `get_active_promotion()` method may still bypass the cache.

#### B-HIGH-4: No rate limiting or throttling
The API has no rate limiting. A malicious user can hammer `/auth/jwt/create/` (login endpoint) with brute-force password attempts indefinitely. Add `rest_framework.throttling.AnonRateThrottle` and `UserRateThrottle`.

#### B-HIGH-5: `CORS_ALLOWED_ORIGINS` hardcoded to localhost
**File:** `backend/storefront/settings/common.py` lines 70-77  
Production deployment will fail CORS checks. The production domain must be added.

#### B-HIGH-6: Celery Beat schedule runs `notify_customers` every 5 seconds
**File:** `backend/storefront/settings/common.py` line 198  
```python
'schedule': 5,  # Every 5 seconds!
```
This fires a Celery task every 5 seconds in production, hammering your task queue with notifications. This is a test value — set a proper `crontab()`.

#### B-HIGH-7: `Customer.update_membership()` is an N+1 in a loop
**File:** `backend/store/models.py` line 155  
```python
total_spent = sum(order.total for order in self.order_set.filter(payment_status='C'))
```
`order.total` is a `@property` that runs an aggregate query per order. This becomes O(N) database queries when a customer has many orders. Use a single aggregate query instead.

#### B-HIGH-8: No database indexes on frequently filtered fields
No indexes declared on `Product.collection`, `Product.is_on_sale`, `Product.discount_active`, `CartItem.cart_id`, `Order.customer`. As data grows, queries will slow down significantly.

---

### Frontend

#### F-HIGH-1: Product search/sort/filter is 100% client-side
**File:** `frontend/app/products/page.tsx` lines 79-82  
```typescript
const filteredProducts = products.filter(p =>
  p.title.toLowerCase().includes(search.toLowerCase()) &&
  p.unit_price >= priceRange[0] && p.unit_price <= priceRange[1]
);
```
ALL products are loaded into memory, then filtered in the browser. This will break when you have 1,000+ products. Use backend search params (`?search=`, `?price__gt=`, `?price__lt=`).

#### F-HIGH-2: No pagination on the products page
The products page loads every single product in one request. With 100+ products this will be slow and use excessive memory.

#### F-HIGH-3: Star ratings are hardcoded to 5 stars (4.5)
**File:** `frontend/components/products/ProductCard.tsx` lines 121-124  
```typescript
{[...Array(5)].map((_, i) => (
  <Star key={i} className="h-3 w-3 fill-primary text-primary" />
))}
<span>(4.5)</span>
```
Every product shows the same fake 5-star rating with "(4.5)". This is misleading and will undermine trust with real customers.

#### F-HIGH-4: `@react-three/fiber` and `three.js` in dependencies but potentially unused
**File:** `frontend/package.json` lines 18-19  
Three.js is a massive library (~500KB gzipped). If it's not actively used, it's a huge bundle size penalty that slows down initial page load.

#### F-HIGH-5: No `loading.tsx` files — no streaming/progressive loading
Next.js 15 supports `loading.tsx` per route segment for instant feedback. Without it, navigation between routes shows nothing until the full page is ready.

#### F-HIGH-6: `motion` library loaded on every page
Framer Motion (`motion/react`) is imported in `ProductCard`, `Hero`, `FeaturedProducts`, and more. Every page that uses any of these components loads the entire animation library, even for users who prefer reduced motion.

---

## 🟢 MEDIUM PRIORITY (Quality & Portfolio Polish)

### Backend

#### B-MED-1: `Review` model has `data` field (should be `date`)
**File:** `backend/store/models.py` line 267  
```python
data = models.DateField(auto_now_add=True)  # Typo: should be "date"
```
This typo is in the model and will be in migration history — a renaming migration is needed.

#### B-MED-2: Logging writes to a 1.8MB flat file with no rotation
**File:** `backend/general.log` — 1,825,417 bytes  
The log file has no rotation. In production it will grow indefinitely, consuming disk space and eventually crashing the server.

#### B-MED-3: No API versioning
All endpoints are under `/store/` with no version prefix. When you make breaking API changes, all clients will break simultaneously. Add `/api/v1/` prefix.

#### B-MED-4: `celerybeat-schedule` files are committed to git
`celerybeat-schedule`, `celerybeat-schedule-shm`, and `celerybeat-schedule-wal` (total ~550KB) are runtime files committed to the repo. Add to `.gitignore`.

#### B-MED-5: Multiple `.sqlite3` files committed
`db.sqlite3`, `dev.sqlite3`, `test.sqlite3` are all committed. These contain real data (including user credentials) and are a security risk.

#### B-MED-6: `playground` app exposed in production
The `playground` app is in `INSTALLED_APPS` and its URLs are mounted. Playground apps are for testing only and should never be in production.

#### B-MED-7: Missing `unit_price` in `CartItemSerializer`
**File:** `backend/store/serializers.py` line 133-136  
`SimpleProductSerializer` only returns `id, title, price`. The frontend cart expects `unit_price` (with discounts). Cart total calculation will use non-discounted price.

---

### Frontend

#### F-MED-1: The `app/page.tsx` homepage is a Server Component but imports Client Components without `Suspense`
The Hero and FeaturedProducts components are client components with async data fetching. Wrapping them individually in `<Suspense>` boundaries would allow the rest of the page to render immediately.

#### F-MED-2: Cart state uses `Math.random()` for item IDs
**File:** `frontend/lib/store.ts` line 57  
```typescript
id: Math.random(),  // In real app, cart items are managed by backend
```
Random IDs will cause duplicate ID collisions and make removing/updating specific items unreliable. The comment even acknowledges this is a placeholder.

#### F-MED-3: No error boundary — one failed component crashes the page
A single API failure in `FeaturedProducts` or `HeroProductSlides` can propagate and break the entire page. Add React error boundaries.

#### F-MED-4: Images use `referrerPolicy="no-referrer"` — may block backend images
**File:** Multiple components  
This is correct for picsum.photos placeholder images but will prevent the browser from sending the Referer header to your own backend, which is unnecessary.

#### F-MED-5: No `<meta>` og:image or social sharing tags
The layout only has title and description. There are no Open Graph or Twitter Card meta tags. When users share a product link on WhatsApp/Telegram, it will show no image preview.

#### F-MED-6: Search in Navbar is a non-functional icon
**File:** `frontend/components/layout/Navbar.tsx` line 53  
```tsx
<Button variant="ghost" size="icon" className="hidden sm:flex">
  <Search className="h-5 w-5" />
</Button>
```
The search button does nothing. This looks broken to users and interviewers reviewing your portfolio.

#### F-MED-7: `sortBy` state in products page has no effect
**File:** `frontend/app/products/page.tsx`  
The sort options (Newest, Price: Low–High, etc.) are rendered but `sortBy` state is never applied to `filteredProducts`. Selecting a sort option does nothing.

---

## ⚠️ SECURITY CHECKLIST

| # | Issue | Severity | Who |
|---|---|---|---|
| 1 | `SECRET_KEY` in `.env` committed to git | 🔴 Critical | Backend |
| 2 | `DEBUG=True` in production | 🔴 Critical | Backend |
| 3 | JWT in `localStorage` (XSS risk) | 🔴 Critical | Frontend |
| 4 | No rate limiting on login endpoint | 🟡 High | Backend |
| 5 | `playground` app exposed in production | 🟡 High | Backend |
| 6 | SQLite DB files committed to git | 🟡 High | Backend |
| 7 | Media files served by Django in production (not CDN) | 🟠 Medium | Backend |
| 8 | No HTTPS enforcement in production settings | 🟠 Medium | Backend |
| 9 | Admin panel accessible with no IP restriction | 🟠 Medium | Backend |
| 10 | No CSRF protection for API (JWT-only) | 🟢 Low | Backend |

---

## 🚀 PERFORMANCE CHECKLIST

| # | Issue | Impact | Who |
|---|---|---|---|
| 1 | Homepage: two parallel client-side fetches (waterfall) | ⚡ Huge | Frontend |
| 2 | `page_size = 2` — wrong number, forces many requests | ⚡ Huge | Backend |
| 3 | `DEBUG=True` + Silk middleware on every request | ⚡ Huge | Backend |
| 4 | Hero slider fetches ALL products, discards most | ⚡ Large | Frontend+Backend |
| 5 | No SSR — empty HTML shell on first load | ⚡ Large | Frontend |
| 6 | Three.js in bundle (potentially unused) | ⚡ Large | Frontend |
| 7 | Client-side filtering — all products in memory | ⚡ Large | Frontend |
| 8 | No pagination on products page | ⚡ Large | Frontend+Backend |
| 9 | `ContentType.get_for_model()` query per request | ⚡ Medium | Backend |
| 10 | `is_liked` N+1 per product in serializer | ⚡ Medium | Backend |
| 11 | No CDN for static/media files | ⚡ Medium | Backend |
| 12 | `motion` library loaded on all pages | ⚡ Medium | Frontend |
| 13 | No database indexes on filtered columns | ⚡ Medium | Backend |
| 14 | Log file I/O on every request (no rotation) | ⚡ Low | Backend |

---

## 📋 PRIORITIZED ACTION PLAN

### 🔧 Backend Developer's TODO (Priority Order)

**Week 1 — Critical Fixes:**
- [ ] Set `DEBUG=False` in `.env` (or create `.env.production`)
- [ ] Remove `SECRET_KEY` from `.env`, add to `.gitignore`, rotate the key
- [ ] Add `.env`, `*.sqlite3`, `celerybeat-schedule*`, `general.log` to `.gitignore`
- [ ] Fix `page_size` from `2` to at least `20` in `pagination.py`
- [ ] Fix `UpdataOrderSerializer` — remove `payment_status` from `read_only_fields`
- [ ] Fix Celery Beat schedule from `5` seconds to a proper `crontab()`
- [ ] Move `silk` and `debug_toolbar` to developer settings only (not common)
- [ ] Add your production domain to `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- [ ] Configure real SMTP (SendGrid, Mailgun, or AWS SES)

**Week 2 — Performance:**
- [ ] Cache `ContentType.get_for_model(Product)` as module-level constant
- [ ] Fix the `is_liked` serializer to use annotated value from `obj.__dict__`
- [ ] Add `?limit=8` backend parameter to hero endpoint (or create dedicated endpoint)
- [ ] Add DB indexes: `Product.collection`, `Product.is_on_sale`, `Order.customer`
- [ ] Configure `logging` with `RotatingFileHandler` (max 10MB, 5 backups)
- [ ] Remove `playground` from `INSTALLED_APPS` in production settings
- [ ] Fix `Customer.update_membership()` to use single aggregate query

**Week 3 — Quality:**
- [ ] Fix typo: `Review.data` → `Review.date` (create migration)
- [ ] Add `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT` to production settings
- [ ] Add `AnonRateThrottle` and `UserRateThrottle` to `REST_FRAMEWORK` settings
- [ ] Add API versioning prefix (`/api/v1/`)
- [ ] Add `SimpleProductSerializer` with `unit_price` for cart (include discounted price)
- [ ] Write at least 10 integration tests for critical endpoints (products, orders, cart)

---

### 🎨 Frontend Developer's TODO (Priority Order)

**Week 1 — Critical Fixes:**
- [ ] Convert homepage to use Next.js Server Components + `async/await` fetch instead of `useEffect` + axios
- [ ] Wrap `HeroProductSlides` and `FeaturedProducts` each in `<Suspense>` with skeleton fallbacks
- [ ] Fix Hero slider: use `?limit=8` query param (or new dedicated endpoint) instead of fetching all
- [ ] Fix `page_size` mismatch: implement pagination in products page (infinite scroll or page buttons)
- [ ] Fix `sortBy` — implement actual sort logic in `filteredProducts` array
- [ ] Remove Three.js (`@react-three/fiber`, `three`) from `package.json` if not used
- [ ] Fix cart `'temp-id'` — sync cart creation with backend before allowing add-to-cart

**Week 2 — Performance:**
- [ ] Move product search to backend params: `?search=`, `?price__gt=`, `?price__lt=`
- [ ] Add `loading.tsx` to each route segment (`/products/loading.tsx`, `/cart/loading.tsx`, etc.)
- [ ] Add `error.tsx` to each route segment for graceful error handling
- [ ] Add `next/image` `placeholder="blur"` or `blurDataURL` for product images
- [ ] Lazy-load `motion` animations — only import when needed, wrap in `Suspense`
- [ ] Add `preconnect` link to your API domain in `layout.tsx`

**Week 3 — Quality & Portfolio Polish:**
- [ ] Fix hardcoded star ratings — implement real rating from reviews, or remove fake stars
- [ ] Make the Navbar search button functional (link to `/products?search=...`)
- [ ] Fix hardcoded `collection_id=1,2,3` — fetch collections from API
- [ ] Move JWT from `localStorage` to `httpOnly` cookies (coordinate with backend)
- [ ] Add Open Graph meta tags for product pages (for social sharing)
- [ ] Add `<meta name="viewport">` and PWA manifest for mobile
- [ ] Add `alt` text to all images
- [ ] Add dark mode support (the CSS variables are already defined but `next-themes` provider is missing from `layout.tsx`)
- [ ] Replace fake review count `(4.5)` with real data or remove it

---

## 🏆 PORTFOLIO READINESS SCORE

| Category | Current | Target |
|---|---|---|
| Performance (Lighthouse) | ~40-55 | >85 |
| SEO | ~20 (no SSR) | >90 |
| Accessibility | ~60 | >85 |
| Security | ~45 | >90 |
| Code Quality | ~65 | >85 |
| Feature Completeness | ~70 | >90 |

---

## ✅ WHAT IS ALREADY GOOD (Keep These!)

- ✅ Django settings properly split into `common/developer/production`
- ✅ JWT authentication with refresh token rotation and blacklisting
- ✅ `select_related` and `prefetch_related` are correctly used in most views
- ✅ `bulk_create` used for order items (efficient)
- ✅ Custom permission classes (`IsAdminOrReadOnly`)
- ✅ Atomic transactions for order creation
- ✅ Zustand for lightweight frontend state management
- ✅ Middleware auth protection for protected routes
- ✅ Optimistic UI updates for like button
- ✅ Product discount logic is clean and well-separated
- ✅ Whitenoise configured for static file serving
- ✅ CORS headers properly configured for development
- ✅ `extractList` helper correctly handles both paginated and plain array responses
- ✅ `getApiErrorMessage` provides good user-facing error messages
- ✅ Connection pooling enabled in both dev and production settings (`CONN_MAX_AGE=600`)
- ✅ Admin UI is feature-rich with list filters, search, and inline editing

