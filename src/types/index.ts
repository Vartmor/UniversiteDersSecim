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
