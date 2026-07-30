import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { AirQualityData } from '../types';
import { ALLERGENS, getPollenLevel } from '../data/allergens';
import { BellRing, ShieldAlert, Pill, Wind, Lightbulb, CheckCircle2 } from 'lucide-react';

interface SmartAlertsProps {
  data: AirQualityData;
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ data }) => {
  const { activeProfile, profiles, activeProfileId } = useAppContext();

  const alerts = useMemo(() => {
    if (!data) return [];
    const newAlerts = [];

    // Pokud je vybrána celá rodina, ukážeme jen nejdůležitější varování pro všechny
    const profilesToCheck = activeProfileId === 'all' ? profiles : (activeProfile ? [activeProfile] : []);

    profilesToCheck.forEach(profile => {
      // 1. Zkontrolovat pyly
      const highPollens = profile.trackedAllergens.map(id => {
        const allergen = ALLERGENS.find(a => a.id === id);
        if (!allergen) return null;
        const val = data.current[allergen.apiField] as number || 0;
        const level = getPollenLevel(val);
        return { allergen, level };
      }).filter(Boolean) as { allergen: typeof ALLERGENS[0], level: ReturnType<typeof getPollenLevel> }[];

      const severePollens = highPollens.filter(p => p.level.score >= 2);
      
      if (severePollens.length > 0) {
        newAlerts.push({
          type: 'danger',
          icon: <ShieldAlert className="w-5 h-5" />,
          title: activeProfileId === 'all' ? `Vysoké riziko (${profile.name})` : 'Vysoké riziko',
          message: `Dnes je vysoká koncentrace: ${severePollens.map(p => p.allergen.name).join(', ')}. Doporučujeme omezit pobyt venku a nevětrat.`,
          profileId: profile.id
        });
      }

      // 2. Připomenutí léků (jen pokud je vybrán konkrétní profil)
      if (activeProfileId !== 'all') {
        const regularMeds = profile.medications?.filter(m => m.usageType === 'regular') || [];
        if (regularMeds.length > 0 && severePollens.length > 0) {
          newAlerts.push({
            type: 'medication',
            icon: <Pill className="w-5 h-5" />,
            title: 'Nezapomeňte na léky',
            message: `Kvůli vysoké pylové zátěži si nezapomeňte vzít své pravidelné léky: ${regularMeds.map(m => m.name).join(', ')}.`,
            profileId: profile.id
          });
        }
      }
    });

    // 3. Obecné rady podle AQI
    if (activeProfileId !== 'all') {
      if (data.current.european_aqi > 60) {
         newAlerts.push({
            type: 'warning',
            icon: <Wind className="w-5 h-5" />,
            title: 'Zhoršená kvalita ovzduší',
            message: 'Celková kvalita ovzduší (smog, prach) je dnes horší. To může zhoršit alergické příznaky.'
         });
      } else if (newAlerts.length === 0) {
         newAlerts.push({
            type: 'success',
            icon: <CheckCircle2 className="w-5 h-5" />,
            title: 'Skvělý den',
            message: 'Dnes nejsou v ovzduší žádné vaše alergeny. Užijte si pobyt venku!'
         });
      }
    }

    return newAlerts;
  }, [data, activeProfile, profiles, activeProfileId]);

  if (alerts.length === 0 && activeProfileId === 'all') return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <BellRing className="w-5 h-5 text-indigo-500" /> Osobní upozornění
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-2xl border flex gap-4 ${
              alert.type === 'danger' ? 'bg-red-50 border-red-100 text-red-800' :
              alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
              alert.type === 'medication' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              'bg-green-50 border-green-100 text-green-800'
            }`}
          >
            <div className={`mt-0.5 ${
              alert.type === 'danger' ? 'text-red-500' :
              alert.type === 'warning' ? 'text-amber-500' :
              alert.type === 'medication' ? 'text-emerald-500' :
              'text-green-500'
            }`}>
              {alert.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
              <p className={`text-xs ${
                alert.type === 'danger' ? 'text-red-700' :
                alert.type === 'warning' ? 'text-amber-700' :
                alert.type === 'medication' ? 'text-emerald-700' :
                'text-green-700'
              } leading-relaxed`}>
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
