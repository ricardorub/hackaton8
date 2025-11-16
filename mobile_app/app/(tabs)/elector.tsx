// app/(tabs)/elector.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import {
  ELECTORS,
  POLLING_PLACES,
  TABLE_LOCATIONS,
} from "@/constants/electors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type ElectorView = "LOCAL" | "CEDULA" | "SEGURIDAD";

export default function ElectorScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const accent = theme.tint;

  const [identifier, setIdentifier] = useState("");
  const [activeView, setActiveView] = useState<ElectorView>("LOCAL");
  const [state, setState] = useState<null | {
    electorName: string;
    mesa: string;
    pollingPlaceName: string;
    address: string;
    district: string;
    province: string;
    lat: number;
    lon: number;
    aula: string;
    piso: string;
    pabellon: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  // --- DATA ESTÁTICA ---

  const VOTE_TIPS = {
    valid: [
      "Marca solo un símbolo por cada elección (presidencial, congresal, etc.).",
      "Haz la marca dentro del recuadro del partido o candidato que elijas.",
      "Usa el lapicero que te indique la ONPE o el personal de mesa.",
    ],
    nullVote: [
      "Marcar dos o más símbolos en la misma elección.",
      "Escribir frases, garabatos o hacer dibujos sobre la cédula.",
      "Tachar toda la cédula o romperla.",
    ],
    blankVote: [
      "Dejar la casilla sin marcar también es una opción válida.",
      "El voto en blanco no suma a ningún candidato, pero se contabiliza por separado.",
    ],
  };

  const SAFETY_TIPS = {
    carry: [
      "DNI vigente o documento permitido para votar.",
      "Agua, bloqueador y gorro si hay sol fuerte.",
      "Lentes o ayudas visuales si las necesitas para leer la cédula.",
    ],
    avoid: [
      "No fotografiar tu cédula marcada.",
      "No hacer propaganda política dentro del local ni en la fila.",
      "No entregar tu DNI ni tu cédula marcada a extraños.",
    ],
    health: [
      "Usa ropa y calzado cómodos, puede haber colas largas.",
      "Si te sientes mal, avisa de inmediato al personal de la ONPE.",
      "Mantén distancia prudente y respeta las indicaciones del personal.",
    ],
  };

  const LEGAL_NORMS = [
    {
      id: "1",
      title: "Ley Orgánica de Elecciones",
      shortDescription:
        "Norma principal que regula la organización de las elecciones generales y otros procesos electorales.",
      url: "https://www.onpe.gob.pe",
    },
    {
      id: "2",
      title: "Reglamento de Elecciones Generales",
      shortDescription:
        "Desarrolla los procedimientos específicos para la ejecución de las elecciones generales.",
      url: "https://www.jne.gob.pe",
    },
    {
      id: "3",
      title: "Normas sobre propaganda electoral y encuestas",
      shortDescription:
        "Establece límites y reglas para la difusión de propaganda y publicación de encuestas.",
      url: "https://www.jne.gob.pe",
    },
  ];

  // --- LÓGICA ---

  const handleSearch = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Ingresa tu DNI o código de elector.");
      setState(null);
      return;
    }

    const elector = ELECTORS.find((e) => e.id === trimmed);

    if (!elector) {
      setError("No se encontró información para este identificador.");
      setState(null);
      return;
    }

    const mesa = elector.mesa;
    const mesaInfo = TABLE_LOCATIONS.find((t) => t.mesa === mesa);

    if (!mesaInfo) {
      setError("Se encontró al elector, pero no se ha configurado la mesa.");
      setState(null);
      return;
    }

    const pollingPlace = POLLING_PLACES.find(
      (p) => p.id === mesaInfo.pollingPlaceId
    );

    if (!pollingPlace) {
      setError(
        "Se encontró la mesa, pero no se ha configurado el local de votación."
      );
      setState(null);
      return;
    }

    setError(null);
    setState({
      electorName: elector.fullName,
      mesa,
      pollingPlaceName: pollingPlace.name,
      address: pollingPlace.address,
      district: pollingPlace.district,
      province: pollingPlace.province,
      lat: pollingPlace.lat,
      lon: pollingPlace.lon,
      aula: mesaInfo.aula,
      piso: mesaInfo.piso,
      pabellon: mesaInfo.pabellon,
    });
  };

  const handleOpenMaps = () => {
    if (!state) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${state.lat},${state.lon}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "No se pudo abrir el mapa",
        "Por favor revisa tu conexión o intenta más tarde."
      );
    });
  };

  const handleOpenLaw = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "No se pudo abrir el enlace",
        "Por favor revisa tu conexión o intenta más tarde."
      );
    });
  };

  const pisoLabel = (piso: string) => {
    if (piso === "1") return "primer piso";
    if (piso === "2") return "segundo piso";
    if (piso === "3") return "tercer piso";
    return `${piso}° piso`;
  };

  // --- RENDER ---

  return (
    <ScrollView style={[styles.container, { backgroundColor: "#f1f5f9" }]}>
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: accent + "22" }]}>
        <View style={styles.heroIconCircle}>
          <MaterialIcons name="how-to-vote" size={26} color={accent} />
        </View>
        <View style={styles.heroTextBlock}>
          <Text style={styles.title}>Información para electores</Text>
          <Text style={styles.subtitle}>
            Consulta tu local y mesa de votación y accede a una guía clara para
            emitir un voto válido y seguro.
          </Text>
        </View>
      </View>

      {/* MINI TABS INTERNOS */}
      <View style={styles.topTabsRow}>
        <Pressable
          onPress={() => setActiveView("LOCAL")}
          style={[
            styles.topTab,
            activeView === "LOCAL" && { backgroundColor: "#fff" },
          ]}
        >
          <MaterialIcons
            name="place"
            size={16}
            color={activeView === "LOCAL" ? accent : "#64748b"}
          />
          <Text
            style={[
              styles.topTabText,
              activeView === "LOCAL" && { color: accent, fontWeight: "600" },
            ]}
          >
            Mi local
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveView("CEDULA")}
          style={[
            styles.topTab,
            activeView === "CEDULA" && { backgroundColor: "#fff" },
          ]}
        >
          <MaterialIcons
            name="check-circle"
            size={16}
            color={activeView === "CEDULA" ? accent : "#64748b"}
          />
          <Text
            style={[
              styles.topTabText,
              activeView === "CEDULA" && { color: accent, fontWeight: "600" },
            ]}
          >
            Cómo votar
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveView("SEGURIDAD")}
          style={[
            styles.topTab,
            activeView === "SEGURIDAD" && { backgroundColor: "#fff" },
          ]}
        >
          <MaterialIcons
            name="health-and-safety"
            size={16}
            color={activeView === "SEGURIDAD" ? accent : "#64748b"}
          />
          <Text
            style={[
              styles.topTabText,
              activeView === "SEGURIDAD" && {
                color: accent,
                fontWeight: "600",
              },
            ]}
          >
            Seguridad y leyes
          </Text>
        </Pressable>
      </View>

      {/* VISTA 1: MI LOCAL */}
      {activeView === "LOCAL" && (
        <View style={styles.section}>
          {/* Paso 1: Identifícate */}
          <View style={styles.sectionHeaderRow}>
            <View
              style={[
                styles.sectionIconCircle,
                { backgroundColor: accent + "22" },
              ]}
            >
              <MaterialIcons name="search" size={18} color={accent} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Paso 1 · Identifícate</Text>
              <Text style={styles.sectionSubtitle}>
                Ingresa tu DNI o código de elector.
              </Text>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>DNI o código de elector</Text>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Ejemplo: 12345678"
              keyboardType="numeric"
              style={[styles.input, { borderColor: accent }]}
              placeholderTextColor="#999"
            />
            <Pressable
              onPress={handleSearch}
              style={[styles.buttonPrimary, { backgroundColor: accent }]}
            >
              <MaterialIcons name="location-searching" size={18} color="#fff" />
              <Text style={styles.buttonPrimaryText}>Buscar mi local</Text>
            </Pressable>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Text style={styles.helperText}>
              * Usa un DNI de ejemplo configurado en la demo, por ejemplo{" "}
              <Text style={{ fontWeight: "700" }}>12345678</Text>.
            </Text>
          </View>

          {/* Paso 2: Resultado */}
          {state && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionIconCircle,
                    { backgroundColor: "#dcfce7" },
                  ]}
                >
                  <MaterialIcons name="place" size={18} color="#16a34a" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>
                    Paso 2 · Tu local y tu mesa
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Revisa la información antes de salir de casa.
                  </Text>
                </View>
              </View>

              <Text style={styles.chipInfo}>Datos del elector</Text>
              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Nombre completo</Text>
                <Text style={styles.fieldValue}>{state.electorName}</Text>

                <Text style={styles.fieldLabel}>Mesa de sufragio</Text>
                <View style={styles.mesaRow}>
                  <MaterialIcons name="how-to-vote" size={18} color={accent} />
                  <Text style={styles.mesaValue}>{state.mesa}</Text>
                </View>
              </View>

              <Text style={styles.chipInfo}>Local de votación</Text>
              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Nombre del local</Text>
                <Text style={styles.fieldValue}>{state.pollingPlaceName}</Text>

                <Text style={styles.fieldLabel}>Dirección</Text>
                <Text style={styles.fieldValue}>
                  {state.address}, {state.district}, {state.province}
                </Text>

                <Pressable onPress={handleOpenMaps} style={styles.buttonGhost}>
                  <MaterialIcons name="map" size={18} color={accent} />
                  <Text style={[styles.buttonGhostText, { color: accent }]}>
                    Ver en mapa (Google Maps)
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.chipInfo}>Ubicación dentro del local</Text>
              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Mesa</Text>
                <Text style={styles.fieldValue}>{state.mesa}</Text>

                <Text style={styles.fieldLabel}>Aula</Text>
                <Text style={styles.fieldValue}>{state.aula}</Text>

                <Text style={styles.fieldLabel}>Piso</Text>
                <Text style={styles.fieldValue}>{pisoLabel(state.piso)}</Text>

                <Text style={styles.fieldLabel}>Pabellón</Text>
                <Text style={styles.fieldValue}>Pabellón {state.pabellon}</Text>

                <View style={styles.inlineHint}>
                  <MaterialIcons name="info" size={16} color="#0f172a" />
                  <Text style={styles.inlineHintText}>
                    Ingresa por la puerta principal, dirígete al pabellón{" "}
                    {state.pabellon}, sube al {pisoLabel(state.piso)} y busca el
                    aula {state.aula}. Si tienes dudas, pide apoyo al personal
                    de ONPE.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* VISTA 2: CÓMO VOTAR */}
      {activeView === "CEDULA" && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View
              style={[styles.sectionIconCircle, { backgroundColor: "#eef2ff" }]}
            >
              <MaterialIcons name="check-circle" size={18} color="#4f46e5" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Cómo marcar tu voto</Text>
              <Text style={styles.sectionSubtitle}>
                Revisa estas reglas básicas para que tu voto cuente y no sea
                observado.
              </Text>
            </View>
          </View>

          {/* Voto válido */}
          <View style={styles.cardSoft}>
            <Text style={styles.infoTitle}>Voto válido ✅</Text>
            <Text style={styles.infoText}>
              Tu voto será válido cuando marcas correctamente la opción que
              eliges siguiendo estas indicaciones:
            </Text>
            {VOTE_TIPS.valid.map((t, idx) => (
              <Text key={`valid-${idx}`} style={styles.bullet}>
                • {t}
              </Text>
            ))}
          </View>

          {/* Voto nulo */}
          <View style={styles.cardSoftDanger}>
            <Text style={styles.infoTitle}>Voto nulo ❌</Text>
            <Text style={styles.infoText}>
              El voto se considera nulo cuando cometes alguno de estos errores
              en la cédula:
            </Text>
            {VOTE_TIPS.nullVote.map((t, idx) => (
              <Text key={`null-${idx}`} style={styles.bullet}>
                • {t}
              </Text>
            ))}
          </View>

          {/* Voto en blanco */}
          <View style={styles.cardSoft}>
            <Text style={styles.infoTitle}>Voto en blanco ⚪</Text>
            <Text style={styles.infoText}>
              El voto en blanco también es una opción. Esto es lo que significa:
            </Text>
            {VOTE_TIPS.blankVote.map((t, idx) => (
              <Text key={`blank-${idx}`} style={styles.bullet}>
                • {t}
              </Text>
            ))}
          </View>

          <Text style={styles.infoHint}>
            (En una versión futura se pueden incluir imágenes simuladas de la
            cédula para mostrar ejemplos de voto válido, nulo y en blanco.)
          </Text>
        </View>
      )}

      {/* VISTA 3: SEGURIDAD Y LEYES */}
      {activeView === "SEGURIDAD" && (
        <View style={styles.sectionLast}>
          <View style={styles.sectionHeaderRow}>
            <View
              style={[styles.sectionIconCircle, { backgroundColor: "#fffbeb" }]}
            >
              <MaterialIcons
                name="health-and-safety"
                size={18}
                color="#d97706"
              />
            </View>
            <View>
              <Text style={styles.sectionTitle}>
                Recomendaciones y marco legal
              </Text>
              <Text style={styles.sectionSubtitle}>
                Cuida tu seguridad y conoce las normas que respaldan el proceso.
              </Text>
            </View>
          </View>

          {/* Seguridad */}
          <View style={styles.card}>
            <Text style={styles.infoTitle}>Qué llevar 🎒</Text>
            {SAFETY_TIPS.carry.map((t, idx) => (
              <Text key={`carry-${idx}`} style={styles.bullet}>
                • {t}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.infoTitle}>Qué evitar 🚫</Text>
            {SAFETY_TIPS.avoid.map((t, idx) => (
              <Text key={`avoid-${idx}`} style={styles.bullet}>
                • {t}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.infoTitle}>Cuida tu salud 💧</Text>
            {SAFETY_TIPS.health.map((t, idx) => (
              <Text key={`health-${idx}`} style={styles.bullet}>
                • {t}
              </Text>
            ))}
          </View>

          {/* Marco legal */}
          <View style={{ marginTop: 12 }}>
            <Text style={styles.infoTitle}>Marco legal básico ⚖️</Text>
            <Text style={styles.infoText}>
              Estas normas regulan la organización de las elecciones y los
              derechos y deberes de los electores.
            </Text>
          </View>

          {LEGAL_NORMS.map((law) => (
            <View key={law.id} style={styles.card}>
              <Text style={styles.infoTitle}>{law.title}</Text>
              <Text style={styles.infoText}>{law.shortDescription}</Text>
              <Pressable
                onPress={() => handleOpenLaw(law.url)}
                style={styles.buttonLaw}
              >
                <MaterialIcons name="open-in-new" size={16} color={accent} />
                <Text style={[styles.buttonLawText, { color: accent }]}>
                  Ver norma completa
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  hero: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  heroTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 4,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
  },

  // top mini tabs
  topTabsRow: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    padding: 3,
    marginBottom: 12,
  },
  topTab: {
    flex: 1,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  topTabText: {
    fontSize: 12,
    color: "#64748b",
  },

  section: {
    marginBottom: 16,
  },
  sectionLast: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },

  inputBlock: {
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  buttonPrimary: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#b00020",
    marginTop: 4,
  },
  helperText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },

  chipInfo: {
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardSoft: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#eef2ff",
  },
  cardSoftDanger: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fee2e2",
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    color: "#0f172a",
  },
  fieldValue: {
    fontSize: 13,
    color: "#1f2933",
  },
  mesaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  mesaValue: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
    color: "#0f172a",
  },

  buttonGhost: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonGhostText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  inlineHint: {
    flexDirection: "row",
    marginTop: 8,
  },
  inlineHintText: {
    fontSize: 11,
    color: "#475569",
    marginLeft: 6,
    flex: 1,
  },

  infoTitle: {
  fontSize: 16,          // antes 14
  fontWeight: '600',
  marginBottom: 4,
  color: '#0f172a',
},
infoText: {
  fontSize: 13,          // antes 12
  color: '#334155',
  marginBottom: 4,
},
bullet: {
  fontSize: 13,          // antes 12
  color: '#1e293b',
  lineHeight: 19,        // para que se lea más cómodo
},
  infoHint: {
    fontSize: 11,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },

  buttonLaw: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonLawText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});
