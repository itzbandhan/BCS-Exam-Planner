# 🔧 Environment Setup Guide

## Quick Start (Local Development)

### Without a Build Tool (Simple)

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIza...your_actual_key
   VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
   # ... rest of config
   ```

3. **Load via localStorage** (browser console):
   ```javascript
   // Paste this in browser console to test locally:
   const env = {
       VITE_FIREBASE_API_KEY: "AIza...",
       VITE_FIREBASE_AUTH_DOMAIN: "my-project.firebaseapp.com",
       VITE_FIREBASE_PROJECT_ID: "my-project",
       VITE_FIREBASE_STORAGE_BUCKET: "my-project.firebasestorage.app",
       VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
       VITE_FIREBASE_APP_ID: "1:123456789:web:abc123",
       VITE_FIREBASE_MEASUREMENT_ID: "G-XXXXX"
   };
   Object.entries(env).forEach(([k, v]) => localStorage.setItem(k, v));
   location.reload();
   ```

### With a Build Tool (Recommended for Production)

1. **Install Vite**:
   ```bash
   npm install --save-dev vite
   npm install --save-dev @vitejs/plugin-basic-ssl
   ```

2. **Create `vite.config.js`**:
   ```javascript
   import { defineConfig } from 'vite'
   export default defineConfig({
     server: { https: false }
   })
   ```

3. **Update `package.json`**:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build"
     }
   }
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   # Vite will read .env and inject variables
   # Upload dist/ folder to your host
   ```

---

## 🚀 Production Deployment by Platform

### Netlify

**Environment Variables Setup:**
1. Dashboard → Site Settings → Build & Deploy → Environment
2. Add variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

**Build command**: `npm run build` or `vite build`

**Publish directory**: `dist`

---

### Vercel

**Environment Variables Setup:**
1. Project Settings → Environment Variables
2. Add each variable with Production/Preview scopes
3. Redeploy to apply

**Example `vercel.json`**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

### GitHub Pages + GitHub Actions

**Create `.github/workflows/deploy.yml`**:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build with env vars
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Add secrets to GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each `VITE_*` variable

---

## 🔑 Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click your project (or create one)
3. Click ⚙️ → Project Settings
4. Go to "Your apps" section
5. Click the `</>` icon for your web app
6. Copy all the values from the config object

Example from Firebase:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbgO_Q6euLImJMjb1O2vu-gNUreD57eoQ",  // ← Copy this
  authDomain: "bcs-planner.firebaseapp.com",           // ← Copy this
  projectId: "bcs-planner",                             // ← Copy this
  // ... etc
};
```

Paste each value into your `.env` file.

---

## ⚠️ Important Security Notes

- **NEVER** commit `.env` file to Git (it's in `.gitignore`)
- **NEVER** hardcode secrets in the code
- **NEVER** expose secrets in client-side comments
- **DO** use different API keys for development and production (optional but recommended)
- **DO** restrict Firebase API key usage in [Firebase Console](https://console.firebase.google.com)
  - Go to APIs & Services → Credentials
  - Restrict key to only your domain
  - Restrict to specific APIs (Firestore, etc.)

---

## 🐛 Troubleshooting

**Q: "Firebase API Key not found" warning**
- A: Make sure `.env` file exists and is filled in, OR your deployment platform has environment variables set

**Q: Firestore connection fails in production**
- A: Check that API key is correct and Firebase Security Rules allow read/write

**Q: "Cannot read property 'firebase' of undefined"**
- A: config.js needs to load before any Firebase initialization. Check `index.html` load order.

---

**Need help?** Check the main [README.md](./README.md)
