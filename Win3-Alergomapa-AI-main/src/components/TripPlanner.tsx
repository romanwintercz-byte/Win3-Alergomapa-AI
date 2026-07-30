import React, { useMemo, useState } from 'react';
import { useAppContext } from '../store';
import { AirQualityData, AllergenKey } from '../types';
import { ALLERGENS, getPollenLevel } from '../data/allergens';
import { Map, Clock, Sun, CloudRain, ShieldCheck, Pill, ArrowRight } from 'lucide-react';
import { parseISO, format, addDays, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';

interface TripPlannerProps {
  data: AirQualityData;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ data }) => {
  const { activeProfile, profiles, activeProfileId } = useAppContext();
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(1); // 1 = Zítra, 2 = Pozítří

  const plan = useMemo(() => {
    if (!data) return null;

    const targetDate = addDays(new Date(), selectedDayOffset);
    
    // Získáme indexy pro vybraný den
    const dayIndices = data.hourly.time.reduce((acc, timeStr, idx) => {
      if (isSameDay(parseISO(timeStr), targetDate)) {
        acc.push(idx);
      }
      return acc;
    }, [] as number[]);

    if (dayIndices.length === 0) return null;

    const targetProfiles = activeProfileId === 'all' ? profiles : (activeProfile ? [activeProfile] : []);
    
    // Pro každý profil chceme najít optimální okno a zhodnotit rizika
    const profilePlans = targetProfiles.map(profile => {
      const trackedAllergens = profile.trackedAllergens;
      if (trackedAllergens.length === 0) {
        return { profile, bestWindow: null, avgScore: 0, recommendations: [], asNeededMeds: [] };
      }

      // Hodnocení pro každou hodinu
      const hourlyScores = dayIndices.map(idx => {
        let hourTotalScore = 0;
        let hourMaxScore = 0;
        const time = parseISO(data.hourly.time[idx]);
        
        trackedAllergens.forEach(allergenId => {
          const allergen = ALLERGENS.find(a => a.id === allergenId);
          if (!allergen) return;
          const val = data.hourly[allergen.apiField][idx] || 0;
          const level = getPollenLevel(val);
          hourTotalScore += level.score;
          hourMaxScore = Math.max(hourMaxScore, level.score);
        });

        return { idx, time, totalScore: hourTotalScore, maxScore: hourMaxScore };
      });

      // Najít nejlepší 3-hodinové okno pro denní aktivitu (např. mezi 8:00 a 20:00)
      const dayHours = hourlyScores.filter(h => h.time.getHours() >= 8 && h.time.getHours() <= 20);
      let bestWindow = null;
      let lowestWindowScore = Infinity;

      for (let i = 0; i <= dayHours.length - 3; i++) {
        const windowScore = dayHours[i].totalScore + dayHours[i+1].totalScore + dayHours[i+2].totalScore;
        if (windowScore < lowestWindowScore) {
          lowestWindowScore = windowScore;
          bestWindow = {
            start: dayHours[i].time,
            end: dayHours[i+2].time,
            maxRisk: Math.max(dayHours[i].maxScore, dayHours[i+1].maxScore, dayHours[i+2].maxScore)
          };
        }
      }

      // Léky "při potížích", které by se měly zabalit
      const asNeededMeds = (profile.medications || []).filter(m => m.usageType === 'as_needed' || !m.usageType);
      
      const recommendations = [];
      if (bestWindow) {
        if (bestWindow.maxRisk >= 2) {
          recommendations.push("Plánovaný den má vysokou pylovou zátěž i v nejlepší dobu. Zvažte zkrácení pobytu venku nebo vnitřní aktivitu.");
          if (asNeededMeds.length > 0) {
             recommendations.push(`Nezapomeňte s sebou přibalit pohotovostní léky: ${asNeededMeds.map(m => m.name).join(', ')}.`);
          }
        } else if (bestWindow.maxRisk === 1) {
          recommendations.push("V ovzduší bude mírné množství pylových alergenů. Pro běžnou aktivitu by to mělo být v pořádku.");
          if (asNeededMeds.length > 0) {
            recommendations.push("Pro jistotu si přibalte pohotovostní léky do batohu.");
          }
        } else {
          recommendations.push("Ideální podmínky! Zítra nehrozí pro tento profil téměř žádné pylové nebezpečí.");
        }
      }

      return { profile, bestWindow, recommendations, asNeededMeds };
    });

    return { targetDate, profilePlans };
  }, [data, selectedDayOffset, activeProfile, profiles, activeProfileId]);

  if (!plan) return null;

  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-3xl border border-teal-100 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-teal-900">Plánovač výletů</h3>
            <p className="text-xs text-teal-700">Najděte nejlepší čas pro venkovní aktivitu</p>
          </div>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-teal-200 shadow-sm">
          <button 
            onClick={() => setSelectedDayOffset(1)}
            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${selectedDayOffset === 1 ? 'bg-teal-600 text-white' : 'text-teal-600 hover:bg-teal-50'}`}
          >
            Zítra
          </button>
          <button 
            onClick={() => setSelectedDayOffset(2)}
            className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${selectedDayOffset === 2 ? 'bg-teal-600 text-white' : 'text-teal-600 hover:bg-teal-50'}`}
          >
            Pozítří
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-700 pb-2 border-b border-teal-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          Předpověď pro: {format(plan.targetDate, 'eeee, d. MMMM', { locale: cs })}
        </h4>

        {plan.profilePlans.length === 0 && (
          <p className="text-sm text-slate-500 italic">Pro využití plánovače nejprve nastavte sledované pyly.</p>
        )}

        {plan.profilePlans.map((pPlan, idx) => (
          <div key={pPlan.profile.id} className="bg-white rounded-2xl p-4 border border-teal-100/50 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0 border border-slate-100">
                {pPlan.profile.avatarEmoji}
              </span>
              <h5 className="font-bold text-slate-800">{pPlan.profile.name}</h5>
            </div>

            {pPlan.bestWindow ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-100">
                  <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Doporučený čas pro vycházku
                  </p>
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-lg">
                    {format(pPlan.bestWindow.start, 'HH:mm')} 
                    <ArrowRight className="w-4 h-4 text-teal-400" /> 
                    {format(pPlan.bestWindow.end, 'HH:mm')}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${
                      pPlan.bestWindow.maxRisk >= 2 ? 'bg-red-100 text-red-700' :
                      pPlan.bestWindow.maxRisk === 1 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {pPlan.bestWindow.maxRisk >= 2 ? 'Vysoké riziko během okna' :
                       pPlan.bestWindow.maxRisk === 1 ? 'Mírné riziko během okna' :
                       'Ideální podmínky'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 justify-center">
                  {pPlan.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 items-start text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                       {rec.includes('léky') ? <Pill className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                       <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Tento profil zatím nesleduje žádné pylové alergeny.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
