/**
 * STORAGE.JS — Unified Storage Interface for BCS Exam Planner
 * Handles local isolation (localStorage) and cloud synchronization (Firebase).
 */

class StorageController {
    constructor() {
        this.cloudEnabled = false;
        this.db = null;
        this.syncKey = localStorage.getItem('sync_key') || null;
        this.cache = {};
        this.onUpdateListeners = [];

        // Pre-load cache from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            this.cache[key] = localStorage.getItem(key);
        }
    }

    /**
     * Get a value from the storage cache.
     */
    get(key, defaultValue = null) {
        return this.cache[key] !== undefined ? this.cache[key] : defaultValue;
    }

    /**
     * Set a value in both local and cloud storage.
     */
    async set(key, value) {
        const valStr = String(value);
        this.cache[key] = valStr;
        localStorage.setItem(key, valStr);

        if (this.cloudEnabled && this.db && this.syncKey) {
            try {
                const { doc, setDoc } = window.FirebaseFirestore;
                const userRef = doc(this.db, "users", this.syncKey);
                await setDoc(userRef, { [key]: valStr }, { merge: true });
            } catch (err) {
                console.error("Cloud sync failed:", err);
            }
        }
    }

    /**
     * Remove an item from storage.
     */
    async remove(key) {
        delete this.cache[key];
        localStorage.removeItem(key);

        if (this.cloudEnabled && this.db && this.syncKey) {
            try {
                const { doc, updateDoc, deleteField } = window.FirebaseFirestore;
                const userRef = doc(this.db, "users", this.syncKey);
                await updateDoc(userRef, { [key]: deleteField() });
            } catch (err) {
                console.error("Cloud delete failed:", err);
            }
        }
    }

    /**
     * Initialise Firebase connection.
     */
    async initCloud(config, syncKey) {
        if (!config || !syncKey) return;
        if (this.appInitialized) return true; 

        this.syncKey = syncKey;
        localStorage.setItem('sync_key', syncKey);

        try {
            // Firebase script injection check is handled in index.html
            const { initializeApp } = window.FirebaseApp;
            const { getFirestore, doc, onSnapshot } = window.FirebaseFirestore;

            const app = initializeApp(config);
            this.db = getFirestore(app);
            this.cloudEnabled = true;
            this.appInitialized = true;

            // Subscribe to real-time changes
            onSnapshot(doc(this.db, "users", syncKey), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    let changed = false;

                    for (const [key, value] of Object.entries(data)) {
                        if (this.cache[key] !== value) {
                            this.cache[key] = value;
                            localStorage.setItem(key, value);
                            changed = true;
                        }
                    }

                    if (changed) {
                        this.onUpdateListeners.forEach(cb => cb());
                    }
                }
            });

            return true;
        } catch (err) {
            console.error("Firebase init failed:", err);
            return false;
        }
    }

    addListener(callback) {
        this.onUpdateListeners.push(callback);
    }

    getAll() {
        return this.cache;
    }
}

window.PlannerStorage = new StorageController();
