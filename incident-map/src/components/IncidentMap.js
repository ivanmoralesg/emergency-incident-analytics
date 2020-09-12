import React, { useState, useEffect } from 'react';

const Leaflet = window.L;

const IncidentMap = () => {

    const DEFAULT_CENTER = [37.541885, -77.440624] // TODO calculate map center, default to Richmond, VA
    const DEFAULT_ZOOM = 11;
    const LEAFLET_ATTRIBUTION = 'Map data &copy; ' +
        '<a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    const [mapboxAccessToken, setMapboxAccessToken] = useState('');
    const [leafletMap, setMap] = useState('');
    const [incidents, setIncidents] = useState([]);

    async function fetchWeatherData(url) {

        const baseResponse = await fetch(url);
        const baseData = await baseResponse.json();
        
        const [eventId, latitude, longitude, startTime] = [
            baseData.description.event_id,
            baseData.address.latitude,
            baseData.address.longitude,
            baseData.description.event_opened
        ];

        const weatherResponse = await fetch(`http://localhost:8080/weather?latitude=${latitude}&longitude=${longitude}&startTime=${startTime}`);
        const weatherAtIncidentHour = await weatherResponse.json();

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

    /**
     * Load incident data, get weather from enrich service, and store in state
     */
    useEffect(() => {

        const incidentFiles = [ 'F01705150050.json', 'F01705150090.json' ];

        incidentFiles.forEach(f => {
            fetchWeatherData(`/data/${f}`)
                .then(data => { });
        });


    }, [0]);

    /**
     * Fetch Mapbox access token
     */
    useEffect(() => {

        const fetchMapboxAccessToken = async () => {
            const response = await fetch('http://localhost:8080/mapboxAccessToken');
            const json = await response.json()
            setMapboxAccessToken(json.accessToken);
        };

        fetchMapboxAccessToken();

    }, [mapboxAccessToken]);

    /**
     * Build initial map after Mapbox access token is available
     */
    useEffect(() => {
        
        if (mapboxAccessToken) {
            Leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: LEAFLET_ATTRIBUTION,
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: mapboxAccessToken
            }).addTo(leafletMap);
        } else {
            setMap(Leaflet.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM));
        }    

    }, [mapboxAccessToken]);

    return (
        <div id="map" style={{ height: 800 }}>
            {
                // Add incident markers and popups
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
