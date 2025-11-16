// app/(tabs)/miembros/index.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type MemberActivityType = 'CAPACITACION' | 'PLAZO' | 'ELECCION';

type MemberActivity = {
  id: string;
  title: string;
  date: string; // ISO
  time: string;
  type: MemberActivityType;
  description: string;
  mode: 'PRESENCIAL' | 'VIRTUAL';
  place?: string;
};

type ViewMode = 'CALENDAR' | 'INSTALL' | 'VOTING';

const MEMBER_ACTIVITIES: MemberActivity[] = [
  {
    id: 'act-1',
    title: 'Capacitación presencial ONPE',
    date: '2026-03-10',
    time: '09:00',
    type: 'CAPACITACION',
    description:
      'Sesión oficial de capacitación para miembros de mesa (titulares y suplentes).',
    mode: 'PRESENCIAL',
    place: 'IE Francisco Bolognesi – Auditorio',
  },
  {
    id: 'act-2',
    title: 'Fecha límite para excusas / justificaciones',
    date: '2026-03-15',
    time: '23:59',
    type: 'PLAZO',
    description:
      'Último día para presentar excusas o justificaciones ante el JNE.',
    mode: 'VIRTUAL',
  },
  {
    id: 'act-3',
    title: 'Curso virtual para miembros de mesa',
    date: '2026-03-18',
    time: '20:00',
    type: 'CAPACITACION',
    description:
      'Módulo virtual recomendado sobre funciones y responsabilidades.',
    mode: 'VIRTUAL',
  },
  {
    id: 'act-4',
    title: 'Día de la elección – Instalación y sufragio',
    date: '2026-04-10',
    time: '06:30',
    type: 'ELECCION',
    description:
      'Presentarse en el local, instalar la mesa, conducir el sufragio y participar del escrutinio.',
    mode: 'PRESENCIAL',
    place: 'Local de votación asignado en tu credencial ONPE',
  },
];

const INSTALL_STEPS = [
  {
    title: 'Llegar al local de votación',
    details: [
      'Presentarse a las 6:30 a. m. con DNI.',
      'Ubicar al coordinador de ONPE y registrar asistencia.',
      'Confirmar si eres titular o suplente que asumirá la mesa.',
    ],
  },
  {
    title: 'Recepción del material electoral',
    details: [
      'Verificar la caja de material junto con el coordinador.',
      'Revisar que estén las actas, cédulas, ánfora, cabinas y padrón.',
      'Reportar inmediatamente cualquier falta o irregularidad.',
    ],
  },
  {
    title: 'Instalación de cabinas y ánforas',
    details: [
      'Armar las cabinas en un lugar que garantice el secreto del voto.',
      'Colocar el ánfora en un lugar visible y accesible.',
      'Verificar los sellos de seguridad del ánfora.',
    ],
  },
  {
    title: 'Llenado de acta de instalación',
    details: [
      'Completar los datos generales de la mesa.',
      'Firmar el acta de instalación los tres miembros de mesa.',
      'Registrar la hora oficial de apertura de la mesa.',
    ],
  },
];

const VOTING_STEPS = [
  {
    title: 'Verificación de identidad del elector',
    details: [
      'Solicitar el DNI y compararlo con la fotografía.',
      'Verificar que el elector esté en el padrón de la mesa.',
      'Resolver dudas con calma, siguiendo indicaciones oficiales.',
    ],
  },
  {
    title: 'Control de padrón y entrega de cédula',
    details: [
      'Ubicar al elector en el padrón y solicitar firma o huella.',
      'Entregar la cédula correspondiente, doblada según indicaciones.',
      'Indicar la cabina de votación sin acompañar al elector.',
    ],
  },
  {
    title: 'Recepción de cédula y depósito en ánfora',
    details: [
      'Recibir la cédula doblada, sin revisar el contenido.',
      'Verificar que se deposite en el ánfora correcta.',
      'Entregar el comprobante o constancia según corresponda.',
    ],
  },
  {
    title: 'Cierre de mesa y conteo de votos',
    details: [
      'Cerrar la mesa a la hora establecida, respetando a quienes ya están en cola.',
      'Abrir el ánfora frente a personeros y observadores.',
      'Clasificar votos en válidos, nulos y blancos conforme a las reglas.',
    ],
  },
  {
    title: 'Llenado de actas y entrega de material',
    details: [
      'Completar actas de escrutinio por cada tipo de elección.',
      'Firmar actas todos los miembros de mesa y personeros presentes.',
      'Embalar y entregar el material al coordinador u órgano electoral designado.',
    ],
  },
];

export default function MemberScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [activeView, setActiveView] = useState<ViewMode>('CALENDAR');

  const sortedActivities = useMemo(
    () =>
      [...MEMBER_ACTIVITIES].sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
      ),
    []
  );

  const handleAddToCalendar = () => {
    Alert.alert(
      'Próximamente',
      'La opción para agregar estas actividades a tu calendario se podrá integrar en una siguiente versión.'
    );
  };

  const renderActivity = ({ item }: { item: MemberActivity }) => {
    const iconConfig = getActivityIcon(item.type);
    return (
      <View style={styles.activityCard}>
        <View style={styles.activityHeaderRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: iconConfig.bgColor },
            ]}
          >
            <MaterialIcons
              name={iconConfig.icon}
              size={18}
              color={iconConfig.iconColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <Text style={styles.activityMeta}>
              {formatDate(item.date)} • {item.time} • {item.mode}
            </Text>
          </View>
        </View>

        {item.place && (
          <Text style={styles.activityPlace}>Lugar: {item.place}</Text>
        )}

        <Text style={styles.activityDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Encabezado */}
      <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
        <View style={styles.heroIconCircle}>
          <MaterialIcons name="how-to-vote" size={26} color={theme.tint} />
        </View>
        <Text style={styles.heroTitle}>Miembros de mesa</Text>
        <Text style={styles.heroSubtitle}>
          Consulta tus actividades, responsabilidades y pasos clave para instalar,
          conducir y cerrar tu mesa de votación correctamente.
        </Text>

        <View style={styles.heroChipsRow}>
          <View style={styles.heroChip}>
            <MaterialIcons name="event" size={14} color={theme.tint} />
            <Text style={styles.heroChipText}>Calendario ONPE</Text>
          </View>
          <View style={styles.heroChip}>
            <MaterialIcons name="assignment" size={14} color={theme.tint} />
            <Text style={styles.heroChipText}>Guía de funciones</Text>
          </View>
        </View>
      </View>

      {/* Tabs internos */}
      <View style={styles.tabsRow}>
        <TabButton
          label="Calendario"
          active={activeView === 'CALENDAR'}
          onPress={() => setActiveView('CALENDAR')}
          themeTint={theme.tint}
        />
        <TabButton
          label="Instalación de mesa"
          active={activeView === 'INSTALL'}
          onPress={() => setActiveView('INSTALL')}
          themeTint={theme.tint}
        />
        <TabButton
          label="Sufragio y cierre"
          active={activeView === 'VOTING'}
          onPress={() => setActiveView('VOTING')}
          themeTint={theme.tint}
        />
      </View>

      {/* Contenido según pestaña */}
      <View style={styles.content}>
        {activeView === 'CALENDAR' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionIconCircle,
                  { backgroundColor: '#eff6ff' },
                ]}
              >
                <MaterialIcons name="event-note" size={18} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>
                  Calendario de actividades
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Revisa las fechas importantes como capacitaciones, plazos y el
                  día de la elección.
                </Text>
              </View>
            </View>

            <FlatList
              data={sortedActivities}
              keyExtractor={(item) => item.id}
              renderItem={renderActivity}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 8, marginTop: 8 }}
            />

            <Pressable
              style={styles.calendarButton}
              onPress={handleAddToCalendar}
            >
              <MaterialIcons name="add-alert" size={18} color="#fff" />
              <Text style={styles.calendarButtonText}>
                Agregar a mi calendario (próximamente)
              </Text>
            </Pressable>
          </View>
        )}

        {activeView === 'INSTALL' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionIconCircle,
                  { backgroundColor: '#ecfdf3' },
                ]}
              >
                <MaterialIcons name="build" size={18} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Instalación de mesa</Text>
                <Text style={styles.sectionSubtitle}>
                  Sigue estos pasos antes del inicio del sufragio para instalar
                  correctamente tu mesa.
                </Text>
              </View>
            </View>

            {INSTALL_STEPS.map((step, index) => (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                {step.details.map((d, idx) => (
                  <Text key={idx} style={styles.bullet}>
                    • {d}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {activeView === 'VOTING' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View
                style={[
                  styles.sectionIconCircle,
                  { backgroundColor: '#fef3c7' },
                ]}
              >
                <MaterialIcons name="how-to-vote" size={18} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Sufragio y cierre</Text>
                <Text style={styles.sectionSubtitle}>
                  Guía rápida para atender electores, conducir el voto y cerrar
                  la mesa con un conteo correcto.
                </Text>
              </View>
            </View>

            {VOTING_STEPS.map((step, index) => (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={[styles.stepNumberCircle, { backgroundColor: '#f59e0b20' }]}>
                    <Text style={[styles.stepNumberText, { color: '#b45309' }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                {step.details.map((d, idx) => (
                  <Text key={idx} style={styles.bullet}>
                    • {d}
                  </Text>
                ))}
              </View>
            ))}

            <Text style={styles.infoHint}>
              Recuerda: cualquier duda o situación especial se debe resolver
              siguiendo las instrucciones oficiales de ONPE y JNE.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function TabButton({
  label,
  active,
  onPress,
  themeTint,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  themeTint: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        active && { borderBottomColor: themeTint },
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active && { color: themeTint, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getActivityIcon(type: MemberActivityType) {
  switch (type) {
    case 'CAPACITACION':
      return {
        icon: 'school' as const,
        bgColor: '#eef2ff',
        iconColor: '#4f46e5',
      };
    case 'PLAZO':
      return {
        icon: 'schedule' as const,
        bgColor: '#fef3c7',
        iconColor: '#b45309',
      };
    case 'ELECCION':
      return {
        icon: 'how-to-vote' as const,
        bgColor: '#ecfdf3',
        iconColor: '#16a34a',
      };
    default:
      return {
        icon: 'event' as const,
        bgColor: '#e5e7eb',
        iconColor: '#374151',
      };
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  heroIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
  heroChipsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  heroChipText: {
    fontSize: 11,
    color: '#111827',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
    marginTop: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
  },
  content: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  section: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#4b5563',
  },
  activityCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 10,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  activityMeta: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  activityPlace: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 12,
  },
  calendarButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  stepCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 10,
    marginBottom: 8,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  bullet: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  infoHint: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 8,
  },
});
