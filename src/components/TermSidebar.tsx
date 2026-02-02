import { useState } from 'react';
import { useStore } from '../store';
import { Button, Select } from './ui';

// Yıl seçenekleri - şu anki yıldan 5 yıl ileri/geri
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

export function TermSidebar() {
    const [isAdding, setIsAdding] = useState(false);
    const [editingTermId, setEditingTermId] = useState<string | null>(null);
    const [formYear, setFormYear] = useState(YEAR_OPTIONS[3].value);
    const [formSemester, setFormSemester] = useState('Güz');

    const terms = useStore((state) => state.terms);
    const activeTermId = useStore((state) => state.activeTermId);
    const addTerm = useStore((state) => state.addTerm);
    const updateTerm = useStore((state) => state.updateTerm);
    const setActiveTerm = useStore((state) => state.setActiveTerm);
    const removeTerm = useStore((state) => state.removeTerm);

    const handleAddTerm = () => {
        const termName = `${formYear} ${formSemester}`;
        addTerm(termName);
        setFormYear(YEAR_OPTIONS[3].value);
        setFormSemester('Güz');
        setIsAdding(false);
    };

    const handleUpdateTerm = (termId: string) => {
        const termName = `${formYear} ${formSemester}`;
        updateTerm(termId, termName);
        setEditingTermId(null);
    };

    const startEditing = (term: { id: string; name: string }) => {
        // Parse existing name
        const parts = term.name.split(' ');
        const semester = parts.pop() || 'Güz';
        const year = parts.join(' ') || YEAR_OPTIONS[3].value;

        setFormYear(year);
        setFormSemester(semester);
        setEditingTermId(term.id);
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingTermId(null);
        setIsAdding(false);
        setFormYear(YEAR_OPTIONS[3].value);
        setFormSemester('Güz');
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Dönemler
                </h2>
            </div>

            {/* Term List */}
            <div className="flex-1 overflow-y-auto p-2">
                {terms.length === 0 && !isAdding ? (
                    <p className="text-sm text-text-secondary text-center py-4">
                        Henüz dönem eklenmedi
                    </p>
                ) : (
                    <ul className="space-y-1">
                        {terms.map((term) => (
                            <li key={term.id}>
                                {editingTermId === term.id ? (
                                    // Edit form
                                    <div className="p-2 bg-bg-secondary rounded-md space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Select
                                                options={YEAR_OPTIONS}
                                                value={formYear}
                                                onChange={(e) => setFormYear(e.target.value)}
                                            />
                                            <Select
                                                options={SEMESTER_OPTIONS}
                                                value={formSemester}
                                                onChange={(e) => setFormSemester(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleUpdateTerm(term.id)}>
                                                Kaydet
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                                İptal
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Term row
                                    <div className="group relative">
                                        <button
                                            onClick={() => setActiveTerm(term.id)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${activeTermId === term.id
                                                ? 'bg-accent text-white'
                                                : 'text-text-primary hover:bg-bg-secondary'
                                                }`}
                                        >
                                            <span className="truncate">{term.name}</span>
                                            <span className="text-xs opacity-60">
                                                {term.courses.length} ders
                                            </span>
                                        </button>
                                        {/* Action buttons */}
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(term);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded"
                                                title="Düzenle"
                                            >
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`"${term.name}" dönemini silmek istediğinizden emin misiniz?`)) {
                                                        removeTerm(term.id);
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-100 rounded"
                                                title="Sil"
                                            >
                                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Add Term Form */}
                {isAdding && (
                    <div className="mt-2 p-2 bg-bg-secondary rounded-md space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Select
                                options={YEAR_OPTIONS}
                                value={formYear}
                                onChange={(e) => setFormYear(e.target.value)}
                            />
                            <Select
                                options={SEMESTER_OPTIONS}
                                value={formSemester}
                                onChange={(e) => setFormSemester(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddTerm}>
                                Ekle
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                İptal
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Term Button */}
            {!isAdding && !editingTermId && (
                <div className="p-2 border-t border-border">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsAdding(true)}
                    >
                        + Dönem Ekle
                    </Button>
                </div>
            )}
        </div>
    );
}
