const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const VIDARBHA_COORDS = {
    Nagpur: { lat: 21.1458, lon: 79.0882 },
    Amravati: { lat: 20.9320, lon: 77.7523 },
    Wardha: { lat: 20.7453, lon: 78.6022 },
    Yavatmal: { lat: 20.3899, lon: 78.1307 },
    Chandrapur: { lat: 19.9615, lon: 79.2961 },
    Gadchiroli: { lat: 20.1809, lon: 80.0090 },
    Bhandara: { lat: 21.1669, lon: 79.6500 },
    Akola: { lat: 20.7059, lon: 77.0049 },
    Washim: { lat: 20.1166, lon: 77.1500 },
    Buldhana: { lat: 20.5293, lon: 76.1840 },
    Gondia: { lat: 21.4559, lon: 80.1967 },
};

const fallbackWeather = {
    Nagpur: { temp: 34.2, humidity: 28, condition: 'Clear', rainfall: 0, icon: '01d' },
    Amravati: { temp: 35.8, humidity: 22, condition: 'Haze', rainfall: 0, icon: '50d' },
    Wardha: { temp: 33.5, humidity: 31, condition: 'Clear', rainfall: 0, icon: '01d' },
    Yavatmal: { temp: 36.1, humidity: 20, condition: 'Clear', rainfall: 0, icon: '01d' },
    Chandrapur: { temp: 34.8, humidity: 25, condition: 'Partly Cloudy', rainfall: 0, icon: '02d' },
    Gadchiroli: { temp: 32.9, humidity: 33, condition: 'Clear', rainfall: 0, icon: '01d' },
    Bhandara: { temp: 33.1, humidity: 30, condition: 'Clear', rainfall: 0, icon: '01d' },
    Akola: { temp: 36.5, humidity: 19, condition: 'Haze', rainfall: 0, icon: '50d' },
    Washim: { temp: 37.2, humidity: 17, condition: 'Clear', rainfall: 0, icon: '01d' },
    Buldhana: { temp: 35.4, humidity: 23, condition: 'Clear', rainfall: 0, icon: '01d' },
    Gondia: { temp: 32.5, humidity: 32, condition: 'Partly Cloudy', rainfall: 0, icon: '02d' },
};

export async function getWeatherForDistrict(district) {
    if (!API_KEY) {
        return fallbackWeather[district] || fallbackWeather.Nagpur;
    }
    try {
        const coords = VIDARBHA_COORDS[district];
        if (!coords) return fallbackWeather.Nagpur;
        const res = await fetch(`${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            condition: data.weather[0].main,
            rainfall: data.rain?.['1h'] || 0,
            icon: data.weather[0].icon,
        };
    } catch {
        return fallbackWeather[district] || fallbackWeather.Nagpur;
    }
}

export async function getAllDistrictWeather() {
    const results = {};
    for (const district of Object.keys(VIDARBHA_COORDS)) {
        results[district] = await getWeatherForDistrict(district);
    }
    return results;
}
