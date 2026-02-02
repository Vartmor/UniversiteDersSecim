import { useState } from 'react';
import { useStore } from '../store';
import { DayOfWeek, DAY_SHORT_NAMES, Meeting, Course, Section, TIME_SLOTS, formatMinutesToTime, MeetingType } from '../types';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOT_HEIGHT = 52; // pixels per time slot

interface SelectedMeetingInfo {
    meeting: Meeting;
    course: Course;
    section: Section;
    position: { x: number; y: number };
}

interface QuickAddInfo {
    day: DayOfWeek;
    slotIndex: number;
    position: { x: number; y: number };
}

export function WeeklySchedule() {
    const [selectedMeeting, setSelectedMeeting] = useState<SelectedMeetingInfo | null>(null);
    const [quickAddInfo, setQuickAddInfo] = useState<QuickAddInfo | null>(null);
    const [hiddenDays, setHiddenDays] = useState<Set<DayOfWeek>>(new Set());
    const [draggedMeeting, setDraggedMeeting] = useState<{ meeting: Meeting; section: Section } | null>(null);

    const terms = useStore((state) => state.terms);
    const activeTermId = useStore((state) => state.activeTermId);
    const selectedCourseId = useStore((state) => state.selectedCourseId);
    const schedules = useStore((state) => state.schedules);
    const selectedScheduleId = useStore((state) => state.selectedScheduleId);
    const removeMeeting = useStore((state) => state.removeMeeting);
    const setSelectedCourse = useStore((state) => state.setSelectedCourse);
    const addMeeting = useStore((state) => state.addMeeting);
    const updateMeeting = useStore((state) => state.updateMeeting);

    const activeTerm = terms.find((t) => t.id === activeTermId);
    const courses = activeTerm?.courses || [];
    const selectedCourseFromStore = courses.find((c) => c.id === selectedCourseId);

    const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

    // Build a map of all meetings with course and section info
    const getMeetingsForDisplay = (): { meeting: Meeting; course: Course; section: Section }[] => {
        const meetings: { meeting: Meeting; course: Course; section: Section }[] = [];

        // If a course is selected, show only that course's sections
        if (selectedCourseFromStore) {
            for (const section of selectedCourseFromStore.sections) {
                for (const meeting of section.meetings) {
                    meetings.push({ meeting, course: selectedCourseFromStore, section });
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

    // Check if two meetings overlap
    const doMeetingsOverlap = (m1: Meeting, m2: Meeting): boolean => {
        if (m1.day !== m2.day) return false;
        return m1.startMinute < m2.endMinute && m2.startMinute < m1.endMinute;
    };

    // Find all overlapping meeting IDs
    const getOverlappingMeetingIds = (): Set<string> => {
        const overlappingIds = new Set<string>();

        for (let i = 0; i < allMeetings.length; i++) {
            for (let j = i + 1; j < allMeetings.length; j++) {
                const m1 = allMeetings[i];
                const m2 = allMeetings[j];
                if (doMeetingsOverlap(m1.meeting, m2.meeting)) {
                    overlappingIds.add(m1.meeting.id);
                    overlappingIds.add(m2.meeting.id);
                }
            }
        }

        return overlappingIds;
    };

    const overlappingMeetingIds = getOverlappingMeetingIds();

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

    // Calculate total weekly minutes
    const totalWeeklyMinutes = allMeetings.reduce((total, { meeting }) => {
        return total + (meeting.endMinute - meeting.startMinute);
    }, 0);
    const totalHours = Math.floor(totalWeeklyMinutes / 60);
    const totalMins = totalWeeklyMinutes % 60;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                            {selectedCourseFromStore ? `${selectedCourseFromStore.code} - Haftalık Program` : 'Haftalık Program'}
                        </h2>
                        {selectedCourseFromStore ? (
                            <p className="text-xs text-text-secondary mt-0.5">
                                {selectedCourseFromStore.name} • {selectedCourseFromStore.sections.length} şube
                            </p>
                        ) : selectedSchedule ? (
                            <p className="text-xs text-text-secondary mt-0.5">
                                Seçili kombinasyon: Skor {selectedSchedule.score}
                            </p>
                        ) : null}
                    </div>
                    {allMeetings.length > 0 && (
                        <div className="bg-accent/10 px-3 py-1.5 rounded-full">
                            <span className="text-sm font-semibold text-accent">
                                {totalHours > 0 ? `${totalHours} saat` : ''}{totalMins > 0 ? ` ${totalMins} dk` : totalHours > 0 ? '' : '0 saat'}
                            </span>
                            <span className="text-xs text-text-secondary ml-1">toplam</span>
                        </div>
                    )}
                </div>

                {/* Day Filter Toggles */}
                <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-text-secondary mr-2">Günler:</span>
                    {DAYS.map(day => {
                        const isHidden = hiddenDays.has(day);
                        return (
                            <button
                                key={day}
                                onClick={() => {
                                    const newHiddenDays = new Set(hiddenDays);
                                    if (isHidden) {
                                        newHiddenDays.delete(day);
                                    } else {
                                        newHiddenDays.add(day);
                                    }
                                    setHiddenDays(newHiddenDays);
                                }}
                                className={`px-2 py-0.5 text-xs rounded transition-colors ${isHidden
                                    ? 'bg-gray-100 text-gray-400 line-through'
                                    : 'bg-accent/10 text-accent font-medium'
                                    }`}
                            >
                                {DAY_SHORT_NAMES[day]}
                            </button>
                        );
                    })}
                </div>
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
                ) : !selectedCourseFromStore && !selectedSchedule ? (
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
                            {DAYS.filter(day => !hiddenDays.has(day)).map((day) => (
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
                                        {/* Clickable slot overlays for quick add */}
                                        {selectedCourseFromStore && TIME_SLOTS.map((slot, i) => (
                                            <div
                                                key={`clickable-${slot.id}`}
                                                className={`absolute w-full cursor-pointer hover:bg-accent/10 transition-colors group ${draggedMeeting ? 'hover:bg-green-100' : ''}`}
                                                style={{
                                                    top: `${i * SLOT_HEIGHT}px`,
                                                    height: `${SLOT_HEIGHT}px`
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setQuickAddInfo({
                                                        day,
                                                        slotIndex: i,
                                                        position: { x: rect.left + rect.width / 2, y: rect.top }
                                                    });
                                                }}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.add('bg-green-100');
                                                }}
                                                onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('bg-green-100');
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('bg-green-100');
                                                    if (draggedMeeting) {
                                                        const duration = draggedMeeting.meeting.endMinute - draggedMeeting.meeting.startMinute;
                                                        updateMeeting(draggedMeeting.section.id, draggedMeeting.meeting.id, {
                                                            day: day,
                                                            startMinute: slot.startMinute,
                                                            endMinute: slot.startMinute + duration
                                                        });
                                                        setDraggedMeeting(null);
                                                    }
                                                }}
                                            >
                                                <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs text-accent font-medium bg-white/80 px-2 py-0.5 rounded shadow-sm">
                                                        {draggedMeeting ? '📍 Bırak' : '+ Ekle'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Slot lines */}
                                        {TIME_SLOTS.map((slot, i) => (
                                            <div
                                                key={slot.id}
                                                className="absolute w-full border-t border-gray-100 pointer-events-none"
                                                style={{ top: `${i * SLOT_HEIGHT}px` }}
                                            />
                                        ))}

                                        {/* Meeting blocks */}
                                        {getMeetingsForDay(day).map(({ meeting, course, section }) => {
                                            const isOverlapping = overlappingMeetingIds.has(meeting.id);
                                            return (
                                                <div
                                                    key={meeting.id}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        setDraggedMeeting({ meeting, section });
                                                        e.dataTransfer.effectAllowed = 'move';
                                                    }}
                                                    onDragEnd={() => {
                                                        setDraggedMeeting(null);
                                                    }}
                                                    className={`absolute left-0.5 right-0.5 rounded px-1.5 py-1 overflow-hidden cursor-grab active:cursor-grabbing hover:opacity-90 hover:ring-2 hover:ring-accent transition-all shadow-sm ${isOverlapping ? 'ring-2 ring-red-500' : ''} ${draggedMeeting?.meeting.id === meeting.id ? 'opacity-50' : ''}`}
                                                    style={{
                                                        ...getMeetingStyle(meeting),
                                                        backgroundColor: isOverlapping ? '#FEE2E2' : course.color,
                                                        borderLeft: `3px solid ${isOverlapping ? '#EF4444' : (course.color === '#F3F4F6' ? '#9CA3AF' : course.color)}`,
                                                    }}
                                                    title={isOverlapping ? '⚠️ Bu saat başka bir ders ile çakışıyor!' : 'Sürükleyerek taşı'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setSelectedMeeting({
                                                            meeting,
                                                            course,
                                                            section,
                                                            position: { x: rect.right + 10, y: rect.top }
                                                        });
                                                    }}
                                                >
                                                    {isOverlapping && (
                                                        <div className="absolute top-0.5 right-0.5 text-red-500 animate-pulse" title="Çakışma var!">
                                                            ⚠️
                                                        </div>
                                                    )}
                                                    <div className="text-xs font-semibold text-text-primary truncate">
                                                        {selectedCourseFromStore ? section.name : course.code}
                                                    </div>
                                                    <div className="text-[10px] text-text-secondary truncate">
                                                        {selectedCourseFromStore ? `${formatMinutesToTime(meeting.startMinute)}-${formatMinutesToTime(meeting.endMinute)}` : section.name}
                                                    </div>
                                                    {meeting.location && (
                                                        <div className="text-[10px] text-text-secondary truncate">
                                                            {meeting.location}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Meeting Detail Popup */}
            {selectedMeeting && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={() => setSelectedMeeting(null)}
                >
                    <div
                        className="absolute bg-white rounded-lg shadow-xl border border-border p-4 min-w-[280px] max-w-[320px]"
                        style={{
                            left: Math.min(selectedMeeting.position.x, window.innerWidth - 340),
                            top: Math.min(selectedMeeting.position.y, window.innerHeight - 300),
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-text-primary">{selectedMeeting.course.code}</h3>
                                <p className="text-sm text-text-secondary">{selectedMeeting.course.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMeeting(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-text-secondary">Şube:</span>
                                <span className="font-medium">{selectedMeeting.section.name}</span>
                            </div>
                            {selectedMeeting.section.instructor && (
                                <div className="flex items-center gap-2">
                                    <span className="text-text-secondary">Öğretim Görevlisi:</span>
                                    <span className="font-medium">{selectedMeeting.section.instructor}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-text-secondary">Saat:</span>
                                <span className="font-medium">
                                    {formatMinutesToTime(selectedMeeting.meeting.startMinute)} - {formatMinutesToTime(selectedMeeting.meeting.endMinute)}
                                </span>
                            </div>
                            {selectedMeeting.meeting.location && (
                                <div className="flex items-center gap-2">
                                    <span className="text-text-secondary">Derslik:</span>
                                    <span className="font-medium">{selectedMeeting.meeting.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-text-secondary">Tür:</span>
                                <span className="font-medium">{selectedMeeting.meeting.type}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                            <button
                                onClick={() => {
                                    setSelectedCourse(selectedMeeting.course.id);
                                    setSelectedMeeting(null);
                                }}
                                className="flex-1 px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Dersi Seç
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Bu saati silmek istediğinizden emin misiniz?')) {
                                        removeMeeting(selectedMeeting.section.id, selectedMeeting.meeting.id);
                                        setSelectedMeeting(null);
                                    }
                                }}
                                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Popup */}
            {quickAddInfo && selectedCourseFromStore && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={() => setQuickAddInfo(null)}
                >
                    <div
                        className="absolute bg-white rounded-lg shadow-xl border border-border p-3 min-w-[200px]"
                        style={{
                            left: Math.min(quickAddInfo.position.x - 100, window.innerWidth - 220),
                            top: Math.min(quickAddInfo.position.y + 10, window.innerHeight - 200),
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-text-primary">Hızlı Ekle</h4>
                            <button
                                onClick={() => setQuickAddInfo(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-text-secondary mb-2">
                            {DAY_SHORT_NAMES[quickAddInfo.day]} {formatMinutesToTime(TIME_SLOTS[quickAddInfo.slotIndex].startMinute)}
                        </p>
                        <div className="text-xs text-text-secondary mb-2">Şube seçin:</div>
                        <div className="space-y-1 max-h-[150px] overflow-y-auto">
                            {selectedCourseFromStore.sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        const slot = TIME_SLOTS[quickAddInfo.slotIndex];
                                        addMeeting(section.id, {
                                            day: quickAddInfo.day,
                                            startMinute: slot.startMinute,
                                            endMinute: slot.endMinute,
                                            type: 'Ders' as MeetingType,
                                        });
                                        setQuickAddInfo(null);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent/10 transition-colors"
                                >
                                    {section.name}
                                    {section.instructor && (
                                        <span className="text-xs text-text-secondary ml-1">({section.instructor})</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
