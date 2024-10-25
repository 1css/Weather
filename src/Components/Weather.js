import React, { useEffect, useRef, useState } from "react";
import "../CSS/Weather.css";
import Search_icon from "../Assets/search.png";
import Clear_icon from "../Assets/clear.png";
import Cloud_icon from "../Assets/cloud.png";
import Drizzle_icon from "../Assets/drizzle.png";
import Humidity_icon from "../Assets/humidity.png";
import Rain_icon from "../Assets/rain.png";
import Snow_icon from "../Assets/snow.png";
import Wind_icon from "../Assets/wind.png";
import { Line } from "react-chartjs-2";
import  Loader  from "./Loader";
import {
  Container,
  Row,
  Col,
  Card,
  InputGroup,
  Button,
  FormControl,
} from "react-bootstrap";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

function Weather() {
  const [weather_data, setWeatherData] = useState(false);
  const [weatherData2, setWeatherData2] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [alert, setAlert] = useState(null);
  const [threshold, setThreshold] = useState(35);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef();

  const allIcons = {
    "01d": Clear_icon,
    "01n": Clear_icon,
    "02d": Cloud_icon,
    "02n": Cloud_icon,
    "03d": Cloud_icon,
    "03n": Cloud_icon,
    "04d": Drizzle_icon,
    "04n": Drizzle_icon,
    "09d": Rain_icon,
    "09n": Rain_icon,
    "10d": Rain_icon,
    "10n": Rain_icon,
    "13n": Snow_icon,
    "13d": Snow_icon,
  };

  const fetchWeatherFromAPI = async (city) => {
    if (city === "") {
      alert("enter the city");
      return;
    }
    try {
      setLoading(true)
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.REACT_APP_WEATHER_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();
      const icon = allIcons[data.weather[0].icon] || Clear_icon;
      console.log(data);

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        date: data.dt,
        feels_like: data.main.feels_like,
        icon: icon,
        temp_max: data.main.temp_max,
        temp_min: data.main.temp_min,
        condition: data.weather[0].main,
      });

      const newWeatherData = {
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        date: data.dt,
        feels_like: data.main.feels_like,
        temp_max: data.main.temp_max,
        temp_min: data.main.temp_min,
        condition: data.weather[0].main,
      };
      setWeatherData2((prev) => [...prev, newWeatherData]);

      checkAlertThreshold(newWeatherData);

      console.log(newWeatherData);
    } catch (error) {
      setLoading(false)
      console.log(error, "err");
    }finally{
      setLoading(false)
    }
  };

  const checkAlertThreshold = (newData) => {
    if (newData.temperature > threshold) {
      setAlert(
        `Alert: Temperature exceeded ${threshold}°C at ${newData.location}`
      );
    }
  };

  useEffect(() => {
    fetchWeatherFromAPI("London");

    const setTimeCall = setInterval(() => {
      fetchWeatherFromAPI("London");
    }, 30 * 60 * 1000);

    return () => clearInterval(setTimeCall);
  }, []);

  // Calculate daily aggregates for temperature
  const calculateDailySummary = () => {
    if (!weatherData2.length) return;

    const temperatures = weatherData2.map((data) => data.temperature);
    const avgTemp = (
      temperatures.reduce((a, b) => a + b, 0) / temperatures.length
    ).toFixed(2);
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);

    const conditionCounts = weatherData2.reduce((counts, data) => {
      counts[data.condition] = (counts[data.condition] || 0) + 1;
      return counts;
    }, {});

    const dominantCondition = Object.keys(conditionCounts).reduce((a, b) =>
      conditionCounts[a] > conditionCounts[b] ? a : b
    );

    setDailySummary({
      avgTemp,
      maxTemp,
      minTemp,
      dominantCondition,
    });
  };

  useEffect(() => {
    // Calculate daily summary at the end of each day
    calculateDailySummary();
  }, [weatherData2]);

  // Visualize the temperature trend using Chart.js
  const chartData = {
    labels: weatherData2.map((data) =>
      new Date(data.date * 1000).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Temperature °C",
        data: weatherData2.map((data) => data.temperature),
        fill: false,
        backgroundColor: "blue",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="d-flex justify-content-lg-center justify-content-xl-center justify-content-md-center container-sm mt-3">
          <Col lg={3} xl={3} sm={10} md={4} className="checkbd">
            <div className="search-bar d-flex align-items-center">
              <input
                type="text"
                placeholder="Search"
                ref={inputRef}
                className="form-control me-2"
              />
              <img
                src={Search_icon}
                alt="Search icon"
                className="search-icon"
                onClick={() => fetchWeatherFromAPI(inputRef.current.value)}
              />
            </div>
            {weather_data ? (
              <>
                <img
                  src={weather_data.icon}
                  alt="not found icon"
                  className="weather_icon"
                />
                <p className="temperature">{weather_data.temperature} °C</p>
                <p className="location">{weather_data.location}</p>

                <p className="Time">Time: {timeConverter(weather_data.date)}</p>
                <p className="Feels_like">
                  Feels_like: {weather_data.feels_like}
                </p>
                <div className="weather_data">
                  <div className="col">
                    <img src={Humidity_icon} alt="not found" />
                    <div>
                      <p>{weather_data.humidity} %</p>
                      <span>humidity</span>
                    </div>
                  </div>

                  <div className="col">
                    <img src={Wind_icon} alt="not found" />
                    <div>
                      <p className="d-flex">{weather_data.windSpeed} km/h</p>
                      <span className="wind-name">Wind</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </Col>
        </div>
      )}

      {!loading && (
        <Container className="mt-4">
          {dailySummary && (
            <Row className="justify-content-center">
              <Col lg={4} md={6} sm={10} xs={12} className="mb-4">
                <Card className="p-3 shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-center">
                      Daily Weather Summary
                    </Card.Title>
                    <Card.Text>
                      Average Temperature: {dailySummary.avgTemp}°C
                    </Card.Text>
                    <Card.Text>
                      Maximum Temperature: {dailySummary.maxTemp}°C
                    </Card.Text>
                    <Card.Text>
                      Minimum Temperature: {dailySummary.minTemp}°C
                    </Card.Text>
                    <Card.Text>
                      Condition: {dailySummary.dominantCondition}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row className="justify-content-center">
            <Col lg={8} md={10} sm={12} className="mb-4">
              <Card className="p-3 shadow-sm">
                <Card.Body>
                  <Card.Title className="text-center">
                    Temperature Trend
                  </Card.Title>
                  <div className="chart-container">
                    <Line
                      data={chartData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
}

export default Weather;


