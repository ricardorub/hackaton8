import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getVotingCenters, getTables } from '../services/api';

interface MapMarkerData {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  type: string;
}

const WebMap: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centersResponse, tablesResponse] = await Promise.all([
          getVotingCenters(),
          getTables(),
        ]);

        const centers = centersResponse.data.map((c: any) => ({ ...c, type: 'center' }));
        const tables = tablesResponse.data.map((t: any) => ({ ...t, type: 'table' }));

        setMarkers([...centers, ...tables]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <MapContainer center={[-12.0464, -77.0428]} zoom={11} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker) => (
        <Marker key={`${marker.type}-${marker.id}`} position={[marker.latitud, marker.longitud]}>
          <Popup>
            <b>{marker.nombre}</b>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WebMap;
