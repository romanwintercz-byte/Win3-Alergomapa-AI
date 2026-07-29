import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../store';
import { X, FileText, Download, TrendingUp, Printer, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { cs } from 'date-fns/locale';
import { ALLERGENS } from '../data/allergens';

interface AllergyReportModalProps {
  onClose: () => void;
}

export const AllergyReportModal: React.FC<AllergyReportModalProps> = ({ onClose }) => {
  const { activeProfile } = useAppContext();
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const reportData = useMemo(() => {
    if (!activeProfile || !activeProfile.diaryEntries) return [];

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    
    return daysInMonth.map(date => {
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
  }, [activeProfile, currentMonth]);

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
        const meds = d.meds.map(medId => {
          const med = activeProfile.medications?.find(m => m.id === medId);
          return med ? med.name : medId;
        }).join(" | ");
        csvContent += `${format(d.date, 'yyyy-MM-dd')},${d.level},"${symptoms}","${meds}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${activeProfile.name}_${format(currentMonth, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMedicationName = (id: string) => {
    const med = activeProfile.medications?.find(m => m.id === id);
    return med ? med.name : id;
  };

  const handlePrint = () => {
    if (window.self !== window.top) {
      setShowPrintWarning(true);
      try {
        window.print();
      } catch (e) {
        console.warn("Print blocked by iframe sandbox.");
      }
    } else {
      window.print();
    }
  };

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:static print:bg-white print:p-0 print:block">
      <div id="printable-report" className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col print:shadow-none print:max-h-none print:overflow-visible print:rounded-none">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Report pro alergologa</h2>
              <p className="text-sm text-slate-500">Pacient: {activeProfile.name} • {format(currentMonth, 'LLLL yyyy', { locale: cs })}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl mr-2">
              <button onClick={handlePrevMonth} className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium px-2 min-w-[100px] text-center capitalize">
                {format(currentMonth, 'LLLL yyyy', { locale: cs })}
              </span>
              <button onClick={handleNextMonth} className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Tisknout do PDF
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors border border-slate-200"
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

        {/* Print-only header */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold mb-4">Výpis z deníku alergika</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold mr-2">Jméno a příjmení:</span>
              {activeProfile.name} {activeProfile.lastName || ''}
            </div>
            <div>
              <span className="font-semibold mr-2">Datum narození:</span>
              {activeProfile.dateOfBirth ? format(parseISO(activeProfile.dateOfBirth), 'd. M. yyyy') : '____________________'}
            </div>
            <div className="col-span-2">
              <span className="font-semibold mr-2">Adresa:</span>
              {activeProfile.address || '________________________________________'}
            </div>
            <div className="col-span-2 mt-2">
              <span className="font-semibold mr-2">Sledované období:</span>
              <span className="capitalize">{format(currentMonth, 'LLLL yyyy', { locale: cs })}</span>
            </div>
          </div>
        </div>

        {showPrintWarning && (
          <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 print:hidden animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Tisk v náhledu může být blokován prohlížečem</p>
              <p>
                Pokud se neotevřelo okno pro tisk, z bezpečnostních důvodů prohlížeče je potřeba aplikaci otevřít v nové záložce (ikonka vpravo nahoře).
              </p>
            </div>
            <button 
              onClick={() => setShowPrintWarning(false)}
              className="ml-auto p-1.5 hover:bg-amber-100 rounded-xl transition-colors h-fit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 md:p-8 flex-1 print:p-0 print:pt-4 print:text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:gap-4 print:mb-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 print:p-3 print:rounded-lg print:border-slate-300">
              <p className="text-sm text-slate-500 font-medium mb-1 print:text-xs">Záznamy</p>
              <p className="text-3xl font-black text-slate-800 print:text-xl">{totalEntries}</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 print:p-3 print:rounded-lg print:border-rose-200 print:bg-rose-50/50">
              <p className="text-sm text-rose-500 font-medium mb-1 print:text-xs">Dny s horšími potížemi</p>
              <p className="text-3xl font-black text-rose-700 print:text-xl">{severeDays}</p>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 print:p-3 print:rounded-lg print:border-indigo-200 print:bg-indigo-50/50">
              <p className="text-sm text-indigo-500 font-medium mb-1 print:text-xs">Nejčastější symptom</p>
              <p className="text-xl font-bold text-indigo-900 mt-2 line-clamp-1 print:text-lg print:mt-1">
                {topSymptoms.length > 0 ? topSymptoms[0][0] : 'Žádná data'}
              </p>
            </div>
          </div>

          <div className="mb-8 print:mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 print:text-base print:mb-2">
               <TrendingUp className="w-5 h-5 text-indigo-500 print:hidden" /> 
               Křivka příznaků v měsíci
             </h3>
             <div className="h-32 flex items-end gap-1 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 print:p-2 print:border-slate-300 print:bg-transparent print:h-24">
               {reportData.map((d, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                   <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 print:hidden">
                     {format(d.date, 'd. MMM', { locale: cs })}: {d.hasEntry ? `Úroveň ${d.level}` : 'Bez záznamu'}
                   </div>
                   <div 
                     className={`w-full rounded-sm transition-all ${
                       !d.hasEntry ? 'bg-transparent border border-dashed border-slate-200 print:border-slate-300' :
                       d.level === 0 ? 'bg-green-300 print:bg-green-400' :
                       d.level === 1 ? 'bg-yellow-400 print:bg-yellow-400' :
                       d.level === 2 ? 'bg-orange-500 print:bg-orange-500' :
                       'bg-red-500 print:bg-red-500'
                     }`}
                     style={{ height: d.hasEntry ? `${Math.max(10, d.level * 30)}%` : '10%' }}
                   ></div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between text-xs text-slate-400 mt-2 px-1 print:text-[10px] print:text-slate-600">
               <span>{format(reportData[0].date, 'd. MMMM', { locale: cs })}</span>
               <span>{format(reportData[reportData.length - 1].date, 'd. MMMM', { locale: cs })}</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4 print:mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 print:text-base print:mb-2">Nejčastější potíže</h3>
              {topSymptoms.length > 0 ? (
                <div className="space-y-3 print:space-y-1">
                  {topSymptoms.map(([symptom, count]) => (
                    <div key={symptom} className="flex items-center justify-between">
                      <span className="text-slate-700 print:text-[11px]">{symptom}</span>
                      <div className="flex items-center gap-3 print:gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden print:w-20 print:border print:border-slate-300">
                          <div 
                            className="h-full bg-indigo-400 rounded-full print:bg-slate-400 print:rounded-none"
                            style={{ width: `${(count / totalEntries) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-500 w-8 text-right print:text-[11px] print:w-6">{count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Zatím nebyly zaznamenány žádné potíže.</p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 print:text-base print:mb-2">Sledované alergeny</h3>
              <div className="flex flex-wrap gap-2 print:gap-1">
                {activeProfile.trackedAllergens.length > 0 ? (
                  activeProfile.trackedAllergens.map(a => {
                    const allergen = ALLERGENS.find(al => al.id === a);
                    return (
                      <span key={a} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium print:px-2 print:py-0.5 print:border print:border-slate-300 print:bg-transparent print:text-[11px]">
                        {allergen ? allergen.name : a}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-slate-500 italic">Profil nesleduje pyly.</span>
                )}
                {activeProfile.customAllergens && activeProfile.customAllergens.map(a => (
                  <span key={a.id} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-medium print:px-2 print:py-0.5 print:border-slate-300 print:text-slate-700 print:bg-transparent print:text-[11px]">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 print:mt-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4 print:text-base print:mb-2">Detailní deník ({format(currentMonth, 'LLLL', { locale: cs })})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm print:text-[10px]">
                <thead>
                  <tr className="border-b-2 border-slate-200 print:border-black">
                    <th className="py-2 font-semibold text-slate-600 print:py-1 print:text-black">Datum</th>
                    <th className="py-2 font-semibold text-slate-600 print:py-1 print:text-black">Úroveň</th>
                    <th className="py-2 font-semibold text-slate-600 print:py-1 print:text-black">Příznaky</th>
                    <th className="py-2 font-semibold text-slate-600 print:py-1 print:text-black">Léky</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.filter(d => d.hasEntry).map(d => (
                    <tr key={d.dateStr} className="border-b border-slate-100 print:border-slate-300">
                      <td className="py-2 pr-4 whitespace-nowrap text-slate-800 font-medium print:py-1">{format(d.date, 'd. M. yyyy')}</td>
                      <td className="py-2 pr-4 print:py-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold print:border print:border-slate-400 print:bg-transparent print:text-[10px] print:px-1 ${
                          d.level === 0 ? 'bg-green-100 text-green-700' :
                          d.level === 1 ? 'bg-yellow-100 text-yellow-700' :
                          d.level === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {d.level === 0 ? 'Žádné' : d.level === 1 ? 'Mírné' : d.level === 2 ? 'Střední' : 'Silné'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600 print:py-1">{d.symptoms.join(', ') || '-'}</td>
                      <td className="py-2 text-slate-600 print:py-1">{d.meds.map(getMedicationName).join(', ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.filter(d => d.hasEntry).length === 0 && (
                <p className="text-slate-500 italic py-4">Žádné záznamy k zobrazení.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
