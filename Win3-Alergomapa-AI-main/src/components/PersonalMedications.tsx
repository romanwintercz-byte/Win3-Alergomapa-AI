import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Pill, Plus, Trash2, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { checkInteractions } from '../hooks/useInteractionChecker';
import { Medication } from '../types';

export const PersonalMedications: React.FC = () => {
  const { activeProfile, updateProfile } = useAppContext();
  const [name, setName] = useState('');
  const [type, setType] = useState<Medication['type']>('pill');
  const [usageType, setUsageType] = useState<Medication['usageType']>('regular');
  const [isAdding, setIsAdding] = useState(false);

  if (!activeProfile) return null;

  const medications = activeProfile.medications || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newMed: Medication = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        usageType
      };
      updateProfile(activeProfile.id, {
        medications: [...medications, newMed]
      });
      setName('');
      setIsAdding(false);
    }
  };

  const removeMedication = (id: string) => {
    updateProfile(activeProfile.id, {
      medications: medications.filter(m => m.id !== id)
    });
  };

  const interactions = checkInteractions(activeProfile);

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-500" />
            <span>Léky a doplňky</span>
          </h3>
          <p className="text-xs text-slate-500">Pravidelné léky a doplňky stravy pro kontrolu interakcí</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat lék</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Nový lék / doplněk
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Název:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="např. Euthyrox, Vápník, Zyrtec..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Typ:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Medication['type'])}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="pill">Prášky / Tobolky</option>
                <option value="drops">Kapky</option>
                <option value="spray">Sprej</option>
                <option value="other">Jiné</option>
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Užívání:</label>
              <select
                value={usageType}
                onChange={(e) => setUsageType(e.target.value as Medication['usageType'])}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="regular">Pravidelně</option>
                <option value="as_needed">Podle potřeby</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mb-4">
            <button 
              type="button"
              onClick={() => { setIsAdding(false); setName(''); }}
              className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Zrušit
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-200"
            >
              Uložit lék
            </button>
          </div>
        </form>
      )}

      {/* Zobrazení varování z Interaction Engine */}
      {interactions.length > 0 && (
        <div className="mb-6 space-y-3">
          {interactions.map((interaction, idx) => (
            <div 
              key={idx} 
              className={cn(
                "p-4 rounded-2xl border flex gap-4 animate-in fade-in",
                interaction.severity === 'CRITICAL' ? "bg-red-50 border-red-200 text-red-900" :
                interaction.severity === 'WARNING' ? "bg-amber-50 border-amber-200 text-amber-900" :
                "bg-blue-50 border-blue-200 text-blue-900"
              )}
            >
               <div className="mt-0.5">
                 {interaction.severity === 'CRITICAL' ? <ShieldAlert className="w-5 h-5 text-red-500" /> :
                  interaction.severity === 'WARNING' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                  <Info className="w-5 h-5 text-blue-500" />}
               </div>
               <div>
                  <h4 className="font-bold text-sm mb-1">Interakce: {interaction.triggerMatch} a {interaction.targetMatch}</h4>
                  <p className="text-xs leading-relaxed opacity-90">{interaction.message}</p>
                  {interaction.timeSpacingHours && (
                    <p className="text-xs font-bold mt-2">Doporučený odstup: {interaction.timeSpacingHours} hodiny</p>
                  )}
                  {interaction.description && (
                    <p className="text-[10px] mt-2 opacity-70 italic">{interaction.description}</p>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}

      {medications.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {medications.map(med => (
            <div 
              key={med.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-500">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{med.name}</h4>
                  <p className="text-xs text-slate-500">
                    {med.usageType === 'regular' ? 'Pravidelně' : 'Dle potřeby'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeMedication(med.id)}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                aria-label="Odstranit lék"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white border border-slate-200 border-dashed rounded-2xl">
          <Pill className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-600">Zatím žádné léky</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Přidejte své pravidelné léky a doplňky stravy pro kontrolu interakcí s alergeny a potravinami.
          </p>
        </div>
      )}
    </div>
  );
};
