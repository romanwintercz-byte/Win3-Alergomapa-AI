import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { ALLERGENS } from '../data/allergens';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { HeartPulse } from 'lucide-react';

export const VisualAllergyProfile: React.FC = () => {
  const { activeProfileId, activeProfile } = useAppContext();

  if (activeProfileId === 'all' || !activeProfile) {
    return null; 
  }

  const { trackedAllergens, customAllergens, bloodTestResults, name, avatarEmoji } = activeProfile;

  const chartData = useMemo(() => {
    if (!bloodTestResults) return [];

    const data = [];

    // Pyly
    trackedAllergens.forEach(allergenId => {
      const info = ALLERGENS.find(a => a.id === allergenId);
      if (info) {
        data.push({
          subject: info.name,
          A: bloodTestResults[allergenId] || 0,
          fullMark: 6,
        });
      }
    });

    // Ostatní alergeny
    customAllergens.forEach(ca => {
      data.push({
        subject: ca.name,
        A: bloodTestResults[ca.id] || 0,
        fullMark: 6,
      });
    });

    return data;
  }, [trackedAllergens, customAllergens, bloodTestResults]);

  if (chartData.length === 0 || chartData.every(d => d.A === 0)) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          Vizuální profil alergika
        </h3>
        <p className="text-sm text-slate-500">
          Zatím nemáte vyplněné výsledky z krve (IgE protilátky) pro profil {name} {avatarEmoji}. Můžete je doplnit v úpravě profilu v sekci Výsledky z krve, abyste aktivovali graf alergického profilu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            Vizuální profil alergika
          </h3>
          <p className="text-sm text-slate-500">
            Intenzita alergických reakcí podle krevních testů (třídy 0-6)
          </p>
        </div>
        <div className="text-sm px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-full self-start sm:self-auto">
          {avatarEmoji} {name}
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 6]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={7} />
            <Radar name="Síla alergie (IgE)" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#e11d48', fontWeight: 'bold' }}
              labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '4px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
