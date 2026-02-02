import { useStore } from '../store';
import { Input, Select } from './ui';
import { DayOfWeek, DAY_NAMES } from '../types';
import { minutesToTime, timeToMinutes } from '../lib/utils';

export function FilterPanel() {
    const filters = useStore((state) => state.filters);
    const updateFilters = useStore((state) => state.updateFilters);
    const resetFilters = useStore((state) => state.resetFilters);

    const handleTimeChange = (field: 'earliestStart' | 'latestEnd', value: string) => {
        if (value) {
            updateFilters({ [field]: timeToMinutes(value) });
        } else {
            updateFilters({ [field]: null });
        }
    };

    const handleFreeDayToggle = (day: DayOfWeek) => {
        const current = filters.freeDays;
        if (current.includes(day)) {
            updateFilters({ freeDays: current.filter(d => d !== day) });
        } else {
            updateFilters({ freeDays: [...current, day] });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Filtreler
                </h2>
                <button
                    onClick={resetFilters}
                    className="text-xs text-accent hover:underline"
                >
                    Sıfırla
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Zaman Filtreleri */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                        Zaman Aralığı
                    </h3>
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs text-text-secondary">En erken ders</label>
                            <Input
                                type="time"
                                value={filters.earliestStart !== null ? minutesToTime(filters.earliestStart) : ''}
                                onChange={(e) => handleTimeChange('earliestStart', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-secondary">En geç bitiş</label>
                            <Input
                                type="time"
                                value={filters.latestEnd !== null ? minutesToTime(filters.latestEnd) : ''}
                                onChange={(e) => handleTimeChange('latestEnd', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Boş Günler */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                        Boş Olması Gereken Günler
                    </h3>
                    <div className="space-y-1">
                        {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as DayOfWeek[]).map((day) => (
                            <label key={day} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.freeDays.includes(day)}
                                    onChange={() => handleFreeDayToggle(day)}
                                    className="accent-accent"
                                />
                                <span className="text-sm">{DAY_NAMES[day]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Öğle Arası */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.lunchBreak}
                            onChange={(e) => updateFilters({ lunchBreak: e.target.checked })}
                            className="accent-accent"
                        />
                        <span className="text-sm">Öğle arası boş (12:00-13:00)</span>
                    </label>
                </div>

                {/* Minimum Boş Gün */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                        Minimum Boş Gün
                    </h3>
                    <Select
                        options={[
                            { value: '0', label: 'Fark etmez' },
                            { value: '1', label: 'En az 1 gün' },
                            { value: '2', label: 'En az 2 gün' },
                            { value: '3', label: 'En az 3 gün' },
                        ]}
                        value={filters.minFreeDays.toString()}
                        onChange={(e) => updateFilters({ minFreeDays: parseInt(e.target.value) })}
                    />
                </div>

                {/* Maksimum Boşluk */}
                <div>
                    <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                        Maksimum Günlük Boşluk (dakika)
                    </h3>
                    <Input
                        type="number"
                        placeholder="Sınırsız"
                        min={0}
                        step={30}
                        value={filters.maxGap !== null ? filters.maxGap : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateFilters({ maxGap: val ? parseInt(val) : null });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
