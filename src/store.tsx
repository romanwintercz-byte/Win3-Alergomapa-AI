import React, { createContext, useContext, useState, useEffect } from 'react';
import { AllergenKey, Location, CustomAllergen } from './types';

interface AppState {
  trackedAllergens: AllergenKey[];
  setTrackedAllergens: (allergens: AllergenKey[]) => void;
  toggleAllergen: (allergen: AllergenKey) => void;
  currentLocation: Location | null;
  setCurrentLocation: (loc: Location) => void;
  customAllergens: CustomAllergen[];
  addCustomAllergen: (allergen: Omit<CustomAllergen, 'id'>) => void;
  removeCustomAllergen: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_ALLERGENS: AllergenKey[] = ['birch', 'grass'];
const DEFAULT_LOCATION: Location = {
  id: 3067696,
  name: "Praha",
  latitude: 50.08804,
  longitude: 14.42076,
  country: "Česko",
  admin1: "Hlavní město Praha"
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trackedAllergens, setTrackedAllergensState] = useState<AllergenKey[]>([]);
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(null);
  const [customAllergens, setCustomAllergensState] = useState<CustomAllergen[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedAllergens = localStorage.getItem('alergo_allergens');
    if (savedAllergens) {
      setTrackedAllergensState(JSON.parse(savedAllergens));
    } else {
      setTrackedAllergensState(DEFAULT_ALLERGENS);
    }

    const savedLoc = localStorage.getItem('alergo_location');
    if (savedLoc) {
      setCurrentLocationState(JSON.parse(savedLoc));
    } else {
      setCurrentLocationState(DEFAULT_LOCATION);
    }
    
    const savedCustom = localStorage.getItem('alergo_custom_allergens');
    if (savedCustom) {
      setCustomAllergensState(JSON.parse(savedCustom));
    }

    setIsLoaded(true);
  }, []);

  const setTrackedAllergens = (allergens: AllergenKey[]) => {
    setTrackedAllergensState(allergens);
    localStorage.setItem('alergo_allergens', JSON.stringify(allergens));
  };

  const toggleAllergen = (allergen: AllergenKey) => {
    setTrackedAllergens(
      trackedAllergens.includes(allergen)
        ? trackedAllergens.filter((a) => a !== allergen)
        : [...trackedAllergens, allergen]
    );
  };

  const setCurrentLocation = (loc: Location) => {
    setCurrentLocationState(loc);
    localStorage.setItem('alergo_location', JSON.stringify(loc));
  };

  const addCustomAllergen = (allergen: Omit<CustomAllergen, 'id'>) => {
    const newAllergen = { ...allergen, id: Date.now().toString() };
    const updated = [...customAllergens, newAllergen];
    setCustomAllergensState(updated);
    localStorage.setItem('alergo_custom_allergens', JSON.stringify(updated));
  };

  const removeCustomAllergen = (id: string) => {
    const updated = customAllergens.filter(a => a.id !== id);
    setCustomAllergensState(updated);
    localStorage.setItem('alergo_custom_allergens', JSON.stringify(updated));
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <AppContext.Provider
      value={{
        trackedAllergens,
        setTrackedAllergens,
        toggleAllergen,
        currentLocation,
        setCurrentLocation,
        customAllergens,
        addCustomAllergen,
        removeCustomAllergen,
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
