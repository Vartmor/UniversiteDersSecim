import { useStore } from '../store';
import { DayOfWeek, DAY_SHORT_NAMES, Meeting, Course, Section, TIME_SLOTS, formatMinutesToTime } from '../types';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOT_HEIGHT = 52; // pixels per time slot

export function WeeklySchedule() {
    const terms = useStore((state) => state.terms);
    const activeTermId = useStore((state) => state.activeTermId);
    const selectedCourseId = useStore((state) => state.selectedCourseId);
    const schedules = useStore((state) => state.schedules);
    const selectedScheduleId = useStore((state) => state.selectedScheduleId);

    const activeTerm = terms.find((t) => t.id === activeTermId);
    const courses = activeTerm?.courses || [];
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

    // Build a map of all meetings with course and section info
    const getMeetingsForDisplay = (): { meeting: Meeting; course: Course; section: Section }[] => {
        const meetings: { meeting: Meeting; course: Course; section: Section }[] = [];

        // If a course is selected, show only that course's sections
        if (selectedCourse) {
            for (const section of selectedCourse.sections) {
                for (const meeting of section.meetings) {
                    meetings.push({ meeting, course: selectedCourse, section });
                }
            }
        } else if (selectedSchedule) {
            // Show selected schedule
            for (const course of courses) {
                for (const section of course.sections) {
                    if (selectedSchedule.sectionIds.includes(section.id)) {
                        for (const meeting of section.meetings) {
                            meetings.push({ meeting, course, section });
                        }
                    }
                }
            }
        } else {
            // Show all courses
            for (const course of courses) {
                for (const section of course.sections) {
                    for (const meeting of section.meetings) {
                        meetings.push({ meeting, course, section });
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

    // Find which slots a meeting spans
    const getMeetingSlots = (meeting: Meeting): { startSlot: number; slotCount: number } => {
        let startSlot = -1;
        let endSlot = -1;

        for (let i = 0; i < TIME_SLOTS.length; i++) {
            const slot = TIME_SLOTS[i];
            // Meeting starts in this slot
            if (meeting.startMinute >= slot.startMinute && meeting.startMinute < slot.endMinute) {
                startSlot = i;
            }
            // Meeting ends in this slot or after
            if (meeting.endMinute <= slot.endMinute && meeting.endMinute > slot.startMinute) {
                endSlot = i;
            }
        }

        // If meeting spans exactly slot boundaries
        if (startSlot === -1) {
            for (let i = 0; i < TIME_SLOTS.length; i++) {
                if (meeting.startMinute <= TIME_SLOTS[i].startMinute) {
                    startSlot = i;
                    break;
                }
            }
        }
        if (endSlot === -1) {
            endSlot = startSlot;
        }

        return {
            startSlot: Math.max(0, startSlot),
            slotCount: Math.max(1, endSlot - startSlot + 1)
        };
    };

    // Calculate position and height for a meeting block
    const getMeetingStyle = (meeting: Meeting) => {
        const { startSlot, slotCount } = getMeetingSlots(meeting);
        const top = startSlot * SLOT_HEIGHT;
        const height = slotCount * SLOT_HEIGHT - 2;
        return { top: `${top}px`, height: `${height}px` };
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    {selectedCourse ? `${selectedCourse.code} - Haftalık Program` : 'Haftalık Program'}
                </h2>
                {selectedCourse ? (
                    <p className="text-xs text-text-secondary mt-0.5">
                        {selectedCourse.name} • {selectedCourse.sections.length} şube
                    </p>
                ) : selectedSchedule ? (
                    <p className="text-xs text-text-secondary mt-0.5">
                        Seçili kombinasyon: Skor {selectedSchedule.score}
                    </p>
                ) : null}
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
                ) : !selectedCourse && !selectedSchedule ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-text-secondary">
                                Haftalık programı görüntülemek için<br />
                                <span className="font-medium text-accent">sol panelden bir ders seçin</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex min-w-[650px]">
                        {/* Time Column */}
                        <div className="w-20 flex-shrink-0">
                            <div className="h-8"></div> {/* Header spacer */}
                            <div className="relative">
                                {TIME_SLOTS.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="text-xs text-text-secondary pr-2 flex flex-col justify-center"
                                        style={{ height: `${SLOT_HEIGHT}px` }}
                                    >
                                        <div className="font-medium">
                                            {formatMinutesToTime(slot.startMinute)}
                                        </div>
                                        <div className="text-gray-400">
                                            {formatMinutesToTime(slot.endMinute)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days Columns */}
                        <div className="flex-1 flex">
                            {DAYS.map((day) => (
                                <div key={day} className="flex-1 min-w-[100px]">
                                    {/* Day Header */}
                                    <div className="h-8 flex items-center justify-center border-b border-border bg-bg-secondary rounded-t">
                                        <span className="text-sm font-medium text-text-primary">
                                            {DAY_SHORT_NAMES[day]}
                                        </span>
                                    </div>

                                    {/* Day Column */}
                                    <div
                                        className="relative border-l border-border"
                                        style={{ height: `${TIME_SLOTS.length * SLOT_HEIGHT}px` }}
                                    >
                                        {/* Slot lines */}
                                        {TIME_SLOTS.map((slot, i) => (
                                            <div
                                                key={slot.id}
                                                className="absolute w-full border-t border-gray-100"
                                                style={{ top: `${i * SLOT_HEIGHT}px` }}
                                            />
                                        ))}

                                        {/* Meeting blocks */}
                                        {getMeetingsForDay(day).map(({ meeting, course, section }) => (
                                            <div
                                                key={meeting.id}
                                                className="absolute left-0.5 right-0.5 rounded px-1.5 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                                style={{
                                                    ...getMeetingStyle(meeting),
                                                    backgroundColor: course.color,
                                                    borderLeft: `3px solid ${course.color === '#F3F4F6' ? '#9CA3AF' : course.color}`,
                                                }}
                                                title={`${course.code} - ${section.name}\n${formatMinutesToTime(meeting.startMinute)} - ${formatMinutesToTime(meeting.endMinute)}`}
                                            >
                                                <div className="text-xs font-semibold text-text-primary truncate">
                                                    {selectedCourse ? section.name : course.code}
                                                </div>
                                                <div className="text-[10px] text-text-secondary truncate">
                                                    {selectedCourse ? `${formatMinutesToTime(meeting.startMinute)}-${formatMinutesToTime(meeting.endMinute)}` : section.name}
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
        </div >
    );
}
