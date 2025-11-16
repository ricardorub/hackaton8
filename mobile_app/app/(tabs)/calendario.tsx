// app/(tabs)/calendario.tsx
import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    FlatList,
    Modal,
} from "react-native";
import {
    EVENTS,
    type ElectoralEvent,
    type EventType,
} from "@/constants/events";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { addEventToCalendar } from "../../utils/calendar";

type FilterType = "ALL" | EventType;

const FILTERS: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "ALL" },
    { label: "Elecciones", value: "ELECCION" },
    { label: "Proceso electoral", value: "PROCESO" },
    { label: "Miembros de mesa", value: "MIEMBRO_MESA" },
];

export default function CalendarioScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const [filter, setFilter] = useState<FilterType>("ALL");
    const [selectedEvent, setSelectedEvent] = useState<ElectoralEvent | null>(
        null
    );

    // RF1.2.1 + RF1.2.2 → filtro + orden cronológico
    const filteredEvents = useMemo(() => {
        let data: ElectoralEvent[] =
            filter === "ALL"
                ? EVENTS
                : EVENTS.filter((event) => event.type === filter);

        return [...data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [filter]);

    const getTypeLabel = (type: EventType) => {
        switch (type) {
            case "ELECCION":
                return "Elecciones";
            case "PROCESO":
                return "Proceso electoral";
            case "MIEMBRO_MESA":
                return "Miembros de mesa";
            default:
                return "";
        }
    };

    const getTargetLabel = (target: ElectoralEvent["target"]) => {
        switch (target) {
            case "ELECTOR":
                return "Electores";
            case "MIEMBRO_MESA":
                return "Miembros de mesa";
            case "GENERAL":
            default:
                return "Público general";
        }
    };

    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        const dateLabel = d.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        const timeLabel = d.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return { dateLabel, timeLabel };
    };

    const renderEvent = ({ item }: { item: ElectoralEvent }) => {
        const { dateLabel, timeLabel } = formatDateTime(item.date);

        return (
            <Pressable
                onPress={() => setSelectedEvent(item)} // 👉 abre el detalle (RF1.3.1)
                style={[styles.card, { borderColor: theme.tint }]}
            >
                {/* Tipo de evento (Elecciones, Proceso, etc.) */}
                <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                        <Text style={styles.badgeText}>{getTypeLabel(item.type)}</Text>
                    </View>
                    {item.level && (
                        <View style={styles.badgeSecondary}>
                            <Text style={styles.badgeSecondaryText}>
                                {item.level === "NACIONAL"
                                    ? "Nacional"
                                    : item.level === "REGIONAL"
                                        ? "Regional"
                                        : "Local"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* RF1.3.1 – Título */}
                <Text style={styles.cardTitle}>{item.title}</Text>

                {/* Fecha y hora */}
                <Text style={styles.cardDate}>
                    {dateLabel} • {timeLabel}
                </Text>

                {/* Descripción corta */}
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                {/* Dirigido a */}
                <View style={styles.pill}>
                    <Text style={styles.pillText}>
                        Dirigido a: {getTargetLabel(item.target)}
                    </Text>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* Filtros (RF1.2.1) */}
            <View style={styles.filtersContainer}>
                {FILTERS.map((f) => {
                    const isActive = f.value === filter;
                    return (
                        <Pressable
                            key={f.value}
                            onPress={() => setFilter(f.value)}
                            style={[
                                styles.filterButton,
                                isActive && { backgroundColor: theme.tint },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    isActive && { color: "#fff", fontWeight: "600" },
                                ]}
                            >
                                {f.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Lista (RF1.1) */}
            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                renderItem={renderEvent}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay eventos para este filtro.</Text>
                }
            />

            {/* Modal de detalle (RF1.3.1) */}
            <Modal
                visible={!!selectedEvent}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedEvent(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedEvent && (
                            <>
                                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                                <Text style={styles.modalSubtitle}>
                                    {getTypeLabel(selectedEvent.type)}
                                </Text>

                                <Text style={styles.modalText}>
                                    <Text style={styles.modalLabel}>Fecha y hora: </Text>
                                    {formatDateTime(selectedEvent.date).dateLabel} •{" "}
                                    {formatDateTime(selectedEvent.date).timeLabel}
                                </Text>

                                <Text style={styles.modalText}>
                                    <Text style={styles.modalLabel}>Dirigido a: </Text>
                                    {getTargetLabel(selectedEvent.target)}
                                </Text>

                                {selectedEvent.level && (
                                    <Text style={styles.modalText}>
                                        <Text style={styles.modalLabel}>Ámbito: </Text>
                                        {selectedEvent.level === "NACIONAL"
                                            ? "Nacional"
                                            : selectedEvent.level === "REGIONAL"
                                                ? "Regional"
                                                : "Local"}
                                    </Text>
                                )}

                                <Text style={[styles.modalText, { marginTop: 8 }]}>
                                    <Text style={styles.modalLabel}>Descripción: </Text>
                                    {selectedEvent.description}
                                </Text>

                                {/* RF1.3.2 – Futuro: agregar al calendario */}
                                <Pressable
                                    style={[styles.mainButton, { backgroundColor: theme.tint }]}
                                    onPress={async () => {
                                        if (!selectedEvent) return;

                                        await addEventToCalendar({
                                            title: selectedEvent.title,
                                            notes: selectedEvent.description,
                                            startDate: new Date(selectedEvent.date),
                                            endDate: new Date(
                                                new Date(selectedEvent.date).getTime() + 60 * 60 * 1000 // +1 hora
                                            ),
                                        });
                                    }}
                                >
                                    <Text style={styles.mainButtonText}>
                                        Agregar a mi calendario
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.secondaryButton}
                                    onPress={() => setSelectedEvent(null)}
                                >
                                    <Text style={styles.secondaryButtonText}>Cerrar</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    filtersContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    filterButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    filterText: {
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 16,
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        backgroundColor: "#fff",
        elevation: 1,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    badgeRow: {
        flexDirection: "row",
        gap: 6,
        marginBottom: 4,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "600",
    },
    badgeSecondary: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "#eee",
    },
    badgeSecondaryText: {
        fontSize: 11,
        color: "#333",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 13,
        color: "#333",
        marginBottom: 8,
    },
    pill: {
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "#f2f2f2",
    },
    pillText: {
        fontSize: 11,
        color: "#333",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        color: "#666",
    },
    // Modal estilos
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 13,
        color: "#666",
        marginBottom: 8,
    },
    modalText: {
        fontSize: 13,
        color: "#333",
        marginBottom: 4,
    },
    modalLabel: {
        fontWeight: "600",
    },
    mainButton: {
        marginTop: 16,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
    },
    mainButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
        textAlign: "center",
    },
    secondaryButton: {
        marginTop: 8,
        paddingVertical: 8,
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#333",
        fontSize: 13,
    },
});
