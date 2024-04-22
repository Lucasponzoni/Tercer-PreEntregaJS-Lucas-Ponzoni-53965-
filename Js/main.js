
//TODO: DOM - ELEMENTOS DEL HTML
const apiKey = "cf7ae197cd3b9bb784f6b11cc2a08738";
const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const weatherData = document.getElementById("weatherData");
const spinner = document.querySelector(".loader");
const suggestionContainer = document.getElementById("suggestions");
const skyanimation = document.querySelector(".card");

//!BOTON MODO OSCURO
const modoOscuroButton = document.getElementById('modoOscuroButton');
modoOscuroButton.addEventListener('click', function() {
    alert('En construcción para pre-entrega 4');
});

//!BOTON SEARCH
cityInput.addEventListener("input", () => {
    const input = cityInput.value.trim();
    if (input.length >= 3) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const suggestions = data.map(city => {
                        const countryFullName = country_names[city.country] || "País Desconocido";
                        return `<li><a href="#">${city.name}, ${countryFullName}</a></li>`;
                    }).join("");
                    suggestionContainer.innerHTML = suggestions;
                    suggestionContainer.style.display = "block";
                } else {
                    suggestionContainer.innerHTML = "";
                    suggestionContainer.style.display = "none";
                }
            })
            .catch(error => {
                console.error("Error al obtener sugerencias:", error);
                suggestionContainer.innerHTML = "";
                suggestionContainer.style.display = "none";
            });
    } else {
        suggestionContainer.innerHTML = "";
        suggestionContainer.style.display = "none";
    }
});

//!REALIZAR BUSQUEDA AL DAR CLICK EN LA SUCURGENCIA
suggestionContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        e.preventDefault();
        const searchQuery = e.target.textContent;
        cityInput.value = searchQuery;
        fetchData();
        suggestionContainer.innerHTML = "";
        suggestionContainer.style.display = "none";
    }
});

//!OCULTAR SUGERENCIA AL DAR CLICK FUERA DEL CONTENEDOR
document.addEventListener("click", (e) => {
    if (!e.target.matches("#cityInput")) {
        suggestionContainer.innerHTML = "";
        suggestionContainer.style.display = "none";
    }
});

//!FUNCION QUITAR ETIQUETA RELATIVE AL FOOTER
function quitarFooterRelative() {
    const footer = document.querySelector('.foot');
    footer.classList.remove('relative');
}

//!FUNCION AGREGR ETIQUETA RELATIVE AL FOOTER
function cambiarFooterRelative() {
    const footer = document.querySelector('.foot');
    footer.classList.add('relative');
}

//!FUNCION MOSTRAR SPINNER
function showSpinner() {
    spinner.style.display = "block";
}

//!FUNCION OCULTAR SPINNER
function hideSpinner() {
    spinner.style.display = "none";
}

//!FUNCION ELIMINAR CONTENIDO DEL CONTENEDOR WEATHER
function clearWeatherData() {
    weatherData.innerHTML = "";
}

//!FUNCION LIMPIAR IMPUT
function clearInput() {
    cityInput.value = "";
}

//!LLAMAR A LA API AL DAR CLICK
searchButton.addEventListener("click", () => {
    fetchData();
});

//!LLAMAR A LA API AL DAR ENTER
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        fetchData();
    }
});

//!FUNCION PRINCIPAR LLAMADO A API OPEN WEATHER
function fetchData() {
    const cityName = cityInput.value.trim();

    if (cityName !== "") {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=sp`;

        //?ELIMINA DATOS DEL CONTENEDOS
        skyanimation.classList.remove("clean-sky-day", "clean-sky-night", "rain-sky-night", "rain-sky-day");
        quitarFooterRelative()
        clearWeatherData();
        showSpinner();
        clearInput();

        //?PETICION A API DE OPEN WEATHER
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    displayWeatherData(data);
                } else {
                    hideSpinner()
                    weatherData.innerHTML = `<div class="error-city">
                    <p><i class="bi bi-exclamation-circle"></i> No se encontraron datos para esa ciudad</p>
                    <img id="imagen-clima-estado" src="./img/error.gif">
                    </div>
                    `;
                }
            })
            .catch(error => {
                hideSpinner()
                console.error("Error al obtener datos del clima:", error);
                weatherData.innerHTML = `<div class="error-city">
                <p>Ocurrió un error al obtener los datos del clima</p>
                <img id="imagen-clima-estado" src="./img/error.gif">
                </div>
                `;
            })
            .finally(() => {
                setTimeout(hideSpinner, 2000);
            });
    } else {
        quitarFooterRelative()
        skyanimation.classList.remove("clean-sky-day", "clean-sky-night", "rain-sky-night", "rain-sky-day");
        weatherData.innerHTML = `<div class="error-city">
        <p><i class="bi bi-question-circle"></i> Por favor ingrese el nombre de una ciudad</p>
        <img id="imagen-clima-estado" src="./img/error.gif">
        </div>
        `;
    }
}

//!FUNCION MOSTRAR DATOS OBTENIDOS
function displayWeatherData(data) {
    const weatherMain = data.weather[0].main;
    const icon = data.weather[0].icon;
    const weatherDescription = data.weather[0].description;
    const cityName = data.name;
    const temperature = data.main.temp;
    const maxTemp = data.main.temp_max;
    const minTemp = data.main.temp_min;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const feelsLike = data.main.feels_like;
    const visibility = data.visibility;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
    const country = data.sys.country;
    //**CONVIERTE CODIGO DE PAIS A NOMBRE COMPLETO (Ej AR a ARGENTINA)
    const countryFullName = country_names[country] || "País Desconocido";

    //**OBTENER TIME ZONE
    const { cityTime, dayNight } = getCurrentCityTime(data.timezone);

    suggestionContainer.style.display = "none";
    
    //**RETRASA EL MOSTRAR DATOS 2 SEGUNDOS PARA FIRZAR EL SPINNER
    setTimeout(() => {

    //**REMUEVE CLASES PARA ANIMACION DE CONTENEDOR WEATHER
        skyanimation.classList.remove("clean-sky-day", "clean-sky-night", "rain-sky-night", "rain-sky-day");

    //**AGREGA CLASES PARA ANIMACION DE CONTENEDOR WEATHER DEPENDIENDO DEL ICONO QUE RETORNA OPEN WEATHER
        if (["01d", "02d", "03d"].includes(icon)) {
            skyanimation.classList.add("clean-sky-day");
        } else if (["01n", "02n", "03n"].includes(icon)) {
            skyanimation.classList.add("clean-sky-night");
        } else if (["04d", "09d", "10d", "11d", "13d", "50d"].includes(icon)) {
            skyanimation.classList.add("rain-sky-night");
        } else if (["04n", "09n", "10n", "11n", "13n", "50n"].includes(icon)) {
            skyanimation.classList.add("rain-sky-day");
        }

        cambiarFooterRelative(); 

    //**AGREGA HTML A CONTENEDOR WEATHER CON VARIABLES
        weatherData.innerHTML = `
            <div class="city-Name">
                <h1 class="city">${cityName}</h1>
                <img src="./icons/fill/animation-ready/compass.svg">
            </div>
            <div class="country-Name container">
                <h4 class="dia-noche">Ahora en ${cityName}, ${countryFullName} es de ${dayNight} y son las ${cityTime}hs</h4>
            </div>
            <div class="clima">
            <img id="imagen-clima-estado" src="./img/Imagen estado del Clima/${icon}.svg">
            </div>

    //**ICONO PRINCIPAL DEL CLIMA DETERMINADO POR ICONO QUE RETORNA OPEN WEATHER
            <div class="weather-description container">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="clima">
                <h3 class="descripcion-clima">${weatherDescription}</h3>
            </div>

            <div class="min-max">
                <h3>Máxima ${maxTemp}°C</h3>
                <h3>Mínima ${minTemp}°C</h3>
            </div>
            <div class="temperature">
                <h2 class="tempt">${temperature}</h2>
                <h3 class="c">°C</h3>
            </div>
            <div class="weather-details container">
                <div class="humidity col">
                    <div class="text">
                        <p class="Humedad detail-tittle">${humidity}%</p>
                        <p>Humedad</p>
                    </div>
                    <img class="weather-icons" src="./icons/fill/animation-ready/raindrops.svg">
                </div>
                <div class="wind col">
                    <img class="weather-icons" src="./icons/fill/animation-ready/dust-wind.svg">
                    <div class="text">
                        <p class="Viento detail-tittle">${windSpeed} Km/h</p>
                        <p>Viento</p>
                    </div>
                </div>
            </div>
            <div class="weather-details container">
                <div class="feel-like col">
                    <div class="text">
                        <p class="Humedad detail-tittle">${feelsLike}°C</p>
                        <p>Termica</p>
                    </div>
                    <img class="weather-icons" src="./icons/fill/animation-ready/thermometer-celsius.svg">
                </div>
                <div class="visibility col">
                    <img class="weather-icons" src="./icons/fill/animation-ready/mist.svg">
                    <div class="text">
                        <p class="Visibilidad detail-tittle">${visibility}m</p>
                        <p>Visibilidad</p>
                    </div>
                </div>
            </div>
            <div class="weather-details sunrise-sunset container">
                <div class="sunrise col">
                    <div class="text">
                        <p class="Humedad detail-tittle">${sunrise}</p>
                        <p>Amanecer</p>
                    </div>
                    <img class="weather-icons" src="./icons/fill/animation-ready/sunrise.svg">
                </div>
                <div class="sunset col">
                    <img class="weather-icons" src="./icons/fill/animation-ready/moonrise.svg">
                    <div class="text">
                        <p class="Visibilidad detail-tittle">${sunset}</p>
                        <p>Atardecer</p>
                    </div>
                </div>
            </div>
        `;
    }, 2000);
}

//**CONVIERTE TIMEZONE EN HORA LOCAL
function getCurrentCityTime(timezone) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (1000 * timezone)).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
    const hora = parseInt(cityTime.split(':')[0]);

    //!DETERMINAR SI ES DE DIA, TARDE O DE NOCHE
    let dayNight = '';
    if (hora >= 6 && hora < 13) {
        dayNight = 'día ☀️';
    } else if (hora >= 13 && hora < 18){
        dayNight = 'tarde 🌈';
    } else{
        dayNight = 'noche 🌙';
    }

    return { cityTime, dayNight };
}