import { Course, Section, Meeting, Schedule, ScheduleStats, DayOfWeek, UserFilters } from '../types';
import { hasOverlap, generateId } from './utils';

// Meeting'lerin çakışıp çakışmadığını kontrol et
function meetingsOverlap(m1: Meeting, m2: Meeting): boolean {
    if (m1.day !== m2.day) return false;
    return hasOverlap(m1.startMinute, m1.endMinute, m2.startMinute, m2.endMinute);
}

// Bir section'ın tüm meeting'lerinin mevcut seçimle çakışıp çakışmadığını kontrol et
function sectionOverlapsWithSelection(
    section: Section,
    selectedMeetings: Meeting[]
): boolean {
    for (const meeting of section.meetings) {
        for (const selected of selectedMeetings) {
            if (meetingsOverlap(meeting, selected)) {
                return true;
            }
        }
    }
    return false;
}

// Bir section'ın erken filtrelerle uyumlu olup olmadığını kontrol et
function sectionPassesEarlyFilters(
    section: Section,
    filters: UserFilters
): boolean {
    for (const meeting of section.meetings) {
        // Erken başlangıç filtresi
        if (filters.earliestStart !== null && meeting.startMinute < filters.earliestStart) {
            return false;
        }
        // Geç bitiş filtresi
        if (filters.latestEnd !== null && meeting.endMinute > filters.latestEnd) {
            return false;
        }
        // Boş gün filtresi
        if (filters.freeDays.includes(meeting.day)) {
            return false;
        }
        // Öğle arası filtresi (12:00-13:00)
        if (filters.lunchBreak) {
            const lunchStart = 12 * 60;
            const lunchEnd = 13 * 60;
            if (hasOverlap(meeting.startMinute, meeting.endMinute, lunchStart, lunchEnd)) {
                return false;
            }
        }
    }
    return true;
}

// Backtracking ile tüm geçerli kombinasyonları bul
export function generateCombinations(
    courses: Course[],
    filters: UserFilters,
    maxResults: number = 1000
): Schedule[] {
    // En az şubesi olan dersten başla (branching azaltma)
    const sortedCourses = [...courses].sort(
        (a, b) => a.sections.length - b.sections.length
    );

    const results: Schedule[] = [];
    const currentSelection: Section[] = [];
    const currentMeetings: Meeting[] = [];

    function backtrack(courseIndex: number) {
        // Sonuç limitine ulaşıldı mı?
        if (results.length >= maxResults) return;

        // Tüm dersler işlendi - geçerli kombinasyon bulundu
        if (courseIndex >= sortedCourses.length) {
            const schedule = createScheduleFromSelection(currentSelection);

            // Son filtreleri uygula
            if (schedulePassesPostFilters(schedule, filters)) {
                results.push(schedule);
            }
            return;
        }

        const course = sortedCourses[courseIndex];

        // Bu dersin her şubesini dene
        for (const section of course.sections) {
            // Erken filtreler
            if (!sectionPassesEarlyFilters(section, filters)) {
                continue;
            }

            // Çakışma kontrolü
            if (sectionOverlapsWithSelection(section, currentMeetings)) {
                continue;
            }

            // Bu şubeyi seç ve devam et
            currentSelection.push(section);
            currentMeetings.push(...section.meetings);

            backtrack(courseIndex + 1);

            // Geri al (backtrack)
            currentSelection.pop();
            currentMeetings.length -= section.meetings.length;
        }
    }

    backtrack(0);

    // Skora göre sırala
    results.sort((a, b) => b.score - a.score);

    return results;
}

// Seçilen şubelerden bir Schedule oluştur
function createScheduleFromSelection(sections: Section[]): Schedule {
    const sectionIds = sections.map(s => s.id);
    const allMeetings = sections.flatMap(s => s.meetings);
    const stats = calculateScheduleStats(allMeetings);
    const score = calculateScore(stats);

    return {
        id: generateId(),
        sectionIds,
        score,
        stats,
        pinned: false,
    };
}

// Program istatistiklerini hesapla
function calculateScheduleStats(meetings: Meeting[]): ScheduleStats {
    if (meetings.length === 0) {
        return {
            totalGaps: 0,
            freeDays: 5,
            earliestStart: 0,
            latestEnd: 0,
            totalSpread: 0,
        };
    }

    const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayMeetings: Record<DayOfWeek, Meeting[]> = {
        Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    };

    for (const meeting of meetings) {
        dayMeetings[meeting.day].push(meeting);
    }

    // Her günün meeting'lerini sırala
    for (const day of days) {
        dayMeetings[day].sort((a, b) => a.startMinute - b.startMinute);
    }

    let totalGaps = 0;
    let freeDays = 0;
    let earliestStart = Infinity;
    let latestEnd = 0;
    let totalSpread = 0;

    for (const day of days) {
        const dm = dayMeetings[day];

        if (dm.length === 0) {
            freeDays++;
            continue;
        }

        // En erken ve en geç
        const dayStart = dm[0].startMinute;
        const dayEnd = dm[dm.length - 1].endMinute;

        earliestStart = Math.min(earliestStart, dayStart);
        latestEnd = Math.max(latestEnd, dayEnd);

        // Spread (günlük kampüste kalma süresi)
        totalSpread += dayEnd - dayStart;

        // Gap hesaplama
        for (let i = 1; i < dm.length; i++) {
            const gap = dm[i].startMinute - dm[i - 1].endMinute;
            if (gap > 0) {
                totalGaps += gap;
            }
        }
    }

    if (earliestStart === Infinity) earliestStart = 0;

    return {
        totalGaps,
        freeDays,
        earliestStart,
        latestEnd,
        totalSpread,
    };
}

// Skor hesapla (yüksek = iyi)
function calculateScore(stats: ScheduleStats): number {
    const weights = {
        freeDays: 100,        // Her boş gün için +100
        lateStart: 2,         // Geç başlamak iyi (dakika başına +2)
        gaps: -0.5,           // Boşluk kötü (dakika başına -0.5)
        spread: -0.3,         // Uzun kampüs süresi kötü (dakika başına -0.3)
    };

    let score = 0;

    // Boş günler
    score += stats.freeDays * weights.freeDays;

    // Geç başlangıç bonusu (8:00'dan sonra her dakika için)
    const baseStart = 8 * 60; // 08:00
    if (stats.earliestStart > baseStart) {
        score += (stats.earliestStart - baseStart) * weights.lateStart;
    }

    // Boşluk cezası
    score += stats.totalGaps * weights.gaps;

    // Spread cezası
    score += stats.totalSpread * weights.spread;

    return Math.round(score);
}

// Son filtreler (kombinasyon tamamlandıktan sonra)
function schedulePassesPostFilters(
    schedule: Schedule,
    filters: UserFilters
): boolean {
    // Minimum boş gün
    if (schedule.stats.freeDays < filters.minFreeDays) {
        return false;
    }

    // Maksimum gap (herhangi bir günde)
    if (filters.maxGap !== null && schedule.stats.totalGaps > filters.maxGap) {
        return false;
    }

    return true;
}
