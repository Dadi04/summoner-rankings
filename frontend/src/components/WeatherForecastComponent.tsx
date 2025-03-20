import React, { useState, useEffect } from 'react';

interface WeatherForecast {
    date: string;
    temperatureC: number;
    summary: string;
}
  
const WeatherForecastComponent: React.FC = () => {
    const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetch('/weatherforecast')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data: WeatherForecast[]) => setForecasts(data))
        .catch((err: Error) => setError(err.message));
    }, []);

    return (
        <div>
            <h1>Weather Forecast</h1>
            {error && <p>Error: {error}</p>}
            <ul>
                {forecasts.map((forecast, index) => (
                    <li key={index}>
                        <strong>Date:</strong> {forecast.date} | <strong>Temp (C):</strong> {forecast.temperatureC} | <strong>Summary:</strong> {forecast.summary}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WeatherForecastComponent;