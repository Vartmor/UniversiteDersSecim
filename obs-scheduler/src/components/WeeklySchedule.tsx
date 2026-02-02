import { useStore } from '../store';
import { DayOfWeek, DAY_SHORT_NAMES, Meeting, Course } from '../types';
import { minutesToTime } from '../lib/utils';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 48; // pixels per hour

export function WeeklySchedule() {
    const terms = useStore((state) => state.terms);
    const activeTermId = useStore((state) => state.activeTermId);
    const schedules = useStore((state) => state.schedules);
    const selectedScheduleId = useStore((state) => state.selectedScheduleId);

    const activeTerm = terms.find((t) => t.id === activeTermId);
    const courses = activeTerm?.courses || [];

    // Get selected schedule's sections or show all sections if no schedule selected
    const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

    // Build a map of all meetings with course info
    const getMeetingsForDisplay = (): { meeting: Meeting; course: Course }[] => {
        const meetings: { meeting: Meeting; course: Course }[] = [];

        if (selectedSchedule) {
            // Show only selected schedule's sections
            for (const course of courses) {
                for (const section of course.sections) {
                    if (selectedSchedule.sectionIds.includes(section.id)) {
                        for (const meeting of section.meetings) {
                            meetings.push({ meeting, course });
                        }
                    }
                }
            }
        } else {
            // Show all meetings (preview mode)
            for (const course of courses) {
                for (const section of course.sections) {
                    for (const meeting of section.meetings) {
                        meetings.push({ meeting, course });
                    }
                }
            }
        }

        return meetings;
    };

    const allMeetings = getMeetingsForDisplay();

    // Get meetings for a specific day
    const getMeetingsForDay = (day: DayOfWeek) => {
        return allMeetings.filter((m) => m.meeting.day === day);
    };

    // Calculate position and height for a meeting block
    const getMeetingStyle = (meeting: Meeting) => {
        const startHour = meeting.startMinute / 60;
        const endHour = meeting.endMinute / 60;
        const top = (startHour - START_HOUR) * HOUR_HEIGHT;
        const height = (endHour - startHour) * HOUR_HEIGHT;
        return { top: `${top}px`, height: `${height}px` };
    };

    // Generate hour labels
    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Haftalık Program
                </h2>
                {selectedSchedule && (
                    <p className="text-xs text-text-secondary mt-0.5">
                        Seçili kombinasyon: Skor {selectedSchedule.score}
                    </p>
                )}
            </div>

            {/* Schedule Grid */}
            <div className="flex-1 overflow-auto p-4">
                {!activeTermId ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-text-secondary text-center">
                            Program görüntülemek için<br />bir dönem seçin.
                        </p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-text-secondary text-center">
                            Henüz ders eklenmedi.<br />
                            Sol panelden ders ekleyin.
                        </p>
                    </div>
                ) : (
                    <div className="flex min-w-[600px]">
                        {/* Time Column */}
                        <div className="w-16 flex-shrink-0">
                            <div className="h-8"></div> {/* Header spacer */}
                            <div className="relative">
                                {hours.map((hour) => (
                                    <div
                                        key={hour}
                                        className="text-xs text-text-secondary text-right pr-2"
                                        style={{ height: `${HOUR_HEIGHT}px` }}
                                    >
                                        {`${hour.toString().padStart(2, '0')}:00`}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days Columns */}
                        <div className="flex-1 flex">
                            {DAYS.map((day) => (
                                <div key={day} className="flex-1 min-w-[100px]">
                                    {/* Day Header */}
                                    <div className="h-8 flex items-center justify-center border-b border-border">
                                        <span className="text-sm font-medium text-text-primary">
                                            {DAY_SHORT_NAMES[day]}
                                        </span>
                                    </div>

                                    {/* Day Column */}
                                    <div
                                        className="relative border-l border-border"
                                        style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
                                    >
                                        {/* Hour lines */}
                                        {hours.map((hour) => (
                                            <div
                                                key={hour}
                                                className="absolute w-full border-t border-gray-100"
                                                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                                            />
                                        ))}

                                        {/* Meeting blocks */}
                                        {getMeetingsForDay(day).map(({ meeting, course }) => (
                                            <div
                                                key={meeting.id}
                                                className="absolute left-0.5 right-0.5 rounded-sm px-1 py-0.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                                style={{
                                                    ...getMeetingStyle(meeting),
                                                    backgroundColor: course.color,
                                                    borderLeft: `3px solid ${course.color === '#F3F4F6' ? '#9CA3AF' : course.color}`,
                                                }}
                                                title={`${course.code} - ${course.name}\n${minutesToTime(meeting.startMinute)} - ${minutesToTime(meeting.endMinute)}`}
                                            >
                                                <div className="text-xs font-medium text-text-primary truncate">
                                                    {course.code}
                                                </div>
                                                <div className="text-[10px] text-text-secondary truncate">
                                                    {minutesToTime(meeting.startMinute)}
                                                </div>
                                                {meeting.location && (
                                                    <div className="text-[10px] text-text-secondary truncate">
                                                        {meeting.location}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
