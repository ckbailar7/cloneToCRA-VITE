const latitude = 36.174818989940526;
const longitude = -115.14960249357529;
const APIkey = "a897cb667f85da5c2b7bbe2afde79165";

export const getForecastWeather = () => {
  const weatherApi = fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${APIkey}`
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return Promise.reject(`Error: ${res.status}`);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return weatherApi;
};

export const parseWeatherData = (data) => {
  const weather = {
    temperature: {
      F: "",
      C: "",
    },
  };
  const main = data.main;
  const temperature = main && main.temp;

  weather.temperature.F = `${Math.round(data.main.temp)}°F`;
  weather.temperature.C = `${Math.round(((data.main.temp - 32) * 5) / 9)}°C`;
  console.log("Weather in Fahrenheit");
  console.log(weather.temperature.F);
  console.log("Weather in Calcius");
  console.log(weather.temperature.C);

  return Math.ceil(weather.temperature.F);
};

export const parseWeaterDataCelcius = (data) => {
  console.log("Weather Data from Celcius Parse >>>");
  console.log(data);
};

export const parseWeatherDataName = (data) => {
  const name = data.name;
  return name;
};