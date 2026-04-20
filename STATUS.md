# Nebi Store — Status & Roadmap

## ✅ Completed
All core features, admin suite, validation, and API integration are done.

---

## 🔧 Tasks Left

### 🔴 Critical (Must Fix Before Going Live)
- [ ] **Start PostgreSQL** on port 5433 — backend won't run without it
- [ ] **Analytics JWT support** — `/analytics/data/` uses session auth, not JWT; needs a DRF-compatible view added to backend
- [ ] **Chapa payment** — gateway is integrated in backend but needs live API keys + end-to-end test
- [x] **Product image upload** in admin UI — file input POSTing to `/store/products/{id}/images/`, image preview grid, delete image, 5MB limit

### 🟡 Important (Before Selling)
- [ ] **Deploy backend** to a live server (Railway / Render / VPS) with PostgreSQL
- [ ] **Deploy frontend** to Vercel and set `NEXT_PUBLIC_API_URL` to production backend URL
- [x] **Customer name display** in Orders admin — cross-references `/store/customers/` and `/auth/users/{id}/` to show real names
- [ ] **Forgot password** page — route exists but flow needs backend email config (SMTP)
- [x] **Review submission** form in product detail page — inline form with name + description POSTs to `/store/products/{id}/reviews/`

### 🟢 Nice to Have (Increases Sale Value)
- [ ] **Mobile testing** — verify all admin pages on small screens
- [ ] **Playwright E2E tests** — automate register → login → buy flow
- [ ] **Product search** in storefront — wire the search bar to `GET /store/products/?search=`
- [ ] **Order confirmation email** — backend signal exists, needs SMTP config
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
