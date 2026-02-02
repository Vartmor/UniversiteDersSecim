import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Term, Course, Section, Schedule, UserFilters, ScoreWeights, DEFAULT_SCORE_WEIGHTS, COURSE_COLORS } from '../types';

// Uygulama durumu
interface AppState {
    terms: Term[];
    activeTermId: string | null;
    selectedCourseId: string | null;
    selectedScheduleId: string | null;
    schedules: Schedule[];
    filters: UserFilters;
    scoreWeights: ScoreWeights;
    isGenerating: boolean;
    _hasHydrated: boolean;

    setHasHydrated: (state: boolean) => void;
    addTerm: (name: string) => void;
    removeTerm: (id: string) => void;
    setActiveTerm: (id: string | null) => void;

    addCourse: (course: Omit<Course, 'id' | 'color' | 'sections'>) => void;
    updateCourse: (id: string, updates: Partial<Course>) => void;
    removeCourse: (id: string) => void;
    setSelectedCourse: (id: string | null) => void;

    addSection: (courseId: string, section: Omit<Section, 'id' | 'meetings'>) => void;
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    removeSection: (courseId: string, sectionId: string) => void;

    addMeeting: (sectionId: string, meeting: Omit<Section['meetings'][0], 'id' | 'sectionId'>) => void;
    removeMeeting: (sectionId: string, meetingId: string) => void;

    updateFilters: (filters: Partial<UserFilters>) => void;
    resetFilters: () => void;
    updateScoreWeights: (weights: Partial<ScoreWeights>) => void;
    resetScoreWeights: () => void;

    setSchedules: (schedules: Schedule[]) => void;
    togglePinSchedule: (id: string) => void;
    setSelectedSchedule: (id: string | null) => void;

    getActiveTerm: () => Term | undefined;
    getCourseById: (id: string) => Course | undefined;
    getSectionById: (id: string) => Section | undefined;
}

const generateId = () => crypto.randomUUID();

const defaultFilters: UserFilters = {
    earliestStart: null,
    latestEnd: null,
    freeDays: [],
    maxGap: null,
    lunchBreak: false,
    minFreeDays: 0,
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            terms: [],
            activeTermId: null,
            selectedCourseId: null,
            selectedScheduleId: null,
            schedules: [],
            filters: defaultFilters,
            scoreWeights: DEFAULT_SCORE_WEIGHTS,
            isGenerating: false,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            addTerm: (name) => {
                const newTerm: Term = {
                    id: generateId(),
                    name,
                    courses: [],
                };
                set((state) => ({
                    terms: [...state.terms, newTerm],
                    activeTermId: newTerm.id,
                }));
            },

            removeTerm: (id) => {
                set((state) => ({
                    terms: state.terms.filter((t) => t.id !== id),
                    activeTermId: state.activeTermId === id ? null : state.activeTermId,
                }));
            },

            setActiveTerm: (id) => {
                set({ activeTermId: id, selectedCourseId: null, schedules: [] });
            },

            addCourse: (courseData) => {
                const state = get();
                if (!state.activeTermId) return;

                const activeTerm = state.terms.find((t) => t.id === state.activeTermId);
                const colorIndex = activeTerm ? activeTerm.courses.length % COURSE_COLORS.length : 0;

                const newCourse: Course = {
                    ...courseData,
                    id: generateId(),
                    color: COURSE_COLORS[colorIndex],
                    sections: [],
                };

                set((state) => ({
                    terms: state.terms.map((term) =>
                        term.id === state.activeTermId
                            ? { ...term, courses: [...term.courses, newCourse] }
                            : term
                    ),
                }));
            },

            updateCourse: (id, updates) => {
                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.map((course) =>
                            course.id === id ? { ...course, ...updates } : course
                        ),
                    })),
                }));
            },

            removeCourse: (id) => {
                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.filter((c) => c.id !== id),
                    })),
                    selectedCourseId: state.selectedCourseId === id ? null : state.selectedCourseId,
                }));
            },

            setSelectedCourse: (id) => {
                set({ selectedCourseId: id });
            },

            addSection: (courseId, sectionData) => {
                const newSection: Section = {
                    ...sectionData,
                    id: generateId(),
                    courseId,
                    meetings: [],
                };

                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.map((course) =>
                            course.id === courseId
                                ? { ...course, sections: [...course.sections, newSection] }
                                : course
                        ),
                    })),
                }));
            },

            updateSection: (sectionId, updates) => {
                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.map((course) => ({
                            ...course,
                            sections: course.sections.map((section) =>
                                section.id === sectionId ? { ...section, ...updates } : section
                            ),
                        })),
                    })),
                }));
            },

            removeSection: (courseId, sectionId) => {
                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.map((course) =>
                            course.id === courseId
                                ? { ...course, sections: course.sections.filter((s) => s.id !== sectionId) }
                                : course
                        ),
                    })),
                }));
            },

            addMeeting: (sectionId, meetingData) => {
                const newMeeting = {
                    ...meetingData,
                    id: generateId(),
                    sectionId,
                };

                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.map((course) => ({
                            ...course,
                            sections: course.sections.map((section) =>
                                section.id === sectionId
                                    ? { ...section, meetings: [...section.meetings, newMeeting] }
                                    : section
                            ),
                        })),
                    })),
                }));
            },

            removeMeeting: (sectionId, meetingId) => {
                set((state) => ({
                    terms: state.terms.map((term) => ({
                        ...term,
                        courses: term.courses.map((course) => ({
                            ...course,
                            sections: course.sections.map((section) =>
                                section.id === sectionId
                                    ? { ...section, meetings: section.meetings.filter((m) => m.id !== meetingId) }
                                    : section
                            ),
                        })),
                    })),
                }));
            },

            updateFilters: (filterUpdates) => {
                set((state) => ({
                    filters: { ...state.filters, ...filterUpdates },
                }));
            },

            resetFilters: () => {
                set({ filters: defaultFilters });
            },

            updateScoreWeights: (weightUpdates) => {
                set((state) => ({
                    scoreWeights: { ...state.scoreWeights, ...weightUpdates },
                }));
            },

            resetScoreWeights: () => {
                set({ scoreWeights: DEFAULT_SCORE_WEIGHTS });
            },

            setSchedules: (schedules) => {
                set({ schedules, selectedScheduleId: schedules.length > 0 ? schedules[0].id : null });
            },

            togglePinSchedule: (id) => {
                set((state) => ({
                    schedules: state.schedules.map((s) =>
                        s.id === id ? { ...s, pinned: !s.pinned } : s
                    ),
                }));
            },

            setSelectedSchedule: (id) => {
                set({ selectedScheduleId: id });
            },

            getActiveTerm: () => {
                const state = get();
                return state.terms.find((t) => t.id === state.activeTermId);
            },

            getCourseById: (id) => {
                const state = get();
                for (const term of state.terms) {
                    const course = term.courses.find((c) => c.id === id);
                    if (course) return course;
                }
                return undefined;
            },

            getSectionById: (id) => {
                const state = get();
                for (const term of state.terms) {
                    for (const course of term.courses) {
                        const section = course.sections.find((s) => s.id === id);
                        if (section) return section;
                    }
                }
                return undefined;
            },
        }),
        {
            name: 'universite-ders-secim-data',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                terms: state.terms,
                activeTermId: state.activeTermId,
                filters: state.filters,
                scoreWeights: state.scoreWeights,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

// Hydration durumunu kontrol et
export const useHasHydrated = () => useStore((state) => state._hasHydrated);
