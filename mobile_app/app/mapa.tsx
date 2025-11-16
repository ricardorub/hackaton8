import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity, Modal } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import ChatbotScreen from "./chatbot";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../config";

interface Centro {
  id: string;
  nombre: string;
  distrito: string;
  lat: number;
  lng: number;
}

export default function MapaScreen() {
  const router = useRouter();
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCentro, setSelectedCentro] = useState<Centro | null>(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    fetchCentros();
  }, []);

  const fetchCentros = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mapa/api/centros`);
      setCentros(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching centros:", error);
      setLoading(false);
    }
  };

  const generateMapHTML = () => {
    const mapCenter = centros.length > 0 ? centros[0] : { lat: -12.0464, lng: -77.0428 };

    const markers = centros
      .map((c) => {
        if (!c.lat || !c.lng) return "";
        return `
          L.marker([${c.lat}, ${c.lng}])
            .addTo(map)
            .bindPopup('<strong>${c.nombre}</strong><br>Distrito: ${c.distrito}');
        `;
      })
      .join("\n");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map = L.map('map').setView([${mapCenter.lat}, ${mapCenter.lng}], 11);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          ${markers}
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Cargando centros de votación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: generateMapHTML() }}
        style={{ width: "100%", height: Dimensions.get("window").height * 0.7 }}
      />
      <ScrollView style={styles.infoPanelContainer}>
        <Text style={styles.title}>Centros de Votación</Text>
        {centros.map((centro) => (
          <View key={centro.id} style={styles.centroItem}>
            <Text style={styles.centroNombre}>{centro.nombre}</Text>
            <Text style={styles.centroDistrito}>Distrito: {centro.distrito}</Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => setIsChatbotVisible(true)}>
        <Text style={styles.fabIcon}>?</Text>
      </TouchableOpacity>
      {/* TODO: Replace "YOUR_GEMINI_API_KEY" with your actual Gemini API key. */}
      {/* For production, it's recommended to store the API key in a secure way, e.g., using environment variables. */}
      <ChatbotScreen isVisible={isChatbotVisible} onClose={() => setIsChatbotVisible(false)} apiKey="YOUR_GEMINI_API_KEY" />

      <TouchableOpacity style={styles.menuFab} onPress={() => setIsMenuVisible(true)}>
        <Text style={styles.fabIcon}>☰</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); router.push('/candidatos'); }}>
              <Text style={styles.menuItemText}>Candidatos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); router.push('/cronograma'); }}>
              <Text style={styles.menuItemText}>Cronograma</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); router.push('/electores'); }}>
              <Text style={styles.menuItemText}>Electores</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); router.push('/miembrosmesa'); }}>
              <Text style={styles.menuItemText}>Miembros de Mesa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsMenuVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoPanelContainer: {
    flex: 0.3,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  centroItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  centroNombre: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  centroDistrito: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
  menuFab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    left: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});
