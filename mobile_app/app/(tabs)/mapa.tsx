import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getVotingCenters, getTables } from '../../services/api';

interface MapMarkerData {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  type: string;
}

export default function MapScreen() {
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearestCenter, setNearestCenter] = useState<MapMarkerData | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

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
        Alert.alert('Error', 'Could not fetch location data.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location && markers.length > 0) {
      let closest: MapMarkerData | null = null;
      let minDistance = Infinity;

      markers.forEach(center => {
        const distance = getDistance(
          location.coords.latitude,
          location.coords.longitude,
          center.latitud,
          center.longitud
        );
        if (distance < minDistance) {
          minDistance = distance;
          closest = center;
        }
      });
      setNearestCenter(closest);
    }
  }, [location, markers]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
      >
        {markers.map((marker) => (
          <Marker
            key={`${marker.type}-${marker.id}`}
            coordinate={{ latitude: marker.latitud, longitude: marker.longitud }}
            title={marker.nombre}
            pinColor={nearestCenter?.id === marker.id && nearestCenter?.type === marker.type ? 'blue' : 'red'}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
