// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EvChargingGrid from './EvChargingGrid'; // Import your EV charging grid component

function App() {
  return (
    <Router>
      <div>
        {/* Set up the routes for your application */}
        <Routes>
          <Route path="/" element={<EvChargingGrid />} />
          {/* You can add more routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
