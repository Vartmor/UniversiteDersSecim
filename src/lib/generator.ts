import { Course, Section, Meeting, Schedule, ScheduleStats, DayOfWeek, UserFilters, ScoreWeights, DEFAULT_SCORE_WEIGHTS } from '../types';
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
    filters: UserFilters,
    course: Course
): boolean {
    for (const meeting of section.meetings) {
        if (filters.earliestStart !== null && meeting.startMinute < filters.earliestStart) {
            return false;
        }
        // latestEnd sadece yüzyüze (isOnline=false) dersler için geçerli
        if (!course.isOnline && filters.latestEnd !== null && meeting.endMinute > filters.latestEnd) {
            return false;
        }
        if (filters.freeDays.includes(meeting.day)) {
            return false;
        }
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

// Matematiksel olarak mümkün kombinasyon sayısını hesapla (filtreler hariç)
export function calculatePossibleCombinations(courses: Course[]): number {
    if (courses.length === 0) return 0;

    // Her dersin şube sayısının çarpımı
    let total = 1;
    for (const course of courses) {
        if (course.sections.length === 0) return 0;
        total *= course.sections.length;
    }
    return total;
}

// Backtracking ile tüm geçerli kombinasyonları bul
export function generateCombinations(
    courses: Course[],
    filters: UserFilters,
    weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS,
    maxResults: number = 1000
): Schedule[] {
    const sortedCourses = [...courses].sort(
        (a, b) => a.sections.length - b.sections.length
    );

    const results: Schedule[] = [];
    const currentSelection: Section[] = [];
    const currentMeetings: Meeting[] = [];

    function backtrack(courseIndex: number) {
        if (results.length >= maxResults) return;

        if (courseIndex >= sortedCourses.length) {
            const schedule = createScheduleFromSelection(currentSelection, weights);

            if (schedulePassesPostFilters(schedule, filters)) {
                results.push(schedule);
            }
            return;
        }

        const course = sortedCourses[courseIndex];

        for (const section of course.sections) {
            if (!sectionPassesEarlyFilters(section, filters, course)) {
                continue;
            }

            if (sectionOverlapsWithSelection(section, currentMeetings)) {
                continue;
            }

            currentSelection.push(section);
            currentMeetings.push(...section.meetings);

            backtrack(courseIndex + 1);

            currentSelection.pop();
            currentMeetings.length -= section.meetings.length;
        }
    }

    backtrack(0);

    results.sort((a, b) => b.score - a.score);

    return results;
}

// Seçilen şubelerden bir Schedule oluştur
function createScheduleFromSelection(sections: Section[], weights: ScoreWeights): Schedule {
    const sectionIds = sections.map(s => s.id);
    const allMeetings = sections.flatMap(s => s.meetings);
    const stats = calculateScheduleStats(allMeetings);
    const score = calculateScore(stats, weights);

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

        const dayStart = dm[0].startMinute;
        const dayEnd = dm[dm.length - 1].endMinute;

        earliestStart = Math.min(earliestStart, dayStart);
        latestEnd = Math.max(latestEnd, dayEnd);

        totalSpread += dayEnd - dayStart;

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

// Skor hesapla - dinamik ağırlıklarla
function calculateScore(stats: ScheduleStats, weights: ScoreWeights): number {
    // Ağırlıkları 0-100 aralığından gerçek çarpanlara dönüştür
    const normalizedWeights = {
        freeDays: (weights.freeDays / 100) * 150,      // max 150 puan/gün
        lateStart: (weights.lateStart / 100) * 3,      // max 3 puan/dakika
        gaps: (weights.gaps / 100) * -1,               // max -1 puan/dakika
        spread: (weights.spread / 100) * -0.5,         // max -0.5 puan/dakika
    };

    let score = 0;

    // Boş günler
    score += stats.freeDays * normalizedWeights.freeDays;

    // Geç başlangıç bonusu (8:00'dan sonra her dakika için)
    const baseStart = 8 * 60;
    if (stats.earliestStart > baseStart) {
        score += (stats.earliestStart - baseStart) * normalizedWeights.lateStart;
    }

    // Boşluk cezası
    score += stats.totalGaps * normalizedWeights.gaps;

    // Spread cezası
    score += stats.totalSpread * normalizedWeights.spread;

    return Math.round(score);
}

// Son filtreler
function schedulePassesPostFilters(
    schedule: Schedule,
    filters: UserFilters
): boolean {
    if (schedule.stats.freeDays < filters.minFreeDays) {
        return false;
    }

    if (filters.maxGap !== null && schedule.stats.totalGaps > filters.maxGap) {
        return false;
    }

    return true;
}

// Mevcut programları yeniden skorla (ağırlıklar değiştiğinde)
export function rescoreSchedules(
    schedules: Schedule[],
    weights: ScoreWeights
): Schedule[] {
    return schedules.map(schedule => ({
        ...schedule,
        score: calculateScore(schedule.stats, weights),
    })).sort((a, b) => b.score - a.score);
}
