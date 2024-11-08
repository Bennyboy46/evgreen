'use client'

import React, { useState, useEffect, useCallback } from 'react';

const EVChargingGrid = () => {
  const [evQueue, setEvQueue] = useState([]);
  const [chargers, setChargers] = useState([
    { id: 1, isOccupied: false, vehicleId: null, chargingTimeLeft: 0 },
    { id: 2, isOccupied: false, vehicleId: null, chargingTimeLeft: 0 },
  ]);
  const [chargingTime, setChargingTime] = useState('');
  const [priority, setPriority] = useState('');
  const [waitingTime, setWaitingTime] = useState('');
  const [algorithm, setAlgorithm] = useState(" ");
  const [isChargingActive, setIsChargingActive] = useState(false);
  const [schedulingInterval, setSchedulingInterval] = useState(null);
  const [chargingUpdateInterval, setChargingUpdateInterval] = useState(null);

  const addEVToQueue = () => {
    const defaultwaitingtime = algorithm === "FCFS"? 0 :"none";
    const defaultpriority = algorithm === "Priority" ? 0:"none";
  
    if (chargingTime <= 0) {
      alert("Please enter a valid charging time.");
      return;
    }
    
    const newEV = {
      id: evQueue.length + 1,
      chargingDuration: parseInt(chargingTime),
      priority: parseInt(priority)||defaultpriority,
      waitingTime: parseInt(waitingTime)||defaultwaitingtime,
    };
    setEvQueue((prevQueue) => [...prevQueue, newEV]);
    setChargingTime("");
    setPriority("");
    setWaitingTime("");
  };

  const assignToCharger = useCallback((vehicle) => {
    const availableCharger = chargers.find((charger) => !charger.isOccupied);
    if (availableCharger) {
      console.log(`Assigning Vehicle ${vehicle.id} to Charger ${availableCharger.id}`);
      setEvQueue((prevQueue) => prevQueue.filter((ev) => ev.id !== vehicle.id));
      setChargers((prevChargers) =>
        prevChargers.map((charger) =>
          charger.id === availableCharger.id
            ? {
                ...charger,
                isOccupied: true,
                vehicleId: vehicle.id,
                chargingTimeLeft: vehicle.chargingDuration,
              }
            : charger
        )
      );
    }
  }, [chargers]);

  const scheduleNextEV = useCallback(() => {
    if (evQueue.length === 0) return;

    let nextVehicle;
    switch (algorithm) {
      case "FCFS":
        nextVehicle = evQueue.reduce((prev, current) => 
          ( current.waitingTime < prev.waitingTime ? prev : current)
        );
        break;
      case "SJF":
        nextVehicle = evQueue.reduce((prev, current) => 
          (current.chargingDuration < prev.chargingDuration ? current : prev)
        );
        break;
      case "Priority":
        nextVehicle = evQueue.reduce((prev, current) => 
          (current.priority < prev.priority ? current : prev)
        );
        break;
      default:
        nextVehicle = evQueue[0];
        break;
    }
  
    if (nextVehicle) {  
      setTimeout(() => {
          assignToCharger(nextVehicle); // Assign after 3 seconds delay
      }, 3000);
    }
  }, [evQueue, assignToCharger, algorithm]);

  const updateChargingProgress = useCallback(() => {
    setChargers((prevChargers) =>
      prevChargers.map((charger) => {
        if (charger.isOccupied) {
          if (charger.chargingTimeLeft > 0) {
            return { ...charger, chargingTimeLeft: charger.chargingTimeLeft - 1 };
          } else {
            const finishedVehicleId = charger.vehicleId;
            console.log(`Charger ${charger.id}: Vehicle ${finishedVehicleId} has finished charging.`);
            return { ...charger, isOccupied: false, vehicleId: null, chargingTimeLeft: 0 };
          }
        }
        return charger;
      })
    );

    if (evQueue.length === 0 && chargers.every(charger => !charger.isOccupied)) {
      stopCharging();
      return;
    }

    const nextChargerAvailable = chargers.find((charger) => !charger.isOccupied);
    if (nextChargerAvailable && evQueue.length > 0) {
      scheduleNextEV();
    }
  }, [chargers, evQueue, scheduleNextEV]);

  useEffect(() => {
    if (isChargingActive) {
      const newSchedulingInterval = setInterval(scheduleNextEV, 15000);
      const newChargingUpdateInterval = setInterval(updateChargingProgress, 1000);
      setSchedulingInterval(newSchedulingInterval);
      setChargingUpdateInterval(newChargingUpdateInterval);
    } else {
      clearInterval(schedulingInterval);
      clearInterval(chargingUpdateInterval);
    }

    return () => {
      clearInterval(schedulingInterval);
      clearInterval(chargingUpdateInterval);
    };
  }, [isChargingActive, scheduleNextEV, updateChargingProgress]);

  const startCharging = () => {
    setIsChargingActive(true);
  };

  const stopCharging = () => {
    setIsChargingActive(false);
    clearInterval(schedulingInterval);
    clearInterval(chargingUpdateInterval);
    console.log("Charging stopped due to empty queue and chargers.");
  };

  return (
    <div className="min-h-screen bg-green-100">
      <div className="container mx-auto px-4 py-8">
        <section className="hero min-h-screen flex flex-col justify-center items-center text-center bg-green-200 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-green-900 text-7xl font-bold font-sans mb-8 animate-pulse">EV green</h2>
          <div className="mb-8">
            <h3 className="text-green-800 text-2xl font-semibold mb-4">Select Scheduling Algorithm:</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {["FCFS", "SJF", "Priority"].map((algo) => (
                <label key={algo} className="inline-flex items-center px-4 py-2 bg-green-300 rounded-full cursor-pointer">
                  <input
                    type="radio"
                    value={algo}
                    checked={algorithm === algo}
                    onChange={() => setAlgorithm(algo)}
                    className="mr-2 text-green-700"
                  />
                  <span className="text-green-800 font-medium">{algo}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => {
                document.getElementById('ev-details').scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-12 text-green-700 hover:text-green-900 transition-colors"
              aria-label="Scroll to EV details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        </section>

        <section id="ev-details" className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-6">Enter Charging Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-green-700 mb-2" htmlFor="chargingTime">Charging Time (seconds):</label>
              <input
                id="chargingTime"
                type="number"
                value={chargingTime}
                onChange={(e) => setChargingTime(e.target.value)}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter EV's charging time"
              />
            </div>
            <div>
              <label className="block text-green-700 mb-2" htmlFor="priority">Priority:</label>
              <input
                id="priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={algorithm !== "Priority"}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Enter Priority of EV"
              />
            </div>
            <div>
              <label className="block text-green-700 mb-2" htmlFor="waitingTime">Waiting Time (seconds):</label>
              <input
                id="waitingTime"
                type="number"
                value={waitingTime}
                onChange={(e) => setWaitingTime(e.target.value)}
                disabled={["Round Robin", "Priority", "SJF"].includes(algorithm)}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Enter Waiting Time"
              />
            </div>
          </div>
          <button
            onClick={addEVToQueue}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add EV
          </button>
        </section>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={startCharging}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Charging
          </button>
          <button
            onClick={stopCharging}
            className="px-6 py-3 bg-white text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            Stop Charging
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Charging Stations</h3>
            <div className="space-y-4">
              {chargers.map((charger) => (
                <div key={charger.id} className="p-4 bg-white rounded-lg shadow">
                  <h4 className="text-lg font-medium text-green-700 animate-bounce">Charger {charger.id}</h4>
                  {charger.isOccupied ? (
                    <p className="text-green-600">
                      Charging Vehicle {charger.vehicleId} - {charger.chargingTimeLeft} seconds left
                    </p>
                  ) : (
                    <p className="text-green-500">Available</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Queue</h3>
            <div className="space-y-4">
              {evQueue.map((ev) => (
                <div key={ev.id} className="p-4 bg-white rounded-lg shadow">
                  <p className="text-green-700">
                    Vehicle {ev.id}: Charging Time {ev.chargingDuration} seconds, 
                    Priority {ev.priority}, Waiting Time {ev.waitingTime} seconds
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVChargingGrid;
