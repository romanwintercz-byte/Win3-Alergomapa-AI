import React, { useMemo } from 'react';
import { AirQualityData } from '../types';
import { ALLERGENS, getPollenLevel } from '../data/allergens';
import { useAppContext } from '../store';
import { Leaf, Info, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface CurrentStatusProps {
  data: AirQualityData;
}

export const CurrentStatus: React.FC<CurrentStatusProps> = ({ data }) => {
  const { profiles, activeProfileId, activeProfile, trackedAllergens, toggleAllergen } = useAppContext();

  const currentLevels = useMemo(() => {
    return ALLERGENS.map(allergen => ({
      ...allergen,
      value: data.current[allergen.apiField] as number || 0,
      level: getPollenLevel(data.current[allergen.apiField] as number || 0)
    })).sort((a, b) => b.value - a.value); // Highest first
  }, [data]);

  // Compute family member risk status when in Family Overview ('all')
  const familyRiskSummary = useMemo(() => {
    return profiles.map(profile => {
      const memberLevels = currentLevels.filter(a => profile.trackedAllergens.includes(a.id));
      const highestRisk = memberLevels.reduce((max, a) => Math.max(max, a.level.score), 0);
      const highRiskAllergens = memberLevels.filter(a => a.level.score >= 1);

      return {
        profile,
        highestRisk,
        highRiskAllergens
      };
    });
  }, [profiles, currentLevels]);

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
    <div className="w-full space-y-6">
      {/* Family Risk Overview Card when activeProfileId === 'all' */}
      {activeProfileId === 'all' && (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldAlert className="w-40 h-40" />
          </div>

          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <span>👨‍👩‍👧‍👦</span>
              <span>Dnešní přehled pro členy rodiny</span>
            </h3>
            <p className="text-xs text-indigo-200 mb-5">
              Souhrnné hodnocení pylové zátěže podle osobních profilů
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {familyRiskSummary.map(({ profile, highestRisk, highRiskAllergens }) => (
                <div 
                  key={profile.id}
                  className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center">
                        {profile.avatarEmoji}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{profile.name}</h4>
                        <p className="text-[11px] text-indigo-200">
                          Sleduje {profile.trackedAllergens.length} pyly
                        </p>
                      </div>
                    </div>

                    {highestRisk >= 2 ? (
                      <span className="px-2.5 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Vysoké
                      </span>
                    ) : highestRisk === 1 ? (
                      <span className="px-2.5 py-1 bg-amber-500/80 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Info className="w-3 h-3" /> Střední
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/80 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Nízké
                      </span>
                    )}
                  </div>

                  {highRiskAllergens.length > 0 ? (
                    <div className="text-xs text-indigo-100 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <span className="font-semibold text-white">Pozor na: </span>
                      {highRiskAllergens.map(a => a.name).join(', ')}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-200 italic">
                      Žádné zvýšené pylové riziko pro dnešek.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Tracked Allergens List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-indigo-500" />
            <span>Sledované pyly</span>
            {activeProfile && (
              <span className="text-xs font-normal text-slate-500">({activeProfile.name})</span>
            )}
          </h3>
        </div>

        {activeAllergens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAllergens.map(a => renderAllergenCard(a, true))}
          </div>
        ) : (
          <p className="text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-sm">
            Pro tento profil zatím nesledujete žádné pylové alergeny. Vyberte si je kliknutím z níže uvedených.
          </p>
        )}
      </div>

      {/* Other Pollens */}
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
