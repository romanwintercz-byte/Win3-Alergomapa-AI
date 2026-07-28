import { AirQualityData, Location } from "../types";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const AQ_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(query)}&count=5&language=cs&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to search locations:", err);
    return [];
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: "european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
      hourly: "european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
      timezone: "auto",
      forecast_days: "3"
    });
    const res = await fetch(`${AQ_API}?${params.toString()}`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch AQ data:", err);
    return null;
  }
}
