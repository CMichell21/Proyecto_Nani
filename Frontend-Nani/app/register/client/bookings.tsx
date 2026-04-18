import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  QrCode,
  Star,
  Timer,
  XCircle,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ENDPOINTS } from "../../../constants/apiConfig";

type BookingStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "en_progreso"
  | "rejected";

export default function BookingsListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sendingReview, setSendingReview] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState(""); 
  const [sendingCancel, setSendingCancel] = useState(false); 
  const [cancelWarning, setCancelWarning] = useState<string | null>(null); 

  const fetchBookings = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(ENDPOINTS.get_mis_reservas_detalle(userId));
      const data = await response.json();

      if (!response.ok) {
        setBookings([]);
        return;
      }

      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        babysitter: item.babysitter,
        ninera_id: item.ninera_id,
        photo: item.photo,
        date: item.date,
        time: item.time,
        duration: item.duration,
        location: item.location || "Ubicación no especificada",
        status: item.status as BookingStatus,
        amount: item.amount,
        rating: item.rating ?? 0.0,
        reviewed: item.reviewed || false,
        motivo_rechazo: item.motivo_rechazo || null,
        motivo_cancelacion: item.motivo_cancelacion || null,
      }));

      setBookings(mapped);
    } catch (error) {
      console.log("Error fetchBookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const handlePostReview = async () => {
    const comentarioLimpio = comment.trim();
    if (!comentarioLimpio) {
      Alert.alert("Atención", "Por favor, escribe un comentario.");
      return;
    }

    try {
      setSendingReview(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(ENDPOINTS.crear_resena, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reserva_id: selectedBooking.id,
          ninera_id: selectedBooking.ninera_id,
          puntuacion: rating,
          comentario: comentarioLimpio,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("¡Gracias!", "Tu reseña ha sido publicada.");
        setModalVisible(false);
        setComment("");
        setRating(5);
        await fetchBookings();
      } else {
        Alert.alert("Atención", result.message || "Error al publicar reseña.");
      }
    } catch (error) {
      Alert.alert("Error", "No pudimos conectar con el servidor.");
    } finally {
      setSendingReview(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      Alert.alert(
        "Atención",
        "Por favor escribe un motivo (mínimo 5 caracteres).",
      );
      return;
    }
    try {
      setSendingCancel(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        ENDPOINTS.cancelar_reserva(selectedBooking.id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo_cancelacion: cancelReason.trim() }),
        },
      );
      const result = await response.json();
      if (response.ok) {
        if (result.advertencia) {
          Alert.alert("Reserva cancelada", result.advertencia);
        } else {
          Alert.alert(
            "Reserva cancelada",
            "Tu reserva ha sido cancelada exitosamente.",
          );
        }
        setCancelModalVisible(false);
        setCancelReason("");
        await fetchBookings();
      } else {
        Alert.alert(
          "Error",
          result.message || "No se pudo cancelar la reserva.",
        );
      }
    } catch {
      Alert.alert("Error", "No pudimos conectar con el servidor.");
    } finally {
      setSendingCancel(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        fetchBookings();
      }
    });

    return () => sub.remove();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusBadge = (status: BookingStatus) => {
    const badges = {
      confirmed: {
        bg: "#ECFDF5",
        color: "#16A34A",
        icon: <CheckCircle2 size={12} color="#16A34A" />,
        label: "Confirmada",
      },
      en_progreso: {
        bg: "rgba(136, 107, 193, 0.15)", // Ajustado al morado de la app
        color: "#886BC1",
        icon: <Timer size={12} color="#886BC1" />,
        label: "En curso",
      },
      pending: {
        bg: "#FEFCE8",
        color: "#CA8A04",
        icon: <Clock3 size={12} color="#CA8A04" />,
        label: "Pendiente",
      },
      completed: {
        bg: "rgba(136, 107, 193, 0.15)", // Ajustado al morado de la app
        color: "#886BC1",
        icon: <CheckCircle2 size={12} color="#886BC1" />,
        label: "Completada",
      },
      cancelled: {
        bg: "#FEF2F2",
        color: "#EF4444",
        icon: <XCircle size={12} color="#EF4444" />,
        label: "Cancelada",
      },
      rejected: {
        bg: "#FFF1F0",
        color: "#DC2626",
        icon: <XCircle size={12} color="#DC2626" />,
        label: "Rechazada",
      },
    };
    const config = badges[status] || badges.pending;
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        {config.icon}
        <Text style={[styles.badgeText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const upcomingBookings = bookings.filter((b) => {
    return (
      b.status === "confirmed" ||
      b.status === "pending" ||
      b.status === "en_progreso"
    );
  });

  const pastBookings = bookings.filter((b) => {
    return (
      b.status === "completed" ||
      b.status === "cancelled" ||
      b.status === "rejected"
    );
  });

  if (loading && !refreshing) {
    return (
      <View style={[styles.safeArea, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#886BC1"
          />
        }
      >
        {/* HEADER CON DEGRADADO */}
        <LinearGradient
          colors={["#886BC1", "#FF768A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mis reservas</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas</Text>
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <View key={booking.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Image
                    source={{ uri: booking.photo }}
                    style={styles.avatar}
                  />
                  <View style={styles.cardTopInfo}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.nameText} numberOfLines={1}>
                          {booking.babysitter}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Star size={12} color="#FF768A" fill="#FF768A" />
                          <Text style={styles.ratingText}>
                            {booking.rating}
                          </Text>
                        </View>
                      </View>
                      {getStatusBadge(booking.status)}
                    </View>
                  </View>
                </View>

                <View style={styles.bookingInfoGroup}>
                  <View style={styles.bookingInfoRow}>
                    <Calendar size={16} color="#886BC1" />
                    <Text style={styles.bookingInfoText}>{booking.date}</Text>
                  </View>
                  <View style={styles.bookingInfoRow}>
                    <Clock3 size={16} color="#886BC1" />
                    <Text style={styles.bookingInfoText}>
                      {booking.time} ({booking.duration})
                    </Text>
                  </View>
                  <View style={styles.bookingInfoRow}>
                    <MapPin size={16} color="#8D8D8D" />
                    <Text style={styles.bookingInfoText} numberOfLines={1}>
                      {booking.location}
                    </Text>
                  </View>
                </View>

                {booking.status === "confirmed" && (
                  <View style={styles.qrButtonsRow}>
                    <TouchableOpacity
                      style={styles.qrEntryButton}
                      onPress={() =>
                        router.push({
                          pathname: "/register/client/ClientActiveSession",
                          params: { bookingId: booking.id },
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <QrCode size={16} color="#16A34A" />
                      <Text style={styles.qrEntryButtonText}>Entrada</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {booking.status === "confirmed" && (
                  <TouchableOpacity
                    style={styles.cancelBookingButton}
                    onPress={() => {
                      setSelectedBooking(booking);
                      setCancelModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <XCircle size={16} color="#EF4444" />
                    <Text style={styles.cancelBookingText}>
                      Cancelar reserva
                    </Text>
                  </TouchableOpacity>
                )}

                {booking.status === "en_progreso" && (
                  <View style={styles.qrButtonsRow}>
                    <TouchableOpacity
                      style={styles.qrExitButton}
                      onPress={() =>
                        router.push({
                          pathname: "/register/client/ClientActiveSession",
                          params: { bookingId: booking.id },
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <QrCode size={16} color="#EA580C" />
                      <Text style={styles.qrExitButtonText}>Salida</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.amountText}>{booking.amount}</Text>
                  <View style={styles.cardFooterActions}>
                    <TouchableOpacity style={styles.chatButton} activeOpacity={0.8}>
                      <MessageCircle size={16} color="#886BC1" />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() =>
                        router.push({
                          pathname: "/register/client/ClientActiveSession",
                          params: { bookingId: booking.id },
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.detailsButtonText}>Ver detalles</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyTextSeccion}>
              No hay reservas próximas.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial</Text>
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <View key={booking.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Image
                    source={{ uri: booking.photo }}
                    style={styles.avatar}
                  />
                  <View style={styles.cardTopInfo}>
                    <View style={styles.cardTopRow}>
                      <Text
                        style={[styles.nameText, { flex: 1 }]}
                        numberOfLines={1}
                      >
                        {booking.babysitter}
                      </Text>
                      {getStatusBadge(booking.status)}
                    </View>
                  </View>
                </View>

                {booking.status === "rejected" && (
                  <View style={styles.rejectionNote}>
                    <XCircle size={16} color="#DC2626" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rejectionText}>
                        Motivo: {booking.motivo_rechazo || "No especificado"}
                      </Text>
                      <Text
                        style={[
                          styles.rejectionText,
                          { fontSize: 12, marginTop: 2 },
                        ]}
                      >
                        Fecha: {booking.date}
                      </Text>
                    </View>
                  </View>
                )}
                
                {booking.status === "cancelled" && (
                  <View
                    style={[
                      styles.rejectionNote,
                      {
                        backgroundColor: "#FFF1F2", // Rojo muy claro
                        borderColor: "#FECDD3",
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <XCircle size={16} color="#EF4444" />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.rejectionText,
                          { color: "#2E2E2E", fontWeight: "700" },
                        ]}
                      >
                        Reserva Cancelada
                      </Text>
                      <Text
                        style={{ color: "#8D8D8D", fontSize: 13, marginTop: 2 }}
                      >
                        Motivo:{" "}
                        {booking.motivo_cancelacion ||
                          "No se especificó un motivo"}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.historyAmountText}>{booking.amount}</Text>
                  <TouchableOpacity
                    style={
                      booking.reviewed
                        ? styles.reviewedButton
                        : styles.reviewButton
                    }
                    onPress={() => {
                      if (!booking.reviewed) {
                        setSelectedBooking(booking);
                        setModalVisible(true);
                      }
                    }}
                    disabled={booking.reviewed}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        booking.reviewed
                          ? styles.reviewedButtonText
                          : styles.reviewButtonText
                      }
                    >
                      {booking.reviewed ? "Reseña enviada" : "Dejar reseña"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyTextSeccion}>
              No hay historial disponible.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* --- MODAL DE CALIFICACIÓN --- */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calificar servicio</Text>
            <Text style={styles.modalSubtitle}>
              ¿Cómo fue tu experiencia con {selectedBooking?.babysitter}?
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.8}>
                  <Star
                    size={36}
                    color={s <= rating ? "#FF768A" : "#E5E7EB"}
                    fill={s <= rating ? "#FF768A" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe tu comentario..."
              placeholderTextColor="#9A9A9A"
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePostReview}
                disabled={sendingReview}
                activeOpacity={0.8}
              >
                {sendingReview ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Publicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE CANCELACIÓN --- */}
      <Modal visible={cancelModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancelar reserva</Text>
            <Text style={styles.modalSubtitle}>
              Esta acción no se puede deshacer. Por favor indica el motivo.
            </Text>
            {cancelWarning && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{cancelWarning}</Text>
              </View>
            )}
            <TextInput
              style={styles.textInput}
              placeholder="Motivo de cancelación..."
              placeholderTextColor="#9A9A9A"
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCancelModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#EF4444" }]}
                onPress={handleCancelBooking}
                disabled={sendingCancel}
                activeOpacity={0.8}
              >
                {sendingCancel ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Confirmar cancelación
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#886BC1" },
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContent: { paddingBottom: 110 },
  
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", flex: 1 },
  
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    color: "#2E2E2E",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2, // Sombra suave en lugar de borde plano
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 14 },
  cardTop: { flexDirection: "row", marginBottom: 16 },
  cardTopInfo: { flex: 1, justifyContent: "center" },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameText: { color: "#2E2E2E", fontSize: 17, fontWeight: "700", marginBottom: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { color: "#8D8D8D", fontSize: 13, marginLeft: 4, fontWeight: "600" },
  
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, marginLeft: 4, fontWeight: "700" },
  
  bookingInfoGroup: { marginBottom: 16 },
  bookingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingInfoText: { color: "#8D8D8D", fontSize: 14, marginLeft: 8, flex: 1 },
  
  qrButtonsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  qrEntryButton: {
    flex: 1,
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  qrEntryButtonText: { color: "#16A34A", fontSize: 14, fontWeight: "700", marginLeft: 6 },
  qrExitButton: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  qrExitButtonText: { color: "#EA580C", fontSize: 14, fontWeight: "700", marginLeft: 6 },
  
  cancelBookingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    marginBottom: 16,
  },
  cancelBookingText: { color: "#EF4444", fontSize: 14, fontWeight: "700", marginLeft: 6 },
  
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: { color: "#886BC1", fontSize: 18, fontWeight: "700" },
  historyAmountText: { color: "#8D8D8D", fontSize: 16, fontWeight: "700" },
  cardFooterActions: { flexDirection: "row", gap: 8 },
  chatButton: {
    backgroundColor: "rgba(136, 107, 193, 0.1)", // Morado muy suave
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  chatButtonText: { color: "#886BC1", fontSize: 13, fontWeight: "700", marginLeft: 6 },
  detailsButton: {
    backgroundColor: "#FF768A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  detailsButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  reviewButton: {
    backgroundColor: "#FF768A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reviewButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  reviewedButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reviewedButtonText: { color: "#9A9A9A", fontSize: 13, fontWeight: "700" },
  emptyTextSeccion: {
    color: "#9A9A9A",
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#2E2E2E", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#8D8D8D", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  starsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  textInput: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    fontSize: 15,
    color: "#2E2E2E",
  },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: { color: "#8D8D8D", fontWeight: "600", fontSize: 15 },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#FF768A", // Rosa de la app
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  
  rejectionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF1F2",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  rejectionText: { color: "#EF4444", fontSize: 13, flex: 1, lineHeight: 18 },
  warningContainer: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
  },
  warningText: { color: "#92400E", fontSize: 13, fontWeight: "500", lineHeight: 18 },
});