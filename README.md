# Emergency Incident Analytics

## Steps to Install and Run App

- Download and install Node.js: https://nodejs.org/en/download/
- Clone Git repository: https://github.com/ivanmoralesg/emergency-incident-analytics
- Change directory to `emergency-incident-analytics/incident-map`
- Run `npm install` to install Node dependencies
- Get an API key from https://auth.meteostat.net/ 
- Put API key in IncidentMap.js (do not store in GitHub)
- Run `npm start` to start a local React development server
- Browse to http://localhost:3000

## Improvements / Fixes

- Fix `<Marker>` component to actually display incidents on map (it already contains the enriched weather data)
- Set map center based on incident data (instead of hard-coding Richmond)
- Read API keys from external configuration or a service like AWS Secrets Manager if running on AWS.
- Refactor code in `fetchWeatherData` to separate functions that: get closest station ID, fetch weather data, and format incident data
- Use an actual Google Maps API key

## Work Time

- I spent closer to 6 hours on the project:
  - About 1 hour understanding the requirements and available data
  - 1+ hours sending test requests to Meteostat API
  - 1+ hours getting the GoogleMapReact component to work
  - The rest was on iterative coding: fetching data from APIs, combining incident and weather data, building the `<IncidentMap>` and `<Marker>` components

