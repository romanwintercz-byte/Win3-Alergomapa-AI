import React, { useState, useRef } from 'react';
import { useAppContext } from '../store';
import { Camera, Upload, AlertTriangle, ShieldCheck, Loader2, Image as ImageIcon, Barcode, Search } from 'lucide-react';
import { ALLERGENS } from '../data/allergens';

export const FoodScanner: React.FC = () => {
  const { activeProfileId, activeProfile } = useAppContext();
  const [scanMode, setScanMode] = useState<'image' | 'barcode'>('image');
  const [barcode, setBarcode] = useState('');
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
    if ((scanMode === 'image' && !imageSrc) || (scanMode === 'barcode' && !barcode.trim()) || !currentProfile) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      let ingredientsText = '';
      
      // If barcode mode, fetch from Open Food Facts first
      if (scanMode === 'barcode') {
        const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode.trim()}.json`);
        const offData = await offResponse.json();
        
        if (offData.status === 0) {
          throw new Error('Produkt s tímto čárovým kódem nebyl nalezen v databázi Open Food Facts. Zkuste prosím vyfotit složení na obalu.');
        }
        
        const product = offData.product;
        ingredientsText = product.ingredients_text_cs || product.ingredients_text_en || product.ingredients_text || '';
        
        if (!ingredientsText) {
          throw new Error('Produkt byl nalezen, ale v databázi chybí text složení. Zkuste prosím vyfotit zadní stranu obalu.');
        }
      }

      // Gather allergens for prompt
      const trackedNames = currentProfile.trackedAllergens.map(id => {
        const info = ALLERGENS.find(a => a.id === id);
        if (!info) return null;
        const status = currentProfile.allergenStatuses?.[id] || 'suspected';
        let statusText = 'Podezření';
        if (status === 'confirmed') statusText = 'Potvrzeno lékařem';
        if (status === 'monitored') statusText = 'Sledováno (Intolerance, ne anafylaxe)';
        return `${info.name} (${statusText})`;
      }).filter(Boolean);
      const customAllergensWithStatus = currentProfile.customAllergens.map(a => {
        let statusText = 'Podezření';
        if (a.status === 'confirmed') statusText = 'Potvrzeno lékařem';
        if (a.status === 'monitored') statusText = 'Sledováno (Intolerance, ne anafylaxe)';
        return `${a.name} (${statusText})`;
      });
      const allAllergens = [...trackedNames, ...customAllergensWithStatus];
      
      const medications = (currentProfile.medications || []).map(m => m.name);

      if (allAllergens.length === 0 && medications.length === 0) {
        setError("Profil nemá nastavené žádné alergeny ani léky ke kontrole. Přidejte je nejprve v sekci Zdraví.");
        setIsScanning(false);
        return;
      }

      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: scanMode === 'image' ? imageSrc : undefined,
          text: scanMode === 'barcode' ? ingredientsText : undefined,
          allergens: allAllergens,
          medications: medications,
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              {scanMode === 'image' ? <Camera className="w-5 h-5 text-indigo-600" /> : <Barcode className="w-5 h-5 text-indigo-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Skener složení
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Beta verze</span>
              </h2>
              <p className="text-sm text-slate-500">Kontrola pro profil: <span className="font-bold text-slate-700">{currentProfile.avatarEmoji} {currentProfile.name}</span></p>
            </div>
          </div>
          
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start md:self-auto shrink-0 overflow-x-auto w-full md:w-auto hide-scrollbar">
             <button
                onClick={() => setScanMode('image')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${scanMode === 'image' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                Fotografie
             </button>
             <button
                onClick={() => setScanMode('barcode')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${scanMode === 'barcode' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Barcode className="w-3.5 h-3.5 shrink-0" />
                EAN Kód
             </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Tato funkce je aktuálně ve fázi testování. Občas se může objevit chybová hláška z důvodu načítání a kapacity AI. Děkujeme za trpělivost!</p>
        </div>

        <p className="text-slate-600 text-sm mb-6 max-w-2xl">
          {scanMode === 'image' 
            ? 'Vyfoťte zadní stranu obalu se složením potraviny. Umělá inteligence přečte text a porovná ho s alergickým profilem (jak osobní alergeny, tak interakce léků).'
            : 'Zadejte čárový kód (EAN) z obalu potraviny. Složení stáhneme z databáze a umělá inteligence jej porovná s vaším alergickým profilem.'}
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {scanMode === 'image' ? (
              <>
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
              </>
            ) : (
              <div className="w-full h-64 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center shadow-inner">
                <Barcode className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 mb-4">Hledání podle čárového kódu</h3>
                <div className="w-full max-w-xs flex gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Např. 8591234567890"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium shadow-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">Přečtěte EAN kód (čísla pod čárovým kódem) z obalu a vložte jej sem.</p>
              </div>
            )}

            <div className="flex gap-3">
              {((scanMode === 'image' && imageSrc) || (scanMode === 'barcode' && barcode.length > 5)) && !isScanning && !result && (
                <button 
                  onClick={handleScan}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {scanMode === 'image' ? <ImageIcon className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                  Analyzovat {scanMode === 'barcode' ? 'kód' : 'složení'}
                </button>
              )}
              {isScanning && (
                <div className="flex-1 bg-indigo-50 text-indigo-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-indigo-100">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Čtu a analyzuji {scanMode === 'barcode' ? 'data z databáze' : 'etiketu'}...
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
              <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 min-h-[256px]">
                {scanMode === 'image' ? (
                  <>
                    <ShieldCheck className="w-10 h-10 mb-3 text-slate-300" />
                    <h4 className="font-bold text-slate-500 mb-1">Čekám na fotografii</h4>
                    <p className="text-sm max-w-xs">Nahrajte etiketu a já zkontroluji všechny alergeny v profilu.</p>
                  </>
                ) : (
                  <>
                    <Barcode className="w-10 h-10 mb-3 text-slate-300" />
                    <h4 className="font-bold text-slate-500 mb-1">Čekám na EAN kód</h4>
                    <p className="text-sm max-w-xs">Zadejte čárový kód pro načtení složení produktu z databáze.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
