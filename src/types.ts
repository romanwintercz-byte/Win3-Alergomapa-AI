export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // State/Region
}

export interface AirQualityData {
  current: {
    time: string;
    european_aqi: number;
    alder_pollen: number;
    birch_pollen: number;
    grass_pollen: number;
    mugwort_pollen: number;
    olive_pollen: number;
    ragweed_pollen: number;
  };
  hourly: {
    time: string[];
    european_aqi: number[];
    alder_pollen: number[];
    birch_pollen: number[];
    grass_pollen: number[];
    mugwort_pollen: number[];
    olive_pollen: number[];
    ragweed_pollen: number[];
  };
}

export type AllergenKey = 'alder' | 'birch' | 'grass' | 'mugwort' | 'olive' | 'ragweed';

export interface AllergenInfo {
  id: AllergenKey;
  name: string;
  apiField: keyof AirQualityData['current'];
  color: string;
  crossAllergies: string[];
  description: string;
}

export type CustomAllergenCategory = 'food' | 'animal' | 'mite' | 'other';

export interface CustomAllergen {
  id: string;
  name: string;
  category: CustomAllergenCategory;
}
