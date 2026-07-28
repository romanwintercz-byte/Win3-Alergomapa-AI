import React, { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../api/openmeteo';
import { Location } from '../types';
import { useAppContext } from '../store';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';

export const LocationSearch: React.FC = () => {
  const { currentLocation, setCurrentLocation } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const data = await searchLocations(query);
        setResults(data);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (loc: Location) => {
    setCurrentLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          // Reverse geocoding via Open-Meteo isn't perfectly supported by search endpoint directly without a query,
          // but we can just use the coordinates directly for the API.
          // For UX, we'll set a generic location name.
          setCurrentLocation({
            id: Date.now(),
            name: "Aktuální poloha",
            latitude: lat,
            longitude: lon,
          });
          setIsLoading(false);
          setIsOpen(false);
        },
        (error) => {
          console.error("Error getting location", error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          className="w-full pl-10 pr-12 py-2.5 bg-white/10 backdrop-blur-md border border-slate-200/20 text-slate-800 placeholder-slate-400 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          placeholder={currentLocation?.name || "Hledat město nebo destinaci..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <button 
          onClick={requestGeolocation}
          className="absolute right-2 p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Použít aktuální polohu"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-4">
          {results.map((loc) => (
            <button
              key={loc.id}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors"
              onClick={() => handleSelect(loc)}
            >
              <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">{loc.name}</p>
                <p className="text-sm text-slate-500">
                  {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
