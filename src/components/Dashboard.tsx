import React, { useEffect, useState } from 'react';
import { useAppContext } from '../store';
import { fetchAirQuality } from '../api/openmeteo';
import { AirQualityData } from '../types';
import { LocationSearch } from './LocationSearch';
import { ProfileSelector } from './ProfileSelector';
import { MorningSummary } from "./MorningSummary.tsx";
import { AqiWidget } from './AqiWidget';
import { CurrentStatus } from './CurrentStatus';
import { PollenChart } from './PollenChart';
import { PersonalAllergens } from './PersonalAllergens';
import { ChatAssistant } from './ChatAssistant';
import { SymptomDiary } from './SymptomDiary';
import { SmartAlerts } from './SmartAlerts';
import { TripPlanner } from './TripPlanner';
import { CloudRain, Loader2, MapPin, Activity, Book, Bug, Map } from 'lucide-react';

type Tab = 'overview' | 'allergens' | 'diary' | 'planner';

export const Dashboard: React.FC = () => {
  const { currentLocation, activeProfileId } = useAppContext();
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12 font-sans selection:bg-indigo-100">
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

        {/* Tabs Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-none md:sticky md:top-20 md:z-30 md:bg-slate-50/95 md:backdrop-blur-xl md:border-none pb-[env(safe-area-inset-bottom)] md:pb-0 mb-0 md:mb-8 md:pt-4 md:-mx-2 md:px-2 transition-all">
          <div className="flex md:bg-slate-100 md:p-1 md:rounded-2xl overflow-x-auto hide-scrollbar gap-1 md:gap-0 justify-around md:justify-start">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3 md:px-6 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all md:min-w-[120px] ${
                activeTab === 'overview'
                  ? 'text-indigo-600 bg-indigo-50/50 md:bg-white md:shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 md:hover:bg-transparent'
              }`}
            >
              <Activity className="w-6 h-6 md:w-4 md:h-4" />
              <span>Přehled</span>
            </button>
            <button
              onClick={() => handleTabChange('allergens')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3 md:px-6 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all md:min-w-[120px] ${
                activeTab === 'allergens'
                  ? 'text-indigo-600 bg-indigo-50/50 md:bg-white md:shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 md:hover:bg-transparent'
              }`}
            >
              <Bug className="w-6 h-6 md:w-4 md:h-4" />
              <span>Alergeny</span>
            </button>
            <button
              onClick={() => handleTabChange('diary')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3 md:px-6 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all md:min-w-[120px] ${
                activeTab === 'diary'
                  ? 'text-indigo-600 bg-indigo-50/50 md:bg-white md:shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 md:hover:bg-transparent'
              }`}
            >
              <Book className="w-6 h-6 md:w-4 md:h-4" />
              <span>Deník</span>
            </button>
            <button
              onClick={() => handleTabChange('planner')}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3 md:px-6 md:py-3 rounded-xl text-[10px] md:text-sm font-bold transition-all md:min-w-[120px] ${
                activeTab === 'planner'
                  ? 'text-indigo-600 bg-indigo-50/50 md:bg-white md:shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 md:hover:bg-transparent'
              }`}
            >
              <Map className="w-6 h-6 md:w-4 md:h-4" />
              <span>Výlety</span>
            </button>
          </div>
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
                {activeTab === 'overview' && (
                  <>
                    <SmartAlerts data={data} />
                    <AqiWidget data={data} />
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-8" />
                    <CurrentStatus data={data} />
                  </>
                )}
                {activeTab === 'allergens' && (
                  <>
                    <PersonalAllergens data={data} />
                    <PollenChart data={data} />
                  </>
                )}
                {activeTab === 'planner' && (
                  <TripPlanner data={data} />
                )}
              </div>
            ) : null}
          </>
        )}
      </main>
      
      <ChatAssistant data={data} />
    </div>
  );
};
