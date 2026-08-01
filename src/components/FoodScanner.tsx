import React, { useState, useRef } from 'react';
import { useAppContext } from '../store';
import { Camera, Upload, AlertTriangle, ShieldCheck, Loader2, Image as ImageIcon } from 'lucide-react';
import { ALLERGENS } from '../data/allergens';

export const FoodScanner: React.FC = () => {
  const { activeProfileId, activeProfile } = useAppContext();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    safe: boolean;
    foundAllergens: string[];
    reasoning: string;
    extractedIngredients: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProfile = activeProfileId === 'all' ? null : activeProfile;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Zmenšení pro optimalizaci a limity payloadu
        const MAX_SIZE = 1200;
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
        
        // Zmenšený base64 (jpeg 0.7 kvalita)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImageSrc(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imageSrc || !currentProfile) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      // Gather allergens for prompt
      const trackedNames = currentProfile.trackedAllergens.map(id => ALLERGENS.find(a => a.id === id)?.name).filter(Boolean);
      const customNames = currentProfile.customAllergens.map(a => a.name);
      const allAllergens = [...trackedNames, ...customNames];

      if (allAllergens.length === 0) {
        setError("Profil nemá nastavené žádné alergeny ke kontrole. Přidejte je nejprve v sekci Alergeny.");
        setIsScanning(false);
        return;
      }

      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageSrc,
          allergens: allAllergens,
          profileName: currentProfile.name
        })
      });

      if (!res.ok) {
        throw new Error('Chyba při skenování. Zkuste to prosím znovu.');
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Došlo k chybě při komunikaci se serverem.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!currentProfile) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-center mt-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Vyberte konkrétní profil</h2>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">
          Pro skenování složení potravin prosím vyberte konkrétního člena rodiny v horní části obrazovky, abychom věděli, vůči kterým alergenům potravinu kontrolovat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Camera className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Skener složení
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Beta verze</span>
            </h2>
            <p className="text-sm text-slate-500">Kontrola pro profil: <span className="font-bold text-slate-700">{currentProfile.avatarEmoji} {currentProfile.name}</span></p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Tato funkce je aktuálně ve fázi testování. Občas se může objevit chybová hláška z důvodu načítání a kapacity AI. Děkujeme za trpělivost!</p>
        </div>

        <p className="text-slate-600 text-sm mb-6 max-w-2xl">
          Vyfoťte zadní stranu obalu se složením potraviny. Umělá inteligence přečte text a porovná ho s alergickým profilem (jak osobní alergeny, tak zkřížené reakce u pylů).
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {!imageSrc ? (
              <div 
                className="w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mb-3 text-slate-400" />
                <p className="font-medium text-slate-700">Nahrát fotku složení</p>
                <p className="text-xs mt-1">Klikněte nebo použijte fotoaparát</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64 flex items-center justify-center">
                <img src={imageSrc} alt="Náhled složení" className="max-h-full max-w-full object-contain" />
                {!isScanning && (
                  <button 
                    onClick={() => { setImageSrc(null); setResult(null); }}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur text-slate-700 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                  >
                    ✕
                  </button>
                )}
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

            <div className="flex gap-3">
              {imageSrc && !isScanning && !result && (
                <button 
                  onClick={handleScan}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  Analyzovat složení
                </button>
              )}
              {isScanning && (
                <div className="flex-1 bg-indigo-50 text-indigo-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-indigo-100">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Čtu a analyzuji etiketu...
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {error && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-sm mb-4 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 mb-2 text-rose-500" />
                {error}
              </div>
            )}

            {result && (
              <div className={`p-6 rounded-2xl border ${result.safe ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} animate-in fade-in slide-in-from-bottom-4 duration-500 h-full`}>
                <div className="flex items-start gap-4 mb-5">
                  {result.safe ? (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200 shadow-sm">
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className={`text-xl font-black ${result.safe ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {result.safe ? 'BEZPEČNÉ' : 'POZOR, RIZIKO!'}
                    </h3>
                    <p className={`text-sm font-medium mt-1 leading-relaxed ${result.safe ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.safe 
                        ? `Nenašli jsme žádný z alergenů pro profil ${currentProfile.name}.`
                        : `Našli jsme alergeny, na které má ${currentProfile.name} alergii.`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {!result.safe && result.foundAllergens.length > 0 && (
                    <div className="bg-white/70 p-4 rounded-xl border border-rose-100 shadow-sm">
                      <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-2">Nalezené alergeny:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.foundAllergens.map((a, i) => (
                          <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-800 text-sm font-bold rounded-lg border border-rose-200">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white/70 p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Odůvodnění:</p>
                    <p className="text-slate-800 text-sm font-medium leading-relaxed">{result.reasoning}</p>
                  </div>

                  {result.extractedIngredients && (
                    <div className="bg-white/70 p-4 rounded-xl border border-slate-100 shadow-sm max-h-32 overflow-y-auto">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Přečtený text z obalu:</p>
                      <p className="text-slate-600 italic text-xs leading-relaxed">{result.extractedIngredients}</p>
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-center mt-5 text-slate-400 font-medium bg-white/50 py-2 px-3 rounded-lg">
                  Umělá inteligence může dělat chyby. Výsledek berte orientačně a složení pro jistotu zkontrolujte i sami.
                </p>
              </div>
            )}

            {!result && !error && !isScanning && (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50">
                <ShieldCheck className="w-10 h-10 mb-3 text-slate-300" />
                <h4 className="font-bold text-slate-500 mb-1">Čekám na fotografii</h4>
                <p className="text-sm max-w-xs">Nahrajte etiketu a já zkontroluji všechny alergeny v profilu.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
