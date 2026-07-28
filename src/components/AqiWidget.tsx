import React, { useMemo } from 'react';
import { AirQualityData } from '../types';
import { getAqiStatus } from '../data/allergens';
import { Wind, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const AqiWidget: React.FC<{ data: AirQualityData }> = ({ data }) => {
  const currentAqi = data.current.european_aqi;
  const status = getAqiStatus(currentAqi);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
            currentAqi <= 40 ? "bg-green-100 text-green-600" :
            currentAqi <= 80 ? "bg-yellow-100 text-yellow-600" :
            currentAqi <= 100 ? "bg-orange-100 text-orange-600" :
            "bg-red-100 text-red-600"
          )}>
            <Wind className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-slate-500 text-sm font-medium mb-1">Kvalita ovzduší a Smog (AQI)</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-800">{currentAqi}</span>
              <span className={cn("text-lg font-bold", status.color)}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <div className="bg-white/60 backdrop-blur px-5 py-4 rounded-2xl border border-slate-200/50 flex gap-3">
            {currentAqi <= 40 ? (
              <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className={cn("w-5 h-5 shrink-0 mt-0.5", status.color)} />
            )}
            <p className="text-sm text-slate-700 leading-relaxed">
              {status.advice}
            </p>
          </div>
          {currentAqi > 40 && (
            <div className="bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 flex gap-3">
               <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-xs text-amber-800 leading-relaxed">
                 <strong className="font-semibold block mb-0.5">Zhoršený smog a pyl</strong>
                 Prachové částice ze smogu se vážou na pylová zrna a rozbíjí je na menší kousky. Pylový alergen pak snadněji proniká hlouběji do plic, což <strong>zvyšuje riziko alergické reakce a astmatu i při nižší koncentraci pylu v ovzduší</strong>.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
