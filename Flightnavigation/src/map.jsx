import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import {
  TileLayer,
  MapContainer,
  LayersControl,
  Marker,
  ZoomControl,
} from "react-leaflet";
import { toast } from "react-toastify";
// import { Button } from "@material-ui/core";

// Import the JS and CSS:
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import { io } from "socket.io-client";

import marker from "./plane.svg";
import axios from "axios";
const myIcon = new L.Icon({
  iconUrl: marker,
  iconRetinaUrl: marker,
  popupAnchor: [-0, -0],
  iconSize: [32, 45],
});
const maps = {
  base: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

const Map = () => {
  const [map, setMap] = useState(null);

  // State vars for our routing machine instance:
  const [routingMachine, setRoutingMachine] = useState(null);
  const [planeposition, setPlanePositon] = useState([0, 0]);

  // Start-End points for the routing machine:
  const [waypoints, setWaypoints] = useState([]);

  // Ref for our routing machine instace:
  const RoutingMachineRef = useRef(null);

  const updateWaypoints = async (codes) => {
    const way = await Promise.all(
      codes.map(async (code) => {
        return await getCoordinates(code);
      })
    );
    setWaypoints(way);
    setPlanePositon(way[0]);
  };

  const getCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [lat, lon];
      }
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  // useEffect(() => {
  //   // const socket = io("localhost:5000/", {
  //   //   transports: ["websocket"],
  //   //   cors: {
  //   //     origin: "http://localhost:3000/",
  //   //   },
  //   // });

  //   const socket = io("http://localhost:5000");

  //   socket.on("connected", (data) => {
  //     const pathData = JSON.parse(data);
  //     updateWaypoints(pathData.path);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // Create the routing-machine instance:
  useEffect(() => {
    // Check For the map instance:
    if (!map) return;
    if (map) {
      // Assign Control to React Ref:
      RoutingMachineRef.current = L.Routing.control({
        position: "topleft", // Where to position control on map
        lineOptions: {
          // Options for the routing line
          styles: [
            {
              color: "#757de8",
            },
          ],
        },
        waypoints: waypoints, // Point A - Point B
      });
      // Save instance to state:
      setRoutingMachine(RoutingMachineRef.current);
    }
  }, [map, waypoints]);

  // Once routing machine instance is ready, add to map:
  useEffect(() => {
    if (!routingMachine) return;
    if (routingMachine) {
      routingMachine.addTo(map);
    }
  }, [routingMachine]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post("http://localhost:5000/route", {
          origin: "IND",
          destination: "MSO",
        });
        toast("Updating Waypoints");
        updateWaypoints(data.path);
      } catch (error) {
        toast("Failed to update waypoints");
        console.error("Error fetching data:", error);
      }
    };
    const interval = setInterval(() => {
      fetchData();
    }, 50000); // set for 50 secounds, can change it as you wish
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <button variant="contained" color="default">
        Click To Change Waypoints
      </button>
      <MapContainer
        center={[37.0902, -95.7129]}
        zoom={3}
        zoomControl={false}
        style={{ height: "100vh", width: "100%", padding: 0 }}
        // Set the map instance to state when ready:
        // whenCreated={(map) => setMap(map)}
        ref={setMap}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={maps.base}
            />
            <Marker position={planeposition} icon={myIcon} />
            <ZoomControl position="topright" />
          </LayersControl.BaseLayer>
        </LayersControl>
      </MapContainer>
    </>
  );
};

export default Map;
