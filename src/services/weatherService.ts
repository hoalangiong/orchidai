export interface DayWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rain: number;        // mm
  windSpeed: number;   // km/h
  uvIndex: number;
  weatherCode: number;
}

export interface WeatherForecast {
  location: { lat: number; lng: number };
  days: DayWeather[];
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
    + `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,precipitation_sum,wind_speed_10m_max,uv_index_max,weather_code`
    + `&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Không thể tải dữ liệu thời tiết');
  const data = await res.json();

  const days: DayWeather[] = data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    humidity: Math.round(data.daily.relative_humidity_2m_max[i]),
    rain: Math.round(data.daily.precipitation_sum[i] * 10) / 10,
    windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
    uvIndex: Math.round(data.daily.uv_index_max[i]),
    weatherCode: data.daily.weather_code[i],
  }));

  return { location: { lat, lng }, days };
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 84) return '🌧️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

export function getWeatherLabel(code: number): string {
  if (code === 0) return 'Trời nắng';
  if (code <= 2) return 'Ít mây';
  if (code === 3) return 'Nhiều mây';
  if (code <= 49) return 'Sương mù';
  if (code <= 59) return 'Mưa phùn';
  if (code <= 69) return 'Mưa';
  if (code <= 79) return 'Tuyết';
  if (code <= 84) return 'Mưa rào';
  if (code <= 99) return 'Giông bão';
  return 'Không rõ';
}
