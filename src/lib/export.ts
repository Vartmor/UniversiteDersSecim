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

// Blob indirme helper
export function downloadBlobFile(blob: Blob, filename: string): void {
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

// PNG Export - haftalık tabloyu canvas'a çiz ve PNG olarak indir
export async function exportToPNG(
    schedule: Schedule,
    courses: Course[],
    termName: string
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Canvas boyutları
    const width = 900;
    const height = 600;
    const headerHeight = 60;
    const timeColumnWidth = 60;
    const dayColumnWidth = (width - timeColumnWidth) / 5;
    const rowHeight = 30;

    canvas.width = width;
    canvas.height = height;

    // Arka plan
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Başlık
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(termName + ' - Haftalık Program', width / 2, 30);

    // Gün başlıkları
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#333333';

    days.forEach((day, i) => {
        const x = timeColumnWidth + (i * dayColumnWidth) + dayColumnWidth / 2;
        ctx.fillText(day, x, headerHeight - 10);
    });

    // Saat satırları (09:00 - 18:00)
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#666666';

    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour <= endHour; hour++) {
        const y = headerHeight + ((hour - startHour) * rowHeight * 2);
        ctx.fillText(`${hour.toString().padStart(2, '0')}:00`, timeColumnWidth - 5, y + 4);

        // Yatay çizgi
        ctx.strokeStyle = '#E5E5E5';
        ctx.beginPath();
        ctx.moveTo(timeColumnWidth, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Dikey çizgiler (günler arası)
    for (let i = 0; i <= 5; i++) {
        const x = timeColumnWidth + (i * dayColumnWidth);
        ctx.strokeStyle = '#E5E5E5';
        ctx.beginPath();
        ctx.moveTo(x, headerHeight);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Section'ları bul ve çiz
    const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };

    for (const course of courses) {
        for (const section of course.sections) {
            if (!schedule.sectionIds.includes(section.id)) continue;

            for (const meeting of section.meetings) {
                const dayIndex = dayMap[meeting.day];
                if (dayIndex === undefined) continue;

                const startHourOffset = (meeting.startMinute / 60) - startHour;
                const duration = (meeting.endMinute - meeting.startMinute) / 60;

                const x = timeColumnWidth + (dayIndex * dayColumnWidth) + 2;
                const y = headerHeight + (startHourOffset * rowHeight * 2);
                const blockWidth = dayColumnWidth - 4;
                const blockHeight = duration * rowHeight * 2 - 2;

                // Blok arka planı
                ctx.fillStyle = course.color || '#DBEAFE';
                ctx.fillRect(x, y, blockWidth, blockHeight);

                // Blok border
                ctx.strokeStyle = '#2563EB';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, blockWidth, blockHeight);

                // Ders adı
                ctx.fillStyle = '#1A1A1A';
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'left';
                const courseName = course.name.length > 15 ? course.name.substring(0, 15) + '...' : course.name;
                ctx.fillText(courseName, x + 3, y + 12);

                // Şube adı
                ctx.font = '8px Inter, sans-serif';
                ctx.fillText(section.name, x + 3, y + 22);
            }
        }
    }

    // Canvas'ı blob'a çevir
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob!);
        }, 'image/png');
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
