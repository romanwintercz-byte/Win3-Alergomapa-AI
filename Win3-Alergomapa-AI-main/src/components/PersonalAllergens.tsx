import React, { useState } from 'react';
import { useAppContext } from '../store';
import { CustomAllergenCategory, AirQualityData } from '../types';
import { UserCircle, Bug, Cat, Apple, Sparkles, Plus, Trash2, ShieldAlert, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALLERGENS, getPollenLevel, KNOWN_CROSS_REACTIONS, EU_FOOD_ALLERGENS } from '../data/allergens';

const CATEGORIES: { id: CustomAllergenCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'food', label: 'Potraviny', icon: <Apple className="w-5 h-5" />, color: 'text-orange-500 bg-orange-100' },
  { id: 'animal', label: 'Zvířata', icon: <Cat className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100' },
  { id: 'mite', label: 'Roztoči/Prach', icon: <Bug className="w-5 h-5" />, color: 'text-slate-500 bg-slate-200' },
  { id: 'other', label: 'Ostatní', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-100' },
];

const COMMON_SUGGESTIONS: Record<CustomAllergenCategory, string[]> = {
  food: [...EU_FOOD_ALLERGENS, 'Pšenice', 'Lískové ořechy', 'Vlašské ořechy', 'Jablko', 'Rajče', 'Broskev'],
  animal: ['Kočka', 'Pes', 'Kůň', 'Králík', 'Morče', 'Peří (Ptáci)'],
  mite: ['Roztoč prachový', 'Roztoč domácí', 'Plísně', 'Švábi'],
  other: ['Včelí jed', 'Vosí jed', 'Latex', 'Penicilin']
};

export const PersonalAllergens: React.FC<{ data: AirQualityData }> = ({ data }) => {
  const { profiles, activeProfileId, activeProfile, customAllergens, addCustomAllergen, removeCustomAllergen } = useAppContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CustomAllergenCategory>('food');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(activeProfileId === 'all' ? (profiles[0]?.id || '') : activeProfileId);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const targetId = activeProfileId === 'all' ? selectedProfileId : activeProfileId;
      addCustomAllergen({ name: name.trim(), category }, targetId);
      setName('');
      setIsAdding(false);
    }
  };

  const getCrossReactions = (allergenName: string) => {
    return ALLERGENS.filter(pollen => {
      const isCrossAllergen = pollen.crossAllergies.some(ca => ca.toLowerCase() === allergenName.toLowerCase());
      const level = getPollenLevel(data.current[pollen.apiField] as number || 0);
      return isCrossAllergen && level.score >= 1;
    });
  };

  // Build custom allergens list with owner info if activeProfileId === 'all'
  const displayCustomAllergens = React.useMemo(() => {
    if (activeProfileId === 'all') {
      return profiles.flatMap(p => 
        p.customAllergens.map(ca => ({
          ...ca,
          ownerName: p.name,
          ownerEmoji: p.avatarEmoji,
          ownerId: p.id,
          activeCrossReactions: getCrossReactions(ca.name)
        }))
      ).sort((a, b) => b.activeCrossReactions.length - a.activeCrossReactions.length);
    } else {
      return customAllergens.map(ca => ({
        ...ca,
        ownerName: activeProfile?.name || 'Já',
        ownerEmoji: activeProfile?.avatarEmoji || '👨',
        ownerId: activeProfileId,
        activeCrossReactions: getCrossReactions(ca.name)
      })).sort((a, b) => b.activeCrossReactions.length - a.activeCrossReactions.length);
    }
  }, [profiles, activeProfileId, activeProfile, customAllergens, data]);

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-500" />
            <span>Osobní alergeny</span>
            {activeProfile ? (
              <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center gap-1">
                <span>{activeProfile.avatarEmoji}</span>
                <span>{activeProfile.name}</span>
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full">
                👨👩👧👦 Rodina (všichni)
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">Alergie na potraviny, zvířata, prach a jejich zkřížené reakce</p>
        </div>

        {!isAdding && (
          <button 
            onClick={() => {
              setSelectedProfileId(activeProfileId === 'all' ? (profiles[0]?.id || '') : activeProfileId);
              setIsAdding(true);
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat alergen</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Přidání nového alergenu
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {activeProfileId === 'all' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pro člena:</label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.avatarEmoji} {p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={activeProfileId === 'all' ? 'sm:col-span-1' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Název alergenu:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="např. Ořechy, Kočka, Jablko..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategorie:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CustomAllergenCategory)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
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
              Uložit alergen
            </button>
          </div>
          
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">Rychlý výběr ({CATEGORIES.find(c => c.id === category)?.label}):</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUGGESTIONS[category]
                .filter(sug => !customAllergens.some(a => a.name.toLowerCase() === sug.toLowerCase()))
                .map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      const targetId = activeProfileId === 'all' ? selectedProfileId : activeProfileId;
                      addCustomAllergen({ name: sug, category }, targetId);
                    }}
                    className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-full transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {sug}
                  </button>
                ))}
            </div>
          </div>
        </form>
      )}

      {displayCustomAllergens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {displayCustomAllergens.map(allergen => {
            const catInfo = CATEGORIES.find(c => c.id === allergen.category);
            const activeCrossReactions = allergen.activeCrossReactions;
            
            return (
              <div 
                key={`${allergen.ownerId}_${allergen.id}`}
                className={cn(
                  "bg-white p-4 rounded-2xl border shadow-sm flex flex-col gap-3 group relative transition-all",
                  activeCrossReactions.length > 0 ? "border-red-200 bg-red-50/30" : "border-slate-200/80 hover:border-indigo-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", catInfo?.color)}>
                      {catInfo?.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-800">{allergen.name}</h4>
                        {activeProfileId === 'all' && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                            <span>{allergen.ownerEmoji}</span>
                            <span>{allergen.ownerName}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{catInfo?.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCustomAllergen(allergen.id, allergen.ownerId)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 absolute top-3 right-3"
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
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-slate-600 font-bold mb-1">Žádné osobní alergeny</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Přidejte potraviny nebo zvířata pro sledování zkřížených alergií.
          </p>
        </div>
      )}
    </div>
  );
};
