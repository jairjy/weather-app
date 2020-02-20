let cityList = [];
function City(name, id) {
  this.name = name;
  this.id = id;  
}

function toggle() {
  const clear = document.getElementById('list');
  clear.innerHTML = '';
  const btn = document.getElementById('unit');
  if (btn.innerHTML == "Celsius") {
    btn.innerHTML = "Fahrenheit";
    unit = "imperial";
    fetchCurrentCityName(unit);
    toggleRender(unit);
  } else {
    btn.innerHTML = "Celsius";
    unit = "metric";
    fetchCurrentCityName(unit);
    toggleRender(unit);
  }
}	

const fetchCurrentCityName = (unit = "metric") => {
  fetch('https://ipinfo.io?token=311875147c07c2', {mode: 'cors'})
 .then(response => response.json())
 .then(function(response) {
    fetchLocalCityWeather(response.city, unit);
 })
 .catch(e => {
    localCity.innerHTML = e;
    console.log(e);
 })
};

(function() {
  fetchCurrentCityName();
})();

const fetchLocalCityWeather = (cityName, unit) => {
  let location = cityName;
  const baseUrl = 'https://api.openweathermap.org/data/2.5';
  const key = '05f63ad5080a502f607cfa5b1219794b';
  const value = unit;
  const url = `${baseUrl}/weather?q=${location}&units=${value}&APPID=${key}`;
  fetch(url, {mode: 'cors'})
  .then((response => response.json()))
  .then(function(response) {
    renderLocalCard(response, unit);
 })
 .catch(e => {
    localCity.innerHTML = e;
    console.log(e);
 })
}

const renderLocalCard = (weather, unit) => {
  const localIcon = document.getElementById('localIcon');
  const localTemp = document.getElementById('localTemp');
  const dateElement = document.getElementById("date");
  const localCity = document.getElementById('localCity')
  
  const icon = weather.weather[0].icon;
    let localLink = "https://openweathermap.org/img/wn/" + icon + "@2x.png"
  localIcon.setAttribute("src", localLink)

  if (unit === "metric") {			
    localTemp.innerHTML = "Local Temp: " + Math.floor(weather.main.temp) + "°C";
  } else {
    localTemp.innerHTML = "Local Temp: " + Math.floor(weather.main.temp) + "°F";
  }

  const format = {weekday:"long", month:"short", day:"numeric", hour: 'numeric', minute: 'numeric'};
  const today = new Date();
  dateElement.innerHTML = today.toLocaleDateString("en-US", format);

  localCity.innerHTML = weather.name;
}

const updateLocalStorage = (arr) => {
  window.localStorage.setItem('cityList', JSON.stringify(arr));
}

const findCity = (e) => {
  e.preventDefault();
  const cityInput = document.getElementById('cityInput').value;
  if(cityList.some(city => city.name === cityInput)) {
    alert("Duplicate city!")
  } else {
    checkCity(cityInput);
  }
};

const addCityToList = (cityName) => {
  if(cityList.some(city => city.name === cityName)) {
  } else {
    id = cityList.length;
    const newCity = new City(cityName, id);
    cityList.push(newCity);
    updateLocalStorage(cityList);
    fetchForeignCityWeather(cityName, id, unit = 'metric');      
  }  
}

const toggleRender = (unit) => {
	const cityList = JSON.parse(localStorage.getItem("cityList"))
	const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
	async function asyncForEach(array, callback) {
	  for (let index = 0; index < array.length; index++) {
	    await callback(array[index], index, array);
	  }
	}
	const init = async () => {
	  await asyncForEach(cityList, async (city) => {
	    await waitFor(900);
	    fetchForeignCityWeather(city.name, city.id, unit);
	  });
  }
  init();
}

const fetchForeignCityWeather = (cityName, id, unit = 'metric') => {
  let location = cityName;
  const baseUrl = 'https://api.openweathermap.org/data/2.5';
  const key = '05f63ad5080a502f607cfa5b1219794b';
  const value = unit;
  const url = `${baseUrl}/weather?q=${location}&units=${value}&APPID=${key}`;
  fetch(url, {mode: 'cors'})
  .then((response => response.json()))
  .then(function(response) {  
    renderForeignCard(response, id, unit);
  })
  .catch(e => {
    console.log(e);
   })  
}

const checkCity = (cityName) => {
  let location = cityName;
  const baseUrl = 'https://api.openweathermap.org/data/2.5';
  const key = '05f63ad5080a502f607cfa5b1219794b';
  const url = `${baseUrl}/weather?q=${location}&APPID=${key}`;
  fetch(url, {mode: 'cors'})
  .then((response => response.json()))
  .then(function() {
    addCityToList(cityName);
 })
 .catch(e => {
    alert("Invalid City")
    console.log(e);
 })
}

const getForeignWeatherIcon = (icon) => {
  let foreignLink = "https://openweathermap.org/img/wn/" + icon + "@2x.png"
  return foreignLink;
}

const getForeignTemp = (temp, unit) => {
  if (unit == 'metric') {
    const mainTemp = "Local Temp: " + Math.floor(temp) + "°C";
    return mainTemp;
  } else {
    const mainTemp = "Local Temp: " + Math.floor(temp) + "°F";
    return mainTemp;
  };
}

const getflickrImg = (foreignCityName, id) => {
  const tags = foreignCityName;
  const script = document.createElement('script');
  script.src = "http://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=cb&tags=" + tags;
  document.head.appendChild(script)
  let photoID = id; 
  window.cb = function(data) {    
    console.log(data);
    console.warn(photoID);
    let ele = 'cityPic' + photoID    
    const image = document.getElementById(ele);
    image.setAttribute('src', data.items[0].media.m);
  };
};



const getForeignTime = (foreignTiming) => {
  const date = new Date();
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const timeOffset = foreignTiming/3600;
  const format = {month:"short", day:"numeric", hour: 'numeric', minute: 'numeric'};
  const newTime = new Date(utcTime + (3600000 * timeOffset)).toLocaleDateString("en-US", format);
  return newTime;
}

const getForeignFeel = (feel, unit) => {
  if (unit == 'metric') {
    const feelLike = "Feels Like: " + Math.floor(feel) + "°C";
    return feelLike;
  } else {
    const feelLike = "Feels Like: " + Math.floor(feel) + "°F";    
    return feelLike;
  }
}

const getForeignLow = (low, unit) => {
  if (unit == 'metric') {
    const tempMin = "Min Temp: " + Math.floor(low) + "°C";
    return tempMin;
  } else {
    const tempMin = "Min Temp: " + Math.floor(low) + "°F";    
    return tempMin;
  }
}

const getForeignHigh = (high, unit) => {
  if (unit == 'metric') {
    const tempMax = "Max Temp: " + Math.floor(high) + "°C";
    return tempMax;
  } else {
    const tempMax = "Max Temp: " + Math.floor(high) + "°F";    
    return tempMax;
  }
}

const getSunTiming = (timeZone, sunTime) => {
  const foreignTiming = timeZone;
  const date = new Date(sunTime * 1000);
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const timeOffset = foreignTiming/3600;
  const format = {hour: 'numeric', minute: 'numeric'};
  const sunnyTime = new Date(utcTime + (3600000 * timeOffset)).toLocaleTimeString("en-US", format);
  return sunnyTime;
}

const renderForeignCard = (weather, id, unit) => {
  const foreignweatherIcon = getForeignWeatherIcon(weather.weather[0].icon);
  const weatherDesc = weather.weather[0].description;
  const foreignTemp = getForeignTemp(weather.main.temp, unit);
  getflickrImg(weather.name, id);
  console.log(id);
  const foreignTime = getForeignTime(weather.timezone);
  const foreignFeel = getForeignFeel(weather.main.feels_like, unit)
  const foreignLow = getForeignLow(weather.main.temp_min, unit)
  const foreignHigh = getForeignHigh(weather.main.temp_max, unit)
  const foreignPressure = "Pressure: " + weather.main.pressure + " hPa"; 
  const windSpeed = 'Wind Speed: ' + weather.wind.speed + "m/s";
  const humidity = "Humidity: " + weather.main.humidity + "%";
  const sunriseTime = getSunTiming(weather.timezone, weather.sys.sunrise);		
  const sunrise = 'Sunrise: ' + sunriseTime;
  const sunSetTime = getSunTiming(weather.timezone, weather.sys.sunset);		
  const sunset = 'Sunset: ' + sunSetTime;	

  const list = document.getElementById('list');

  const item = `
    <div class="card">
      <header class="card-header">
        <div class="column has-text-centered left-col">
          <img id="foreignIcon" src="${foreignweatherIcon}">
          <p class="heading" id="weatherCondition">${weatherDesc}</p>
          <p class="heading" id="foreignTemp">${foreignTemp}</p>
        </div>
        <div class="column has-text-centered right-col">
          <div id="cityImage">
            <img id="cityPic${id}">
          </div>
        </div>												
      </header>
      <div class="card-content">
        <div class="content">
          <h4 id="foreignCity" class="is-4" style="color: white;">${weather.name}</h4>
          <p id="foreignTime">${foreignTime}</p>
          <div class="row">
            <div class="columns">
              <div class="column">
                <p id="foreignFeel">${foreignFeel}</p>
                <p id="foreignLow">${foreignLow}</p>
                <p id="foreignHigh">${foreignHigh}</p>
                <p id="foreignPressure">${foreignPressure}</p>
              </div>
              <div class="column">
                <p id="windSpeed">${windSpeed}</p>
                <p id="humidity">${humidity}</p>
                <p id="sunrise">${sunrise}</p>
                <p id="sunset">${sunset}</p>
              </div>
            </div>
          </div>							
        </div>
      </div>
    </div>`
  const position = 'beforeend';
  list.insertAdjacentHTML(position, item);
}

const citySearch = (function(){
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('citySearch').addEventListener('click', findCity);
  });
})();

const toggleTime = (function(){
  const unit =  document.getElementById('unit');
  unit.addEventListener("click", toggle);
})();

const purge = (function() {
  const clearAll =  document.getElementById('clearAll');
  clearAll.addEventListener("click", function() {
    localStorage.clear();
    window.location.reload();
  })
})();

(function() {  
  toggleRender();
})();