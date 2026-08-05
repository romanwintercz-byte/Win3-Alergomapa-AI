import React, { useState } from 'react';
import { useAppContext } from '../store';
import { DiaryEntry, Medication } from '../types';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { AllergyReportModal } from "./AllergyReportModal.tsx";
import { Plus, Pill, Save, Calendar, Activity, X, ChevronLeft, ChevronRight, Stethoscope, Book, Image as ImageIcon } from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Kýchání', 'Rýma (vodnatá)', 'Ucpaný nos', 'Svědění očí', 
  'Zarudlé oči', 'Slzení očí', 'Svědění v krku/na patře', 
  'Kašel', 'Dušnost', 'Pískání na hrudi', 'Únava', 'Bolest hlavy',
  'Svědění kůže', 'Vyrážka / Kopřivka', 'Zhoršení ekzému'
];

export const SymptomDiary: React.FC = () => {
  const { activeProfileId, activeProfile, updateProfile } = useAppContext();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [level, setLevel] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medsTaken, setMedsTaken] = useState<string[]>([]);
  const [note, setNote] = useState('');
  
  // Medications manager
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMedsManager, setShowMedsManager] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [newMedName, setNewMedName] = useState('');
  const [newMedType, setNewMedType] = useState<'pill' | 'spray' | 'drops' | 'other'>('pill');
  const [newMedUsageType, setNewMedUsageType] = useState<'regular' | 'as_needed'>('regular');

  if (activeProfileId === 'all' || !activeProfile) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
          <Book className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Vyberte člena rodiny</h2>
        <p className="text-slate-500 max-w-md">
          Deník příznaků a léků je osobní pro každého člena. Vyberte konkrétní profil v horní liště pro zobrazení jeho deníku.
        </p>
      </div>
    );
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const existingEntry = activeProfile.diaryEntries?.find(e => e.date === dateStr);
  const skinEntriesForDate = (activeProfile.skinDiaryEntries || []).filter(e => {
    return format(new Date(e.timestamp), 'yyyy-MM-dd') === dateStr;
  });
  const userMeds = activeProfile.medications || [];

  const handleDateChange = (days: number) => {
    setSelectedDate(prev => addDays(prev, days));
    setIsEditing(false); // Reset form when changing date
  };

  const startEditing = () => {
    if (existingEntry) {
      setLevel(existingEntry.symptomLevel);
      setSymptoms(existingEntry.symptoms || []);
      setMedsTaken(existingEntry.medicationsTaken || []);
      setNote(existingEntry.note || '');
    } else {
      setLevel(0);
      setSymptoms([]);
      
      // Auto-select regular medications for a new entry
      const regularMeds = userMeds.filter(m => m.usageType === 'regular').map(m => m.id);
      setMedsTaken(regularMeds);
      
      setNote('');
    }
    setIsEditing(true);
  };

  const saveEntry = () => {
    const newEntry: DiaryEntry = {
      id: existingEntry?.id || Date.now().toString(),
      date: dateStr,
      symptomLevel: level,
      symptoms,
      medicationsTaken: medsTaken,
      note
    };
    
    let updatedEntries = [...(activeProfile.diaryEntries || [])];
    if (existingEntry) {
      updatedEntries = updatedEntries.map(e => e.date === dateStr ? newEntry : e);
    } else {
      updatedEntries.push(newEntry);
    }
    
    updateProfile(activeProfile.id, { diaryEntries: updatedEntries });
    setIsEditing(false);
  };

  const toggleSymptom = (symp: string) => {
    setSymptoms(prev => prev.includes(symp) ? prev.filter(s => s !== symp) : [...prev, symp]);
  };

  const toggleMed = (medId: string) => {
    setMedsTaken(prev => prev.includes(medId) ? prev.filter(m => m !== medId) : [...prev, medId]);
  };

  const addMedication = () => {
    if (!newMedName.trim()) return;
    const med: Medication = {
      id: Date.now().toString(),
      name: newMedName.trim(),
      type: newMedType,
      usageType: newMedUsageType
    };
    updateProfile(activeProfile.id, { medications: [...userMeds, med] });
    setNewMedName('');
    setNewMedType('pill');
    setNewMedUsageType('regular');
  };

  const removeMedication = (id: string) => {
    updateProfile(activeProfile.id, { medications: userMeds.filter(m => m.id !== id) });
    // Also remove from medsTaken if currently selected
    setMedsTaken(prev => prev.filter(m => m !== id));
  };

  const getLevelLabel = (lvl: number) => {
    switch (lvl) {
      case 0: return 'Žádné';
      case 1: return 'Mírné';
      case 2: return 'Střední';
      case 3: return 'Silné';
      default: return '';
    }
  };
  
  const getLevelColor = (lvl: number) => {
    switch (lvl) {
      case 0: return 'bg-green-100 text-green-700 border-green-200';
      case 1: return 'bg-blue-100 text-blue-700 border-blue-200';
      case 2: return 'bg-amber-100 text-amber-700 border-amber-200';
      case 3: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Deník: {activeProfile.name}</h2>
            <p className="text-sm text-slate-500">Sledujte příznaky a užité léky</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-colors border border-indigo-100"
          >
            <Stethoscope className="w-4 h-4" /> Report pro lékaře
          </button>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
            <button 
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1 font-semibold text-slate-700 min-w-[140px] text-center">
              {isSameDay(selectedDate, new Date()) ? 'Dnes' : format(selectedDate, 'd. MMMM', { locale: cs })}
            </div>
            <button 
              onClick={() => handleDateChange(1)}
              disabled={isSameDay(selectedDate, new Date())} // prevent future dates
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Zápis pro {format(selectedDate, 'd. M. yyyy', { locale: cs })}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-8">
            {/* Symptom Level */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Jak se dnes cítíte? (Intenzita příznaků)</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`flex-1 py-3 px-2 rounded-xl border text-sm font-semibold transition-all ${
                      level === lvl 
                        ? `${getLevelColor(lvl)} ring-2 ring-offset-2 ring-indigo-500/30 shadow-sm` 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {getLevelLabel(lvl)}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Selection (only if level > 0) */}
            {level > 0 && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Zaškrtněte příznaky:</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(symp => (
                    <button
                      key={symp}
                      onClick={() => toggleSymptom(symp)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        symptoms.includes(symp)
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {symp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Medications Taken */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700">Užité léky:</label>
                <button 
                  onClick={() => setShowMedsManager(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg"
                >
                  <Stethoscope className="w-3 h-3" /> Spravovat léky
                </button>
              </div>
              
              {userMeds.length > 0 ? (
                <div className="space-y-4">
                  {userMeds.some(m => m.usageType === 'regular') && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Pravidelné léky</p>
                      <div className="flex flex-wrap gap-2">
                        {userMeds.filter(m => m.usageType === 'regular').map(med => (
                          <button
                            key={med.id}
                            onClick={() => toggleMed(med.id)}
                            className={`px-3 py-1.5 rounded-xl text-sm border flex items-center gap-2 transition-colors ${
                              medsTaken.includes(med.id)
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                            }`}
                          >
                            <Pill className="w-3.5 h-3.5" />
                            {med.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {userMeds.some(m => m.usageType === 'as_needed' || !m.usageType) && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Při potížích</p>
                      <div className="flex flex-wrap gap-2">
                        {userMeds.filter(m => m.usageType === 'as_needed' || !m.usageType).map(med => (
                          <button
                            key={med.id}
                            onClick={() => toggleMed(med.id)}
                            className={`px-3 py-1.5 rounded-xl text-sm border flex items-center gap-2 transition-colors ${
                              medsTaken.includes(med.id)
                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                            }`}
                          >
                            <Pill className="w-3.5 h-3.5" />
                            {med.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center text-sm text-slate-500">
                  Nemáte přidány žádné léky. <button onClick={() => setShowMedsManager(true)} className="text-indigo-600 font-semibold hover:underline">Přidat lék</button>
                </div>
              )}
            </div>
            
            {/* Note */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Poznámka (volitelné):</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Např. zhoršení odpoledne po procházce..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                rows={3}
              />
            </div>

            {/* Skin entries for this date in edit mode */}
            {skinEntriesForDate.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  Fotografie kůže z tohoto dne ({skinEntriesForDate.length})
                </h4>
                <div className="flex flex-wrap gap-4">
                  {skinEntriesForDate.map(entry => {
                    const entryDate = new Date(entry.timestamp);
                    return (
                      <div 
                        key={entry.id} 
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black w-24 h-24 md:w-32 md:h-32 shrink-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setFullscreenImage(entry.image)}
                      >
                        <img src={entry.image} alt="Kůže" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-[10px] font-bold shadow-sm">
                            {entryDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={saveEntry}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
              >
                <Save className="w-4 h-4" /> Uložit zápis
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm animate-in fade-in">
          {existingEntry ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Záznam dne</h3>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getLevelColor(existingEntry.symptomLevel)}`}>
                    <Activity className="w-3.5 h-3.5" /> {getLevelLabel(existingEntry.symptomLevel)} příznaky
                  </div>
                </div>
                <button
                  onClick={startEditing}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors"
                >
                  Upravit
                </button>
              </div>

              {existingEntry.symptomLevel > 0 && existingEntry.symptoms.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zaznamenané příznaky</h4>
                  <div className="flex flex-wrap gap-2">
                    {existingEntry.symptoms.map(s => (
                      <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {existingEntry.medicationsTaken.length > 0 && (
                <div className="mb-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Užité léky</h4>
                  
                  {(() => {
                    const takenMeds = existingEntry.medicationsTaken
                      .map(id => userMeds.find(m => m.id === id))
                      .filter((m): m is Medication => m !== undefined);
                    
                    const regularMeds = takenMeds.filter(m => m.usageType === 'regular');
                    const asNeededMeds = takenMeds.filter(m => m.usageType === 'as_needed' || !m.usageType);

                    return (
                      <>
                        {regularMeds.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Pravidelné</p>
                            <div className="flex flex-wrap gap-2">
                              {regularMeds.map(med => (
                                <span key={med.id} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                  <Pill className="w-3 h-3" /> {med.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {asNeededMeds.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Při potížích</p>
                            <div className="flex flex-wrap gap-2">
                              {asNeededMeds.map(med => (
                                <span key={med.id} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 flex items-center gap-1.5 shadow-sm">
                                  <Pill className="w-3 h-3" /> {med.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {existingEntry.note && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Poznámka</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{existingEntry.note}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-4">Pro tento den nemáte žádný záznam příznaků.</p>
              <button
                onClick={startEditing}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
              >
                Přidat záznam
              </button>
            </div>
          )}

          {/* Skin entries for this date */}
          {skinEntriesForDate.length > 0 && (
            <div className={`mt-8 ${existingEntry ? 'pt-8 border-t border-slate-100' : ''}`}>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                Fotografie kůže ({skinEntriesForDate.length})
              </h4>
              <div className="flex flex-wrap gap-4">
                {skinEntriesForDate.map(entry => {
                  const entryDate = new Date(entry.timestamp);
                  return (
                    <div 
                      key={entry.id} 
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black w-32 h-32 md:w-40 md:h-40 shrink-0 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setFullscreenImage(entry.image)}
                    >
                      <img src={entry.image} alt="Kůže" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold shadow-sm">
                          {entryDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {entry.note && (
                          <span className="text-white/80 text-[10px] truncate shadow-sm">
                            {entry.note}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medications Manager Modal */}
      {showMedsManager && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" /> Moje léky
              </h3>
              <button onClick={() => setShowMedsManager(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <div className="mb-6 space-y-2">
                {userMeds.length > 0 ? userMeds.map(med => (
                  <div key={med.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center border ${med.usageType === 'regular' ? 'border-emerald-200 text-emerald-500' : 'border-amber-200 text-amber-500'} shadow-sm`}>
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                          {med.name}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${med.usageType === 'regular' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {med.usageType === 'regular' ? 'Pravidelně' : 'Při potížích'}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{med.type === 'pill' ? 'Prášek' : med.type === 'spray' ? 'Sprej' : med.type === 'drops' ? 'Kapky' : 'Jiné'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeMedication(med.id)}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">Seznam léků je prázdný.</p>
                )}
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">Přidat nový lék</h4>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMedName}
                      onChange={e => setNewMedName(e.target.value)}
                      placeholder="Název léku (např. Zodac)"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select 
                      value={newMedType}
                      onChange={e => setNewMedType(e.target.value as any)}
                      className="w-[100px] px-2 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pill">Prášek</option>
                      <option value="spray">Sprej</option>
                      <option value="drops">Kapky</option>
                      <option value="other">Jiné</option>
                    </select>
                  </div>
                  
                  <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => setNewMedUsageType('regular')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newMedUsageType === 'regular' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Pravidelně
                    </button>
                    <button
                      onClick={() => setNewMedUsageType('as_needed')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newMedUsageType === 'as_needed' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Při potížích
                    </button>
                  </div>
                </div>
                <button
                  onClick={addMedication}
                  disabled={!newMedName.trim()}
                  className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Přidat do seznamu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showReportModal && (
        <AllergyReportModal onClose={() => setShowReportModal(false)} />
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Kůže detail" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
