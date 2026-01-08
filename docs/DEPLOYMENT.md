# KCIC Ticketing System - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Supabase production project
- Vercel/Netlify account (or hosting of choice)
- Domain name (optional)
- Git repository

---

## Step 1: Database Setup

### 1.1 Create Production Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to users
4. Note down project credentials

### 1.2 Run All Migrations
Execute in SQL Editor in order:
```sql
-- 0000_initial_schema.sql
-- 0001_tickets_table.sql
-- 0002_dashboard_incidents.sql
-- 0003_incidents_table.sql
-- 0004_notifications.sql
-- 0005_knowledge_base.sql
-- 0006_worker_management.sql
-- 0007_sla_management.sql
-- 0009_advanced_features.sql
```

### 1.3 Seed Initial Data (Optional)
```sql
-- Create admin user (replace with real email)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@yourcompany.com', crypt('temporary-password', gen_salt('bf')), now());

-- Add user to public.users
INSERT INTO public.users (id, email, role, full_name)
SELECT id, email, 'admin', 'System Admin'
FROM auth.users WHERE email = 'admin@yourcompany.com';

-- Default SLA policies are auto-created by migration
```

---

## Step 2: Environment Configuration

### 2.1 Get Supabase Credentials
From Supabase Dashboard → Settings → API:
- Project URL
- Anon public key

### 2.2 Create Production `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=production
```

---

## Step 3: Deploy to Vercel (Recommended)

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### 3.2 Import to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3.3 Add Environment Variables
In Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

### 3.4 Deploy
Click "Deploy" - Vercel will build and deploy automatically

---

## Step 4: Post-Deployment Verification

### 4.1 Test Core Features
- [ ] Login with admin account
- [ ] Create a test ticket
- [ ] Verify real-time updates
- [ ] Check analytics dashboard
- [ ] Test SLA calculation
- [ ] Verify RLS policies work

### 4.2 Performance Check
- [ ] Lighthouse score >90
- [ ] Page load <3 seconds
- [ ] Database query times <100ms
- [ ] Real-time latency <500ms

---

## Step 5: Security Hardening

### 5.1 Supabase Security
✅ Enable email confirmation
✅ Set up password complexity requirements
✅ Configure rate limiting
✅ Review RLS policies
✅ Enable audit logging

### 5.2 Application Security
```sql
-- Disable public registration (optional)
UPDATE auth.config 
SET allow_signup = false;

-- Require email verification
UPDATE auth.config 
SET enable_signup = true,
    email_confirm = true;
```

---

## Step 6: Monitoring & Maintenance

### 6.1 Supabase Monitoring
- Database usage and performance
- API request logs
- Real-time connection count
- Storage usage

### 6.2 Vercel Analytics
- Page views and performance
- Function execution times
- Edge network metrics

### 6.3 Setup Alerts
```sql
-- Create function to check SLA breaches
CREATE OR REPLACE FUNCTION notify_sla_breaches()
RETURNS void AS $$
BEGIN
    -- Check for critical SLA breaches
    -- Send notifications (implement via Supabase Edge Functions)
END;
$$ LANGUAGE plpgsql;
```

---

## Alternative Deployment Options

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Deploy to Railway
```bash
railway up
```

### Deploy with Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Backup & Recovery

### Database Backups
Supabase provides automatic daily backups.

Manual backup:
```bash
# Using pg_dump (requires database credentials)
pg_dump -h db.your-project.supabase.co \
        -U postgres \
        -d postgres \
        -f backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f backup_20241223.sql
```

---

## Scaling Considerations

### Database Scaling
- **Free tier**: 500MB database, 2GB bandwidth
- **Pro tier**: 8GB database, 250GB bandwidth
- **Enterprise**: Custom limits

### Application Scaling
Vercel auto-scales based on traffic.

For high traffic:
1. Enable Vercel Analytics
2. Use Edge Functions for heavy operations
3. Implement caching strategies
4. Consider CDN for static assets

---

## Troubleshooting

### Common Issues

**Issue**: 401 Unauthorized errors
- Check environment variables are set
- Verify Supabase URL and keys
- Ensure RLS policies allow access

**Issue**: Real-time not working
- Check Supabase Realtime is enabled
- Verify channel subscriptions
- Check browser console for errors

**Issue**: Slow performance
- Add database indexes
- Enable query caching
- Optimize component re-renders

---

## Maintenance Checklist

### Weekly
- [ ] Review error logs
- [ ] Check SLA compliance metrics
- [ ] Monitor database size

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review security audit
- [ ] Backup database manually
- [ ] Test disaster recovery

### Quarterly
- [ ] Update Next.js version
- [ ] Review and optimize queries
- [ ] User feedback session
- [ ] Security penetration test

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support

---

**Deployment Checklist Complete** ✅

Your KCIC Ticketing System is now production-ready!
