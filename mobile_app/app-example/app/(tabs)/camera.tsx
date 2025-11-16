import { View, Text, Button, StyleSheet } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera';

interface PoliticalParty {
  id: number;
  name: string;
  founder: string;
  foundationYear: number;
  ideology: string;
  politicalPosition: string;
  representation: string;
  description: string;
}

const camera = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false)
  const [detectedParty, setDetectedParty] = useState<PoliticalParty | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCamera) {
      interval = setInterval(() => {
        takePicture();
      }, 5000); // Take a picture every 5 seconds
    }
    return () => clearInterval(interval);
  }, [showCamera]);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
      if (photo && photo.base64) {
        sendImageToBackend(photo.base64);
      }
    }
  };

  const sendImageToBackend = async (base64Image: string) => {
    try {
      // Replace with your actual backend URL
      const predictResponse = await fetch('http://your-backend-url/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const predictData = await predictResponse.json();
      if (predictData.party_name) {
        fetchPartyDetails(predictData.party_name);
      }
    } catch (error) {
      console.error('Error sending image to backend:', error);
    }
  };

  const fetchPartyDetails = async (partyName: string) => {
    try {
      // Replace with your actual backend URL
      const detailsResponse = await fetch(`http://your-backend-url/party/${partyName}`);
      const detailsData = await detailsResponse.json();
      setDetectedParty(detailsData);
    } catch (error) {
      console.error('Error fetching party details:', error);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title={showCamera ? "Close Camera" : "Open Camera"} onPress={() => setShowCamera(!showCamera)} />
      {showCamera &&
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <Button title="Flip Camera" onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))} />
          </View>
        </CameraView>}
      {detectedParty && (
        <View style={styles.resultsContainer}>
          <Text style={styles.partyName}>{detectedParty.name}</Text>
          <Text>Founder: {detectedParty.founder}</Text>
          <Text>Founded: {detectedParty.foundationYear}</Text>
          <Text>Ideology: {detectedParty.ideology}</Text>
          <Text>Position: {detectedParty.politicalPosition}</Text>
          <Text>Representation: {detectedParty.representation}</Text>
          <Text>Description: {detectedParty.description}</Text>
        </View>
      )}
    </View>
  )
}

export default camera

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  resultsContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  partyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});