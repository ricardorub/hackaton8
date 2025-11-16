import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const MiembrosMesaScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cronograma para Miembros de Mesa</Text>

      <View style={styles.item}>
        <Text style={styles.time}>6:00 a.m. ⏰</Text>
        <Text style={styles.description}>Los miembros de mesa deben reunirse en el local de votación asignado.</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.time}>7:00 a.m. 🛠️</Text>
        <Text style={styles.description}>Se conforma e instala la mesa. Se inicia la revisión del material electoral recibido.</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.time}>8:00 a.m. 🗳️</Text>
        <Text style={styles.description}>Inicia oficialmente la jornada de sufragio.</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.time}>5:00 p.m. 🚪</Text>
        <Text style={styles.description}>Se cierran las puertas del local de votación. Pueden votar quienes hayan ingresado antes de esta hora.</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.time}>Después de 5:00 p.m. 📊</Text>
        <Text style={styles.description}>Inicio del acto de escrutinio. Una vez concluido el sufragio, se inicia el acto de escrutinio.</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.time}>Finalización ✅</Text>
        <Text style={styles.description}>Conclusión del acto de escrutinio. El acto de escrutinio finaliza cuando se han contado todos los votos. Se completan todas las tareas finales.</Text>
      </View>
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
  item: {
    marginBottom: 20,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
  },
});

export default MiembrosMesaScreen;
