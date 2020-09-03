import React from 'react';

const Marker = (props) => {

    const incident = props.incident;

    console.log(incident);

    return (
        <div>
            Temperature: { incident.weather.temperature }<br/>
            Rain: { incident.weather.rain }, Snow: { incident.weather.snow }<br/>
            Wind Speed (max): { incident.weather.windSpeed }<br/>
            Started: { incident.startTime}
        </div>
    )

}

export default Marker