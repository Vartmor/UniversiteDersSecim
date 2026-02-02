import { load, Store } from '@tauri-apps/plugin-store';
import { StateStorage } from 'zustand/middleware';

// Global store instance
let tauriStore: Store | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Store'u başlat
async function initStore(): Promise<void> {
    if (isInitialized && tauriStore) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // Tauri v2 plugin-store API
            tauriStore = await load('universite-ders-secim.json');
            isInitialized = true;
            console.log('Tauri store initialized');
        } catch (error) {
            console.error('Failed to initialize Tauri store:', error);
            isInitialized = true;
        }
    })();

    return initPromise;
}

// Zustand için storage adapter
export const tauriStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        await initStore();
        if (!tauriStore) {
            console.warn('Tauri store not available, using localStorage fallback');
            return localStorage.getItem(name);
        }
        try {
            const value = await tauriStore.get<string>(name);
            return value ?? null;
        } catch (error) {
            console.error('Error reading from Tauri store:', error);
            return localStorage.getItem(name);
        }
    },

    setItem: async (name: string, value: string): Promise<void> => {
        await initStore();
        if (!tauriStore) {
            console.warn('Tauri store not available, using localStorage fallback');
            localStorage.setItem(name, value);
            return;
        }
        try {
            await tauriStore.set(name, value);
            await tauriStore.save();
        } catch (error) {
            console.error('Error writing to Tauri store:', error);
            localStorage.setItem(name, value);
        }
    },

    removeItem: async (name: string): Promise<void> => {
        await initStore();
        if (!tauriStore) {
            localStorage.removeItem(name);
            return;
        }
        try {
            await tauriStore.delete(name);
            await tauriStore.save();
        } catch (error) {
            console.error('Error removing from Tauri store:', error);
            localStorage.removeItem(name);
        }
    },
};

// Store'u manuel kaydet
export async function saveStore(): Promise<void> {
    if (tauriStore) {
        await tauriStore.save();
    }
}

// Başlangıçta store'u yükle
initStore();
