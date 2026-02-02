import { Term, Schedule, Course, Section, DayOfWeek } from '../types';

// JSON Export - tüm veriyi dışa aktar
export function exportToJSON(terms: Term[]): string {
    const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        terms: terms,
    };
    return JSON.stringify(exportData, null, 2);
}

// JSON Import - dışarıdan veri al
export function importFromJSON(jsonString: string): Term[] {
    try {
        const data = JSON.parse(jsonString);

        // Versiyon kontrolü
        if (!data.version || !data.terms) {
            throw new Error('Geçersiz dosya formatı');
        }

        // Temel validasyon
        if (!Array.isArray(data.terms)) {
            throw new Error('Dönem verisi bulunamadı');
        }

        return data.terms as Term[];
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Geçersiz JSON formatı');
        }
        throw error;
    }
}

// ICS (iCalendar) Export - seçili program için takvim dosyası
export function exportToICS(
    schedule: Schedule,
    courses: Course[],
    termName: string,
    startDate: Date = getNextMonday()
): string {
    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//UniversiteDersSecim//TR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${termName}`,
    ];

    // Section'ları bul
    const sections: Section[] = [];
    for (const course of courses) {
        for (const section of course.sections) {
            if (schedule.sectionIds.includes(section.id)) {
                sections.push(section);
            }
        }
    }

    // Her meeting için event oluştur
    let eventId = 0;
    for (const section of sections) {
        const course = courses.find(c => c.sections.some(s => s.id === section.id));
        if (!course) continue;

        for (const meeting of section.meetings) {
            eventId++;
            const dayOffset = getDayOffset(meeting.day);
            const eventDate = new Date(startDate);
            eventDate.setDate(eventDate.getDate() + dayOffset);

            const startTime = minutesToHHMM(meeting.startMinute);
            const endTime = minutesToHHMM(meeting.endMinute);

            const dtStart = formatICSDate(eventDate, startTime);
            const dtEnd = formatICSDate(eventDate, endTime);

            lines.push('BEGIN:VEVENT');
            lines.push(`UID:${eventId}-${schedule.id}@universite-ders-secim`);
            lines.push(`DTSTAMP:${formatICSDateNow()}`);
            lines.push(`DTSTART:${dtStart}`);
            lines.push(`DTEND:${dtEnd}`);
            lines.push(`SUMMARY:${course.name} - ${section.name}`);
            lines.push(`DESCRIPTION:Şube: ${section.name}\\nHoca: ${section.instructor || 'Belirtilmemiş'}`);
            lines.push(`LOCATION:${meeting.location || ''}`);
            // Haftalık tekrar (16 hafta)
            lines.push('RRULE:FREQ=WEEKLY;COUNT=16');
            lines.push('END:VEVENT');
        }
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

// Dosya indirme helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Dosya okuma helper
export function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsText(file);
    });
}

// Yardımcı fonksiyonlar
function getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
}

function getDayOffset(day: DayOfWeek): number {
    const offsets: Record<DayOfWeek, number> = {
        Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6
    };
    return offsets[day];
}

function minutesToHHMM(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
}

function formatICSDate(date: Date, time: string): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}T${time}00`;
}

function formatICSDateNow(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const secs = now.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}T${hours}${mins}${secs}Z`;
}
