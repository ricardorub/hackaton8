import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Candidato {
  id: string;
  nombre: string;
  partido_nombre: string;
  partido_logo: string;
  foto: string;
}

const CandidatosScreen = () => {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidatos();
  }, []);

  const fetchCandidatos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/candidatos`);
      setCandidatos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching candidatos:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Cargando candidatos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Candidatos</Text>
      {candidatos.map((candidato) => (
        <View key={candidato.id} style={styles.candidatoItem}>
          <Image source={{ uri: `data:image/png;base64,${candidato.foto}` }} style={styles.candidatoFoto} />
          <View style={styles.candidatoInfo}>
            <Text style={styles.candidatoNombre}>{candidato.nombre}</Text>
            <Text style={styles.partidoNombre}>{candidato.partido_nombre}</Text>
          </View>
          <Image source={{ uri: `data:image/png;base64,${candidato.partido_logo}` }} style={styles.partidoLogo} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidatoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  candidatoFoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  candidatoInfo: {
    flex: 1,
  },
  candidatoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  partidoNombre: {
    fontSize: 16,
    color: '#666',
  },
  partidoLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default CandidatosScreen;
