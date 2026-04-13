# 📚 BCS Exam Planner - BSc CSNT Board Preparation

A high-fidelity, interactive **Progressive Web App (PWA)** designed for **BSc CSNT 1st Semester** students. This dashboard is built for absolute focus, high-speed performance, and strategic exam tracking.

---
## 🚀 Key Features

- **📱 App Installation**: Installable as a standalone mobile app on iOS and Android. No browser bars, full-screen experience.
- **☁️ Offline Support**: Powered by Service Workers to ensure you can access your schedule even without internet.
- **🔥 Operational Streaks**: Tracks your consistency with an automated daily activity engine.
- **💡 Smart Navigation**: Context-aware briefing that automatically transitions to **Exam Protocols** during board week.
- **⚡ Performance Core**: Optimized canvas starfield with throttled resize logic for zero-lag mobile use.
- **🎯 Tactical Focus**: Direct mapping of "Section C" subjects (15 marks each) with mastery tracking.
- **🔐 Secure Secrets Management**: API keys stored safely in environment variables, not hardcoded.

## 🛠 Tech Stack

- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **PWA**: Web Manifest + Service Worker API.
- **Visuals**: Chart.js & Optimized Canvas.
- **Styling**: Tailwind CSS & Glassmorphic Design System.
- **Backend**: Firebase (Firestore) for cloud synchronization.

---

## 🔒 Environment Configuration

### **Security Update: API Keys Now Hidden**

API keys and secrets are now managed through environment variables instead of being hardcoded in the repository. This includes:

- ✅ Firebase API credentials
- ✅ Gemini API keys
- ✅ Any future API integrations

### **Local Development Setup**

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Click **⚙️ Settings > Project Settings**
   - Scroll to "Your apps" and copy the config values

3. **Fill in your `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Never commit `.env` file!**
   - Your `.env` file is automatically ignored by Git (see `.gitignore`)
   - Only `.env.example` should be in the repository

### **Files Changed**

| File | Change | Purpose |
|------|--------|---------|
| `index.html` | Removed hardcoded API key | Load config from environment |
| `js/config.js` | ✨ **NEW** | Read env vars via `window.AppConfig` |
| `.env.example` | ✨ **NEW** | Template showing required variables |
| `.gitignore` | Updated | Exclude `.env` and related files |

### **How It Works**

The application flow:

```
.env (development)
    ↓
config.js (loads via import.meta.env)
    ↓
window.AppConfig (global config object)
    ↓
index.html (reads window.AppConfig.firebase)
```

---

## 🚀 Production Deployment

Depending on your hosting platform, follow the appropriate guide:

### **GitHub Pages + GitHub Actions**

1. Add secrets to your repository:
   - Go to **Settings > Secrets and variables > Actions**
   - Add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.

2. Use in your GitHub Actions workflow (`.github/workflows/deploy.yml`):
   ```yaml
   - name: Build with env variables
     env:
       VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
       VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
       # ... add other secrets
     run: npm run build
   ```

### **Netlify**

1. Connect your repository to Netlify
2. Go to **Site Settings > Build & Deploy > Environment**
3. Add environment variables:
   - `VITE_FIREBASE_API_KEY=your_key`
   - `VITE_FIREBASE_AUTH_DOMAIN=your_domain`
   - ... etc

4. Netlify will inject these during the build process

### **Vercel**

1. Import your project to Vercel
2. Go to **Settings > Environment Variables**
3. Add each variable with scope: `Production`, `Preview`, `Development`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - ... etc

### **Traditional Web Hosting (No Build Tool)**

For hosting platforms without built-in build support, you'll need to:

1. **Option A: Use a build tool locally**
   ```bash
   npm install --save-dev vite
   npm run build
   # Upload dist/ folder to your server
   ```

2. **Option B: Inject at server startup**
   - Create a node.js wrapper that reads env vars and injects them into `index.html`
   - Example: Use `dotenv` package to load `.env` and replace `process.env` placeholders

3. **Option C: Manually set secrets before deployment**
   - For static hosting with ZERO build process, use the Firebase Console's public API configuration
   - Note: Firebase API key is intentionally public for frontend apps (restricted by Firestore security rules)

---

## 📲 How to Install as an App

### **On iOS (Safari)**
1. Open the website in Safari.
2. Tap the **Share** button (box with an upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner.

### **On Android (Chrome)**
1. Open the website in Chrome.
2. Tap the **three dots** in the top right corner.
3. Tap **"Install App"** (or "Add to Home Screen").
4. Follow the prompt to install.

---

## 📁 Repository Structure

```text
Exam Planner/
├── index.html             # Smart UI Shell + Firebase init
├── manifest.json          # PWA Identity
├── sw.js                  # Offline Service Worker
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules (excludes .env)
├── css/                   # Modular Glass-Design 
├── js/
│   ├── app.js             # Main app logic
│   ├── config.js          # ⭐ NEW: Environment config loader
│   ├── storage.js         # Storage interface
│   ├── charts.js          # Chart.js integration
│   ├── countdown.js       # Exam countdown timer
│   ├── data.js            # Subject data
│   ├── effects.js         # Visual effects
│   ├── notes.js           # Notes & AI features
│   ├── targets.js         # Target management
│   ├── timetable.js       # Timetable logic
│   └── utils.js           # Utility functions
└── assets/                # App Icons & Visuals
```

---

## 🎯 Tactical Methodology

The **BCS Exam Planner** isn't just a schedule; it's a strategic framework based on the following principles:
- **The 45-Mark Rule**: Prioritizes Section C mastery (long-form questions). Understanding these core topics provides the cognitive foundation for Sections A and B.
- **Front-Loading**: Hardest subjects (Math/Systems) are scheduled early in the 12-day block to maximize retention.
- **Survival Protocols**: Daily 7:00 AM and 5:30 PM blocks during exam week are reserved for high-yield recall only, avoiding burn-out.

## 👨‍💻 Developer & Author

**Pramesh Bhurtel**
- 🌐 [Official Portfolio](https://prameshbhurtel.com.np)
- 🐙 [GitHub Profile](https://github.com/Pramesh-Bhurtel)

---
*Optimized for clarity. Engineered for results.*
