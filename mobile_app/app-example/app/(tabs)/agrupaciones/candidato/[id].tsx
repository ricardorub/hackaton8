// app/(tabs)/agrupaciones/candidato/[id].tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  CANDIDATES,
  CANDIDATE_ACTIVITIES,
  PARTIES,
  type Candidate,
} from '../../../../constants/parties';

export default function CandidateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const candidate: Candidate | undefined = useMemo(
    () => CANDIDATES.find((c) => c.id === id),
    [id]
  );

  const party = useMemo(
    () => PARTIES.find((p) => p.id === candidate?.partyId),
    [candidate]
  );

  const activities = useMemo(
    () => CANDIDATE_ACTIVITIES.filter((a) => a.candidateId === id),
    [id]
  );

  if (!candidate) {
    return (
      <View style={styles.centered}>
        <Text>El candidato seleccionado no existe.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: candidate.name }} />
      <ScrollView style={styles.container}>
        <Text style={styles.name}>{candidate.name}</Text>
        <Text style={styles.role}>
          {roleLabel(candidate.role)} {candidate.region ? `• ${candidate.region}` : ''}
        </Text>
        {party && (
          <Text style={styles.party}>
            Agrupación política: {party.name} ({party.shortName})
          </Text>
        )}

        {/* Datos generales (VI) */}
        <Text style={styles.sectionTitle}>Datos del candidato</Text>
        <Text style={styles.paragraph}>{candidate.bio}</Text>

        {/* Hoja de vida (VII) */}
        {(candidate.education || candidate.experience) && (
          <>
            <Text style={styles.sectionTitle}>Hoja de vida</Text>
            {candidate.education && (
              <Text style={styles.paragraph}>
                <Text style={styles.label}>Formación: </Text>
                {candidate.education}
              </Text>
            )}
            {candidate.experience && (
              <Text style={styles.paragraph}>
                <Text style={styles.label}>Experiencia: </Text>
                {candidate.experience}
              </Text>
            )}
          </>
        )}

        {/* Propuestas (X) */}
        <Text style={styles.sectionTitle}>Propuestas principales</Text>
        {candidate.proposals.map((p, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {p}
          </Text>
        ))}

        {/* Actividades (VIII) */}
        <Text style={styles.sectionTitle}>Actividades recientes</Text>
        {activities.length > 0 ? (
          activities.map((a) => (
            <View key={a.id} style={styles.activityCard}>
              <Text style={styles.activityTitle}>{a.title}</Text>
              <Text style={styles.activityMeta}>
                {new Date(a.date).toLocaleString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {a.location ? ` • ${a.location}` : ''}
              </Text>
              <Text style={styles.paragraph}>{a.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.paragraph}>
            No se han registrado actividades recientes para este candidato.
          </Text>
        )}
      </ScrollView>
    </>
  );
}

function roleLabel(role: Candidate['role']) {
  switch (role) {
    case 'PRESIDENTE':
      return 'Candidata a la Presidencia';
    case 'VICEPRESIDENTE':
      return 'Candidato a la Vicepresidencia';
    case 'DIPUTADO':
      return 'Candidato a la Cámara de Diputados';
    case 'SENADOR':
      return 'Candidato a la Cámara de Senadores';
    case 'PARLAMENTO_ANDINO':
      return 'Candidata al Parlamento Andino';
    default:
      return role;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  role: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  party: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
  },
  bullet: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityMeta: {
    fontSize: 11,
    color: '#777',
    marginBottom: 4,
  },
});
