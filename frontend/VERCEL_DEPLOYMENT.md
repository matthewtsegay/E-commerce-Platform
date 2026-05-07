# Vercel Deployment Guide

## Quick Start

### 1. Prerequisites
- GitHub account with the repository pushed
- Vercel account (create at https://vercel.com)
- Production backend URL (e.g., https://api.nebistore.com/api/v1)

### 2. Connect Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Paste your GitHub repository URL
4. Vercel auto-detects Next.js configuration
5. Click "Deploy"

### 3. Configure Environment Variables

In Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com/api/v1` | Production |

**Example URLs:**
- Railway: `https://your-app.railway.app/api/v1`
- Render: `https://your-app.onrender.com/api/v1`
- Self-hosted: `https://api.nebistore.com/api/v1`

### 4. Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Wait for build to complete (~2-3 minutes)
3. Your site is live at `https://your-project.vercel.app`

### 5. Verify Deployment

After deployment, test the following:

**Checklist:**
- [ ] Homepage loads without errors
- [ ] Products display with images
- [ ] Hero slider auto-rotates
- [ ] Navigation works
- [ ] Login page accessible
- [ ] Cart functionality works
- [ ] Open browser DevTools Console - no red errors
- [ ] Mobile responsive design verified
- [ ] Lighthouse score acceptable (>80)

**Test URLs:**
- Homepage: `https://your-project.vercel.app`
- Products: `https://your-project.vercel.app/products`
- Login: `https://your-project.vercel.app/login`
- Cart: `https://your-project.vercel.app/cart`

## Advanced Configuration

### Custom Domain

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., `store.nebistore.com`)
3. Follow DNS configuration steps provided by Vercel
4. Wait 24-48 hours for DNS propagation

### SSL/HTTPS

Vercel automatically provides free SSL certificates from Let's Encrypt. HTTPS is enabled by default.

### Performance Optimization

**Current optimizations enabled:**
- ✅ Server-side rendering (SSR) for homepage
- ✅ Automatic code splitting
- ✅ Image optimization with Next.js Image component
- ✅ Production source maps disabled
- ✅ Standalone output for minimal bundle

### Monitoring & Logs

**View deployment logs:**
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Click "Functions" or "Logs" to see runtime logs
4. Check error messages and performance metrics

**Performance Analytics:**
1. Go to **Analytics** in Vercel Dashboard
2. Monitor:
   - Page load times
   - Web Core Vitals (LCP, FID, CLS)
   - Request count and latency
   - Error rates

## Troubleshooting

### Build Fails

**Error: "Deployment failed with exit code 1"**
- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally: `npm run build`
- Verify all environment variables are set correctly

**Error: "Cannot find module"**
- Check `package.json` dependencies
- Ensure package-lock.json is committed
- Run `npm install` locally and commit node_modules lock

### Page Shows 404

**Issue: Product pages showing 404**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend is running and accessible
- Test backend endpoint directly: `curl https://your-api/api/v1/store/products/`

### Images Not Loading

**Issue: Product images appear broken**
- Check image URL in browser DevTools
- Verify backend image paths are correct
- Add backend domain to `next.config.ts` remotePatterns if needed
- Backend may need CORS configuration

### Cart Not Persisting

**Issue: Cart clears on page reload**
- Check browser localStorage in DevTools
- Verify no errors in browser console
- Clear browser cache and retry
- Check API calls in Network tab

## Rollback

If deployment causes issues:

1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click the three dots menu
4. Select "Promote to Production"
5. Your site reverts to that version

## Custom Server (Advanced)

To run frontend on your own server instead of Vercel:

```bash
# Build the application
npm run build

# Start the server
npm run start
# App runs on http://localhost:3000

# Or use PM2 for production management
pm2 start npm --name "nebi-store" -- start
```

## CI/CD Pipeline

Vercel automatically deploys on:
- Push to `main` branch → Production
- Other branches → Preview deployments
- Pull requests → Preview deployments

**Disable auto-deployment:**
1. Go to Project Settings → Git
2. Toggle "Automatic Deployments" off
3. Deploy manually from Vercel dashboard

## Support

**Common resources:**
- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
