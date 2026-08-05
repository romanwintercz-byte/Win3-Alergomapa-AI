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

export type VerificationStatus = 'confirmed' | 'suspected' | 'monitored';

export interface CustomAllergen {
  id: string;
  name: string;
  category: CustomAllergenCategory;
  status?: VerificationStatus;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  symptomLevel: number; // 0-3
  symptoms: string[];
  medicationsTaken: string[]; // IDs of medications taken
  note?: string;
}

export interface SkinDiaryEntry {
  id: string;
  timestamp: string; // ISO string
  image: string; // Base64 data URL
  note: string;
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
  allergenStatuses?: Record<string, VerificationStatus>;
  diaryEntries?: DiaryEntry[];
  skinDiaryEntries?: SkinDiaryEntry[];
  medications?: Medication[];
  bloodTestResults?: Record<string, number>;
  color?: string;
}

export type InteractionSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type ItemType = 'medication' | 'allergy' | 'diet' | 'supplement';

export interface InteractionRule {
  id: string;
  triggerType: ItemType;
  triggerKeywords: string[]; 
  targetType: ItemType;
  targetKeywords: string[];
  severity: InteractionSeverity;
  message: string;
  timeSpacingHours?: number;
  description?: string;
}

export interface InteractionResult {
  ruleId: string;
  severity: InteractionSeverity;
  message: string;
  timeSpacingHours?: number;
  triggerMatch: string;
  targetMatch?: string;
  description?: string;
}
