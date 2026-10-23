
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { CloudConfig, Property } from "../types";
import { PropertyService } from "./propertyService";

const STORAGE_KEY = 'AQAR_AI_CLOUD_CONFIG';

const loadConfig = (): CloudConfig => {
    if (typeof window === 'undefined') return { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '', isConnected: false };
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    return { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '', isConnected: false };
};

let CONFIG = loadConfig();
let db: any = null;

export const CloudService = {
    getConfig: () => CONFIG,
    
    saveConfig: (cfg: CloudConfig) => {
        CONFIG = cfg;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG));
        CloudService.initialize();
    },

    initialize: async () => {
        if (!CONFIG.apiKey || !CONFIG.projectId) return false;
        
        try {
            // Check if apps exist, if so, delete to re-init with new config (for demo purposes mainly)
            if (getApps().length > 0) {
                // In a real app we might verify if config changed, but here we just reset
                const app = getApps()[0];
                // Note: deleteApp is async
                await deleteApp(app);
            }

            const app = initializeApp({
                apiKey: CONFIG.apiKey,
                authDomain: CONFIG.authDomain,
                projectId: CONFIG.projectId,
                storageBucket: CONFIG.storageBucket,
                messagingSenderId: CONFIG.messagingSenderId,
                appId: CONFIG.appId
            });
            
            db = getFirestore(app);
            CONFIG.isConnected = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG));
            return true;
        } catch (error) {
            console.error("Firebase Init Failed:", error);
            CONFIG.isConnected = false;
            return false;
        }
    },

    // Upload Local -> Cloud
    syncUp: async () => {
        if (!db) {
            const success = await CloudService.initialize();
            if (!success) throw new Error("Could not connect to Cloud Database");
        }

        const localProperties = PropertyService.getAll();
        const batchSize = 450; // Firestore batch limit is 500
        
        // Simple approach: Overwrite cloud with local
        // In prod, you'd want merge logic
        let count = 0;
        const chunks = [];
        
        for (let i = 0; i < localProperties.length; i += batchSize) {
            chunks.push(localProperties.slice(i, i + batchSize));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(p => {
                const ref = doc(db, "properties", p.id);
                batch.set(ref, p);
            });
            await batch.commit();
            count += chunk.length;
        }

        return count;
    },

    // Download Cloud -> Local
    syncDown: async () => {
        if (!db) {
            const success = await CloudService.initialize();
            if (!success) throw new Error("Could not connect to Cloud Database");
        }

        const querySnapshot = await getDocs(collection(db, "properties"));
        const cloudProps: Property[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Property;
            // Ensure ID matches
            data.id = doc.id; 
            cloudProps.push(data);
        });

        // Update Local Storage
        // We iterate and add to preserve the PropertyService internal logic
        // But for bulk replace, we might want a setAll method. 
        // For now, let's clear and add.
        
        // Note: This relies on PropertyService being mutable
        // We will manually overwrite the local storage key used by PropertyService
        // to ensure a hard reset.
        if (cloudProps.length > 0) {
            localStorage.setItem('AQAR_AI_PROPERTIES_DB_V2', JSON.stringify(cloudProps));
            // Force page reload to refresh PropertyService state since it's not reactive
            return cloudProps.length;
        }
        return 0;
    }
};
