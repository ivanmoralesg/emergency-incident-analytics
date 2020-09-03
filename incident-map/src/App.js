import React from 'react';
import GoogleMapReact from 'google-map-react'

const DEFAULT_CENTER = [34.0522, -118.2437]

function App() {
  return (
    <div className="App" style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        defaultZoom={10}
        defaultCenter={DEFAULT_CENTER}>
      </GoogleMapReact>
    </div>
  );
}

export default App;
