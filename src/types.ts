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

export type AllergenKey = 'alder' | 'birch' | 'grass' | 'mugwort' | 'olive' | 'ragweed' | 'hazel' | 'ash' | 'timothy';

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

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  symptomLevel: number; // 0-3
  symptoms: string[];
  medicationsTaken: string[]; // IDs of medications taken
  note?: string;
}

export interface Medication {
  id: string;
  name: string;
  type: 'pill' | 'spray' | 'drops' | 'other';
  usageType?: 'regular' | 'as_needed';
  defaultDose?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  lastName?: string;
  address?: string;
  dateOfBirth?: string;
  avatarEmoji: string;
  trackedAllergens: AllergenKey[];
  customAllergens: CustomAllergen[];
  diaryEntries?: DiaryEntry[];
  medications?: Medication[];
  color?: string;
}
