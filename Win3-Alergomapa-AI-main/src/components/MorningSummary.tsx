import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { AirQualityData } from '../types';
import { ALLERGENS, getPollenLevel } from '../data/allergens';
import { AlertCircle, Sun, Bell } from 'lucide-react';

export const MorningSummary: React.FC<{ data: AirQualityData }> = ({ data }) => {
  const { profiles, activeProfileId } = useAppContext();

  const summary = useMemo(() => {
    const activeProfiles = activeProfileId === 'all' ? profiles : profiles.filter(p => p.id === activeProfileId);
    
    let highestRiskProfile = null;
    let highestRiskAllergen = null;
    let highestScore = 0;

    activeProfiles.forEach(profile => {
      profile.trackedAllergens.forEach(allergenId => {
        const allergen = ALLERGENS.find(a => a.id === allergenId);
        if (!allergen) return;

        // Current hour or day max
        const currentValue = data.current[allergen.apiField] || 0;
        const level = getPollenLevel(currentValue);

        if (level.score > highestScore) {
          highestScore = level.score;
          highestRiskProfile = profile;
          highestRiskAllergen = allergen;
        }
      });
    });

    if (highestScore === 0) return null;

    return {
      profile: highestRiskProfile as any,
      allergen: highestRiskAllergen as any,
      score: highestScore
    };
  }, [data, profiles, activeProfileId]);

  if (!summary || summary.score === 0) {
    return (
      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-emerald-100 shadow-sm animate-in fade-in">
        <Sun className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <h4 className="font-bold">Ranní souhrn</h4>
          <p className="text-sm">Vzduch je dnes čistý, nejsou hlášena žádná pylová rizika pro sledované profily. Ideální den pro aktivity venku!</p>
        </div>
      </div>
    );
  }

  const { profile, allergen, score } = summary;
  const isHighRisk = score >= 2;

  return (
    <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border shadow-sm animate-in fade-in ${isHighRisk ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
      <Bell className={`w-6 h-6 shrink-0 ${isHighRisk ? 'text-rose-500' : 'text-amber-500'}`} />
      <div>
        <h4 className="font-bold flex items-center gap-2">
          Ranní varování pro {profile.name} {profile.avatarEmoji}
        </h4>
        <p className="text-sm mt-1">
          {isHighRisk 
            ? `Dnes je extrémní riziko pro alergii na pyl (${allergen.name}). Nezapomeňte na ranní léky a při odchodu ven sluneční brýle. Pokud má ${profile.name} astma, zvažte zkrácení pobytu venku.`
            : `Dnes je mírně zvýšené riziko pro pyl (${allergen.name}). Mějte pro jistotu pohotovostní léky u sebe.`}
        </p>
      </div>
    </div>
  );
};
