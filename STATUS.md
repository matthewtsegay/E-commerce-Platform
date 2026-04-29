# Nebi Store — Status & Roadmap

## ✅ Completed
- All core features, admin suite, validation, and API integration.
- **Analytics Dashboard UI**: Modern blue theme, icons, and layout improvements.
- **Django Admin Fixes**: Audited `format_html` calls for security and stability.

---

## 🕒 Recent Updates
- Updated the **Analytics Dashboard** (UI, Icons, and Theme)
- **Database Solidified** (PostgreSQL migration and optimization)
- **Performance Optimized** (Django Debug Toolbar disabled for load tests, Locust scripts made dynamic)
- **Background Tasks Setup** (Redis and Celery configured for asynchronous email processing)
- **Frontend Store Updates**:
  - Implemented **Collection pages** displaying dedicated products for specific collections.
  - Added **Like/Favorite button** functionality to products.
  - Upgraded the **UI of the filtering sidebar** for better user experience.
  - Enhanced **Product Cards** to be clickable, routing to full product description/info pages.

---

## 🔧 Tasks Left

### 🔴 Critical (Must Fix Before Going Live)
- [x] **Start PostgreSQL** on port 5433 — backend now running on PostgreSQL
- [x] **Analytics JWT support** — `/analytics/data/` view updated for JWT compatibility
- [x] **Chapa payment** — gateway is integrated in backend but needs live API keys + end-to-end test
- [x] **Product image upload** in admin UI — file input POSTing to `/store/products/{id}/images/`, image preview grid, delete image, 5MB limit

### 🟡 Important (Before Selling)
- [ ] **Deploy backend** to a live server (Railway / Render / VPS) with PostgreSQL
- [ ] **Deploy frontend** to Vercel and set `NEXT_PUBLIC_API_URL` to production backend URL
- [x] **Customer name display** in Orders admin — cross-references `/store/customers/` and `/auth/users/{id}/` to show real names
- [x] **Review submission** form in product detail page — inline form with name + description POSTs to `/store/products/{id}/reviews/`

### 🟢 Nice to Have (Increases Sale Value)
- [ ] **Mobile testing** — verify all admin pages on small screens
- [ ] **Playwright E2E tests** — automate register → login → buy flow
- [ ] **Product search** in storefront — wire the search bar to `GET /store/products/?search=`
- [x] **Order confirmation email** — backend signal connected to Celery, just needs `.env` SMTP config
- [x] **Forgot password** page — backend ready via Djoser + Celery, just needs `.env` SMTP config
- [ ] **Admin: bulk actions** — bulk delete products, bulk status update orders

---

## 💰 Estimated Sale Price

| Market | Buyer | Price |
|--------|-------|-------|
| 🇪🇹 Ethiopia | Small business / Shop owner | **ETB 15,000 – 80,000** |
| 🇪🇹 Ethiopia | Startup / Agency | **ETB 100,000 – 300,000** |
| 🌍 International (Fiverr/Upwork) | Freelance client | **$500 – $2,000 (ETB 60k–240k)** |
| 🌍 International | Direct startup / SME | **$2,000 – $8,000 (ETB 240k–960k)** |
| 🌍 International | Agency white-label | **$5,000 – $15,000 (ETB 600k–1.8M)** |

> ⚡ **Tip:** Deploying to a live URL before selling can **double or triple** the price.
> Current average realistic price: **ETB 80,000–200,000** locally, **$2,000–5,000** internationally.
