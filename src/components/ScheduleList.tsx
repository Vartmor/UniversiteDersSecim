import { useState } from 'react';
import { useStore } from '../store';
import { Schedule } from '../types';
import { minutesToTime } from '../lib/utils';

type SortBy = 'freeDays' | 'earliestStart' | 'latestEnd' | 'gaps';

export function ScheduleList() {
    const schedules = useStore((state) => state.schedules);
    const selectedScheduleId = useStore((state) => state.selectedScheduleId);
    const setSelectedSchedule = useStore((state) => state.setSelectedSchedule);
    const togglePinSchedule = useStore((state) => state.togglePinSchedule);

    const [sortBy, setSortBy] = useState<SortBy>('freeDays');
    const [sortDesc, setSortDesc] = useState(true);
    const [filterMinFreeDays, setFilterMinFreeDays] = useState(0);

    if (schedules.length === 0) {
        return (
            <div className="p-4">
                <p className="text-sm text-text-secondary text-center">
                    Henüz kombinasyon oluşturulmadı.
                </p>
            </div>
        );
    }

    // Filtrele
    let filteredSchedules = schedules.filter(s => s.stats.freeDays >= filterMinFreeDays);

    // Sırala
    const sortedSchedules = [...filteredSchedules].sort((a, b) => {
        // Pinned olanları öne al
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        let comparison = 0;
        switch (sortBy) {
            case 'freeDays':
                comparison = a.stats.freeDays - b.stats.freeDays;
                break;
            case 'earliestStart':
                comparison = a.stats.earliestStart - b.stats.earliestStart;
                break;
            case 'latestEnd':
                comparison = a.stats.latestEnd - b.stats.latestEnd;
                break;
            case 'gaps':
                comparison = a.stats.totalGaps - b.stats.totalGaps;
                break;
        }
        return sortDesc ? -comparison : comparison;
    });

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                        {sortedSchedules.length}/{schedules.length} program
                    </span>
                </div>

                {/* Sıralama ve Filtreleme */}
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="text-xs px-2 py-1 border border-border rounded bg-bg-primary"
                    >
                        <option value="freeDays">Boş Gün</option>
                        <option value="earliestStart">Başlangıç Saati</option>
                        <option value="latestEnd">Bitiş Saati</option>
                        <option value="gaps">Boşluk</option>
                    </select>
                    <button
                        onClick={() => setSortDesc(!sortDesc)}
                        className="text-xs px-2 py-1 border border-border rounded bg-bg-primary hover:bg-gray-100"
                        title={sortDesc ? 'Azalan' : 'Artan'}
                    >
                        {sortDesc ? '↓' : '↑'}
                    </button>
                    <select
                        value={filterMinFreeDays}
                        onChange={(e) => setFilterMinFreeDays(parseInt(e.target.value))}
                        className="text-xs px-2 py-1 border border-border rounded bg-bg-primary"
                    >
                        <option value="0">Min 0 boş gün</option>
                        <option value="1">Min 1 boş gün</option>
                        <option value="2">Min 2 boş gün</option>
                        <option value="3">Min 3 boş gün</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sortedSchedules.map((schedule, index) => (
                    <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        index={index + 1}
                        isSelected={schedule.id === selectedScheduleId}
                        onSelect={() => setSelectedSchedule(schedule.id)}
                        onTogglePin={() => togglePinSchedule(schedule.id)}
                    />
                ))}
            </div>
        </div>
    );
}

interface ScheduleCardProps {
    schedule: Schedule;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onTogglePin: () => void;
}

function ScheduleCard({ schedule, index, isSelected, onSelect, onTogglePin }: ScheduleCardProps) {
    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-2 rounded-md border transition-colors ${isSelected
                ? 'bg-blue-50 border-accent'
                : 'bg-bg-primary border-border hover:border-gray-400'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Program #{index}</span>
                    {schedule.pinned && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                            Favori
                        </span>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin();
                    }}
                    className={`text-sm px-2 py-1 rounded ${schedule.pinned
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-text-secondary hover:bg-gray-100'
                        }`}
                    title={schedule.pinned ? 'Favoriden çıkar' : 'Favorilere ekle'}
                >
                    {schedule.pinned ? '★' : '☆'}
                </button>
            </div>

            <div className="mt-1 text-xs text-text-secondary grid grid-cols-2 gap-x-2">
                <span>{schedule.stats.freeDays} boş gün</span>
                <span>Başlangıç: {minutesToTime(schedule.stats.earliestStart)}</span>
                <span>Boşluk: {schedule.stats.totalGaps} dk</span>
                <span>Bitiş: {minutesToTime(schedule.stats.latestEnd)}</span>
            </div>
        </button>
    );
}
