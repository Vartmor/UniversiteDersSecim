import { StateStorage } from 'zustand/middleware';

// Tauri store desteği - dinamik import ile
let tauriStore: any = null;
let isInitialized = false;
let isTauriAvailable = false;

// Tauri ortamında mıyız kontrol et
async function checkTauriEnvironment(): Promise<boolean> {
    try {
        // @ts-ignore - Tauri global object
        return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
    } catch {
        return false;
    }
}

// Store'u başlat
async function initStore(): Promise<void> {
    if (isInitialized) return;
    isInitialized = true;

    isTauriAvailable = await checkTauriEnvironment();

    if (isTauriAvailable) {
        try {
            const { load } = await import('@tauri-apps/plugin-store');
            tauriStore = await load('universite-ders-secim.json');
            console.log('✓ Tauri store initialized - data will persist');
        } catch (error) {
            console.warn('Tauri store not available, using localStorage:', error);
            isTauriAvailable = false;
        }
    } else {
        console.log('Running in browser mode - using localStorage');
    }
}

// Zustand için storage adapter
export const tauriStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        await initStore();

        if (isTauriAvailable && tauriStore) {
            try {
                const value = await tauriStore.get(name);
                return value as string ?? null;
            } catch (error) {
                console.error('Tauri store read error:', error);
            }
        }

        // Fallback to localStorage
        return localStorage.getItem(name);
    },

    setItem: async (name: string, value: string): Promise<void> => {
        await initStore();

        // Always save to localStorage as backup
        localStorage.setItem(name, value);

        if (isTauriAvailable && tauriStore) {
            try {
                await tauriStore.set(name, value);
                await tauriStore.save();
            } catch (error) {
                console.error('Tauri store write error:', error);
            }
        }
    },

    removeItem: async (name: string): Promise<void> => {
        await initStore();

        localStorage.removeItem(name);

        if (isTauriAvailable && tauriStore) {
            try {
                await tauriStore.delete(name);
                await tauriStore.save();
            } catch (error) {
                console.error('Tauri store delete error:', error);
            }
        }
    },
};

// Başlangıçta ortamı kontrol et
initStore();
