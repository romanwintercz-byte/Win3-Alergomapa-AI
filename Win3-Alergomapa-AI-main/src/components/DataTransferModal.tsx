import React, { useRef, useState } from 'react';
import { Download, Upload, X, AlertTriangle, FileJson, CheckCircle2 } from 'lucide-react';

interface DataTransferModalProps {
  onClose: () => void;
}

export const DataTransferModal: React.FC<DataTransferModalProps> = ({ onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleExport = () => {
    const exportData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('alergo_')) {
        exportData[key] = localStorage.getItem(key) || '';
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `alergomapa-zaloha-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        let hasValidData = false;
        // Validate if it has our keys
        for (const key in json) {
          if (key.startsWith('alergo_')) {
            localStorage.setItem(key, json[key]);
            hasValidData = true;
          }
        }

        if (hasValidData) {
          setImportStatus('success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setImportStatus('error');
          setErrorMessage('Vybraný soubor neobsahuje platná data aplikace.');
        }
      } catch (err) {
        console.error("Import failed:", err);
        setImportStatus('error');
        setErrorMessage('Soubor je poškozený nebo není ve správném formátu (JSON).');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-600" /> Záloha a obnova dat
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Můžete si exportovat svá data (profily, záznamy v deníku, fotky) do souboru a přenést je do jiného zařízení.
          </p>

          <div className="space-y-4">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportovat data (Stáhnout zálohu)
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400">
                <span className="bg-white px-2">Nebo</span>
              </div>
            </div>

            <button 
              onClick={handleImportClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors"
            >
              <Upload className="w-5 h-5" />
              Importovat data (Obnovit ze zálohy)
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
          </div>

          {importStatus === 'error' && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium flex gap-2 items-start border border-rose-100">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium flex gap-2 items-start border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>Data byla úspěšně obnovena! Aplikace se nyní restartuje...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
