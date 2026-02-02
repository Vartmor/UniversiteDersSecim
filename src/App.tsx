import { useState } from 'react';
import './index.css';
import { CourseList, WeeklySchedule, ScheduleList, FilterPanel, ExportModal } from './components';
import { Button, Select } from './components/ui';
import { useStore } from './store';
import { generateCombinations } from './lib/generator';

// Yıl seçenekleri
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const startYear = currentYear - 3 + i;
  const endYear = startYear + 1;
  return {
    value: `${startYear}-${endYear}`,
    label: `${startYear}-${endYear}`,
  };
});

const SEMESTER_OPTIONS = [
  { value: 'Güz', label: 'Güz' },
  { value: 'Bahar', label: 'Bahar' },
];

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [formYear, setFormYear] = useState(YEAR_OPTIONS[3].value);
  const [formSemester, setFormSemester] = useState('Güz');

  const activeTermId = useStore((state) => state.activeTermId);
  const terms = useStore((state) => state.terms);
  const filters = useStore((state) => state.filters);
  const scoreWeights = useStore((state) => state.scoreWeights);
  const setSchedules = useStore((state) => state.setSchedules);
  const schedules = useStore((state) => state.schedules);
  const addTerm = useStore((state) => state.addTerm);
  const setActiveTerm = useStore((state) => state.setActiveTerm);
  const updateTerm = useStore((state) => state.updateTerm);
  const removeTerm = useStore((state) => state.removeTerm);

  const activeTerm = terms.find((t) => t.id === activeTermId);
  const courses = activeTerm?.courses || [];
  const hasCoursesWithSections = courses.some(c => c.sections.length > 0);

  const handleGenerate = () => {
    if (!activeTerm || !hasCoursesWithSections) return;

    setIsGenerating(true);

    setTimeout(() => {
      try {
        const results = generateCombinations(courses, filters, scoreWeights);
        setSchedules(results);
      } catch (error) {
        console.error('Kombinasyon üretme hatası:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 10);
  };

  const handleAddTerm = () => {
    const termName = `${formYear} ${formSemester}`;
    addTerm(termName);
    setIsAddingTerm(false);
  };

  // Term dropdown options
  const termOptions = [
    { value: '', label: 'Dönem Seçin...' },
    ...terms.map(t => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="h-14 px-4 border-b border-border flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text-primary">
            Ders Seçim
          </h1>

          {/* Term Selector */}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            {terms.length > 0 && (
              <Select
                options={termOptions}
                value={activeTermId || ''}
                onChange={(e) => setActiveTerm(e.target.value || null)}
                className="w-48"
              />
            )}

            {isAddingTerm ? (
              <div className="flex items-center gap-2">
                <Select
                  options={YEAR_OPTIONS}
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="w-28"
                />
                <Select
                  options={SEMESTER_OPTIONS}
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  className="w-20"
                />
                <Button size="sm" onClick={handleAddTerm}>Ekle</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingTerm(false)}>İptal</Button>
              </div>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setIsAddingTerm(true)}>
                + Dönem
              </Button>
            )}

            {activeTerm && (
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => {
                    const newName = prompt('Dönem adını düzenle:', activeTerm.name);
                    if (newName) updateTerm(activeTerm.id, newName);
                  }}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  title="Dönem Düzenle"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${activeTerm.name}" dönemini silmek istediğinizden emin misiniz?`)) {
                      removeTerm(activeTerm.id);
                    }
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Dönem Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {schedules.length > 0 && (
            <span className="text-sm text-text-secondary">
              {schedules.length} kombinasyon
            </span>
          )}
          <Button
            variant="primary"
            disabled={!activeTermId || !hasCoursesWithSections || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Oluşturuluyor...' : 'Kombinasyonları Oluştur'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsExportModalOpen(true)}
          >
            Dışa Aktar
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Course List */}
        <aside className="w-80 border-r border-border bg-bg-secondary flex-shrink-0 overflow-hidden">
          <CourseList />
        </aside>

        {/* Main - Weekly Schedule */}
        <main className="flex-1 overflow-hidden">
          <WeeklySchedule />
        </main>

        {/* Right Panel - Filters & Results */}
        <aside className="w-72 border-l border-border bg-white flex-shrink-0 flex flex-col">
          {/* Filters */}
          <div className="flex-1 border-b border-border overflow-hidden">
            <FilterPanel />
          </div>

          {/* Results */}
          <div className="h-64 overflow-hidden flex-shrink-0">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Kombinasyonlar
              </h2>
            </div>
            <ScheduleList />
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="h-8 px-4 border-t border-border flex items-center justify-between bg-white flex-shrink-0">
        <span className="text-xs text-text-secondary">
          v0.1.0 - MVP
        </span>
        <span className="text-xs text-text-secondary">
          Ctrl+N: Ders Ekle | Ctrl+G: Kombinasyon Oluştur | Ctrl+E: Dışa Aktar
        </span>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
