import { type ClassValue, clsx } from 'clsx';

// Class name birleştirici (tailwind-merge yerine basit versiyon)
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

// Dakikayı saat:dakika formatına çevir
export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Saat:dakika formatını dakikaya çevir
export function timeToMinutes(time: string): number {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
}

// Zaman aralığı çakışma kontrolü
export function hasOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean {
    return start1 < end2 && start2 < end1;
}

// ID oluşturucu
export function generateId(): string {
    return crypto.randomUUID();
}
