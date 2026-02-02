import { useState } from 'react';
import { useStore } from '../store';
import { Button, Input, Select } from './ui';
import { DayOfWeek, DAY_NAMES, MeetingType } from '../types';
import { minutesToTime, timeToMinutes } from '../lib/utils';

export function CourseList() {
    const activeTermId = useStore((state) => state.activeTermId);
    const terms = useStore((state) => state.terms);
    const selectedCourseId = useStore((state) => state.selectedCourseId);
    const setSelectedCourse = useStore((state) => state.setSelectedCourse);
    const addCourse = useStore((state) => state.addCourse);
    const removeCourse = useStore((state) => state.removeCourse);
    const addSection = useStore((state) => state.addSection);
    const addMeeting = useStore((state) => state.addMeeting);

    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState<string | null>(null);
    const [isAddingMeeting, setIsAddingMeeting] = useState<string | null>(null);

    // Form states
    const [courseForm, setCourseForm] = useState({
        code: '',
        name: '',
        credits: 3,
        required: true,
    });

    const [sectionForm, setSectionForm] = useState({
        name: '',
        instructor: '',
    });

    const [meetingForm, setMeetingForm] = useState({
        day: 'Mon' as DayOfWeek,
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        type: 'Lecture' as MeetingType,
    });

    const activeTerm = terms.find((t) => t.id === activeTermId);
    const courses = activeTerm?.courses || [];

    const handleAddCourse = () => {
        if (courseForm.code.trim() && courseForm.name.trim() && activeTermId) {
            addCourse({
                termId: activeTermId,
                code: courseForm.code.trim(),
                name: courseForm.name.trim(),
                credits: courseForm.credits,
                required: courseForm.required,
            });
            setCourseForm({ code: '', name: '', credits: 3, required: true });
            setIsAddingCourse(false);
        }
    };

    const handleAddSection = (courseId: string) => {
        if (sectionForm.name.trim()) {
            addSection(courseId, {
                courseId,
                name: sectionForm.name.trim(),
                instructor: sectionForm.instructor.trim() || undefined,
            });
            setSectionForm({ name: '', instructor: '' });
            setIsAddingSection(null);
        }
    };

    const handleAddMeeting = (sectionId: string) => {
        addMeeting(sectionId, {
            day: meetingForm.day,
            startMinute: timeToMinutes(meetingForm.startTime),
            endMinute: timeToMinutes(meetingForm.endTime),
            location: meetingForm.location.trim() || undefined,
            type: meetingForm.type,
        });
        setMeetingForm({
            day: 'Mon',
            startTime: '09:00',
            endTime: '10:00',
            location: '',
            type: 'Lecture',
        });
        setIsAddingMeeting(null);
    };

    if (!activeTermId) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-text-secondary text-center">
                    Lütfen sol panelden bir dönem seçin<br />
                    veya yeni bir dönem oluşturun.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                        Dersler
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                        {activeTerm?.name}
                    </p>
                </div>
                {!isAddingCourse && (
                    <Button size="sm" onClick={() => setIsAddingCourse(true)}>
                        + Ders Ekle
                    </Button>
                )}
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto p-2">
                {/* Add Course Form */}
                {isAddingCourse && (
                    <div className="mb-4 p-3 bg-bg-secondary rounded-lg border border-border">
                        <h3 className="text-sm font-medium mb-3">Yeni Ders</h3>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Ders Kodu"
                                    value={courseForm.code}
                                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                                    autoFocus
                                />
                                <Input
                                    placeholder="Kredi"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={courseForm.credits}
                                    onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 3 })}
                                />
                            </div>
                            <Input
                                placeholder="Ders Adı"
                                value={courseForm.name}
                                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                            />
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={courseForm.required}
                                        onChange={() => setCourseForm({ ...courseForm, required: true })}
                                        className="accent-accent"
                                    />
                                    Zorunlu
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!courseForm.required}
                                        onChange={() => setCourseForm({ ...courseForm, required: false })}
                                        className="accent-accent"
                                    />
                                    Seçmeli
                                </label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button size="sm" onClick={handleAddCourse}>Ekle</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsAddingCourse(false)}>İptal</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Courses */}
                {courses.length === 0 && !isAddingCourse ? (
                    <p className="text-sm text-text-secondary text-center py-8">
                        Bu dönemde henüz ders yok.<br />
                        Ders eklemek için yukarıdaki butonu kullanın.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className={`rounded-lg border transition-colors ${selectedCourseId === course.id
                                    ? 'border-accent bg-blue-50'
                                    : 'border-border bg-white hover:border-gray-300'
                                    }`}
                            >
                                {/* Course Header */}
                                <button
                                    onClick={() => setSelectedCourse(selectedCourseId === course.id ? null : course.id)}
                                    className="w-full p-3 text-left"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                                style={{ backgroundColor: course.color }}
                                            />
                                            <div>
                                                <span className="font-medium text-sm">{course.code}</span>
                                                <span className="text-text-secondary text-sm ml-2">{course.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-secondary">
                                                {course.credits} kredi
                                            </span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${course.required
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {course.required ? 'Zorunlu' : 'Seçmeli'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">
                                        {course.sections.length} şube
                                    </p>
                                </button>

                                {/* Expanded Content */}
                                {selectedCourseId === course.id && (
                                    <div className="px-3 pb-3 border-t border-border">
                                        {/* Sections */}
                                        <div className="mt-3 space-y-2">
                                            {course.sections.map((section) => (
                                                <div key={section.id} className="bg-bg-secondary rounded p-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">{section.name}</span>
                                                        {section.instructor && (
                                                            <span className="text-xs text-text-secondary">{section.instructor}</span>
                                                        )}
                                                    </div>
                                                    {/* Meetings */}
                                                    <div className="mt-2 space-y-1">
                                                        {section.meetings.map((meeting) => (
                                                            <div key={meeting.id} className="text-xs text-text-secondary flex items-center gap-2">
                                                                <span className="w-16">{DAY_NAMES[meeting.day].slice(0, 3)}</span>
                                                                <span>{minutesToTime(meeting.startMinute)} - {minutesToTime(meeting.endMinute)}</span>
                                                                {meeting.location && <span className="text-gray-400">({meeting.location})</span>}
                                                                <span className="text-gray-400">{meeting.type}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Add Meeting */}
                                                    {isAddingMeeting === section.id ? (
                                                        <div className="mt-2 p-2 bg-white rounded border border-border">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Select
                                                                    options={Object.entries(DAY_NAMES).map(([value, label]) => ({ value, label }))}
                                                                    value={meetingForm.day}
                                                                    onChange={(e) => setMeetingForm({ ...meetingForm, day: e.target.value as DayOfWeek })}
                                                                />
                                                                <Select
                                                                    options={[
                                                                        { value: 'Lecture', label: 'Teori' },
                                                                        { value: 'Lab', label: 'Lab' },
                                                                        { value: 'Recitation', label: 'Uygulama' },
                                                                    ]}
                                                                    value={meetingForm.type}
                                                                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value as MeetingType })}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <Input
                                                                    type="time"
                                                                    value={meetingForm.startTime}
                                                                    onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                                                                />
                                                                <Input
                                                                    type="time"
                                                                    value={meetingForm.endTime}
                                                                    onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                                                                />
                                                            </div>
                                                            <Input
                                                                placeholder="Derslik (opsiyonel)"
                                                                value={meetingForm.location}
                                                                onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                                                                className="mt-2"
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <Button size="sm" onClick={() => handleAddMeeting(section.id)}>Ekle</Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setIsAddingMeeting(null)}>İptal</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setIsAddingMeeting(section.id)}
                                                            className="mt-2 text-xs text-accent hover:underline"
                                                        >
                                                            + Saat Ekle
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Section */}
                                            {isAddingSection === course.id ? (
                                                <div className="p-2 bg-bg-secondary rounded border border-border">
                                                    <Input
                                                        placeholder="Şube Adı (örn: 1. Şube)"
                                                        value={sectionForm.name}
                                                        onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                                        autoFocus
                                                    />
                                                    <Input
                                                        placeholder="Öğretim Görevlisi (opsiyonel)"
                                                        value={sectionForm.instructor}
                                                        onChange={(e) => setSectionForm({ ...sectionForm, instructor: e.target.value })}
                                                        className="mt-2"
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" onClick={() => handleAddSection(course.id)}>Ekle</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setIsAddingSection(null)}>İptal</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsAddingSection(course.id)}
                                                    className="text-sm text-accent hover:underline mt-2"
                                                >
                                                    + Şube Ekle
                                                </button>
                                            )}
                                        </div>

                                        {/* Delete Course */}
                                        <div className="mt-3 pt-3 border-t border-border">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => {
                                                    if (confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
                                                        removeCourse(course.id);
                                                    }
                                                }}
                                            >
                                                Dersi Sil
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
