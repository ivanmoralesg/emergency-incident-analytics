import React, { useState, useEffect } from 'react';

const Leaflet = window.L;

const IncidentMap = () => {

    const DEFAULT_CENTER = [37.541885, -77.440624] // Richmond, VA
    const DEFAULT_ZOOM = 11;

    const LEAFLET_ATTRIBUTION = 'Map data &copy; ' +
        '<a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    const MAPBOX_ACCESS_TOKEN = '';

    const WEATHER_API_AUTH_HEADERS = {
        headers: { 'x-api-key': '' }
    };

    const [leafletMap, setMap] = useState('');
    const [incidents, setIncidents] = useState([]);

    async function fetchWeatherData(url) {

        const baseResponse = await fetch(url);
        const baseData = await baseResponse.json();
        
        const [eventId, latitude, longitude, startTime, city] = [
            baseData.description.event_id,
            baseData.address.latitude,
            baseData.address.longitude,
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
                .then(data => { });
        });


    }, [0]);

    useEffect(() => {
        
        if (leafletMap) {
            Leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: LEAFLET_ATTRIBUTION,
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: MAPBOX_ACCESS_TOKEN
            }).addTo(leafletMap);
        } else {
            setMap(Leaflet.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM));
        }    

    }, [leafletMap]);

    return (
        <div id="map" style={{ height: 800 }}>
            {
                incidents.map(i => {
                    const marker = Leaflet.marker([i.latitude, i.longitude]).addTo(leafletMap);
                    const popupText = `Temperature: ${i.weather.temperature}&deg;<br/>
                        Rain: ${i.weather.rain}. Snow: ${i.weather.snow}<br/>
                        Wind Speed (max): ${i.weather.windSpeed} km/h<br/>
                        Started: ${i.startTime}`;
                    marker.bindPopup(popupText);
                })
            }
        </div>
    )

}

export default IncidentMap
