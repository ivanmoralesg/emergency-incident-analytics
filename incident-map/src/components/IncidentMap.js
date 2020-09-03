import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker';

const IncidentMap = () => {

    const DEFAULT_CENTER = [37.541885, -77.440624] // Richmond, VA

    const WEATHER_API_AUTH_HEADERS = {
        headers: { 'x-api-key': '<YOUR_METEOSTAT_KEY>' }
    };

    const [incidents, setIncidents] = useState([]);

    async function fetchWeatherData(url) {

        const baseResponse = await fetch(url);
        const baseData = await baseResponse.json();
         
        const [eventId, latitude, longitude, startTime, city] = [
            baseData.description.event_id,
            baseData.address.longitude,
            baseData.address.latitude,
            baseData.description.event_opened,
            baseData.address.city,
            baseData.address.state
        ];

        const startDate = startTime.split('T')[0];
        const hour = startTime.split('T')[1].split(':')[0];

        const stationResponse = await fetch(`https://api.meteostat.net/v2/stations/search?query=${city}`, WEATHER_API_AUTH_HEADERS);
        const weatherStations = await stationResponse.json();
        let closestStationId = weatherStations.data[0].id;
        let [minLatitudeDistance, minLongitudeDistance] = [ weatherStations.data[0].latitude, weatherStations.data[0].longitude ];    
        weatherStations.data.forEach(s => {
            if (s.latitude - latitude < minLatitudeDistance && s.longitude - longitude < minLongitudeDistance) {
                closestStationId = s.id;
            }
        })

        const weatherResponse = await fetch(`https://api.meteostat.net/v2/stations/hourly?station=${closestStationId}&start=${startDate}&end=${startDate}`, WEATHER_API_AUTH_HEADERS);
        const weatherData = await weatherResponse.json();
        const weatherAtIncidentHour = weatherData.data.find(hourlyData => {
            return hour === hourlyData.time.split(' ')[1].split(':')[0]
        });

        const incidentWeather = {
            eventId: eventId,
            latitude: latitude,
            longitude: longitude,
            startTime: startTime,
            weather: {
                temperature: weatherAtIncidentHour.temp,
                rain: weatherAtIncidentHour.prcp > 0 ? 'Yes' : 'No',
                snow: weatherAtIncidentHour.snow != null ? 'Yes' : 'No',
                windSpeed: weatherAtIncidentHour.wspd
            }
        }

        const updatedIncidents = incidents.slice();
        updatedIncidents.push(incidentWeather);
        setIncidents(updatedIncidents);

    } 

    useEffect(() => {
    
        const incidentFiles = [ 'F01705150050.json', 'F01705150090.json' ];

        incidentFiles.forEach(f => {
            fetchWeatherData(`/data/${f}`)
                .then(data => {
                    // console.log(data);
                });
        });

    }, []);

    return (
        <GoogleMapReact
            // bootstrapURLKeys={{ key: /* YOUR_GA_MAP_KEY */ }},
            defaultZoom={10}
            defaultCenter={DEFAULT_CENTER}>
            {
                incidents.map(i => {
                    return (
                        <Marker key={ i.eventId } lat={i.latitude} lng={i.longitude} incident={ i } />
                    )
                })
            }
        </GoogleMapReact>
    )

}

export default IncidentMap
