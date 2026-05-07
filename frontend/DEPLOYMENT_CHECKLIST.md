# Vercel Deployment Checklist

## Pre-Deployment (Local)

### Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run test` - all tests pass
- [ ] Run `npm run build` - build succeeds
- [ ] Git status clean - all changes committed
- [ ] Branch pushed to GitHub main

### Environment
- [ ] `.env.example` up to date with all required variables
- [ ] `.env.production` created with production values
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] No sensitive data in `.env.example`

### Documentation
- [ ] README updated with current feature set
- [ ] VERCEL_DEPLOYMENT.md created and reviewed
- [ ] Comments added to complex code
- [ ] Changelog updated with version info

## Vercel Setup

### Account & Repository
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub repository connected to Vercel
- [ ] Deploy from `main` branch selected

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel dashboard
- [ ] Production backend URL verified accessible
- [ ] Test API endpoint: `curl https://your-backend/api/v1/store/products/`

### Initial Deployment
- [ ] Project imported to Vercel
- [ ] Build settings verified (Framework: Next.js)
- [ ] First deployment triggered
- [ ] Build completes without errors
- [ ] Deployment preview available

## Post-Deployment Verification

### Critical Functionality
- [ ] Homepage loads at production URL
- [ ] Hero section displays with real product data
- [ ] Navigation works correctly
- [ ] Product listings load and display images
- [ ] Search/filter functionality works
- [ ] Links to product detail pages work

### User Flows
- [ ] Registration page loads
- [ ] Login works with valid credentials
- [ ] Cart add/remove items works
- [ ] Cart persists across page reloads
- [ ] Checkout page loads and accepts input
- [ ] Order creation succeeds
- [ ] Order confirmation page displays

### Technical
- [ ] Browser console clean (no errors/warnings)
- [ ] Network tab shows successful API calls
- [ ] Response times acceptable (<3s for homepage)
- [ ] Images load correctly from backend
- [ ] No CORS errors in console
- [ ] No 404 errors for API calls

### Mobile & Responsive
- [ ] Mobile viewport tested (375px, 768px, 1024px)
- [ ] Touch interactions work (buttons, forms)
- [ ] Mobile navigation visible and functional
- [ ] Images responsive and load quickly on mobile
- [ ] No horizontal scroll on any screen size

### Browser Compatibility
- [ ] Chrome latest version
- [ ] Firefox latest version
- [ ] Safari latest version
- [ ] Mobile Safari (iPhone)
- [ ] Chrome Mobile (Android)

## Performance Testing

### Lighthouse Audit
1. Open DevTools → Lighthouse
2. Run audit (Mobile & Desktop)
3. Check scores:
   - [ ] Performance: > 80
   - [ ] Accessibility: > 90
   - [ ] Best Practices: > 90
   - [ ] SEO: > 90

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Bundle Analysis
1. Run: `npm run build`
2. Check output:
   - [ ] Page size < 500KB (gzipped)
   - [ ] No unused dependencies
   - [ ] Production source maps disabled

## Security Review

### Headers
- [ ] X-Content-Type-Options set
- [ ] X-Frame-Options set
- [ ] Content-Security-Policy considered
- [ ] CORS headers appropriate

### API Integration
- [ ] JWT tokens stored securely (httpOnly cookies)
- [ ] No sensitive data in localStorage
- [ ] API calls use HTTPS only
- [ ] Backend CORS configured properly

### Form Security
- [ ] CSRF protection (if applicable)
- [ ] Input validation on client
- [ ] No SQL injection vectors
- [ ] Password fields masked

## Monitoring Setup

### Vercel Dashboard
- [ ] Analytics enabled
- [ ] Monitor Web Core Vitals
- [ ] Review deployment logs
- [ ] Set up deployment notifications

### Error Tracking (Optional)
- [ ] Sentry or similar configured (optional)
- [ ] Error notifications sent to team
- [ ] Error rate monitored

### DNS & Domain (If Custom Domain)
- [ ] Domain DNS records configured
- [ ] SSL certificate provisioned
- [ ] Redirect from root domain configured
- [ ] HTTPS working on custom domain

## Go-Live Steps

### Final Checks (24 hours before)
- [ ] Full end-to-end test cycle
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Backup of working version ready

### Deployment Checklist
1. [ ] Code reviewed and approved
2. [ ] All tests passing
3. [ ] Environment variables verified
4. [ ] Production database ready (if needed)
5. [ ] Backend API running and responsive
6. [ ] Deployment triggered
7. [ ] Build completes successfully
8. [ ] Production URL tested immediately

### Post-Deployment (First Hour)
- [ ] Monitor error rates (should be 0)
- [ ] Check performance metrics
- [ ] Monitor API response times
- [ ] Test payment flow if applicable
- [ ] Verify email notifications working
- [ ] Monitor backend logs for errors

## Rollback Plan

If critical issues found:
1. [ ] Identify root cause
2. [ ] Check previous deployments in Vercel
3. [ ] Promote previous stable deployment
4. [ ] Verify rollback successful
5. [ ] Post-mortem documentation

**Vercel rollback command:**
```bash
# In Vercel dashboard:
# Deployments → Select stable version → Three dots → Promote to Production
```

## Post-Deployment (Week 1)

- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Review performance metrics
- [ ] Check for any unreported bugs
- [ ] Plan first hotfix if needed

## Ongoing Maintenance

- [ ] Weekly performance review
- [ ] Monthly security scan
- [ ] Update dependencies monthly
- [ ] Review error logs weekly
- [ ] Monitor user reports

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Status:** ☐ Success ☐ Rollback ☐ Issues Found

**Issues Found:**
```
(Document any issues here)
```

**Notes:**
```
(Add any additional notes)
```
