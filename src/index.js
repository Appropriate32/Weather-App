import "./styles.css";

class ApplicationLogic {
  async getWeather(location) {
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=days&key=JZRVWS8M3H5SBPLUD9B8F3TZW&options=usefcst&contentType=json`,
      );

      if (!response.ok) {
        throw new Error(`City not found (Status: ${response.status})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  }
}

class DisplayController {
  constructor() {
    this.forecastContainer = document.querySelector(".forecast");
    this.tempInfo = document.querySelector(".temp-info");
    this.locationHeading = document.querySelector(".current-location");
    this.eventContainer = document.querySelector(".event-container");

    this.inputSearch = document.querySelector(".search-location");
    this.searchForm = document.querySelector(".search-bar form");

    this.iconImg = document.querySelector(".icon-img");
    this.tempValue = document.querySelector(".temp-value");
    this.cBtn = document.querySelector(".c-btn");
    this.fBtn = document.querySelector(".f-btn");

    this.currentUnit = "c";
    this.weatherData = null;

    this.init();
  }

  init() {
    if (this.searchForm) {
      this.searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("Hello");

        const city = this.getLocation();
        appLogic.getWeather(city).then((response) => {
          if (response) {
            this.weatherData = response;

            this.displayTemperature();
            this.displayForecast();
          }
        });
      });
    }

    if (this.tempInfo) {
      this.tempInfo.addEventListener("click", (e) => {
        if (
          e.target.tagName === "P" &&
          e.target.parentElement.classList.contains("temp-types")
        ) {
          const selectedUnit = e.target.textContent.toLowerCase();

          if (selectedUnit !== this.currentUnit) {
            this.currentUnit = selectedUnit;

            this.displayTemperature();
            this.displayForecast();
          }
        }
      });
    }
  }

  async getWeatherIcon(iconName) {
    try {
      const iconModule = await import(`./icons/${iconName}.svg`);

      return iconModule.default;
    } catch (error) {
      console.error(`Icon not found: ${iconName}, ${error}`);
      const defaultIcon = await import("./icons/default.svg");
      return defaultIcon.default;
    }
  }

  getLocation() {
    return this.inputSearch.value;
  }

  getConvertedTemp(tempC) {
    if (this.currentUnit === "f") {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  }

  async displayTemperature() {
    const data = this.weatherData;
    if (!data) return;

    const today = new Date();

    const timeString = today.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const currentTemp = this.getConvertedTemp(data.days[0].temp);
    this.locationHeading.textContent = data.address;

    const iconPath = await this.getWeatherIcon(data.days[0].icon);
    this.iconImg.src = iconPath;

    this.tempValue.textContent = `${currentTemp}°`;

    if (this.currentUnit === "c") {
      this.cBtn.classList.add("active");
      this.fBtn.classList.remove("active");
    } else {
      this.cBtn.classList.remove("active");
      this.fBtn.classList.add("active");
    }
    this.eventContainer.innerHTML = `<p class="weather-event">${data.days[0].description}</p>
        <p class="updated-time">Updated as of ${timeString}</p>
        <div class="weather-info">
          <p>Feels like ${this.getConvertedTemp(data.days[0].feelslike)}°</p>
          <p>Wind ${data.days[0].windspeed} km/h</p>
          <p>${data.days[0].visibility} 4 km</p>
        </div>`;
  }

  displayForecast() {
    const data = this.weatherData;
    if (!data) return;

    this.forecastContainer.textContent = "";

    const next7Days = data.days.slice(1, 8);

    next7Days.forEach(async (day) => {
      const card = document.createElement("div");
      card.classList.add("forecast-item");
      const iconPath = await this.getWeatherIcon(day.icon);

      card.innerHTML = `<div class="card-header">${this.formatDate(day.datetime)}</div>
          <div class="card-body">
            <img src="${iconPath}">
            <div class="card-temps">
              <p>${this.getConvertedTemp(day.tempmax)}°</p>
              <p>${this.getConvertedTemp(day.tempmin)}°</p>
            </div>
            <p class="forecast-event">${day.conditions}</p>
          </div>`;
      this.forecastContainer.appendChild(card);
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
}

const appLogic = new ApplicationLogic();
const displayLogic = new DisplayController();

appLogic.getWeather("London").then((response) => {
  if (response) {
    const mainContent = document.querySelector("main");
    mainContent.classList.remove("hidden");
    displayLogic.weatherData = response;
    displayLogic.displayTemperature();
    displayLogic.displayForecast();
  }
});
