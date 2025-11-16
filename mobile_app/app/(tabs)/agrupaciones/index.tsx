// app/(tabs)/agrupaciones/index.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  PARTIES,
  CANDIDATES,
  type Party,
  type Candidate,
} from '../../../constants/parties';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function PartiesListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredParties = useMemo(() => {
    if (!normalizedQuery) return PARTIES;
    return PARTIES.filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.shortName.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const matchingCandidates = useMemo(() => {
    if (!normalizedQuery) return [];
    return CANDIDATES.filter(
      (c) =>
        c.name.toLowerCase().includes(normalizedQuery) ||
        (c.region && c.region.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  const selectedForComparison = useMemo(
    () => CANDIDATES.filter((c) => comparisonIds.includes(c.id)),
    [comparisonIds]
  );

  const toggleComparison = (id: string) => {
    setComparisonIds((prev) => {
      let next: string[];

      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else if (prev.length >= 2) {
        // Si ya hay 2, reemplaza el primero por el nuevo
        next = [prev[1], id];
      } else {
        next = [...prev, id];
      }

      // Si después de este cambio hay 2 seleccionados, abrimos el modal
      if (next.length === 2) {
        setShowCompareModal(true);
      }

      return next;
    });
  };

  const renderPartyItem = ({ item }: { item: Party }) => (
    <Pressable
      onPress={() => router.push(`/agrupaciones/${item.id}`)}
      style={[styles.card, { borderColor: theme.tint }]}
    >
      <Text style={styles.shortName}>{item.shortName}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>
      {item.slogan && (
        <Text style={styles.slogan}>“{item.slogan}”</Text>
      )}
      <Text style={[styles.linkLabel, { color: theme.tint }]}>
        Ver detalle de la agrupación →
      </Text>
    </Pressable>
  );

  const renderCandidateResult = (c: Candidate) => {
    const party = PARTIES.find((p) => p.id === c.partyId);
    const isSelected = comparisonIds.includes(c.id);

    return (
      <View key={c.id} style={styles.candidateResultCard}>
        <Pressable onPress={() => router.push(`/agrupaciones/candidato/${c.id}`)}>
          <Text style={styles.candidateResultName}>{c.name}</Text>
          <Text style={styles.candidateResultMeta}>
            {roleLabel(c.role)}
            {c.region ? ` • ${c.region}` : ''}
          </Text>
          {party && (
            <Text style={styles.candidateResultMeta}>
              Partido: {party.name} ({party.shortName})
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => toggleComparison(c.id)}
          style={[
            styles.compareButton,
            isSelected && styles.compareButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.compareButtonText,
              isSelected && styles.compareButtonTextSelected,
            ]}
          >
            {isSelected
              ? 'Seleccionado para comparar'
              : 'Seleccionar para comparar'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <>
      {/* MODAL DE COMPARACIÓN */}
      <Modal
        visible={showCompareModal && selectedForComparison.length === 2}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompareModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Comparación de candidatos
            </Text>

            <View style={styles.compareRowHeader}>
              <Text style={styles.compareCellHeader}>Campo</Text>
              <Text style={styles.compareCellHeader}>
                {selectedForComparison[0]?.name}
              </Text>
              <Text style={styles.compareCellHeader}>
                {selectedForComparison[1]?.name}
              </Text>
            </View>

            {/* Partido */}
            <View style={styles.compareRow}>
              <Text style={styles.compareCellLabel}>Partido</Text>
              <Text style={styles.compareCellValue}>
                {partyLabel(selectedForComparison[0]?.partyId)}
              </Text>
              <Text style={styles.compareCellValue}>
                {partyLabel(selectedForComparison[1]?.partyId)}
              </Text>
            </View>

            {/* Cargo */}
            <View style={styles.compareRow}>
              <Text style={styles.compareCellLabel}>Cargo</Text>
              <Text style={styles.compareCellValue}>
                {roleLabel(selectedForComparison[0]?.role)}
              </Text>
              <Text style={styles.compareCellValue}>
                {roleLabel(selectedForComparison[1]?.role)}
              </Text>
            </View>

            {/* Región */}
            <View style={styles.compareRow}>
              <Text style={styles.compareCellLabel}>Región</Text>
              <Text style={styles.compareCellValue}>
                {selectedForComparison[0]?.region ?? '-'}
              </Text>
              <Text style={styles.compareCellValue}>
                {selectedForComparison[1]?.region ?? '-'}
              </Text>
            </View>

            {/* Propuesta 1 */}
            <View style={styles.compareRow}>
              <Text style={styles.compareCellLabel}>Propuesta 1</Text>
              <Text style={styles.compareCellValue}>
                {selectedForComparison[0]?.proposals[0] ?? '-'}
              </Text>
              <Text style={styles.compareCellValue}>
                {selectedForComparison[1]?.proposals[0] ?? '-'}
              </Text>
            </View>

            {/* Propuesta 2 */}
            <View style={styles.compareRow}>
              <Text style={styles.compareCellLabel}>Propuesta 2</Text>
              <Text style={styles.compareCellValue}>
                {selectedForComparison[0]?.proposals[1] ?? '-'}
              </Text>
              <Text style={styles.compareCellValue}>
                {selectedForComparison[1]?.proposals[1] ?? '-'}
              </Text>
            </View>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowCompareModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Agrupaciones políticas</Text>
        <Text style={styles.subtitle}>
          Busca información de agrupaciones y candidatos de las Elecciones Generales 2026.
        </Text>

        {/* 🔍 Buscador */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Buscar por nombre de partido, candidato o región..."
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { borderColor: theme.tint }]}
            placeholderTextColor="#999"
          />
        </View>

        {comparisonIds.length > 0 && (
          <View style={styles.comparisonHint}>
            <Text style={styles.comparisonHintText}>
              Has seleccionado {comparisonIds.length} candidato(s) para comparar.
              Puedes seleccionar hasta 2 candidatos, incluso de partidos distintos.
            </Text>
          </View>
        )}

        {/* Resultados de candidatos cuando hay búsqueda */}
        {normalizedQuery !== '' && (
          <View style={styles.searchResults}>
            <Text style={styles.sectionTitle}>
              Candidatos que coinciden con la búsqueda
            </Text>
            {matchingCandidates.length > 0 ? (
              matchingCandidates.map(renderCandidateResult)
            ) : (
              <Text style={styles.noResultsText}>
                No se encontraron candidatos para “{query}”.
              </Text>
            )}
          </View>
        )}

        {/* Lista de agrupaciones */}
        <Text style={styles.sectionTitle}>Agrupaciones políticas</Text>
        <FlatList
          data={filteredParties}
          keyExtractor={(item) => item.id}
          renderItem={renderPartyItem}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>
    </>
  );
}

function roleLabel(role: Candidate['role'] | undefined) {
  switch (role) {
    case 'PRESIDENTE':
      return 'Presidencia';
    case 'VICEPRESIDENTE':
      return 'Vicepresidencia';
    case 'DIPUTADO':
      return 'Diputado';
    case 'SENADOR':
      return 'Senador';
    case 'PARLAMENTO_ANDINO':
      return 'Parlamento Andino';
    default:
      return '-';
  }
}

function partyLabel(partyId: string | undefined) {
  if (!partyId) return '-';
  const party = PARTIES.find((p) => p.id === partyId);
  if (!party) return '-';
  return `${party.name} (${party.shortName})`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  searchResults: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  noResultsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  shortName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  slogan: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#444',
    marginBottom: 4,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  candidateResultCard: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  candidateResultName: {
    fontSize: 13,
    fontWeight: '600',
  },
  candidateResultMeta: {
    fontSize: 11,
    color: '#666',
  },
  compareButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  compareButtonSelected: {
    backgroundColor: '#023e8a',
    borderColor: '#023e8a',
  },
  compareButtonText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  compareButtonTextSelected: {
    color: '#fff',
  },
  comparisonHint: {
    marginTop: 4,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e9f5ff',
  },
  comparisonHintText: {
    fontSize: 11,
    color: '#333',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  compareRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
    marginBottom: 4,
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  compareCellHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  compareCellLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  compareCellValue: {
    flex: 1,
    fontSize: 11,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#023e8a',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
