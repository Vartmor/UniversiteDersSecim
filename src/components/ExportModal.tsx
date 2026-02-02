import { useState, useRef } from 'react';
import { Button, Modal } from './ui';
import { useStore } from '../store';
import { exportToJSON, importFromJSON, exportToICS, downloadFile, readFile } from '../lib/export';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const terms = useStore((state) => state.terms);
    const activeTerm = useStore((state) => state.getActiveTerm());
    const schedules = useStore((state) => state.schedules);
    const selectedScheduleId = useStore((state) => state.selectedScheduleId);

    const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);
    const courses = activeTerm?.courses || [];

    // JSON Export
    const handleExportJSON = () => {
        const json = exportToJSON(terms);
        const filename = `ders-secim-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(json, filename, 'application/json');
    };

    // ICS Export
    const handleExportICS = () => {
        if (!selectedSchedule || !activeTerm) {
            setImportError('Önce bir kombinasyon seçin');
            return;
        }

        const ics = exportToICS(
            selectedSchedule,
            courses,
            activeTerm.name
        );
        const filename = `${activeTerm.name.replace(/\s+/g, '-')}-program.ics`;
        downloadFile(ics, filename, 'text/calendar');
    };

    // JSON Import
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportStatus(null);
        setImportError(null);

        try {
            const content = await readFile(file);
            const importedTerms = importFromJSON(content);

            // Store'a ekle
            const addTerm = useStore.getState().addTerm;

            // Her dönem için
            for (const term of importedTerms) {
                // Yeni dönem oluştur
                addTerm(`${term.name} (İçe Aktarıldı)`);

                // Not: Şu anki implementasyon sadece yeni dönem oluşturur
                // Tam import için daha detaylı bir yapı gerekir
            }

            setImportStatus(`${importedTerms.length} dönem başarıyla içe aktarıldı!`);
        } catch (error) {
            setImportError(error instanceof Error ? error.message : 'Dosya içe aktarılamadı');
        }

        // Input'u resetle
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dışa/İçe Aktar">
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
                <button
                    onClick={() => setActiveTab('export')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'export'
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Dışa Aktar
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'import'
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    İçe Aktar
                </button>
            </div>

            {activeTab === 'export' ? (
                <div className="space-y-4">
                    {/* JSON Export */}
                    <div className="p-4 bg-bg-secondary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">JSON Dosyası</h3>
                        <p className="text-sm text-text-secondary mb-3">
                            Tüm dönem ve ders verilerini JSON formatında dışa aktarın.
                            Bu dosyayı yedek olarak saklayabilir veya başka cihazlara aktarabilirsiniz.
                        </p>
                        <Button variant="primary" onClick={handleExportJSON}>
                            JSON İndir
                        </Button>
                    </div>

                    {/* ICS Export */}
                    <div className="p-4 bg-bg-secondary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">Takvim (ICS)</h3>
                        <p className="text-sm text-text-secondary mb-3">
                            Seçili programı takvim dosyası olarak dışa aktarın.
                            Google Calendar, Apple Calendar veya Outlook'a aktarabilirsiniz.
                        </p>
                        <Button
                            variant="primary"
                            onClick={handleExportICS}
                            disabled={!selectedSchedule}
                        >
                            ICS İndir
                        </Button>
                        {!selectedSchedule && (
                            <p className="text-xs text-warning mt-2">
                                Önce bir kombinasyon seçin
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* JSON Import */}
                    <div className="p-4 bg-bg-secondary rounded-lg">
                        <h3 className="font-medium text-text-primary mb-2">JSON Dosyası İçe Aktar</h3>
                        <p className="text-sm text-text-secondary mb-3">
                            Daha önce dışa aktardığınız JSON dosyasını yükleyerek
                            verilerinizi geri yükleyin.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button variant="secondary" onClick={handleImportClick}>
                            Dosya Seç
                        </Button>

                        {importStatus && (
                            <p className="text-sm text-success mt-3">{importStatus}</p>
                        )}
                        {importError && (
                            <p className="text-sm text-error mt-3">{importError}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                    Kapat
                </Button>
            </div>
        </Modal>
    );
}
