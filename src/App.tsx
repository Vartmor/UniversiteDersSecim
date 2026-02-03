import { useState, useRef, useEffect } from 'react';
import './index.css';
import { CourseList, WeeklySchedule, ScheduleList, FilterPanel, ExportModal } from './components';
import { Button, Select, ToastProvider } from './components/ui';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const settingsRef = useRef<HTMLDivElement>(null);

  const activeTermId = useStore((state) => state.activeTermId);
  const terms = useStore((state) => state.terms);
  const filters = useStore((state) => state.filters);
  const scoreWeights = useStore((state) => state.scoreWeights);
  const setSchedules = useStore((state) => state.setSchedules);
  const addTerm = useStore((state) => state.addTerm);
  const setActiveTerm = useStore((state) => state.setActiveTerm);
  const updateTerm = useStore((state) => state.updateTerm);
  const removeTerm = useStore((state) => state.removeTerm);

  const activeTerm = terms.find((t) => t.id === activeTermId);
  const courses = activeTerm?.courses || [];
  const hasCoursesWithSections = courses.some(c => c.sections.length > 0);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Allow Escape to work in inputs to close modals
        if (e.key !== 'Escape') return;
      }

      // Ctrl+N: trigger add course (dispatch custom event)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (activeTermId) {
          // Dispatch custom event that CourseList will listen to
          window.dispatchEvent(new CustomEvent('open-add-course'));
        }
      }

      // Ctrl+G: Generate combinations
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        if (activeTermId && hasCoursesWithSections && !isGenerating) {
          handleGenerate();
        }
      }

      // Ctrl+E: Open export modal
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        if (isExportModalOpen) {
          setIsExportModalOpen(false);
        }
        if (isAddingTerm) {
          setIsAddingTerm(false);
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTermId, hasCoursesWithSections, isGenerating, isExportModalOpen, isAddingTerm, isSettingsOpen]);


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
    <ToastProvider>
      <div className="h-screen flex flex-col bg-bg-primary">
        {/* Header */}
        <header className="h-14 px-4 border-b border-border flex items-center justify-between bg-bg-primary flex-shrink-0">
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

            {/* GitHub Link */}
            <a
              href="https://github.com/Vartmor/UniversiteDersSecim"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
              title="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
                title="Ayarlar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-bg-primary rounded-lg shadow-xl border border-border py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <h3 className="text-sm font-semibold text-text-primary">Kısayollar</h3>
                  </div>
                  <div className="px-4 py-2 space-y-1 text-xs text-text-secondary">
                    <div className="flex justify-between">
                      <span>Ders Ekle</span>
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl+N</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Kombinasyon Oluştur</span>
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl+G</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Dışa Aktar</span>
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Ctrl+E</kbd>
                    </div>
                  </div>
                  <div className="border-t border-border mt-2 pt-2 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-secondary">Karanlık Mod</span>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${isDarkMode ? 'bg-accent' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${isDarkMode ? 'translate-x-5' : ''}`}
                        />
                      </button>
                    </div>
                    <span className="text-[10px] text-text-secondary">v0.1.0 - MVP</span>
                  </div>
                </div>
              )}
            </div>
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
          <aside className="w-72 border-l border-border bg-bg-primary flex-shrink-0 flex flex-col">
            {/* Filters - daha küçük */}
            <div className="h-64 border-b border-border overflow-hidden flex-shrink-0">
              <FilterPanel />
            </div>

            {/* Results - daha geniş */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex-shrink-0">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  Kombinasyonlar
                </h2>
              </div>
              <ScheduleList />
            </div>
          </aside>
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}

export default App;
