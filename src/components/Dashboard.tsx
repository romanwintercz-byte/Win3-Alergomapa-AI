import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { fetchAirQuality } from '../api/openmeteo';
import { AirQualityData } from '../types';
import { LocationSearch } from '../components/LocationSearch';
import { ProfileSelector } from '../components/ProfileSelector';
import { AqiWidget } from '../components/AqiWidget';
import { CurrentStatus } from '../components/CurrentStatus';
import { PollenChart } from '../components/PollenChart';
import { PersonalAllergens } from '../components/PersonalAllergens';
import { ChatAssistant } from '../components/ChatAssistant';
import { SymptomDiary } from '../components/SymptomDiary';
import { CloudRain, Loader2, MapPin, Activity, Book } from 'lucide-react';

type Tab = 'overview' | 'diary';

export const Dashboard: React.FC = () => {
  const { currentLocation, activeProfileId } = useAppContext();
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!currentLocation) return;
      
      setLoading(true);
      setError(null);
      
      const result = await fetchAirQuality(currentLocation.latitude, currentLocation.longitude);
      
      if (!isMounted) return;
      
      if (result) {
        setData(result);
      } else {
        setError("Nepodařilo se načíst data o ovzduší. Zkuste to prosím později.");
      }
      setLoading(false);
    };

    loadData();
    
    return () => { isMounted = false; };
  }, [currentLocation]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
              <CloudRain className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-br from-indigo-900 to-indigo-600">
              AlergoMapa
            </h1>
          </div>
          
          <div className="flex-1 flex justify-end">
            <LocationSearch />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        {currentLocation && (
          <div className="mb-6 flex items-center gap-2 text-indigo-600 bg-indigo-50 w-fit px-4 py-2 rounded-full font-medium text-xs">
            <MapPin className="w-4 h-4" />
            <span>{currentLocation.name}{currentLocation.country ? `, ${currentLocation.country}` : ''}</span>
          </div>
        )}

        {/* Profile Selector */}
        <ProfileSelector />

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 overflow-x-auto snap-x hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 snap-center flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            Přehled
          </button>
          <button
            onClick={() => setActiveTab('diary')}
            className={`flex-1 snap-center flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'diary'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Book className="w-4 h-4" />
            Deník
          </button>
        </div>

        {activeTab === 'diary' ? (
          <SymptomDiary />
        ) : (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="font-medium text-lg text-slate-600">Analyzuji kvalitu ovzduší...</p>
                <p className="text-sm">Stahuji meteorologická a pylová data pro lokalitu</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center">
                <p className="font-medium">{error}</p>
              </div>
            ) : data ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <AqiWidget data={data} />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-8" />
                <CurrentStatus data={data} />
                <PersonalAllergens data={data} />
                <PollenChart data={data} />
              </div>
            ) : null}
          </>
        )}
      </main>
      
      <ChatAssistant data={data} />
    </div>
  );
};
