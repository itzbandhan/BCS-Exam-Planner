/**
 * CONFIG.JS — Environment Configuration
 * Loads Firebase and API credentials from environment variables
 * 
 * For development:
 *   - If using a build tool (Vite): Uses import.meta.env from .env
 *   - If using vanilla JS: Edit the values below or use a server-side .env injector
 * 
 * For production:
 *   - Environment variables are injected by your hosting platform
 *   - Netlify, Vercel, GitHub Pages CI/CD, etc. handle this automatically
 */

// Configuration object exposed globally
window.AppConfig = {
    firebase: {
        // These will be replaced by your build tool or deployment platform
        // Development: Edit these directly or use import.meta.env if using Vite
        // Production: These are auto-injected by Netlify/Vercel/GitHub Actions
        apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) 
            || localStorage.getItem('VITE_FIREBASE_API_KEY') 
            || null,
        authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) 
            || localStorage.getItem('VITE_FIREBASE_AUTH_DOMAIN') 
            || null,
        projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) 
            || localStorage.getItem('VITE_FIREBASE_PROJECT_ID') 
            || null,
        storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) 
            || localStorage.getItem('VITE_FIREBASE_STORAGE_BUCKET') 
            || null,
        messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) 
            || localStorage.getItem('VITE_FIREBASE_MESSAGING_SENDER_ID') 
            || null,
        appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) 
            || localStorage.getItem('VITE_FIREBASE_APP_ID') 
            || null,
        measurementId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) 
            || localStorage.getItem('VITE_FIREBASE_MEASUREMENT_ID') 
            || null,
    },
    gemini: {
        apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) 
            || localStorage.getItem('VITE_GEMINI_API_KEY') 
            || null,
    }
};

// Validation & Warnings
if (!window.AppConfig.firebase.apiKey) {
    console.warn('⚠️ Firebase API Key not found. Cloud sync will be disabled.');
    console.info('📝 For development: Copy .env.example to .env and fill in your credentials.');
    console.info('🚀 For production: Configure environment variables in your deployment platform.');
}

// Optional: Helper function to set config at runtime (useful for testing)
window.setAppConfig = function(config) {
    Object.assign(window.AppConfig, config);
    console.log('✅ AppConfig updated');
};

