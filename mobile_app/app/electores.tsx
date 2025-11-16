import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ElectoresScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Instrucciones para Electores</Text>

      <Text style={styles.subtitle}>Recomendaciones de seguridad</Text>
      <Text style={styles.paragraph}>
        Durante el proceso electoral, se establecen medidas de seguridad para proteger a los ciudadanos y garantizar un voto libre y seguro:
      </Text>

      <View style={styles.listItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.listItemText}>
          <Text style={styles.bold}>Libertad del elector:</Text> Los efectivos de las Fuerzas Armadas y la Policía Nacional del Perú (PNP) tienen la responsabilidad de garantizar la libertad de los ciudadanos para ejercer su derecho a votar sin coacción alguna.
        </Text>
      </View>

      <View style={styles.listItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.listItemText}>
          <Text style={styles.bold}>Prohibición de dispositivos digitales:</Text> Está prohibido el uso de celulares, cámaras fotográficas y de video dentro de las aulas de votación y especialmente en la cámara secreta.
        </Text>
      </View>

      <View style={styles.listItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.listItemText}>
          <Text style={styles.bold}>Inmunidad temporal:</Text> Los miembros de mesa (titulares o suplentes) y personeros no podrán ser apresados por ninguna autoridad desde veinticuatro horas antes hasta veinticuatro horas después de las elecciones, salvo caso de flagrante delito. Lo mismo aplica para cualquier ciudadano capacitado para votar el día de las elecciones y 24 horas antes.
        </Text>
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
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    marginRight: 10,
  },
  listItemText: {
    fontSize: 16,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default ElectoresScreen;
