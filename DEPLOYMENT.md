# Creative Budget App - Deployment Guide

## 🚀 Hostinger Git Deployment Setup

### Prerequisites
- Hostinger hosting account with Git deployment support
- GitHub repository access

### Deployment Steps

#### 1. Hostinger Control Panel Setup
1. Login to your Hostinger control panel
2. Navigate to **Git** section
3. Click **"Create Repository"**
4. Enter repository URL: `https://github.com/dchambers3-stack/CreativeBudgetingApp.git`
5. Set branch: `main`
6. Set target folder: `public_html`

#### 2. Build Commands Configuration
In Hostinger Git settings, use these build commands:
```bash
npm ci
npm run build:prod
cp -r dist/budget-angular-app/* ./
cp .htaccess ./
```

#### 3. Environment Variables
Update `src/environments/environment.prod.ts` with your production domain:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com/api',
  appName: 'Creative Budget',
  version: '1.0.0'
};
```

#### 4. Enable Auto-Deploy
- Enable **"Auto Deploy"** in Hostinger Git settings
- Every push to `main` branch will automatically trigger deployment

### 🔄 Development Workflow

1. **Make changes locally**
2. **Test**: `npm start`
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your update description"
   git push origin main
   ```
4. **Automatic deployment** to Hostinger

### 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production (testing)
npm run build:prod

# Run tests
npm test
```

### 📁 Project Structure
```
src/
├── app/                    # Application components
├── environments/           # Environment configurations
├── styles.css             # Global styles
└── index.html             # Main HTML file

dist/                      # Production build output
.htaccess                  # Apache configuration for routing
deploy.sh                  # Deployment script
```

### 🔧 Troubleshooting

**Build fails:**
- Check Node.js version (recommended: 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

**Routes don't work:**
- Ensure `.htaccess` is uploaded to root directory
- Verify Angular Router configuration

**Styles missing:**
- Check base-href in build command
- Verify asset paths are correct

### 🚀 Features Included
- ✅ Modern purple theme design
- ✅ Dark/Light mode toggle
- ✅ Responsive mobile design
- ✅ Budget tracking and management
- ✅ Expense categorization
- ✅ Support ticket system
- ✅ Multi-language support (i18n)

### 📞 Support
For deployment issues, contact your hosting provider or check the GitHub repository for updates.
