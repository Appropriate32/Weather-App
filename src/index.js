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
            console.log(response);
            displayLogic.displayTemperature(response);
            displayLogic.displayForecast(response);
          }
        });
      });
    }
  }

  getLocation() {
    return this.inputSearch.value;
  }

  displayTemperature(data) {
    this.locationHeading.textContent = data.address;
    this.tempInfo.innerHTML = `<p>Icon</p>
        <p class="temp">${data.days[0].temp}</p>
        <div class="temp-types">
          <p class="active">C</p>
          <p>F</p>
        </div>`;
    this.eventContainer.innerHTML = `<p class="weather-event">${data.days[0].icon}</p>
        <p class="updated-time">Updated as of 11:23 AM</p>
        <div class="weather-info">
          <p>Feels like ${data.days[0].feelslike}°</p>
          <p>Wind ${data.days[0].windspeed} km/h</p>
          <p>${data.days[0].visibility} 4 km</p>
        </div>`;
  }

  displayForecast(data) {
    this.forecastContainer.textContent = "";

    const next7Days = data.days.slice(1, 8);

    next7Days.forEach((day) => {
      const card = document.createElement("div");
      card.classList.add("forecast-item");

      card.innerHTML = `<div class="card-header">${this.formatDate(day.datetime)}</div>
          <div class="card-body">
            <p>Icon</p>
            <div class="card-temps">
              <p>${Math.round(day.tempmax)}°</p>
              <p>${Math.round(day.tempmin)}°</p>
            </div>
            <p class="forecast-event">Storms</p>
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
