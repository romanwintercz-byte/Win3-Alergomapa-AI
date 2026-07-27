import React, { useState } from 'react';
import { useAppContext } from '../store';
import { CustomAllergenCategory, AirQualityData } from '../types';
import { UserCircle, Bug, Cat, Apple, Sparkles, Plus, Trash2, ShieldAlert, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALLERGENS, getPollenLevel, KNOWN_CROSS_REACTIONS } from '../data/allergens';

const CATEGORIES: { id: CustomAllergenCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'food', label: 'Potraviny', icon: <Apple className="w-5 h-5" />, color: 'text-orange-500 bg-orange-100' },
  { id: 'animal', label: 'Zvířata', icon: <Cat className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100' },
  { id: 'mite', label: 'Roztoči/Prach', icon: <Bug className="w-5 h-5" />, color: 'text-slate-500 bg-slate-200' },
  { id: 'other', label: 'Ostatní', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100' },
];

const COMMON_SUGGESTIONS: Record<CustomAllergenCategory, string[]> = {
  food: ['Arašídy', 'Lískové ořechy', 'Vlašské ořechy', 'Mléko', 'Vejce', 'Sója', 'Pšenice', 'Ryby', 'Korýši', 'Jablko', 'Celer', 'Rajče', 'Broskev'],
  animal: ['Kočka', 'Pes', 'Kůň', 'Králík', 'Morče', 'Peří (Ptáci)'],
  mite: ['Roztoč prachový', 'Roztoč domácí', 'Plísně', 'Švábi'],
  other: ['Včelí jed', 'Vosí jed', 'Latex', 'Penicilin']
};

export const PersonalAllergens: React.FC<{ data: AirQualityData }> = ({ data }) => {
  const { customAllergens, addCustomAllergen, removeCustomAllergen } = useAppContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CustomAllergenCategory>('food');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addCustomAllergen({ name: name.trim(), category });
      setName('');
      setIsAdding(false);
    }
  };

  const getCrossReactions = (allergenName: string) => {
    return ALLERGENS.filter(pollen => {
      const isCrossAllergen = pollen.crossAllergies.some(ca => ca.toLowerCase() === allergenName.toLowerCase());
      const level = getPollenLevel(data.current[pollen.apiField] as number || 0);
      return isCrossAllergen && level.score >= 1; // Zvýšená koncentrace
    });
  };

  const sortedCustomAllergens = React.useMemo(() => {
    return [...customAllergens].map(allergen => {
      const activeCrossReactions = getCrossReactions(allergen.name);
      return { ...allergen, activeCrossReactions };
    }).sort((a, b) => b.activeCrossReactions.length - a.activeCrossReactions.length);
  }, [customAllergens, data]);

  return (
    <div className="w-full mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-indigo-500" />
          Osobní alergeny
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            Přidat vlastní
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vlastní název alergenu..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CustomAllergenCategory)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                Uložit
              </button>
              <button 
                type="button"
                onClick={() => { setIsAdding(false); setName(''); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">Rychlý výběr ({CATEGORIES.find(c => c.id === category)?.label}):</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUGGESTIONS[category]
                .filter(sug => !customAllergens.some(a => a.name.toLowerCase() === sug.toLowerCase()))
                .map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => addCustomAllergen({ name: sug, category })}
                    className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-full transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {sug}
                  </button>
                ))}
              {COMMON_SUGGESTIONS[category].filter(sug => !customAllergens.some(a => a.name.toLowerCase() === sug.toLowerCase())).length === 0 && (
                <span className="text-xs text-slate-400">Všechny běžné alergeny z této kategorie již sledujete.</span>
              )}
            </div>
          </div>
        </form>
      )}

      {sortedCustomAllergens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sortedCustomAllergens.map(allergen => {
            const catInfo = CATEGORIES.find(c => c.id === allergen.category);
            const activeCrossReactions = allergen.activeCrossReactions;
            
            return (
              <div 
                key={allergen.id}
                className={cn(
                  "bg-white p-4 rounded-2xl border shadow-sm flex flex-col gap-3 group relative transition-all",
                  activeCrossReactions.length > 0 ? "border-red-200 bg-red-50/30" : "border-green-100 bg-green-50/30 hover:border-green-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", catInfo?.color)}>
                      {catInfo?.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{allergen.name}</h4>
                      <p className="text-xs text-slate-500">{catInfo?.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCustomAllergen(allergen.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 absolute top-2 right-2"
                    aria-label="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {activeCrossReactions.length > 0 ? (
                  <div className="mt-1 pt-2 border-t border-red-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 leading-relaxed font-medium">
                      Pozor: V ovzduší je <span className="font-bold">{activeCrossReactions.map(r => r.name).join(', ')}</span>. 
                      Může dojít ke zkřížené reakci!
                    </p>
                  </div>
                ) : (
                  <div className="mt-1 pt-2 border-t border-green-100 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700 leading-relaxed font-medium">
                      Aktuálně bez rizika pylové zkřížené reakce.
                    </p>
                  </div>
                )}

                {(() => {
                  const allergenNameLower = allergen.name.toLowerCase();
                  const staticCrossReactions = Object.entries(KNOWN_CROSS_REACTIONS)
                    .filter(([key]) => allergenNameLower.includes(key))
                    .flatMap(([, values]) => values);
                  
                  const uniqueStaticCrossReactions = [...new Set(staticCrossReactions)];
                  
                  if (uniqueStaticCrossReactions.length > 0) {
                    return (
                      <div className="mt-1 pt-2 border-t border-amber-100/50 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          Trvalé riziko zkřížení s: <span className="font-bold">{uniqueStaticCrossReactions.join(', ')}</span>.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-slate-600 font-medium mb-1">Žádné osobní alergeny</p>
          <p className="text-sm text-slate-500 max-w-sm">
            Můžete si sem přidat potraviny, zvířata nebo roztoče, abyste měli všechny své alergie na jednom místě.
          </p>
        </div>
      )}
    </div>
  );
};
