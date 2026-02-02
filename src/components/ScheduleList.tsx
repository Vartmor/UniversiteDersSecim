import { useStore } from '../store';
import { Schedule } from '../types';
import { minutesToTime } from '../lib/utils';

export function ScheduleList() {
    const schedules = useStore((state) => state.schedules);
    const selectedScheduleId = useStore((state) => state.selectedScheduleId);
    const setSelectedSchedule = useStore((state) => state.setSelectedSchedule);
    const togglePinSchedule = useStore((state) => state.togglePinSchedule);

    if (schedules.length === 0) {
        return (
            <div className="p-4">
                <p className="text-sm text-text-secondary text-center">
                    Henüz kombinasyon oluşturulmadı.
                </p>
            </div>
        );
    }

    // Pinned olanları öne al
    const sortedSchedules = [...schedules].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.score - a.score;
    });

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
                <span className="text-xs text-text-secondary">
                    {schedules.length} kombinasyon bulundu
                </span>
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
                    : 'bg-white border-border hover:border-gray-300'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">#{index}</span>
                    <span className="text-sm font-medium">Skor: {schedule.score}</span>
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
