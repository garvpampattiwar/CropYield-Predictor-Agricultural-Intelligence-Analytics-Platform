import { useAppStore } from '../store/useAppStore';

class MockRealtimeService {
  private timer: any = null;
  private isRunning: boolean = false;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Emits new telemetry every 4 seconds
    this.timer = setInterval(() => {
      this.emitTelemetry();
    }, 4000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  private emitTelemetry() {
    const store = useAppStore.getState();
    const fields = store.fields;
    if (!fields || fields.length === 0) return;

    // Pick random field
    const randomField = fields[Math.floor(Math.random() * fields.length)];

    // Slight realistic fluctuation
    const moistureJitter = (Math.random() - 0.5) * 1.5;
    const tempJitter = (Math.random() - 0.5) * 0.4;
    const currentMoisture = Math.max(18, Math.min(65, 36 + moistureJitter));
    const currentTemp = Math.max(16, Math.min(38, 24 + tempJitter));

    const newReading = {
      id: `s_${Date.now()}`,
      fieldId: randomField.id,
      fieldName: randomField.name,
      soilMoisture: Number(currentMoisture.toFixed(1)),
      soilPh: Number((6.8 + (Math.random() - 0.5) * 0.2).toFixed(1)),
      nitrogen: Math.round(115 + (Math.random() - 0.5) * 10),
      phosphorus: Math.round(52 + (Math.random() - 0.5) * 5),
      potassium: Math.round(145 + (Math.random() - 0.5) * 12),
      soilTemp: Number(currentTemp.toFixed(1)),
      timestamp: 'Just now',
      isNew: true,
    };

    store.addSensorReading(newReading);

    // Weather jitter
    const newWeather = {
      ...store.weather,
      temp: Number((store.weather.temp + (Math.random() - 0.5) * 0.3).toFixed(1)),
      humidity: Math.round(Math.max(40, Math.min(95, store.weather.humidity + (Math.random() - 0.5) * 2))),
      windSpeed: Number((store.weather.windSpeed + (Math.random() - 0.5) * 0.5).toFixed(1)),
    };
    store.updateWeather(newWeather);
  }
}

export const realtimeService = new MockRealtimeService();

