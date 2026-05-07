# Quick Deployment Guide

**Time to deploy: 5-10 minutes**

## 1️⃣ Prepare Code

```bash
cd /Users/user/E-commerce-Platform
git add .
git commit -m "refactor: modernize homepage with server components and API integration"
git push origin main
```

## 2️⃣ Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Paste: `https://github.com/semereherruy/E-commerce-Platform`
4. Click "Continue"
5. Framework should show "Next.js" ✅
6. Click "Deploy" (it will auto-detect the `/frontend` directory)

## 3️⃣ Wait for Build

Build typically takes 1-3 minutes. You'll see:
```
✓ Built successfully
✓ Deployed to: https://your-project.vercel.app
```

## 4️⃣ Set Environment Variables

In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend-api.com/api/v1`
   - **Environment:** Select all (Production, Preview, Development)
3. Click "Save"
4. Redeploy (or new deploy will use it)

## 5️⃣ Test the Deployment

### Quick Checks (2 minutes)
- [ ] Homepage loads
- [ ] Products show with images
- [ ] Click a product → detail page works
- [ ] Add to cart → works
- [ ] Open DevTools Console → no errors
- [ ] Mobile view responsive

### Detailed Testing (10 minutes)
See: `DEPLOYMENT_CHECKLIST.md` in `/frontend` folder

## ✅ You're Live!

Your site is now live at: `https://your-project.vercel.app`

---

## Common Issues & Fixes

### Products not showing
**Issue:** Homepage loads but no products
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Backend must be accessible from internet (not localhost)

**Fix:**
```
Settings → Environment Variables → Update NEXT_PUBLIC_API_URL
→ Redeploy
```

### Build fails
**Issue:** Deployment shows "Build failed"
- Click the deployment to see logs
- Most common: TypeScript errors

**Fix:**
- Fix errors locally: `npm run build`
- Commit and push
- Vercel auto-redeploys

### Images broken
**Issue:** Images show as broken on production
- Backend image URLs might be wrong
- Backend domain needs to be in `next.config.ts`

**Fix:**
- Check `next.config.ts` line ~32 for `remotePatterns`
- Add your backend domain if missing
- Rebuild locally and commit

## Rollback (If Needed)

In Vercel Dashboard:
1. Go to **Deployments**
2. Find previous working deployment
3. Click **⋯** (three dots)
4. Click **Promote to Production**

Done! Site reverted to previous version.

## Need Help?

- **Vercel Setup:** See `VERCEL_DEPLOYMENT.md` in `/frontend`
- **Pre-Launch Checklist:** See `DEPLOYMENT_CHECKLIST.md` in `/frontend`
- **Deployment Summary:** See `DEPLOYMENT_SUMMARY.md` in root
- **Vercel Docs:** https://vercel.com/docs

---

**Good luck! 🚀**
