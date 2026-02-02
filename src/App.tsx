import { useState } from 'react';
import './index.css';
import { TermSidebar, CourseList, WeeklySchedule, ScheduleList, FilterPanel } from './components';
import { Button } from './components/ui';
import { useStore } from './store';
import { generateCombinations } from './lib/generator';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);

  const activeTermId = useStore((state) => state.activeTermId);
  const terms = useStore((state) => state.terms);
  const filters = useStore((state) => state.filters);
  const scoreWeights = useStore((state) => state.scoreWeights);
  const setSchedules = useStore((state) => state.setSchedules);
  const schedules = useStore((state) => state.schedules);

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

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="h-14 px-4 border-b border-border flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text-primary">
            Ders Seçim
          </h1>
          {activeTerm && (
            <span className="text-sm text-text-secondary border-l border-border pl-4">
              {activeTerm.name}
            </span>
          )}
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
          <Button variant="secondary" disabled={schedules.length === 0}>
            Dışa Aktar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Terms */}
        <aside className="w-56 border-r border-border bg-white flex-shrink-0">
          <TermSidebar />
        </aside>

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
    </div>
  );
}

export default App;
