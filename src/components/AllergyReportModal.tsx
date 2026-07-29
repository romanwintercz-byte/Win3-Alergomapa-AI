import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { X, FileText, Download, TrendingUp, Printer } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import { ALLERGENS } from '../data/allergens';

interface AllergyReportModalProps {
  onClose: () => void;
}

export const AllergyReportModal: React.FC<AllergyReportModalProps> = ({ onClose }) => {
  const { activeProfile } = useAppContext();

  const reportData = useMemo(() => {
    if (!activeProfile || !activeProfile.diaryEntries) return [];

    const today = new Date();
    const last30Days = Array.from({ length: 30 }).map((_, i) => subDays(today, 29 - i));
    
    return last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = activeProfile.diaryEntries!.find(e => e.date === dateStr);
      
      return {
        date,
        dateStr,
        level: entry ? entry.symptomLevel : 0,
        symptoms: entry ? entry.symptoms : [],
        meds: entry ? entry.medicationsTaken : [],
        hasEntry: !!entry
      };
    });
  }, [activeProfile]);

  if (!activeProfile) return null;

  const totalEntries = reportData.filter(d => d.hasEntry).length;
  const severeDays = reportData.filter(d => d.level >= 2).length;
  
  // Basic counter for symptoms
  const symptomCounts: Record<string, number> = {};
  reportData.forEach(d => {
    d.symptoms.forEach(s => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const downloadCSV = () => {
    let csvContent = "Datum,Uroven_Priznaku,Priznaky,Leky\n";
    
    reportData.forEach(d => {
      if (d.hasEntry) {
        const symptoms = d.symptoms.join(" | ");
        const meds = d.meds.join(" | ");
        csvContent += `${format(d.date, 'yyyy-MM-dd')},${d.level},"${symptoms}","${meds}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${activeProfile.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Report pro alergologa</h2>
              <p className="text-sm text-slate-500">Pacient: {activeProfile.name} • Posledních 30 dní</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors border border-slate-200"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Tisknout
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-medium text-sm transition-colors border border-indigo-100"
              onClick={downloadCSV}
            >
              <Download className="w-4 h-4" />
              Stáhnout CSV
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-sm text-slate-500 font-medium mb-1">Záznamy za 30 dní</p>
              <p className="text-3xl font-black text-slate-800">{totalEntries}</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
              <p className="text-sm text-rose-500 font-medium mb-1">Dny s horšími potížemi</p>
              <p className="text-3xl font-black text-rose-700">{severeDays}</p>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <p className="text-sm text-indigo-500 font-medium mb-1">Nejčastější symptom</p>
              <p className="text-xl font-bold text-indigo-900 mt-2 line-clamp-1">
                {topSymptoms.length > 0 ? topSymptoms[0][0] : 'Žádná data'}
              </p>
            </div>
          </div>

          <div className="mb-10">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
               <TrendingUp className="w-5 h-5 text-indigo-500" /> 
               Křivka příznaků (30 dní)
             </h3>
             <div className="h-40 flex items-end gap-1 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
               {reportData.map((d, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                   <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                     {format(d.date, 'd. MMM', { locale: cs })}: {d.hasEntry ? `Úroveň ${d.level}` : 'Bez záznamu'}
                   </div>
                   <div 
                     className={`w-full rounded-sm transition-all ${
                       !d.hasEntry ? 'bg-transparent border border-dashed border-slate-200' :
                       d.level === 0 ? 'bg-green-300' :
                       d.level === 1 ? 'bg-yellow-400' :
                       d.level === 2 ? 'bg-orange-500' :
                       'bg-red-500'
                     }`}
                     style={{ height: d.hasEntry ? `${Math.max(10, d.level * 30)}%` : '10%' }}
                   ></div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
               <span>{format(reportData[0].date, 'd. MMMM', { locale: cs })}</span>
               <span>Dnes</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Nejčastější potíže</h3>
              {topSymptoms.length > 0 ? (
                <div className="space-y-3">
                  {topSymptoms.map(([symptom, count]) => (
                    <div key={symptom} className="flex items-center justify-between">
                      <span className="text-slate-700">{symptom}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-400 rounded-full"
                            style={{ width: `${(count / totalEntries) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-500 w-8 text-right">{count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Zatím nebyly zaznamenány žádné potíže.</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Sledované alergeny</h3>
              <div className="flex flex-wrap gap-2">
                {activeProfile.trackedAllergens.length > 0 ? (
                  activeProfile.trackedAllergens.map(a => {
                    const allergen = ALLERGENS.find(al => al.id === a);
                    return (
                      <span key={a} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {allergen ? allergen.name : a}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-slate-500 italic">Profil nesleduje pyly.</span>
                )}
                {activeProfile.customAllergens && activeProfile.customAllergens.map(a => (
                  <span key={a.id} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
