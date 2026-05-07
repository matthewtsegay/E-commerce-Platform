# Nebi Store - E-commerce Application

A full-stack e-commerce application built with a Django REST Framework backend and a Next.js/TypeScript frontend. Features a modern, responsive design with comprehensive functionality for online shopping.

## 🚀 Features

### Backend (Django REST Framework)
- **RESTful API**: Complete CRUD operations for products, orders, customers, and more
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with proper migrations and data models
- **Admin Dashboard**: Analytics and management interface for store operations
- **Payment Integration**: Chapa payment gateway integration
- **Product Management**: Categories, collections, images, reviews, and discounts
- **Order Processing**: Complete order lifecycle with status tracking
- **Customer Management**: Membership system with Bronze/Silver/Gold tiers
- **Analytics**: Admin dashboard with sales and performance metrics
- **Comprehensive Testing**: Unit, integration, and end-to-end tests for all critical functionality

### Frontend (Next.js/TypeScript)
- **Modern Tech Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Server Components**: Homepage uses Next.js Server Components for optimal performance
- **Real-time Product Data**: Hero section, featured, latest, and trending products from backend APIs
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Product Management**: Browse, search, filter, and view detailed product pages
- **Shopping Cart**: Add/remove items, update quantities, persistent cart storage with backend sync
- **Checkout Process**: Complete order flow with form validation and payment integration
- **Real API Integration**: Connected to Django backend (no mock data, all sections use live endpoints)
- **State Management**: Zustand with persistence for cart and auth state
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Performance**: Server-side data fetching, Suspense boundaries, lazy loading, optimized images

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#BEE9FF` - Page background
- **Gold Accent**: `#D4AF37` - CTAs and highlights
- **Cream**: `#FFF6E0` - Secondary surfaces and hover states
- **Text**: `#1F2937` - Primary text color
- **Muted**: `#6B7280` - Secondary text and helpers

### Typography
- **Font Family**: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial
- **Focus States**: Custom glow effect using CSS variables
- **Shadows**: Subtle elevation with `0 6px 18px rgba(2,6,23,0.06)`

## 📁 Project Structure

```
ecommerce-app/
├── backend/                    # Django REST Framework backend
│   ├── storefront/            # Django project settings & URL config
│   ├── store/                 # Main e-commerce app (products, orders, carts, customers)
│   ├── core/                  # Custom user model & Djoser serializers
│   ├── analytics/             # Admin analytics views (daily sales, collection breakdown)
│   ├── likes/                 # Product likes functionality
│   ├── tags/                  # Product tagging system
│   ├── playground/            # Development utilities
│   └── manage.py              # Django management script
├── frontend/                  # Next.js frontend (App Router)
│   ├── app/                  # Route segments and pages
│   │   ├── admin/            # Admin console (staff only)
│   │   │   ├── dashboard/    # Overview + live stats
│   │   │   ├── products/     # Product CRUD
│   │   │   ├── collections/  # Collection CRUD
│   │   │   ├── orders/       # Order management + status updates
│   │   │   ├── customers/    # Customer list + membership management
│   │   │   ├── memberships/  # Membership plan CRUD
│   │   │   ├── banners/      # Promo banner CRUD
│   │   │   ├── payment-methods/ # Payment method config
│   │   │   └── analytics/    # Live analytics charts
│   │   ├── products/         # Product catalog & detail pages
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout flow
│   │   ├── orders/           # User order history
│   │   ├── profile/          # User profile + delete account
│   │   ├── login/            # Login (email + password)
│   │   ├── register/         # Registration with strict validation
│   │   └── forgot-password/  # Password reset
│   ├── components/           # Reusable UI components
│   │   └── admin/            # AdminShell sidebar layout
│   ├── lib/                  # API client, helpers, state, types, validation
│   └── public/               # Static assets
└── .env.example              # Environment variables template
```

## 🛠 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (running locally on port 5433)

### Backend Setup

1. **Install Python dependencies**
```bash
cd backend
pipenv install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. **Create and migrate database**
```bash
pipenv run python manage.py migrate
```

4. **Create superuser** (Django prompts for email as the login identifier, plus username and password)
```bash
pipenv run python manage.py createsuperuser
```
Mark the account as staff in Django admin (`/django-admin/`) or set `is_staff=True` if you need the **Next.js** admin UI at `/admin/dashboard` (see below).

5. **Run tests**
```bash
pipenv run pytest
# This will run all unit, integration, and end-to-end tests
```

6. **Start development server**
```bash
pipenv run python manage.py runserver
# Server will run on http://127.0.0.1:8000
```

### Frontend Setup

1. **Install Node.js dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API configuration
```

3. **Start development server**
```bash
npm run dev
# Server will run on http://localhost:3000
```

## 📦 Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository synced with the latest code.
- Vercel account (free tier works fine).

### Steps
1. **Push latest changes**  
   ```bash
   git add .
   git commit -m "Prepare frontend for Vercel deployment"
   git push origin main
   ```

2. **Import project to Vercel**  
   - Go to <https://vercel.com/dashboard>.
   - Click **New Project** → **Import Git Repository** → select your GitHub repo.
   - Vercel auto-detects a Next.js project.

3. **Configure Environment Variables**  
   - In the Vercel dashboard, navigate to **Project Settings → Environment Variables**.
   - Add `NEXT_PUBLIC_API_URL` pointing to your production backend API (e.g., `https://api.nebistore.com`).

4. **Deploy**  
   - Click **Deploy**. Vercel will run `npm install` and `npm run build`.
   - After a successful build, your site will be live at `https://<project-name>.vercel.app`.

### Post‑Deployment Checklist
- Verify homepage loads with real product data.
- Test cart persistence, login, checkout flow.
- Ensure all API calls hit the production backend (check network requests).
- Confirm responsive design on mobile devices.

For more detailed instructions, see `frontend/VERCEL_DEPLOYMENT.md`.

### Database Setup
The application uses PostgreSQL running locally on port 5433. Ensure PostgreSQL is installed and running before starting the application.


## 🧩 Troubleshooting

- **`store_promobanner` table does not exist**  
  If you see errors like `relation "store_promobanner" does not exist` when hitting `/store/promotions/`, run:
  ```bash
  cd backend
  pipenv run python manage.py makemigrations store
  pipenv run python manage.py migrate
  ```
  Then restart the Django development server.

## Storefront conventions

- **Currency**: Prices in the UI are formatted as **Ethiopian Birr (ETB)**. Cart shipping is a simple ETB rule (see `frontend/lib/shipping.ts`).
- **Login**: Users sign in with **email + password** (`User.USERNAME_FIELD = 'email'` on the backend).
- **Phone format**: The app enforces **Ethiopian mobile format** `+251XXXXXXXXX` (13 characters, starting with `+2519` or `+2517`) via `frontend/lib/validation.ts`. This is validated client-side before form submission.
- **Admin UI (Next.js)**: After logging in, staff users (`is_staff=True`) get an **Admin Console** link in the account menu and can open `/admin/dashboard`. Non-staff users are redirected away by middleware.

## 📱 Features Overview

### Product Catalog
- **Grid Layout**: Responsive 1→2→3→4 column grid
- **Product Cards**: Fixed-height images, sale badges, price formatting
- **Search & Filter**: By category, sale status, price sorting
- **Pagination**: Efficient loading of large product sets
- **Product Reviews**: Customer reviews with ratings and comments

### Shopping Cart
- **Persistent storage**: Cart state in `localStorage` (Zustand) with line totals from unit/sale prices
- **Quantity controls**: Per-line quantity with totals and a cart count badge in the navbar
- **Checkout**: Creates a server cart, posts line items, then creates an order via the REST API

### Checkout Process
- **Form Validation**: Client-side validation with error messaging
- **Payment Methods**: Chapa payment gateway integration
- **Billing Address**: Complete address collection
- **Order Confirmation**: Success page with order ID

### User Management
- **Authentication**: Login, registration with strict field validation, password reset
- **Form Validation**: Inline field-level errors on blur and submit for all registration fields
- **Phone Validation**: Ethiopian +251 format enforced (`+2519XXXXXXXX` or `+2517XXXXXXXX`)
- **Role-Based Access**: Admin (`is_staff=True`), customer roles with different permissions
- **Membership System**: Bronze (B), Silver (S), Gold (G) membership tiers with discounts
  - Auto-updates based on total spend: >1000 ETB → Gold, >500 ETB → Silver
- **Profile Management**: User profile, phone number, date of birth, address management
- **Delete Account**: Secure account deletion with password confirmation and type-to-confirm safeguard (`DELETE /auth/users/me/`)

### Admin Dashboard (`/admin/dashboard`)

All pages require `is_staff=True`. Accessible via the Admin Console link after login.

| Page | Path | API Endpoints |
|------|------|---------------|
| Overview | `/admin/dashboard` | `GET /store/admin-stats/`, `GET /store/orders/` |
| Products | `/admin/products` | Full CRUD `/store/products/` |
| Collections | `/admin/collections` | Full CRUD `/store/collections/` |
| Orders | `/admin/orders` | `GET /store/orders/`, `PATCH /store/orders/{id}/` |
| Customers | `/admin/customers` | `GET /store/customers/`, `PATCH /store/customers/{id}/` |
| Memberships | `/admin/memberships` | Full CRUD `/store/memberships/` |
| Promo Banners | `/admin/banners` | Full CRUD `/store/promotions/` |
| Payment Methods | `/admin/payment-methods` | `GET/PATCH /store/payment-methods/` |
| Analytics | `/admin/analytics` | `GET /store/admin-stats/`, `GET /analytics/data/` |

**Admin features include:**
- **Analytics**: Live stats (sales, orders, products, customers) + daily sales bar chart + top-collections chart
- **Product Management**: Create/edit (with discount fields), delete (protected if order-referenced), image preview
- **Order Management**: Paginated list with status filter, inline Pending→Complete→Failed status updates
- **Customer Management**: List all customers with membership badges, inline membership level changes
- **Membership System**: Full CRUD for Bronze/Silver/Gold plans with discount % and perks
- **Promo Banners**: Create/edit banners with zone, animation, scheduling, click/impression tracking
- **Payment Methods**: Enable/disable/coming-soon toggles for Chapa, Telebirr, etc.

## 🔌 Backend API Reference

### Authentication (`/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/users/` | Register new user |
| POST | `/auth/jwt/create/` | Login (returns JWT) |
| POST | `/auth/jwt/refresh/` | Refresh access token |
| GET | `/auth/users/me/` | Get current user |
| DELETE | `/auth/users/me/` | Delete account (requires `current_password`) |

### Store (`/store/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/store/products/` | List / create products |
| GET/PATCH/DELETE | `/store/products/{id}/` | Retrieve / update / delete product |
| POST | `/store/products/{id}/images/` | Upload product image |
| GET/POST | `/store/collections/` | List / create collections |
| GET/PATCH/DELETE | `/store/collections/{id}/` | Retrieve / update / delete collection |
| GET/POST | `/store/orders/` | List orders / create order from cart |
| PATCH | `/store/orders/{id}/` | Update order status (staff only) |
| GET | `/store/customers/` | List all customers (admin) |
| GET/PUT | `/store/customers/me/` | Get / update own profile |
| PATCH | `/store/customers/{id}/` | Update customer (admin) |
| GET/POST | `/store/memberships/` | List / create membership plans |
| GET/PATCH/DELETE | `/store/memberships/{id}/` | Retrieve / update / delete plan |
| GET/POST | `/store/promotions/` | List / create promo banners |
| GET/PATCH/DELETE | `/store/promotions/{id}/` | CRUD promo banner |
| POST | `/store/promotions/{id}/click/` | Track banner click |
| GET/PATCH | `/store/payment-methods/{id}/` | Get / update payment method |
| GET | `/store/admin-stats/` | Admin summary stats (staff only, JWT) |
| GET | `/analytics/data/` | Daily sales + collection analytics (staff, session auth) |

## 🧪 Testing

The application includes comprehensive testing coverage:

### Backend Testing
- **Unit Tests**: Test individual components (models, views, serializers)
- **Integration Tests**: Test API endpoints and database operations
- **End-to-End Tests**: Test complete user workflows
- **Test Database**: Separate test database for isolation
- **Test Coverage**: High coverage for critical business logic

### Running Tests
```bash
# Run all tests
pipenv run pytest

# Run specific test categories
pipenv run pytest tests/unit/
pipenv run pytest tests/integration/
pipenv run pytest tests/e2e/

# Run with coverage report
pipenv run pytest --cov=store --cov=core --cov=analytics
```

## 🏎️ Performance Testing (Locust) & Background Tasks

### 1. Redis (Message Broker)
Celery requires Redis to handle background queues (like sending emails).
```bash
# Using Docker (Recommended)
docker run -d -p 6379:6379 redis

# Or use a native Redis installation on your OS/WSL
```

### 2. Celery Worker (Background Tasks)
Start the Celery worker to process background jobs like order confirmation emails:
```bash
cd backend
# On Windows, using eventlet pool is recommended
pipenv run celery -A storefront worker -l info -P eventlet
```

### 3. SMTP Configuration (Emails)
Add the following variables to your backend `.env` file to enable real email sending (e.g., Gmail):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_PORT=587
```

### 4. Load Testing with Locust
Run load tests to check the platform's performance and concurrent user capacity:
```bash
cd backend
# Start Locust
pipenv run locust -f locustfiles/browes_products.py
```
Open `http://localhost:8089` in your browser, enter the number of concurrent users and spawn rate, and start swarming!

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy-loaded route components
- **Image Optimization**: Lazy loading with proper alt text
- **Bundle Optimization**: Tree shaking and minification
- **State Management**: Efficient React context usage
- **Network Requests**: Request deduplication and error handling

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure PostgreSQL database
3. Run migrations
4. Collect static files
5. Configure production settings

### Frontend Deployment (Vercel)

**Prerequisites:**
- GitHub account with repository pushed
- Vercel account (free tier available)

**Steps:**

1. **Push to GitHub**
```bash
git add .
git commit -m "refactor: modernize homepage with server components and API integration"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js project

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1`
   - Example: `NEXT_PUBLIC_API_URL=https://api.nebistore.com/api/v1`

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys
   - Your site is live at `your-project.vercel.app`

**Post-Deployment Checklist:**
- [ ] Homepage loads correctly with products
- [ ] Product links work and fetch data
- [ ] Cart persists across page reloads
- [ ] Login/Register flow works
- [ ] Checkout process completes
- [ ] No TypeScript build errors
- [ ] No console errors in DevTools
- [ ] Mobile responsive design verified

## 🔍 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: ES2020, CSS Grid, Flexbox, CSS Custom Properties

## 📄 License

This project is licensed under the MIT License.

---

**Stack:** Django REST Framework, Next.js (App Router), TypeScript, Tailwind CSS
