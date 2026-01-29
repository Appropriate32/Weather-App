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
      console.log(data);
      console.log(`Your address is ${data.address}`);
      console.log(`Current temperature: ${data.days[0].temp}`);
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  }
}

const appLogic = new ApplicationLogic();

const locationInput = prompt("What city?");

appLogic.getWeather(locationInput);
