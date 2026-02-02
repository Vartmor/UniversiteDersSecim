import { useState } from 'react';
import { useStore } from '../store';
import { Button, Input } from './ui';

export function TermSidebar() {
    const [newTermName, setNewTermName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const terms = useStore((state) => state.terms);
    const activeTermId = useStore((state) => state.activeTermId);
    const addTerm = useStore((state) => state.addTerm);
    const setActiveTerm = useStore((state) => state.setActiveTerm);
    const removeTerm = useStore((state) => state.removeTerm);

    const handleAddTerm = () => {
        if (newTermName.trim()) {
            addTerm(newTermName.trim());
            setNewTermName('');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTerm();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTermName('');
        }
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
                            <li key={term.id} className="group relative">
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
                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`"${term.name}" dönemini silmek istediğinizden emin misiniz?`)) {
                                            removeTerm(term.id);
                                        }
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                                    title="Dönemi sil"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Add Term Form */}
                {isAdding && (
                    <div className="mt-2 p-2 bg-bg-secondary rounded-md">
                        <Input
                            placeholder="Dönem adı (örn: 2025-2026 Bahar)"
                            value={newTermName}
                            onChange={(e) => setNewTermName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={handleAddTerm}>
                                Ekle
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewTermName('');
                                }}
                            >
                                İptal
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Term Button */}
            {!isAdding && (
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
