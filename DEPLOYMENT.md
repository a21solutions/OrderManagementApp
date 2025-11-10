# Deployment Guide

## Prerequisites

1. Install Firebase CLI globally:
```powershell
npm install -g firebase-tools
```

2. Login to Firebase:
```powershell
firebase login
```

## Step-by-Step Deployment

### 1. Initialize Firebase (First Time Only)

```powershell
firebase init
```

Select the following options:
- ☑ Firestore: Configure security rules and indexes files
- ☑ Hosting: Configure files for Firebase Hosting
- Use existing project: `aporders-b537e`
- Firestore rules file: `firestore.rules` (already exists)
- Firestore indexes file: `firestore.indexes.json` (default)
- Public directory: `dist/order-management-app/browser`
- Configure as single-page app: Yes
- Set up automatic builds: No

### 2. Build the Application

```powershell
ng build --configuration production
```

This creates optimized production files in `dist/order-management-app/browser/`

### 3. Deploy Firestore Rules

```powershell
firebase deploy --only firestore:rules
```

### 4. Deploy Application to Firebase Hosting

```powershell
firebase deploy --only hosting
```

Or deploy everything at once:
```powershell
firebase deploy
```

### 5. View Your Deployed Application

After successful deployment, Firebase will provide a hosting URL:
```
https://aporders-b537e.web.app
```

Or
```
https://aporders-b537e.firebaseapp.com
```

## Continuous Deployment

### Quick Deploy Script

Create a deploy script for easy redeployment:

```powershell
# deploy.ps1
Write-Host "Building application..." -ForegroundColor Cyan
ng build --configuration production

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deploying to Firebase..." -ForegroundColor Cyan
    firebase deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}
```

Run with:
```powershell
.\deploy.ps1
```

## Verify Deployment

1. **Check Hosting**: Visit your hosting URL
2. **Test Functionality**:
   - Load products from Firestore
   - Submit a test order
   - Switch languages
   - Test on mobile device

3. **Check Firestore Rules**: 
   - Go to Firebase Console → Firestore Database → Rules
   - Verify rules are active

4. **Monitor Performance**:
   - Use Chrome DevTools → Lighthouse
   - Run performance audit
   - Target Score > 90

## Troubleshooting

### Build Errors

If build fails, check:
```powershell
ng build --configuration production --verbose
```

### Firestore Permission Errors

If orders fail to submit:
1. Check Firestore rules in Firebase Console
2. Verify rules allow `create` on orders collection
3. Redeploy rules: `firebase deploy --only firestore:rules`

### 404 Errors on Refresh

Ensure `firebase.json` has the rewrite rule:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration steps
5. Wait for SSL certificate provisioning (up to 24 hours)

### Update DNS Records

Add these records to your domain provider:
- Type: A
- Name: @
- Value: (provided by Firebase)

- Type: A
- Name: www
- Value: (provided by Firebase)

## Environment-Specific Deployments

### Production Environment

```powershell
ng build --configuration production
firebase deploy --only hosting
```

### Staging Environment (if configured)

```powershell
ng build --configuration staging
firebase deploy --only hosting:staging
```

## Rollback Deployment

If you need to rollback to a previous version:

1. Go to Firebase Console → Hosting
2. View deployment history
3. Click on previous version
4. Click "Rollback"

Or use CLI:
```powershell
firebase hosting:channel:rollback web
```

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Products display from Firestore
- [ ] Order submission works
- [ ] Language switching works
- [ ] Mobile responsive design works
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Firestore security rules active
- [ ] Custom domain configured (if applicable)
- [ ] Analytics set up (optional)

## Monitoring

### Firebase Console

Monitor your application:
1. **Hosting**: View traffic and bandwidth
2. **Firestore**: Monitor reads/writes
3. **Performance**: Check load times
4. **Analytics**: Track user behavior (if configured)

### Set Up Alerts

Configure budget alerts:
1. Go to Firebase Console → Usage and billing
2. Set up budget alerts for Firestore operations
3. Set up hosting bandwidth alerts

## Updating After Deployment

For subsequent updates:

```powershell
# 1. Make your changes
# 2. Build
ng build --configuration production

# 3. Deploy
firebase deploy --only hosting

# Or use the deploy script
.\deploy.ps1
```

## Support

For deployment issues:
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Angular Deployment Guide](https://angular.dev/tools/cli/deployment)
- [Firebase Support](https://firebase.google.com/support)

---

**Happy Deploying! 🚀**
