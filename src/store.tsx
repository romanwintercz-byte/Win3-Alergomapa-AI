import React, { createContext, useContext, useState, useEffect } from 'react';
import { AllergenKey, Location, CustomAllergen, UserProfile } from './types';

interface AppState {
  profiles: UserProfile[];
  activeProfileId: string; // 'all' or specific profile ID
  activeProfile: UserProfile | null;
  setActiveProfileId: (id: string) => void;
  addProfile: (profileData: Omit<UserProfile, 'id'>) => string;
  updateProfile: (id: string, profileData: Partial<Omit<UserProfile, 'id'>>) => void;
  deleteProfile: (id: string) => void;
  
  // Computed or active profile specific properties
  trackedAllergens: AllergenKey[];
  customAllergens: CustomAllergen[];
  toggleAllergen: (allergen: AllergenKey, profileId?: string) => void;
  addCustomAllergen: (allergen: Omit<CustomAllergen, 'id'>, profileId?: string) => void;
  removeCustomAllergen: (id: string, profileId?: string) => void;
  
  currentLocation: Location | null;
  setCurrentLocation: (loc: Location) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_LOCATION: Location = {
  id: 3067696,
  name: "Praha",
  latitude: 50.08804,
  longitude: 14.42076,
  country: "Česko",
  admin1: "Hlavní město Praha"
};

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'parent',
    name: 'Já (Rodič)',
    avatarEmoji: '👨',
    trackedAllergens: ['birch', 'grass'],
    customAllergens: [],
    color: 'indigo'
  },
  {
    id: 'child1',
    name: 'Adam',
    avatarEmoji: '👦',
    trackedAllergens: ['birch', 'ragweed'],
    customAllergens: [{ id: 'c1', name: 'Ořechy', category: 'food' }],
    color: 'emerald'
  },
  {
    id: 'child2',
    name: 'Eliška',
    avatarEmoji: '👧',
    trackedAllergens: ['grass', 'mugwort'],
    customAllergens: [{ id: 'c2', name: 'Kočky', category: 'animal' }],
    color: 'rose'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string>('parent');
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load profiles
    const savedProfiles = localStorage.getItem('alergo_profiles_v2');
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed);
      } catch (e) {
        setProfiles(DEFAULT_PROFILES);
      }
    } else {
      // Legacy migration
      const savedAllergens = localStorage.getItem('alergo_allergens');
      const savedCustom = localStorage.getItem('alergo_custom_allergens');
      
      const initialProfiles: UserProfile[] = [
        {
          id: 'parent',
          name: 'Já (Rodič)',
          avatarEmoji: '👨',
          trackedAllergens: savedAllergens ? JSON.parse(savedAllergens) : ['birch', 'grass'],
          customAllergens: savedCustom ? JSON.parse(savedCustom) : [],
          color: 'indigo'
        },
        {
          id: 'child1',
          name: 'Adam',
          avatarEmoji: '👦',
          trackedAllergens: ['birch', 'ragweed'],
          customAllergens: [{ id: 'c1', name: 'Ořechy', category: 'food' }],
          color: 'emerald'
        },
        {
          id: 'child2',
          name: 'Eliška',
          avatarEmoji: '👧',
          trackedAllergens: ['grass', 'mugwort'],
          customAllergens: [{ id: 'c2', name: 'Kočky', category: 'animal' }],
          color: 'rose'
        }
      ];
      setProfiles(initialProfiles);
      localStorage.setItem('alergo_profiles_v2', JSON.stringify(initialProfiles));
    }

    const savedActiveId = localStorage.getItem('alergo_active_profile_id');
    if (savedActiveId) {
      setActiveProfileIdState(savedActiveId);
    }

    const savedLoc = localStorage.getItem('alergo_location');
    if (savedLoc) {
      try {
        setCurrentLocationState(JSON.parse(savedLoc));
      } catch {
        setCurrentLocationState(DEFAULT_LOCATION);
      }
    } else {
      setCurrentLocationState(DEFAULT_LOCATION);
      
      // Pokus o automatické zjištění polohy při prvním spuštění
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Pokus o získání názvu místa přes Nominatim (OpenStreetMap)
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=cs`);
              if (res.ok) {
                const data = await res.json();
                const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Aktuální poloha";
                const country = data.address?.country || "Neznámá";
                const admin1 = data.address?.state || "";
                
                const newLoc: Location = {
                  id: Date.now(),
                  name,
                  latitude,
                  longitude,
                  country,
                  admin1
                };
                setCurrentLocationState(newLoc);
                localStorage.setItem('alergo_location', JSON.stringify(newLoc));
              } else {
                throw new Error("Nominatim API failed");
              }
            } catch (err) {
              // Fallback pokud se nepodaří získat název
              const fallbackLoc: Location = {
                id: Date.now(),
                name: "Aktuální poloha",
                latitude,
                longitude,
                country: "",
                admin1: ""
              };
              setCurrentLocationState(fallbackLoc);
              localStorage.setItem('alergo_location', JSON.stringify(fallbackLoc));
            }
          },
          (error) => {
            console.warn("Automatické zjištění polohy se nezdařilo nebo bylo zamítnuto:", error);
          },
          { timeout: 10000, maximumAge: 60000 }
        );
      }
    }

    setIsLoaded(true);
  }, []);

  const saveProfiles = (updatedProfiles: UserProfile[]) => {
    setProfiles(updatedProfiles);
    localStorage.setItem('alergo_profiles_v2', JSON.stringify(updatedProfiles));
  };

  const setActiveProfileId = (id: string) => {
    setActiveProfileIdState(id);
    localStorage.setItem('alergo_active_profile_id', id);
  };

  const addProfile = (profileData: Omit<UserProfile, 'id'>) => {
    const newId = 'profile_' + Date.now();
    const newProfile: UserProfile = {
      ...profileData,
      id: newId
    };
    const updated = [...profiles, newProfile];
    saveProfiles(updated);
    setActiveProfileId(newId);
    return newId;
  };

  const updateProfile = (id: string, profileData: Partial<Omit<UserProfile, 'id'>>) => {
    const updated = profiles.map(p => p.id === id ? { ...p, ...profileData } : p);
    saveProfiles(updated);
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) return; // Prevent deleting the last profile
    const updated = profiles.filter(p => p.id !== id);
    saveProfiles(updated);
    if (activeProfileId === id) {
      setActiveProfileId(updated[0].id);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  // Active profile's tracked allergens or all combined if activeProfileId === 'all'
  const trackedAllergens: AllergenKey[] = activeProfileId === 'all'
    ? Array.from(new Set(profiles.flatMap(p => p.trackedAllergens)))
    : (activeProfile?.trackedAllergens || []);

  const customAllergens: CustomAllergen[] = activeProfileId === 'all'
    ? profiles.flatMap(p => p.customAllergens)
    : (activeProfile?.customAllergens || []);

  const toggleAllergen = (allergen: AllergenKey, targetProfileId?: string) => {
    const pId = targetProfileId || (activeProfileId === 'all' ? profiles[0]?.id : activeProfileId);
    if (!pId) return;

    const targetProfile = profiles.find(p => p.id === pId);
    if (!targetProfile) return;

    const currentTracked = targetProfile.trackedAllergens;
    const newTracked = currentTracked.includes(allergen)
      ? currentTracked.filter(a => a !== allergen)
      : [...currentTracked, allergen];

    updateProfile(pId, { trackedAllergens: newTracked });
  };

  const addCustomAllergen = (allergen: Omit<CustomAllergen, 'id'>, targetProfileId?: string) => {
    const pId = targetProfileId || (activeProfileId === 'all' ? profiles[0]?.id : activeProfileId);
    if (!pId) return;

    const targetProfile = profiles.find(p => p.id === pId);
    if (!targetProfile) return;

    const newAllergen = { ...allergen, id: Date.now().toString() };
    const updatedCustom = [...targetProfile.customAllergens, newAllergen];

    updateProfile(pId, { customAllergens: updatedCustom });
  };

  const removeCustomAllergen = (id: string, targetProfileId?: string) => {
    const pId = targetProfileId || (activeProfileId === 'all' ? profiles[0]?.id : activeProfileId);
    if (!pId) return;

    const targetProfile = profiles.find(p => p.id === pId);
    if (!targetProfile) return;

    const updatedCustom = targetProfile.customAllergens.filter(a => a.id !== id);
    updateProfile(pId, { customAllergens: updatedCustom });
  };

  const setCurrentLocation = (loc: Location) => {
    setCurrentLocationState(loc);
    localStorage.setItem('alergo_location', JSON.stringify(loc));
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfileId,
        activeProfile,
        setActiveProfileId,
        addProfile,
        updateProfile,
        deleteProfile,
        trackedAllergens,
        customAllergens,
        toggleAllergen,
        addCustomAllergen,
        removeCustomAllergen,
        currentLocation,
        setCurrentLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
