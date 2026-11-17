import { create } from 'zustand';
import { UserProfile, UserRole, Language, SensorReading, WeatherData, Field, AlertNotification, MarketPrice } from '../types';

interface AppState {
  // Auth & User
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  setUserRole: (role: UserRole) => void;
  
  // Theme & Language & Units
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (unit: 'metric' | 'imperial') => void;

  // Selected global context
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;

  // Realtime Status
  isLive: boolean;
  connectionStatus: 'online' | 'reconnecting' | 'offline';
  lastUpdated: string;
  setConnectionStatus: (status: 'online' | 'reconnecting' | 'offline') => void;

  // Fields
  fields: Field[];
  activeFieldId: string;
  setActiveFieldId: (id: string) => void;
  addField: (field: Field) => void;

  // Live Telemetry
  sensors: SensorReading[];
  addSensorReading: (reading: SensorReading) => void;
  weather: WeatherData;
  updateWeather: (weather: WeatherData) => void;

  // Alerts
  alerts: AlertNotification[];
  markAlertAsRead: (id: string) => void;
  addAlert: (alert: AlertNotification) => void;

  // Sound Notifications
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: 'usr_01',
    name: 'Rajesh Patil',
    email: 'rajesh.patil@agri-intelligence.in',
    role: 'Farmer',
    farmName: 'Sahyadri Agro Farms',
    location: 'Nashik, Maharashtra',
    hectares: 18.5,
  },
  setUser: (user) => set({ user }),
  setUserRole: (role) => set((state) => ({ user: { ...state.user, role } })),

  theme: 'light',
  toggleTheme: () => set((state) => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: next };
  }),

  language: 'en',
  setLanguage: (language) => set({ language }),

  unitSystem: 'metric',
  setUnitSystem: (unitSystem) => set({ unitSystem }),

  selectedCrop: 'Wheat',
  setSelectedCrop: (selectedCrop) => set({ selectedCrop }),

  selectedCountry: 'India',
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),

  isLive: true,
  connectionStatus: 'online',
  lastUpdated: 'Just now',
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  fields: [
    {
      id: 'f_01',
      name: 'North Block (Wheat A1)',
      crop: 'Wheat',
      variety: 'HD-2967 High Yield',
      areaHa: 6.2,
      sowingDate: '2026-10-15',
      soilType: 'Clay Loam (Black Cotton)',
      irrigationType: 'Drip Irrigation',
      predictedYield: 3.45,
      ndvi: 0.74,
      status: 'Healthy',
      coordinates: [[19.9975, 73.7898], [19.9985, 73.7920], [19.9960, 73.7930], [19.9950, 73.7905]],
    },
    {
      id: 'f_02',
      name: 'South Field (Potatoes B2)',
      crop: 'Potatoes',
      variety: 'Kufri Jyoti',
      areaHa: 4.8,
      sowingDate: '2026-09-28',
      soilType: 'Sandy Loam',
      irrigationType: 'Sprinkler',
      predictedYield: 24.8,
      ndvi: 0.68,
      status: 'Needs Attention',
      coordinates: [[19.9920, 73.7850], [19.9940, 73.7875], [19.9915, 73.7890], [19.9900, 73.7860]],
    },
    {
      id: 'f_03',
      name: 'East Valley (Maize C)',
      crop: 'Maize',
      variety: 'Pioneer P3396',
      areaHa: 7.5,
      sowingDate: '2026-10-02',
      soilType: 'Alluvial Loam',
      irrigationType: 'Furrow',
      predictedYield: 6.1,
      ndvi: 0.81,
      status: 'Healthy',
      coordinates: [[20.0010, 73.7950], [20.0035, 73.7980], [20.0010, 73.8010], [19.9990, 73.7970]],
    },
  ],
  activeFieldId: 'f_01',
  setActiveFieldId: (id) => set({ activeFieldId: id }),
  addField: (field) => set((state) => ({ fields: [field, ...state.fields] })),

  sensors: [
    {
      id: 's_01',
      fieldId: 'f_01',
      fieldName: 'North Block (Wheat A1)',
      soilMoisture: 38.5,
      soilPh: 6.8,
      nitrogen: 120,
      phosphorus: 55,
      potassium: 140,
      soilTemp: 22.4,
      timestamp: '2s ago',
    },
    {
      id: 's_02',
      fieldId: 'f_02',
      fieldName: 'South Field (Potatoes B2)',
      soilMoisture: 24.2,
      soilPh: 6.2,
      nitrogen: 95,
      phosphorus: 42,
      potassium: 110,
      soilTemp: 25.1,
      timestamp: '4s ago',
    },
    {
      id: 's_03',
      fieldId: 'f_03',
      fieldName: 'East Valley (Maize C)',
      soilMoisture: 42.1,
      soilPh: 7.1,
      nitrogen: 135,
      phosphorus: 60,
      potassium: 155,
      soilTemp: 21.8,
      timestamp: '7s ago',
    },
  ],
  addSensorReading: (reading) => set((state) => ({
    sensors: [reading, ...state.sensors.slice(0, 9)],
    lastUpdated: 'Just now',
  })),

  weather: {
    temp: 24.8,
    humidity: 62,
    rainfall: 12.4,
    windSpeed: 14.5,
    pressure: 1012,
    condition: 'Partly Cloudy',
    riskScore: 28,
    forecast: [
      { day: 'Mon', tempMax: 29, tempMin: 18, rainfall: 0, condition: 'Sunny' },
      { day: 'Tue', tempMax: 28, tempMin: 19, rainfall: 4.5, condition: 'Partly Cloudy' },
      { day: 'Wed', tempMax: 26, tempMin: 17, rainfall: 18.0, condition: 'Rain' },
      { day: 'Thu', tempMax: 27, tempMin: 18, rainfall: 2.0, condition: 'Partly Cloudy' },
      { day: 'Fri', tempMax: 30, tempMin: 20, rainfall: 0, condition: 'Sunny' },
      { day: 'Sat', tempMax: 31, tempMin: 21, rainfall: 0, condition: 'Sunny' },
      { day: 'Sun', tempMax: 29, tempMin: 19, rainfall: 8.0, condition: 'Rain' },
    ],
  },
  updateWeather: (weather) => set({ weather, lastUpdated: 'Just now' }),

  alerts: [
    {
      id: 'alt_01',
      title: 'Moisture Deficit Detected',
      message: 'South Field (Potatoes B2) soil moisture dropped to 24.2% (critical threshold 28%). Initiate sprinkler cycle.',
      severity: 'critical',
      timestamp: '3m ago',
      fieldId: 'f_02',
      read: false,
    },
    {
      id: 'alt_02',
      title: 'Rainfall Event Expected',
      message: 'Meteorological radar detects incoming convective showers (18mm) on Wednesday. Postpone foliar pesticide sprays.',
      severity: 'warning',
      timestamp: '25m ago',
      read: false,
    },
    {
      id: 'alt_03',
      title: 'Optimal Mandi Window',
      message: 'Wheat modal rates reached ₹2,740/qtl in Lasalgaon Mandi (+4.2%). Recommended selling window open.',
      severity: 'info',
      timestamp: '1h ago',
      read: true,
    },
  ],
  markAlertAsRead: (id) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { ...a, read: true } : a)
  })),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),

  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));

