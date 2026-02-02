// Ders Zamanı Tipi
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type MeetingType = 'Lecture' | 'Lab' | 'Recitation';

// Ders Zamanı Bloğu
export interface Meeting {
    id: string;
    sectionId: string;
    day: DayOfWeek;
    startMinute: number; // Dakika cinsinden (örn: 9:30 = 570)
    endMinute: number;
    location?: string;
    type: MeetingType;
}

// Şube
export interface Section {
    id: string;
    courseId: string;
    name: string; // "1. Şube" gibi
    instructor?: string;
    capacity?: number;
    isOnline: boolean; // true = çevrimiçi, false = yüzyüze
    meetings: Meeting[];
}

// Ders
export interface Course {
    id: string;
    termId: string;
    code: string; // "CSE101" gibi
    name: string;
    credits: number;
    required: boolean; // Zorunlu mu?
    color: string; // Ders rengi
    sections: Section[];
}

// Dönem
export interface Term {
    id: string;
    name: string; // "2025-2026 Bahar" gibi
    courses: Course[];
}

// Kullanıcı Filtreleri
export interface UserFilters {
    earliestStart: number | null;
    latestEnd: number | null;
    freeDays: DayOfWeek[];
    maxGap: number | null;
    lunchBreak: boolean;
    minFreeDays: number;
}

// Skor Ağırlıkları (kullanıcı ayarlayabilir)
export interface ScoreWeights {
    freeDays: number;    // Boş gün önemi (0-100)
    lateStart: number;   // Geç başlangıç önemi (0-100)
    gaps: number;        // Boşluk azaltma önemi (0-100)
    spread: number;      // Kampüs süresi azaltma önemi (0-100)
}

// Varsayılan skor ağırlıkları
export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
    freeDays: 80,
    lateStart: 50,
    gaps: 40,
    spread: 30,
};

// Kombinasyon / Oluşturulan Program
export interface Schedule {
    id: string;
    sectionIds: string[];
    score: number;
    stats: ScheduleStats;
    pinned: boolean;
}

// Program İstatistikleri
export interface ScheduleStats {
    totalGaps: number;
    freeDays: number;
    earliestStart: number;
    latestEnd: number;
    totalSpread: number;
}

// Renk paleti
export const COURSE_COLORS = [
    '#DBEAFE', // Açık mavi
    '#FEE2E2', // Açık kırmızı
    '#D1FAE5', // Açık yeşil
    '#FEF3C7', // Açık sarı
    '#E9D5FF', // Açık mor
    '#CFFAFE', // Açık turkuaz
    '#FCE7F3', // Açık pembe
    '#F3F4F6', // Açık gri
];

// Gün isimleri (Türkçe)
export const DAY_NAMES: Record<DayOfWeek, string> = {
    Mon: 'Pazartesi',
    Tue: 'Salı',
    Wed: 'Çarşamba',
    Thu: 'Perşembe',
    Fri: 'Cuma',
    Sat: 'Cumartesi',
    Sun: 'Pazar',
};

// Kısa gün isimleri
export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
    Mon: 'Pzt',
    Tue: 'Sal',
    Wed: 'Çar',
    Thu: 'Per',
    Fri: 'Cum',
    Sat: 'Cmt',
    Sun: 'Paz',
};

// Standart üniversite ders saatleri (50 dk ders + 10 dk ara)
export interface TimeSlot {
    id: number;
    label: string;
    startMinute: number;
    endMinute: number;
}

export const TIME_SLOTS: TimeSlot[] = [
    { id: 1, label: '1', startMinute: 8 * 60 + 30, endMinute: 9 * 60 + 20 },   // 08:30-09:20
    { id: 2, label: '2', startMinute: 9 * 60 + 30, endMinute: 10 * 60 + 20 },  // 09:30-10:20
    { id: 3, label: '3', startMinute: 10 * 60 + 30, endMinute: 11 * 60 + 20 }, // 10:30-11:20
    { id: 4, label: '4', startMinute: 11 * 60 + 30, endMinute: 12 * 60 + 20 }, // 11:30-12:20
    { id: 5, label: '5', startMinute: 12 * 60 + 30, endMinute: 13 * 60 + 20 }, // 12:30-13:20
    { id: 6, label: '6', startMinute: 13 * 60 + 30, endMinute: 14 * 60 + 20 }, // 13:30-14:20
    { id: 7, label: '7', startMinute: 14 * 60 + 30, endMinute: 15 * 60 + 20 }, // 14:30-15:20
    { id: 8, label: '8', startMinute: 15 * 60 + 30, endMinute: 16 * 60 + 20 }, // 15:30-16:20
    { id: 9, label: '9', startMinute: 16 * 60 + 30, endMinute: 17 * 60 + 20 }, // 16:30-17:20
    { id: 10, label: '10', startMinute: 17 * 60 + 30, endMinute: 18 * 60 + 20 }, // 17:30-18:20
    { id: 11, label: '11', startMinute: 18 * 60 + 30, endMinute: 19 * 60 + 20 }, // 18:30-19:20
];

// Dakikayı saat formatına çevir
export function formatMinutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
