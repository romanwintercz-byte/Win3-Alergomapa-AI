import React, { useState, useRef } from 'react';
import { useAppContext } from '../store';
import { Camera, Image as ImageIcon, Plus, Trash2, Clock, AlertTriangle } from 'lucide-react';

export const SkinTracker: React.FC = () => {
  const { activeProfileId, activeProfile, updateProfile } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProfile = activeProfileId === 'all' ? null : activeProfile;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Compress image to save local storage (max 600px width/height)
        const MAX_SIZE = 600;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Quality 0.5 to keep size small (~20-40kb per image)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
        setPhotoDataUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!currentProfile || !photoDataUrl) return;

    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      image: photoDataUrl,
      note: note.trim()
    };

    const existingEntries = currentProfile.skinDiaryEntries || [];
    
    updateProfile(currentProfile.id, {
      skinDiaryEntries: [newEntry, ...existingEntries]
    });

    setIsAdding(false);
    setPhotoDataUrl(null);
    setNote('');
  };

  const handleDelete = (entryId: string) => {
    if (!currentProfile || !currentProfile.skinDiaryEntries) return;

    if (window.confirm('Opravdu chcete smazat tento záznam?')) {
      updateProfile(currentProfile.id, {
        skinDiaryEntries: currentProfile.skinDiaryEntries.filter(e => e.id !== entryId)
      });
    }
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setPhotoDataUrl(null);
    setNote('');
  };

  if (!currentProfile) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-center mt-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Vyberte konkrétní profil</h2>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">
          Pro sledování vývoje kůže prosím vyberte konkrétního člena rodiny v horní části obrazovky.
        </p>
      </div>
    );
  }

  const entries = currentProfile.skinDiaryEntries || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Sledování kůže a ekzémů
              </h2>
              <p className="text-sm text-slate-500">Deník pro: <span className="font-bold text-slate-700">{currentProfile.avatarEmoji} {currentProfile.name}</span></p>
            </div>
          </div>
          
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-pink-200"
            >
              <Plus className="w-4 h-4" />
              Přidat záznam
            </button>
          )}
        </div>

        <p className="text-slate-600 text-sm mb-8 max-w-3xl">
          Zaznamenejte si vývoj zarudnutí, vyrážky nebo ekzému v průběhu dne. Můžete přidat fotku, čas a poznámku, např. jak kůže reaguje po promazání léčebnou mastí nebo po koupeli. Fotografie zůstávají uloženy pouze ve vašem zařízení.
        </p>

        {isAdding && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-500" />
              Nový záznam
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                {!photoDataUrl ? (
                  <div 
                    className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-pink-300 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="font-medium text-slate-700">Vyfotit kůži</p>
                    <p className="text-xs mt-1 text-slate-400">Nebo vybrat z galerie</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black h-48 flex items-center justify-center">
                    <img src={photoDataUrl} alt="Náhled kůže" className="max-h-full max-w-full object-contain" />
                    <button 
                      onClick={() => setPhotoDataUrl(null)}
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur text-slate-700 p-1.5 rounded-full shadow-sm hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Poznámka, léčba, stav</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Např. 30 minut po namazání kortikoidy, kůže je méně červená, ale stále svědí..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white resize-none text-sm"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={cancelAdding}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors text-sm"
                  >
                    Zrušit
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!photoDataUrl}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-pink-600 hover:bg-pink-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-pink-200"
                  >
                    Uložit záznam
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {entries.length === 0 ? (
            !isAdding && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-600 mb-1">Žádné záznamy</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Zatím jste nepřidali žádné fotografie. Přidejte první záznam pro sledování vývoje.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-6 bg-white border border-slate-200 text-slate-700 hover:border-pink-300 hover:text-pink-600 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                >
                  Přidat první fotku
                </button>
              </div>
            )
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[27px] md:left-[39px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full" />
              
              <div className="space-y-8">
                {entries.map((entry) => {
                  const date = new Date(entry.timestamp);
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  return (
                    <div key={entry.id} className="relative flex gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 w-14 h-14 md:w-20 md:h-20 shrink-0 bg-white rounded-full border-4 border-slate-50 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">
                          {isToday ? 'Dnes' : date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-xs md:text-sm font-black text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-pink-500" />
                          {date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Content Card */}
                      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-48 h-48 md:h-32 shrink-0 bg-black rounded-xl overflow-hidden cursor-pointer">
                          <img src={entry.image} alt="Záznam kůže" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                            {entry.note || <span className="text-slate-400 italic">Bez poznámky</span>}
                          </p>
                          
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={() => handleDelete(entry.id)}
                              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Smazat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
