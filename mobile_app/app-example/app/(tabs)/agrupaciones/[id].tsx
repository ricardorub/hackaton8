// app/(tabs)/agrupaciones/[id].tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  PARTIES,
  GOVERNMENT_PLANS,
  CANDIDATES,
  PARTY_NEWS,
  type Party,
  type Candidate,
} from "../../../constants/parties";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type Section = "RESUMEN" | "PLAN" | "CANDIDATURAS" | "NOTICIAS";

const SECTION_TABS: { label: string; value: Section }[] = [
  { label: "Resumen", value: "RESUMEN" },
  { label: "Plan de gobierno", value: "PLAN" },
  { label: "Candidaturas", value: "CANDIDATURAS" },
  { label: "Noticias", value: "NOTICIAS" },
];

type RoleFilter =
  | "TODOS"
  | "PRESIDENTE"
  | "VICEPRESIDENTE"
  | "DIPUTADO"
  | "SENADOR"
  | "PARLAMENTO_ANDINO";

export default function PartyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [section, setSection] = useState<Section>("RESUMEN");
  const [regionFilter, setRegionFilter] = useState<string>("TODAS");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("TODOS");
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  const party: Party | undefined = useMemo(
    () => PARTIES.find((p) => p.id === id),
    [id]
  );

  const partyPlan = useMemo(
    () => GOVERNMENT_PLANS.filter((p) => p.partyId === id),
    [id]
  );

  const partyCandidates = useMemo(
    () => CANDIDATES.filter((c) => c.partyId === id),
    [id]
  );

  const partyNews = useMemo(
    () => PARTY_NEWS.filter((n) => n.partyId === id),
    [id]
  );

  const generalNews = useMemo(() => PARTY_NEWS.filter((n) => !n.partyId), []);

  if (!party) {
    return (
      <View style={styles.centered}>
        <Text>La agrupación seleccionada no existe.</Text>
      </View>
    );
  }

  // Regiones disponibles para filtros
  const availableRegions = useMemo(
    () =>
      Array.from(
        new Set(
          partyCandidates.map((c) => c.region).filter((r): r is string => !!r)
        )
      ),
    [partyCandidates]
  );

  // Aplica filtros avanzados
  const filteredByRegion =
    regionFilter === "TODAS"
      ? partyCandidates
      : partyCandidates.filter((c) => c.region === regionFilter);

  const filteredByRole: Candidate[] =
    roleFilter === "TODOS"
      ? filteredByRegion
      : filteredByRegion.filter((c) => c.role === roleFilter);

  // Grupos por tipo (con filtros aplicados)
  const presi = filteredByRole.filter(
    (c) => c.role === "PRESIDENTE" || c.role === "VICEPRESIDENTE"
  );
  const diputados = filteredByRole.filter((c) => c.role === "DIPUTADO");
  const senadores = filteredByRole.filter((c) => c.role === "SENADOR");
  const parlamentoAndino = filteredByRole.filter(
    (c) => c.role === "PARLAMENTO_ANDINO"
  );

  // Candidatos seleccionados para comparar
  const selectedForComparison = filteredByRole.filter((c) =>
    comparisonIds.includes(c.id)
  );

  const toggleComparison = (id: string) => {
    setComparisonIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        // Si ya hay 2, reemplaza el primero
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const renderCandidateCard = (
    c: Candidate,
    opts?: { enableCompare?: boolean }
  ) => {
    const isSelectedForCompare = comparisonIds.includes(c.id);

    return (
      <View key={c.id} style={styles.card}>
        <Text style={styles.candidateName}>{c.name}</Text>
        <View style={styles.row}>
          <Text style={styles.chipSmall}>{roleLabel(c.role)}</Text>
          {c.region && <Text style={styles.chipSmall}>Región: {c.region}</Text>}
        </View>
        <Text style={styles.candidateBio}>{c.bio}</Text>
        <Text style={styles.subBlockTitle}>Propuestas principales:</Text>
        {c.proposals.slice(0, 3).map((p, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {p}
          </Text>
        ))}
        <Pressable
          onPress={() => router.push(`/agrupaciones/candidato/${c.id}`)}
          style={styles.linkButton}
        >
          <Text style={[styles.linkButtonText, { color: theme.tint }]}>
            Ver ficha completa del candidato →
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderSectionContent = () => {
    switch (section) {
      case "RESUMEN":
        return (
          <View>
            <Text style={styles.blockTitle}>Elecciones Generales 2026</Text>
            <Text style={styles.paragraph}>
              Esta agrupación participa en las Elecciones Generales 2026,
              presentando plancha presidencial, lista al Congreso (Cámara de
              Diputados y Cámara de Senadores) y, según corresponda,
              candidaturas al Parlamento Andino.
            </Text>

            <Text style={styles.blockTitle}>Plancha presidencial</Text>
            {presi.map((c) => renderCandidateCard(c))}

            <Text style={styles.blockTitle}>Resumen del partido</Text>
            <Text style={styles.paragraph}>{party.description}</Text>

            {partyPlan.length > 0 && (
              <>
                <Text style={styles.blockTitle}>
                  Principales ejes del plan de gobierno
                </Text>
                {partyPlan.slice(0, 3).map((p) => (
                  <View key={p.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{p.sector}</Text>
                    <Text style={styles.paragraph}>{p.summary}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        );

      case "PLAN":
        return (
          <View>
            <Text style={styles.blockTitle}>Plan de gobierno por sectores</Text>
            {partyPlan.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.cardTitle}>{p.sector}</Text>
                <Text style={styles.paragraph}>{p.summary}</Text>
              </View>
            ))}
            {partyPlan.length === 0 && (
              <Text>No se han registrado aún los sectores del plan.</Text>
            )}
          </View>
        );

      case "CANDIDATURAS":
        return (
          <View>
            {/* 🎛 Filtros avanzados */}
            <Text style={styles.blockTitle}>Filtros de candidaturas</Text>
            <Text style={styles.paragraph}>
              Filtra las candidaturas por región y tipo de cargo.
            </Text>

            {/* Filtro por región */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersRow}
            >
              <Pressable
                onPress={() => setRegionFilter("TODAS")}
                style={[
                  styles.filterChip,
                  regionFilter === "TODAS" && {
                    backgroundColor: theme.tint,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    regionFilter === "TODAS" && { color: "#fff" },
                  ]}
                >
                  Todas las regiones
                </Text>
              </Pressable>
              {availableRegions.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRegionFilter(r)}
                  style={[
                    styles.filterChip,
                    regionFilter === r && {
                      backgroundColor: theme.tint,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      regionFilter === r && { color: "#fff" },
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Filtro por tipo de cargo */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersRow}
            >
              {ROLE_FILTER_OPTIONS.map((opt) => {
                const isActive = roleFilter === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setRoleFilter(opt.value)}
                    style={[
                      styles.filterChip,
                      isActive && { backgroundColor: theme.tint },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && { color: "#fff" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Listas por tipo */}
            <Text style={styles.blockTitle}>Planchas presidenciales</Text>
            {presi.length > 0 ? (
              presi.map((c) => renderCandidateCard(c, { enableCompare: true }))
            ) : (
              <Text style={styles.paragraph}>
                No hay plancha presidencial registrada con los filtros
                seleccionados.
              </Text>
            )}

            <Text style={styles.blockTitle}>Cámara de Diputados</Text>
            {diputados.length > 0 ? (
              diputados.map((c) =>
                renderCandidateCard(c, { enableCompare: true })
              )
            ) : (
              <Text style={styles.paragraph}>
                No se han registrado candidaturas a la Cámara de Diputados con
                los filtros seleccionados.
              </Text>
            )}

            <Text style={styles.blockTitle}>Cámara de Senadores</Text>
            {senadores.length > 0 ? (
              senadores.map((c) =>
                renderCandidateCard(c, { enableCompare: true })
              )
            ) : (
              <Text style={styles.paragraph}>
                No se han registrado candidaturas a la Cámara de Senadores con
                los filtros seleccionados.
              </Text>
            )}

            <Text style={styles.blockTitle}>Parlamento Andino</Text>
            {parlamentoAndino.length > 0 ? (
              parlamentoAndino.map((c) =>
                renderCandidateCard(c, { enableCompare: true })
              )
            ) : (
              <Text style={styles.paragraph}>
                No se han registrado candidaturas al Parlamento Andino con los
                filtros seleccionados.
              </Text>
            )}

            {/* ⚖️ Comparador de candidatos */}
            {selectedForComparison.length === 2 && (
              <View style={styles.compareBlock}>
                <Text style={styles.blockTitle}>
                  Comparación de candidatos seleccionados
                </Text>
                <View style={styles.compareRowHeader}>
                  <Text style={styles.compareCellHeader}>Campo</Text>
                  <Text style={styles.compareCellHeader}>
                    {selectedForComparison[0].name}
                  </Text>
                  <Text style={styles.compareCellHeader}>
                    {selectedForComparison[1].name}
                  </Text>
                </View>

                <View style={styles.compareRow}>
                  <Text style={styles.compareCellLabel}>Cargo</Text>
                  <Text style={styles.compareCellValue}>
                    {roleLabel(selectedForComparison[0].role)}
                  </Text>
                  <Text style={styles.compareCellValue}>
                    {roleLabel(selectedForComparison[1].role)}
                  </Text>
                </View>

                <View style={styles.compareRow}>
                  <Text style={styles.compareCellLabel}>Región</Text>
                  <Text style={styles.compareCellValue}>
                    {selectedForComparison[0].region ?? "-"}
                  </Text>
                  <Text style={styles.compareCellValue}>
                    {selectedForComparison[1].region ?? "-"}
                  </Text>
                </View>

                <View style={styles.compareRow}>
                  <Text style={styles.compareCellLabel}>Propuesta 1</Text>
                  <Text style={styles.compareCellValue}>
                    {selectedForComparison[0].proposals[0] ?? "-"}
                  </Text>
                  <Text style={styles.compareCellValue}>
                    {selectedForComparison[1].proposals[0] ?? "-"}
                  </Text>
                </View>

                <View style={styles.compareRow}>
                  <Text style={styles.compareCellLabel}>Propuesta 2</Text>
                  <Text style={styles.compareCellValue}>
                    {selectedForComparison[0].proposals[1] ?? "-"}
                  </Text>
                  <Text style={styles.compareCellValue}>
                    {selectedForComparison[1].proposals[1] ?? "-"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );

      case "NOTICIAS":
        return (
          <View>
            <Text style={styles.blockTitle}>
              Noticias sobre esta agrupación
            </Text>
            {partyNews.map((n) => (
              <View key={n.id} style={styles.card}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.newsMeta}>
                  {n.source} •{" "}
                  {new Date(n.publishedAt).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <Text style={styles.paragraph}>{n.summary}</Text>
              </View>
            ))}
            {partyNews.length === 0 && (
              <Text>No hay noticias específicas para esta agrupación.</Text>
            )}

            <Text style={styles.blockTitle}>
              Noticias generales de las elecciones
            </Text>
            {generalNews.map((n) => (
              <View key={n.id} style={styles.card}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.newsMeta}>
                  {n.source} •{" "}
                  {new Date(n.publishedAt).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <Text style={styles.paragraph}>{n.summary}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: party.shortName }} />
      <ScrollView style={styles.container}>
        <Text style={styles.partyName}>{party.name}</Text>
        {party.slogan && (
          <Text style={styles.partySlogan}>“{party.slogan}”</Text>
        )}

        {/* Tabs internos */}
        <View style={styles.tabsRow}>
          {SECTION_TABS.map((t) => {
            const isActive = t.value === section;
            return (
              <Pressable
                key={t.value}
                onPress={() => setSection(t.value)}
                style={[
                  styles.tabButton,
                  isActive && { borderBottomColor: theme.tint },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && { color: theme.tint, fontWeight: "600" },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.content}>{renderSectionContent()}</View>
      </ScrollView>
    </>
  );
}

const ROLE_FILTER_OPTIONS: { label: string; value: RoleFilter }[] = [
  { label: "Todos los cargos", value: "TODOS" },
  { label: "Presidencia", value: "PRESIDENTE" },
  { label: "Vicepresidencia", value: "VICEPRESIDENTE" },
  { label: "Diputados", value: "DIPUTADO" },
  { label: "Senadores", value: "SENADOR" },
  { label: "Parlamento Andino", value: "PARLAMENTO_ANDINO" },
];

function roleLabel(role: Candidate["role"]) {
  switch (role) {
    case "PRESIDENTE":
      return "Presidente";
    case "VICEPRESIDENTE":
      return "Vicepresidente";
    case "DIPUTADO":
      return "Diputado";
    case "SENADOR":
      return "Senador";
    case "PARLAMENTO_ANDINO":
      return "Parlamento Andino";
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
    alignItems: "center",
    justifyContent: "center",
  },
  partyName: {
    fontSize: 20,
    fontWeight: "700",
  },
  partySlogan: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 8,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    color: "#666",
  },
  content: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  subBlockTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: "600",
  },
  candidateBio: {
    fontSize: 12,
    color: "#444",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  chipSmall: {
    fontSize: 11,
    color: "#333",
    backgroundColor: "#eee",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginRight: 4,
    marginTop: 2,
  },
  bullet: {
    fontSize: 12,
    color: "#333",
  },
  linkButton: {
    marginTop: 6,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  newsMeta: {
    fontSize: 11,
    color: "#777",
    marginBottom: 4,
  },
  filtersRow: {
    marginVertical: 4,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    backgroundColor: "#fff",
  },
  filterChipText: {
    fontSize: 11,
    color: "#444",
  },
  compareButton: {
    marginTop: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  compareButtonSelected: {
    backgroundColor: "#023e8a",
    borderColor: "#023e8a",
  },
  compareButtonText: {
    fontSize: 11,
    color: "#333",
    fontWeight: "500",
  },
  compareButtonTextSelected: {
    color: "#fff",
  },
  compareBlock: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  compareRowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
    marginBottom: 4,
  },
  compareRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  compareCellHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
  },
  compareCellLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
  },
  compareCellValue: {
    flex: 1,
    fontSize: 11,
    color: "#333",
  },
});
