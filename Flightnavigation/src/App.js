import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./App.css";
import Compass from "./Compass";
import Map from "./map";
import WebSocket from "./components/WebSocket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [position, setPosition] = useState([51.505, -0.09]);
  const [weather, setWeather] = useState({});
  const [flightData, setFlightData] = useState({
    estimatedTimeRemaining: "2h 30m",
    flightDuration: "5h",
    landingAt: "JFK Airport",
    remainingRange: "1500 km",
    fuel: "80%",
    engine: "Normal",
  });

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              lat: position[0],
              lon: position[1],
              appid: "d6555c542ca1b8195223d3d5848cc1f8",
            },
          }
        );

        const weatherData = response.data;
        console.log(weatherData);
        setWeather({
          temperature: weatherData.main.temp,
          precipitation: weatherData.rain ? weatherData.rain["1h"] : 0,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          wind: weatherData.wind.speed,
          visibility: weatherData.visibility,
        });
      } catch (error) {
        console.error("Error fetching weather data", error);
      }
    };

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition([latitude, longitude]);
    });

    fetchWeatherData();
  }, []);

  return (
    <div className="dashboard">
      {/* <WebSocket /> */}
      <div className="dashboard-header">
        <div className="compass">
          <Compass />
          {/* Add a compass image or component here */}
        </div>
        <div className="location">
          <h3>Current Location</h3>
          <p>
            Latitude: {position[0]} &nbsp;&nbsp; Longitude: {position[1]}
          </p>
        </div>
        <div className="flight-info">
          <div>
            <p className="flight-info-heading">Estimated Time Remaining</p>{" "}
            <p className="flightinfovalue">
              {flightData.estimatedTimeRemaining}
            </p>
          </div>
          <div>
            <p className="flight-info-heading">Flight Duration</p>{" "}
            <p className="flightinfovalue">{flightData.flightDuration}</p>
          </div>

          <div>
            <p className="flight-info-heading">Landing At</p>{" "}
            <p className="flightinfovalue">{flightData.landingAt}</p>
          </div>
          <div>
            <p className="flight-info-heading">Remaining Range</p>{" "}
            <p className="flightinfovalue">{flightData.remainingRange}</p>
          </div>
        </div>
      </div>
      {/* <div className="map-container">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <ZoomControl position="topright" />
        </MapContainer>
      </div> */}
      <Map></Map>
      <div className="dashboard-footer">
        <div className="weather">
          <h3>Current Weather Conditions</h3>
          <div className="parameter">
            <div className="weatheritem">
              <img src="/thermometer.svg" alt="temperature" />
              <p> {weather.temperature}</p>
            </div>
            <div className="weatheritem">
              <img src="/precipitation.svg" alt="precipitation" />
              <p> {weather.precipitation}</p>
            </div>
            <div className="weatheritem">
              <img src="/humidity.svg" alt="humidity" />
              <p> {weather.humidity}</p>
            </div>
            <div className="weatheritem">
              <img src="/pressure.svg" alt="humidity" />
              <p> {weather.pressure}</p>
            </div>
            <div className="weatheritem">
              <img src="/wind.svg" alt="wind" />
              <p>{weather.wind}</p>
            </div>
            <div className="weatheritem">
              <img src="/visibility.svg" alt="visibility" />
              <p>{weather.visibility}</p>
            </div>
          </div>
        </div>
        <div className="health-check">
          <img src="/health.svg" alt="health" />
          <h3>Health Check</h3>
          <p>Fuel: {flightData.fuel}</p>
          <p>Engine: {flightData.engine}</p>
        </div>
      </div>
      <ToastContainer toastStyle={{ backgroundColor: "#000" }} />
    </div>
  );
}

export default App;
