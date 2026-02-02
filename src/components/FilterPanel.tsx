import { useStore } from '../store';
import { Select } from './ui';
import { DayOfWeek, DAY_NAMES, ScoreWeights, TIME_SLOTS, formatMinutesToTime } from '../types';

// Slider komponenti
function Slider({
    label,
    value,
    onChange,
    min = 0,
    max = 100
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{label}</span>
                <span className="text-xs font-medium text-text-primary">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
            />
        </div>
    );
}

// Başlangıç saati seçenekleri (slot başlangıç saatleri)
const START_TIME_OPTIONS = [
    { value: '', label: 'Hepsi' },
    ...TIME_SLOTS.map(slot => ({
        value: slot.startMinute.toString(),
        label: formatMinutesToTime(slot.startMinute)
    }))
];

// Bitiş saati seçenekleri (slot bitiş saatleri)
const END_TIME_OPTIONS = [
    { value: '', label: 'Hepsi' },
    ...TIME_SLOTS.map(slot => ({
        value: slot.endMinute.toString(),
        label: formatMinutesToTime(slot.endMinute)
    }))
];

export function FilterPanel() {
    const filters = useStore((state) => state.filters);
    const updateFilters = useStore((state) => state.updateFilters);
    const resetFilters = useStore((state) => state.resetFilters);
    const scoreWeights = useStore((state) => state.scoreWeights);
    const updateScoreWeights = useStore((state) => state.updateScoreWeights);
    const resetScoreWeights = useStore((state) => state.resetScoreWeights);

    const handleStartTimeChange = (value: string) => {
        updateFilters({ earliestStart: value ? parseInt(value) : null });
    };

    const handleEndTimeChange = (value: string) => {
        updateFilters({ latestEnd: value ? parseInt(value) : null });
    };

    const handleFreeDayToggle = (day: DayOfWeek) => {
        const current = filters.freeDays;
        if (current.includes(day)) {
            updateFilters({ freeDays: current.filter(d => d !== day) });
        } else {
            updateFilters({ freeDays: [...current, day] });
        }
    };

    const handleWeightChange = (key: keyof ScoreWeights, value: number) => {
        updateScoreWeights({ [key]: value });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Filtreler
                </h2>
                <button
                    onClick={() => { resetFilters(); resetScoreWeights(); }}
                    className="text-xs text-accent hover:underline"
                >
                    Sıfırla
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Zaman Filtreleri */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                        Zaman Aralığı
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs text-text-secondary block mb-1">
                                En erken başlangıç
                            </label>
                            <Select
                                options={START_TIME_OPTIONS}
                                value={filters.earliestStart?.toString() || ''}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-secondary block mb-1">
                                Yüzyüze derslerin en geç bitişi
                            </label>
                            <Select
                                options={END_TIME_OPTIONS}
                                value={filters.latestEnd?.toString() || ''}
                                onChange={(e) => handleEndTimeChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Boş Günler */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                        Boş Günler
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as DayOfWeek[]).map((day) => (
                            <button
                                key={day}
                                onClick={() => handleFreeDayToggle(day)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${filters.freeDays.includes(day)
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                                    }`}
                            >
                                {DAY_NAMES[day].slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Diğer Filtreler */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.lunchBreak}
                            onChange={(e) => updateFilters({ lunchBreak: e.target.checked })}
                            className="accent-accent"
                        />
                        <span className="text-xs">Öğle arası boş (12-13)</span>
                    </label>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">Min boş gün:</span>
                        <Select
                            options={[
                                { value: '0', label: '0' },
                                { value: '1', label: '1' },
                                { value: '2', label: '2' },
                                { value: '3', label: '3' },
                            ]}
                            value={filters.minFreeDays.toString()}
                            onChange={(e) => updateFilters({ minFreeDays: parseInt(e.target.value) })}
                            className="w-16"
                        />
                    </div>
                </div>

                {/* Skor Ağırlıkları */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-3">
                        Skor Ağırlıkları
                    </h3>
                    <div className="space-y-3">
                        <Slider
                            label="Boş gün önemi"
                            value={scoreWeights.freeDays}
                            onChange={(v) => handleWeightChange('freeDays', v)}
                        />
                        <Slider
                            label="Geç başlangıç önemi"
                            value={scoreWeights.lateStart}
                            onChange={(v) => handleWeightChange('lateStart', v)}
                        />
                        <Slider
                            label="Az boşluk önemi"
                            value={scoreWeights.gaps}
                            onChange={(v) => handleWeightChange('gaps', v)}
                        />
                        <Slider
                            label="Kısa gün önemi"
                            value={scoreWeights.spread}
                            onChange={(v) => handleWeightChange('spread', v)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
