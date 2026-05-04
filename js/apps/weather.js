/**
 * CloudsOS — Weather App
 * Unique implementation with dynamic weather simulation and daily forecasts.
 */
(() => {
  function render() {
    return `
      <div class="weather-app">
        <div class="weather-hero" id="weather-bg">
          <div class="weather-top">
            <div class="weather-location">
              <span class="loc-icon">📍</span>
              <span id="loc-name">Cloud City, OS</span>
            </div>
            <div class="weather-date" id="weather-date">Monday, 12 May</div>
          </div>
          <div class="weather-main">
            <div class="weather-temp-wrap">
              <span class="weather-temp" id="weather-temp">24°</span>
              <span class="weather-desc" id="weather-desc">Partly Cloudy</span>
            </div>
            <div class="weather-icon-lg" id="weather-icon">⛅</div>
          </div>
          <div class="weather-stats">
            <div class="w-stat"><span>💧</span> <b id="w-hum">42%</b><br>Humidity</div>
            <div class="w-stat"><span>💨</span> <b id="w-wind">12 km/h</b><br>Wind</div>
            <div class="w-stat"><span>☀️</span> <b id="w-uv">Low</b><br>UV Index</div>
          </div>
        </div>
        <div class="weather-forecast">
          <div class="forecast-title">7-Day Forecast</div>
          <div class="forecast-list" id="forecast-list">
             <!-- Dynamic items -->
          </div>
        </div>
      </div>
    `;
  }

  async function onOpen(wid) {
    const win = OSUtils.el(wid);
    const bg = win.querySelector('#weather-bg');
    const temp = win.querySelector('#weather-temp');
    const desc = win.querySelector('#weather-desc');
    const icon = win.querySelector('#weather-icon');
    const forecastList = win.querySelector('#forecast-list');

    const CONDITIONS = [
      { name: 'Sunny', icon: '☀️', bg: 'linear-gradient(to bottom, #38bdf8, #0ea5e9)' },
      { name: 'Cloudy', icon: '☁️', bg: 'linear-gradient(to bottom, #94a3b8, #64748b)' },
      { name: 'Rainy', icon: '🌧️', bg: 'linear-gradient(to bottom, #64748b, #475569)' },
      { name: 'Stormy', icon: '⛈️', bg: 'linear-gradient(to bottom, #475569, #1e293b)' },
      { name: 'Partly Cloudy', icon: '⛅', bg: 'linear-gradient(to bottom, #7dd3fc, #38bdf8)' }
    ];

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function update() {
      const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
      const t = Math.floor(15 + Math.random() * 15);
      
      bg.style.background = condition.bg;
      temp.textContent = `${t}°`;
      desc.textContent = condition.name;
      icon.textContent = condition.icon;

      // Stats
      win.querySelector('#w-hum').textContent = `${Math.floor(30 + Math.random() * 50)}%`;
      win.querySelector('#w-wind').textContent = `${Math.floor(5 + Math.random() * 25)} km/h`;

      // Forecast
      forecastList.innerHTML = '';
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const next = new Date(today);
        next.setDate(today.getDate() + i);
        const dayName = DAYS[next.getDay()];
        const fCond = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
        const fTemp = Math.floor(15 + Math.random() * 15);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
          <div class="f-day">${dayName}</div>
          <div class="f-icon">${fCond.icon}</div>
          <div class="f-temp">${fTemp}°</div>
        `;
        forecastList.appendChild(item);
      }
    }

    update();
  }

  OSAppRegistry.register({
    id: 'weather',
    name: 'Weather',
    icon: CloudAPI.ICONS.weather,
    category: 'utilities',
    color: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    defaultWidth: 400, defaultHeight: 600,
    render, onOpen,
  });
})();
