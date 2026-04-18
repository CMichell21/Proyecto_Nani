import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ENDPOINTS } from "../../../constants/apiConfig";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  onBack: () => void;
}

type BookingStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "rejected";

export default function BabysitterBookingHistory({ onBack }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<BookingStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeStatus = (
    estado: string,
  ): "pending" | "confirmed" | "in_progress" | "completed" | "rejected" => {
    const estadoNormalizado = (estado || "").toString().trim().toLowerCase();

    if (estadoNormalizado === "pendiente") return "pending";
    if (estadoNormalizado === "confirmado") return "confirmed";
    if (
      estadoNormalizado === "rechazada" ||
      estadoNormalizado === "rechazado"
    ) {
      return "rejected";
    }
    if (
      estadoNormalizado === "en progreso" ||
      estadoNormalizado === "en_progreso"
    ) {
      return "in_progress";
    }
    if (
      estadoNormalizado === "finalizado" ||
      estadoNormalizado === "finalizada" ||
      estadoNormalizado === "completado" ||
      estadoNormalizado === "completada"
    ) {
      return "completed";
    }

    return "pending";
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        console.log("No se encontró userId");
        setBookings([]);
        return;
      }

      const url = ENDPOINTS.get_reservas_ninera(userId);
      console.log("Consultando reservas en:", url);

      const response = await fetch(url);
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        console.log("Error obteniendo reservas:", data);
        setBookings([]);
        return;
      }

      const reservasArray = Array.isArray(data) ? data : [];

      const mappedBookings = reservasArray.map((item: any) => {
        const clientePersona = item?.cliente?.persona;
        const fecha = item?.fecha_servicio || "";
        const horaInicio = item?.hora_inicio || "";
        const horaFin = item?.hora_fin || "";

        const status = normalizeStatus(item?.estado || "");

        return {
          id: item?.id,
          clientName: clientePersona
            ? `${clientePersona?.nombre || ""} ${clientePersona?.apellido || ""}`.trim()
            : "Cliente",
          clientPhoto:
            clientePersona?.foto_url || "https://via.placeholder.com/150",
          date: fecha,
          time:
            horaInicio && horaFin
              ? `${horaInicio} - ${horaFin}`
              : horaInicio || horaFin || "Horario no disponible",
          duration: item?.duracion_horas || 0,
          children:
            item?.cantidad_ninos ??
            item?.ninos_cantidad ??
            item?.total_ninos ??
            0,
          payment:
            item?.monto_total ??
            item?.total ??
            item?.pago_total ??
            item?.tarifa_total ??
            0,
          status,
          rating: item?.rating ?? null,
        };
      });

      setBookings(mappedBookings);
    } catch (error) {
      console.log("Error fetchBookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" || booking.status === filter;
    const matchesSearch = booking.clientName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.payment || 0), 0);

  const completedCount = bookings.filter(
    (b) => b.status === "completed",
  ).length;

  const getStatusText = (status: string) => {
    if (status === "completed") return "Finalizado";
    if (status === "in_progress") return "En progreso";
    if (status === "confirmed") return "Confirmado";
    if (status === "rejected") return "Rechazada";
    return "Pendiente";
  };

  const getStatusStyle = (status: string) => {
    if (status === "completed") return styles.completed;
    if (status === "in_progress") return styles.inProgress;
    if (status === "confirmed") return styles.confirmed;
    if (status === "rejected") return styles.rejected;
    return styles.pending;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#886BC1" />
          <Text style={{ textAlign: "center", marginTop: 12, color: "#8D8D8D", fontWeight: "600" }}>
            Cargando historial...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Header Degradado Nani Style */}
          <LinearGradient
            colors={["#886BC1", "#FF768A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  onBack
                    ? onBack()
                    : router.replace("/register/babysister/BabysitterDashboard")
                }
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Historial de Reservas</Text>
              <View style={{ width: 44 }} /> {/* Espaciador invisible para centrar el título */}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Completadas</Text>
                <Text style={styles.statValue}>{completedCount}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Ganado total</Text>
                <Text style={styles.statValue}>L {totalEarnings}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Buscador y Filtros */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#A0A0A0" />
              <TextInput
                placeholder="Buscar por cliente..."
                placeholderTextColor="#A0A0A0"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filterRow}>
              {[
                { key: "all", label: "Todas" },
                { key: "pending", label: "Pendientes" },
                { key: "confirmed", label: "Confirmadas" },
                { key: "in_progress", label: "En progreso" },
                { key: "completed", label: "Finalizadas" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.filterButton,
                    filter === item.key && styles.activeFilter,
                  ]}
                  onPress={() => setFilter(item.key as BookingStatus)}
                >
                  <Text
                    style={
                      filter === item.key
                        ? styles.activeFilterText
                        : styles.filterText
                    }
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lista de Reservas */}
          <View style={{ paddingHorizontal: 16 }}>
            {filteredBookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No hay reservas</Text>
                <Text style={styles.emptyText}>
                  No encontramos reservas con ese filtro o búsqueda.
                </Text>
              </View>
            ) : (
              filteredBookings.map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  <Image
                    source={{ uri: booking.clientPhoto }}
                    style={styles.clientPhoto}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{booking.clientName}</Text>

                    <View style={styles.row}>
                      <MaterialIcons
                        name="calendar-today"
                        size={14}
                        color="#8D8D8D"
                      />
                      <Text style={styles.infoText}>{booking.date}</Text>
                    </View>

                    <View style={styles.row}>
                      <Ionicons name="time-outline" size={15} color="#8D8D8D" />
                      <Text style={styles.infoText}>{booking.time}</Text>
                    </View>

                    <View style={styles.footerRow}>
                      <Text style={styles.childrenText}>
                        {booking.children} {booking.children === 1 ? 'niño' : 'niños'}
                      </Text>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.payment}>L {booking.payment}</Text>
                        <Text style={getStatusStyle(booking.status)}>
                          {getStatusText(booking.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Contenedores
  safeArea: { flex: 1, backgroundColor: "#886BC1" },
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  centerContent: { justifyContent: "center", alignItems: "center" },

  // Header Nani Style
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },

  // Stats Row
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 16,
    width: "48%",
  },
  statLabel: { color: "#FFFFFF", opacity: 0.9, fontSize: 13, marginBottom: 4 },
  statValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },

  // Buscador y Filtros
  searchContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    }),
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 15, color: "#2E2E2E" },
  
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 8,
  },
  activeFilter: { backgroundColor: "#886BC1" },
  filterText: { color: "#555", fontSize: 13, fontWeight: "500" },
  activeFilterText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  // Tarjetas de Reservas
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    marginBottom: 14,
    elevation: 2,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    }),
  },
  clientPhoto: { width: 64, height: 64, borderRadius: 32, marginRight: 14 },
  clientName: { fontSize: 17, marginBottom: 6, fontWeight: "700", color: "#2E2E2E" },
  
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  infoText: { color: "#8D8D8D", fontSize: 13 },
  
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 },
  childrenText: { color: "#9A9A9A", fontSize: 13, marginBottom: 2 },
  payment: { fontSize: 18, color: "#886BC1", fontWeight: "700", marginBottom: 2 },

  // Estados
  completed: { color: "#22C55E", fontSize: 13, fontWeight: "700" }, // Verde moderno
  pending: { color: "#F59E0B", fontSize: 13, fontWeight: "700" },   // Naranja vibrante
  confirmed: { color: "#3B82F6", fontSize: 13, fontWeight: "700" }, // Azul claro
  inProgress: { color: "#886BC1", fontSize: 13, fontWeight: "700" },// Morado de la app
  rejected: { color: "#EF4444", fontSize: 13, fontWeight: "700" },  // Rojo moderno

  // Tarjeta vacía
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    }),
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#2E2E2E" },
  emptyText: { color: "#8D8D8D", textAlign: "center", fontSize: 14, lineHeight: 20 },
});