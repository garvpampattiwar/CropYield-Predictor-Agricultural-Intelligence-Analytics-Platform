export type UserRole = 'Farmer' | 'Agronomist' | 'Admin';
export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmName: string;
  location: string;
  hectares: number;
}

export interface SensorReading {
  id: string;
  fieldId: string;
  fieldName: string;
  soilMoisture: number; // %
  soilPh: number;
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  soilTemp: number; // °C
  timestamp: string;
  isNew?: boolean;
}

export interface WeatherData {
  temp: number; // °C
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  pressure: number; // hPa
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Thunderstorm';
  riskScore: number; // 0-100
  forecast: {
    day: string;
    tempMax: number;
    tempMin: number;
    rainfall: number;
    condition: string;
  }[];
}

export interface Field {
  id: string;
  name: string;
  crop: string;
  variety: string;
  areaHa: number;
  sowingDate: string;
  soilType: string;
  irrigationType: string;
  predictedYield: number; // t/ha
  ndvi: number;
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  coordinates: [number, number][];
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  fieldId?: string;
  read: boolean;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  mandi: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // Rs per quintal
  change24h: number; // %
  recommendation: 'Strong Sell' | 'Hold' | 'Accumulate';
}

