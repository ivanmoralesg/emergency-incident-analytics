import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react'

const IncidentMap = () => {

    const DEFAULT_CENTER = [37.541885, -77.440624] // Richmond, VA

    const [incidents, setIncidents] = useState([]);

    async function fetchWeatherData(latitude, longitude, startTime) {

        const startDate = startTime.split('T')[0];
        const weatherApiUrl = `https://api.meteostat.net/v2/point/hourly?lat=${latitude}&lon=${longitude}&start=${startDate}&end=${startDate}`;
        const response = await fetch(weatherApiUrl, {
            headers: {
                'x-api-key': 'wXidUSzNwGtaTG74t6hcvJvB0rHMFCnL'
            }
        });
        
        const weatherData = await response.json();

        console.log(weatherData);

        return weatherData;

    }

    async function weatherAtIncident(data) {

        const eventId = data.description.event_id;
        const latitude = data.address.latitude;
        const longitude = data.address.longitude;
        const startTime = data.description.event_opened;
        const hour = startTime.split('T')[1].split(':')[0];

        const weatherData = fetchWeatherData(latitude, longitude, startTime);

        const weatherAtIncidentHour = weatherData.data.find(hourlyData => {
            return hour === hourlyData.time.split(' ')[1].split(':')[0]
        });

        const weatherAtIncident = {
            temperature: weatherAtIncidentHour.temp,
            rain: weatherAtIncidentHour.prcp > 0,
            snow: weatherAtIncidentHour.snow != null,
            windSpeed: weatherAtIncidentHour.wspd
        }

        return {
            eventId: eventId,
            latitude: latitude,
            longitude: longitude,
            startTime: startTime,
            weather: weatherAtIncident
        }

    }

    async function fetchIncidentData(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    useEffect(() => {
    
        const incidentFiles = [ 'F01705150050.json', 'F01705150090.json' ];

        const incidentsWithWeather = []

        incidentFiles.forEach(f => {
            fetchIncidentData(`/data/${f}`)
                .then(data => {
                    weatherAtIncident(data)
                        .then(data => {
                            console.log(data);
                        })
                });
        });

    }, []);

    return (
        <GoogleMapReact
            // bootstrapURLKeys={{ key: /* YOUR KEY HERE */ }},
            defaultZoom={10}
            defaultCenter={DEFAULT_CENTER}>
        </GoogleMapReact>
    )

}

export default IncidentMap
