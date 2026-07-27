import React, { useMemo } from 'react';
import { AirQualityData } from '../types';
import { ALLERGENS, getPollenLevel } from '../data/allergens';
import { useAppContext } from '../store';
import { Leaf, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface CurrentStatusProps {
  data: AirQualityData;
}

export const CurrentStatus: React.FC<CurrentStatusProps> = ({ data }) => {
  const { trackedAllergens, toggleAllergen } = useAppContext();

  const currentLevels = useMemo(() => {
    return ALLERGENS.map(allergen => ({
      ...allergen,
      value: data.current[allergen.apiField] as number || 0,
      level: getPollenLevel(data.current[allergen.apiField] as number || 0)
    })).sort((a, b) => b.value - a.value); // Highest first
  }, [data]);

  const activeAllergens = currentLevels.filter(a => trackedAllergens.includes(a.id));
  const otherAllergens = currentLevels.filter(a => !trackedAllergens.includes(a.id));

  const renderAllergenCard = (item: typeof currentLevels[0], isActive: boolean) => {
    return (
      <div 
        key={item.id}
        onClick={() => toggleAllergen(item.id)}
        className={cn(
          "relative p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md",
          isActive 
            ? "bg-white border-indigo-100 shadow-sm" 
            : "bg-slate-50 border-transparent hover:bg-slate-100 opacity-70 hover:opacity-100"
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <h4 className="font-semibold text-slate-800">{item.name}</h4>
          </div>
          <div className="text-right">
            <span className={cn("text-sm font-bold", item.level.color)}>
              {item.value.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 ml-1"> zrn/m³</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", 
                item.level.score === 0 ? "bg-green-400" :
                item.level.score === 1 ? "bg-yellow-400" :
                item.level.score === 2 ? "bg-orange-400" : "bg-red-500"
              )}
              style={{ width: `${Math.min((item.value / 100) * 100, 100)}%` }}
            />
          </div>
          <span className={cn("text-xs font-medium w-20 text-right", item.level.color)}>
            {item.level.label}
          </span>
        </div>

        {isActive && item.level.score >= 1 && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <p>Zvýšené riziko. Zkřížená alergie hrozí u: <span className="font-medium text-slate-700">{item.crossAllergies.join(', ')}</span>.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-indigo-500" />
          Sledované alergeny
        </h3>
        {activeAllergens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAllergens.map(a => renderAllergenCard(a, true))}
          </div>
        ) : (
          <p className="text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
            Zatím nesledujete žádné alergeny. Vyberte si ze seznamu níže pro osobní varování.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Ostatní pyly v ovzduší
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {otherAllergens.map(a => renderAllergenCard(a, false))}
        </div>
      </div>
    </div>
  );
};
