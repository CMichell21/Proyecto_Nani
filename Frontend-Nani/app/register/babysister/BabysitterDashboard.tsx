import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS } from "../../../constants/apiConfig";

import {
  Bell,
  Calendar,
  Clock,
  MessageCircle,
  QrCode,
  Star,
  TrendingUp,
  User,
  X,
} from "lucide-react-native";

export default function BabysitterDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState("home");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [bookingToAccept, setBookingToAccept] = useState<any>(null);
  const [updatingBooking, setUpdatingBooking] = useState(false);

  const [availabilityForm, setAvailabilityForm] = useState({
    dia: "",
    hora_inicio: "",
    hora_fin: "",
  });

  const [availabilityList, setAvailabilityList] = useState<any[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingBooking, setRejectingBooking] = useState(false);
  const [stats, setStats] = useState({
    monthEarnings: 0,
    rating: 0,
    newMessages: 0,
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const DAYS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const HOURS = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
    "23:59",
  ];

  const normalizeBookingStatus = (status: string) => {
    const normalized = (status || "").toLowerCase().trim();

    if (normalized === "confirmado") return "confirmada";
    if (normalized === "confirmada") return "confirmada";

    if (normalized === "finalizado") return "completada";
    if (normalized === "completado") return "completada";
    if (normalized === "completada") return "completada";

    if (normalized === "cancelado") return "cancelada";
    if (normalized === "cancelada") return "cancelada";

    if (normalized === "en_progreso") return "en_progreso";
    if (normalized === "pendiente") return "pendiente";

    return normalized || "pendiente";
  };

  const getActionLabel = (status: string) => {
    const normalizedStatus = normalizeBookingStatus(status);

    if (normalizedStatus === "pendiente") return "Aceptar";
    if (normalizedStatus === "confirmada") return "Confirmar llegada";
    if (normalizedStatus === "en_progreso") return "Confirmar salida";

    return "Seguimiento";
  };

  const getScanMode = (status: string) => {
    const normalizedStatus = normalizeBookingStatus(status);

    if (normalizedStatus === "confirmada") return "checkin";
    if (normalizedStatus === "en_progreso") return "checkout";

    return "view";
  };

  const handleShowDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const fetchLoggedUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const savedUserId = await AsyncStorage.getItem("userId");

      if (!token) {
        console.log("No hay token guardado");
        return;
      }

      const response = await fetch(ENDPOINTS.me, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Error trayendo usuario:", data);
        return;
      }

      const nombre = data?.persona?.nombre || "Usuario";
      setUserName(nombre);

      if (savedUserId) {
        const profileResponse = await fetch(ENDPOINTS.get_perfil_ninera(savedUserId));
        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          setStats((prev) => ({
            ...prev,
            rating: Number(profileData?.promedio_rating || 0),
          }));
        }
      }
    } catch (error) {
      console.log("Error fetchLoggedUser:", error);
    }
  }, []);

  const fetchPendingBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);

      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        console.log("No se encontró userId");
        return;
      }

      const response = await fetch(ENDPOINTS.get_reservas_ninera(userId));
      const data = await response.json();

      if (!response.ok) {
        console.log("Error obteniendo reservas:", data);
        return;
      }

      const mappedBookings = data.map((item: any) => {
        const clientePersona = item.cliente?.persona;
        const fecha = item.fecha_servicio || "";
        const horaInicio = item.hora_inicio || "";
        const horaFin = item.hora_fin || "";
        const normalizedStatus = normalizeBookingStatus(
          item.estado || "pendiente",
        );

        const direccionObj =
          item.direccion ||
          item.direccion_servicio ||
          item.cliente?.direccion ||
          item.cliente?.persona?.direccion ||
          null;

        const address =
          direccionObj?.direccion_completa ||
          direccionObj?.direccion ||
          direccionObj?.ubicacion ||
          direccionObj?.punto_referencia ||
          item.ubicacion ||
          "Dirección no disponible";

        const latitude =
          direccionObj?.latitud ??
          direccionObj?.latitude ??
          item.latitud ??
          item.latitude ??
          "";

        const longitude =
          direccionObj?.longitud ??
          direccionObj?.longitude ??
          item.longitud ??
          item.longitude ??
          "";

        return {
          id: item.id,
          codigo_reserva: item.codigo_reserva || "",
          clientName: clientePersona
            ? `${clientePersona.nombre} ${clientePersona.apellido}`
            : "Cliente",
          clientPhoto:
            clientePersona?.foto_url || "https://via.placeholder.com/150",
          date: fecha,
          time: `${horaInicio} - ${horaFin}`,
          scheduledStart: horaInicio,
          scheduledEnd: horaFin,
          duration: item.duracion_horas || 0,
          children: item.reserva_nino?.length || 0,
          payment: item.monto_total || 0,
          status: normalizedStatus,
          address,
          paymentMethod: item.metodo_pago?.nombre || "No especificado",
          childrenDetails: "Pendiente",
          notes: item.notas_importantes || "Sin notas",
          latitude,
          longitude,
          rawDate: fecha,
        };
      });

      const activeBookings = mappedBookings.filter((booking: any) =>
        ["pendiente", "confirmada", "en_progreso"].includes(
          normalizeBookingStatus(booking.status),
        ),
      );

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;

      const monthEarnings = mappedBookings
        .filter((booking: any) => {
          const bookingMonth = String(booking.rawDate || "").slice(0, 7);
          return (
            bookingMonth === currentMonth &&
            normalizeBookingStatus(booking.status) === "completada"
          );
        })
        .reduce(
          (total: number, booking: any) => total + Number(booking.payment || 0),
          0,
        );

      setPendingBookings(activeBookings);
      setStats((prev) => ({
        ...prev,
        monthEarnings,
      }));
    } catch (error) {
      console.log("Error fetchPendingBookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchChatStats = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) return;

      const response = await fetch(ENDPOINTS.get_chat_conversations, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const messageCount = Array.isArray(data)
        ? data.filter((item: any) => item.chatId || item.lastMessage).length
        : 0;

      setStats((prev) => ({
        ...prev,
        newMessages: messageCount,
      }));
    } catch (error) {
      console.log("Error fetchChatStats:", error);
    }
  }, []);

  const fetchSavedAvailability = useCallback(async () => {
    try {
      const savedUserId = await AsyncStorage.getItem("userId");

      if (!savedUserId) return;

      const response = await fetch(
        ENDPOINTS.get_disponibilidad_ninera(savedUserId),
      );
      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setAvailabilityList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error fetchSavedAvailability:", error);
    }
  }, []);

  const fetchNotificationStats = useCallback(async () => {
    try {
      const savedUserId = await AsyncStorage.getItem("userId");

      if (!savedUserId) return;

      const response = await fetch(
        ENDPOINTS.get_notificaciones_ninera(savedUserId),
      );
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        return;
      }

      setUnreadNotifications(data.filter((item: any) => !item.read).length);
    } catch (error) {
      console.log("Error fetchNotificationStats:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLoggedUser();
      fetchPendingBookings();
      fetchChatStats();
      fetchSavedAvailability();
      fetchNotificationStats();
    }, [
      fetchLoggedUser,
      fetchPendingBookings,
      fetchChatStats,
      fetchSavedAvailability,
      fetchNotificationStats,
    ]),
  );

  const handleAvailabilityInputChange = (
    field: "dia" | "hora_inicio" | "hora_fin",
    value: string,
  ) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenAcceptModal = (booking: any) => {
    setBookingToAccept(booking);
    setIsAcceptModalOpen(true);
  };

  const handleAcceptBooking = async () => {
    try {
      if (!bookingToAccept) return;

      setUpdatingBooking(true);

      const response = await fetch(
        ENDPOINTS.update_estado_reserva(bookingToAccept.id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
          },
          body: JSON.stringify({
            estado: "confirmada",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo aceptar la reserva");
      }

      setPendingBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingToAccept.id
            ? { ...booking, status: "confirmada" }
            : booking,
        ),
      );

      setIsAcceptModalOpen(false);
      setBookingToAccept(null);

      Alert.alert("Éxito", "Reserva aceptada correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo aceptar la reserva");
    } finally {
      setUpdatingBooking(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!bookingToReject) return;
    try {
      setRejectingBooking(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        ENDPOINTS.rechazar_reserva(bookingToReject.id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motivo_rechazo: rejectReason.trim() || null }),
        },
      );
      if (!response.ok) throw new Error("No se pudo rechazar");
      Alert.alert("Listo", "Reserva rechazada.");
      setIsRejectModalOpen(false);
      setRejectReason("");
      fetchPendingBookings();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setRejectingBooking(false);
    }
  };

  const openTrackingForBooking = (booking: any) => {
    const normalizedStatus = normalizeBookingStatus(booking.status);
    const scanMode = getScanMode(normalizedStatus);

    router.push({
      pathname: "./JobTracking",
      params: {
        bookingId: booking.id,
        bookingCode: booking.codigo_reserva || "",
        clientName: booking.clientName,
        clientPhoto: booking.clientPhoto,
        date: booking.date,
        time: booking.time,
        scheduledStart: booking.scheduledStart,
        scheduledEnd: booking.scheduledEnd,
        duration: booking.duration,
        children: booking.children,
        address: booking.address,
        payment: booking.payment,
        paymentMethod: booking.paymentMethod,
        childrenDetails: booking.childrenDetails,
        notes: booking.notes,
        latitude: booking.latitude ?? "",
        longitude: booking.longitude ?? "",
        bookingStatus: normalizedStatus,
        scanMode,
      },
    });
  };

  const addAvailabilityItem = () => {
    const { dia, hora_inicio, hora_fin } = availabilityForm;

    if (!dia || !hora_inicio || !hora_fin) {
      Alert.alert(
        "Campos incompletos",
        "Selecciona día, hora inicio y hora fin.",
      );
      return;
    }

    if (!DAYS.includes(dia)) {
      Alert.alert("Día inválido", "Selecciona un día válido.");
      return;
    }

    if (!HOURS.includes(hora_inicio) || !HOURS.includes(hora_fin)) {
      Alert.alert("Hora inválida", "Selecciona horas válidas.");
      return;
    }

    if (hora_inicio >= hora_fin) {
      Alert.alert(
        "Horario inválido",
        "La hora fin debe ser mayor que la hora inicio.",
      );
      return;
    }

    const alreadyExists = availabilityList.some(
      (item) =>
        item.dia_semana === dia &&
        item.hora_inicio === hora_inicio &&
        item.hora_fin === hora_fin,
    );

    if (alreadyExists) {
      Alert.alert("Duplicado", "Ese horario ya fue agregado.");
      return;
    }

    setAvailabilityList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        dia_semana: dia,
        hora_inicio,
        hora_fin,
      },
    ]);

    setAvailabilityForm({
      dia: "",
      hora_inicio: "",
      hora_fin: "",
    });
  };

  const removeAvailabilityItem = (id: string) => {
    setAvailabilityList((prev) => prev.filter((item) => item.id !== id));
  };

  const closeAvailabilityModal = () => {
    setIsAvailabilityOpen(false);
    setAvailabilityForm({
      dia: "",
      hora_inicio: "",
      hora_fin: "",
    });
  };

  const saveAvailability = async () => {
    try {
      if (availabilityList.length === 0) {
        Alert.alert("Sin registros", "Agrega al menos un horario.");
        return;
      }

      setSavingAvailability(true);

      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "No se encontró el userId.");
        return;
      }

      const response = await fetch(ENDPOINTS.save_disponibilidad_ninera, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: userId,
          disponibilidad: availabilityList.map(({ id, ...rest }) => rest),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo guardar la disponibilidad");
      }

      Alert.alert("Éxito", "Disponibilidad guardada correctamente");
      await fetchSavedAvailability();
      setIsAvailabilityOpen(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error guardando disponibilidad");
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        
        {/* Header con Degradado Nani */}
        <LinearGradient
          colors={["#886BC1", "#FF768A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.hello}>Hola, {userName} 👋</Text>
              <Text style={styles.sub}>
                Tienes {pendingBookings.length} reservas activas
              </Text>
            </View>

            <TouchableOpacity
              style={styles.notification}
              onPress={() => router.push("./BabysitterNotifications")}
            >
              <Bell color="white" size={22} />
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <TrendingUp color="white" size={20} />
              <Text style={styles.statValue}>L {stats.monthEarnings}</Text>
              <Text style={styles.statLabel}>Este mes</Text>
            </View>

            <View style={styles.statCard}>
              <Star color="white" size={20} />
              <Text style={styles.statValue}>{stats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>

            <View style={styles.statCard}>
              <MessageCircle color="white" size={20} />
              <Text style={styles.statValue}>{stats.newMessages}</Text>
              <Text style={styles.statLabel}>Mensajes</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Reservas activas</Text>

            {loadingBookings ? (
              <Text style={{ color: "#9A9A9A", marginBottom: 12 }}>
                Cargando reservas...
              </Text>
            ) : pendingBookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No tienes reservas activas por ahora.
                </Text>
              </View>
            ) : (
              pendingBookings.map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingRow}>
                    <Image
                      source={{ uri: booking.clientPhoto }}
                      style={styles.avatar}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.clientName}>{booking.clientName}</Text>

                      <View style={styles.row}>
                        <Clock size={14} color="#8D8D8D" />
                        <Text style={styles.timeText}>
                          {booking.date} | {booking.time}
                        </Text>
                      </View>

                      <Text style={styles.address}>{booking.address}</Text>

                      <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Estado:</Text>
                        <Text style={styles.statusValue}>{booking.status}</Text>
                      </View>

                      <View style={styles.buttonRow}>
                        {normalizeBookingStatus(booking.status) === "pendiente" && (
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => {
                              setBookingToReject(booking);
                              setIsRejectModalOpen(true);
                            }}
                          >
                            <Text style={styles.rejectText}>Rechazar</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => {
                            const normalizedStatus = normalizeBookingStatus(
                              booking.status,
                            );

                            if (normalizedStatus === "pendiente") {
                              handleOpenAcceptModal(booking);
                              return;
                            }

                            if (
                              normalizedStatus === "confirmada" ||
                              normalizedStatus === "en_progreso"
                            ) {
                              openTrackingForBooking(booking);
                            }
                          }}
                        >
                          <QrCode size={14} color="white" />
                          <Text style={styles.acceptText}>
                            {getActionLabel(booking.status)}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.detailsBtn}
                          onPress={() => handleShowDetails(booking)}
                        >
                          <Text style={styles.detailsBtnText}>Detalles</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.paymentBox}>
                      <Text style={styles.payment}>L {booking.payment}</Text>
                      <Text style={styles.children}>{booking.children} niños</Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Acciones rápidas</Text>

            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => setIsAvailabilityOpen(true)}
              >
                <Clock color="#886BC1" size={24} />
                <Text style={styles.quickTitle}>Disponibilidad</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => router.push("./BabysitterOwnProfile")}
              >
                <User color="#886BC1" size={24} />
                <Text style={styles.quickTitle}>Mi perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => router.push("./Babysitterchats")}
              >
                <MessageCircle color="#886BC1" size={24} />
                <Text style={styles.quickTitle}>Mensajes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => router.push("./BabysitterBookingHistory")}
              >
                <Calendar color="#886BC1" size={24} />
                <Text style={styles.quickTitle}>Reservas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Navbar Flotante Nani Style */}
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab("home")}
          >
            <Calendar size={22} color={activeTab === "home" ? "#886BC1" : "#B0B0B0"} />
            <Text style={[styles.navText, activeTab === "home" && { color: "#886BC1" }]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("./BabysitterBookingHistory")}
          >
            <Clock size={22} color="#B0B0B0" />
            <Text style={styles.navText}>Reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("./Babysitterchats")}
          >
            <MessageCircle size={22} color="#B0B0B0" />
            <Text style={styles.navText}>Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("./BabysitterOwnProfile")}
          >
            <User size={22} color="#B0B0B0" />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Modales rediseñados con el estilo general */}
        <Modal visible={isDetailsOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
              <TouchableOpacity
                style={styles.close}
                onPress={() => setIsDetailsOpen(false)}
              >
                <X color="#2E2E2E" size={20} />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Detalles de la reserva</Text>

              {selectedBooking && (
                <View>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Cliente: </Text>{selectedBooking.clientName}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Fecha: </Text>{selectedBooking.date}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Hora: </Text>{selectedBooking.time}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Estado: </Text>{selectedBooking.status}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Dirección: </Text>{selectedBooking.address}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Pago: </Text>L {selectedBooking.payment}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Método: </Text>{selectedBooking.paymentMethod}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Notas: </Text>{selectedBooking.notes}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.okBtn}
                onPress={() => setIsDetailsOpen(false)}
              >
                <Text style={styles.okBtnText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={isAcceptModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
              <TouchableOpacity
                style={styles.close}
                onPress={() => {
                  setIsAcceptModalOpen(false);
                  setBookingToAccept(null);
                }}
              >
                <X color="#2E2E2E" size={20} />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Aceptar reserva</Text>

              {bookingToAccept && (
                <View>
                  <Text style={styles.modalText}>
                    ¿Deseas aceptar la reserva de <Text style={{fontWeight: 'bold'}}>{bookingToAccept.clientName}</Text>?
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Fecha: </Text>{bookingToAccept.date}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Hora: </Text>{bookingToAccept.time}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Dirección: </Text>{bookingToAccept.address}
                  </Text>
                </View>
              )}

              <View style={styles.confirmButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setIsAcceptModalOpen(false);
                    setBookingToAccept(null);
                  }}
                  disabled={updatingBooking}
                >
                  <Text style={styles.cancelBtnText}>No</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.okBtn,
                    { flex: 1, marginTop: 0 },
                    updatingBooking && { opacity: 0.7 },
                  ]}
                  onPress={handleAcceptBooking}
                  disabled={updatingBooking}
                >
                  <Text style={styles.okBtnText}>
                    {updatingBooking ? "Aceptando..." : "Sí, aceptar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isRejectModalOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Rechazar reserva</Text>
              <Text style={styles.modalText}>
                ¿Por qué rechazas la solicitud de <Text style={{fontWeight: 'bold'}}>{bookingToReject?.clientName}</Text>?
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Escribe el motivo (opcional)"
                placeholderTextColor="#A0A0A0"
                multiline
                value={rejectReason}
                onChangeText={setRejectReason}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => {
                    setIsRejectModalOpen(false);
                    setRejectReason("");
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmRejectBtn}
                  onPress={handleRejectBooking}
                  disabled={rejectingBooking}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    {rejectingBooking ? "Rechazando..." : "Confirmar rechazo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isAvailabilityOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
              <TouchableOpacity
                style={styles.close}
                onPress={closeAvailabilityModal}
              >
                <X color="#2E2E2E" size={20} />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Gestionar disponibilidad</Text>

              <ScrollView
                style={styles.availabilityScrollArea}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.availabilityScrollContent}
              >
                <Text style={styles.inputLabel}>Día</Text>
                <View style={styles.optionsWrap}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.optionChip,
                        availabilityForm.dia === day && styles.optionChipActive,
                      ]}
                      onPress={() => handleAvailabilityInputChange("dia", day)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          availabilityForm.dia === day && styles.optionChipTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Hora inicio</Text>
                <View style={styles.optionsWrap}>
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={`start-${hour}`}
                      style={[
                        styles.optionChip,
                        availabilityForm.hora_inicio === hour && styles.optionChipActive,
                      ]}
                      onPress={() => handleAvailabilityInputChange("hora_inicio", hour)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          availabilityForm.hora_inicio === hour && styles.optionChipTextActive,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Hora fin</Text>
                <View style={styles.optionsWrap}>
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={`end-${hour}`}
                      style={[
                        styles.optionChip,
                        availabilityForm.hora_fin === hour && styles.optionChipActive,
                      ]}
                      onPress={() => handleAvailabilityInputChange("hora_fin", hour)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          availabilityForm.hora_fin === hour && styles.optionChipTextActive,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.addAvailabilityBtn}
                  onPress={addAvailabilityItem}
                >
                  <Text style={styles.addAvailabilityBtnText}>Agregar horario</Text>
                </TouchableOpacity>

                <View style={styles.availabilityListWrap}>
                  {availabilityList.map((item) => (
                    <View key={item.id} style={styles.availabilityItem}>
                      <View>
                        <Text style={styles.availabilityText}>{item.dia_semana}</Text>
                        <Text style={styles.availabilitySubText}>
                          {item.hora_inicio} - {item.hora_fin}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeAvailabilityItem(item.id)}>
                        <Text style={styles.removeText}>Quitar</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.okBtn, savingAvailability && { opacity: 0.7 }]}
                onPress={saveAvailability}
                disabled={savingAvailability}
              >
                <Text style={styles.okBtnText}>
                  {savingAvailability ? "Guardando..." : "Guardar disponibilidad"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Contenedores Base
  safeArea: { flex: 1, backgroundColor: "#886BC1" },
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContent: { paddingBottom: 100 },

  // Header Nani Style
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  hello: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  sub: { color: "#FFFFFF", opacity: 0.9, fontSize: 14, marginTop: 4 },
  
  notification: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF768A",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "#886BC1",
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 12,
    borderRadius: 16,
    width: "31%",
    alignItems: "flex-start",
  },
  statValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginTop: 8 },
  statLabel: { color: "#FFFFFF", fontSize: 12, opacity: 0.9, marginTop: 2 },

  // Contenido Principal
  content: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#2E2E2E", marginBottom: 14 },

  // Tarjetas de Reserva
  bookingCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 2,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    }),
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#8D8D8D", textAlign: "center", fontSize: 15 },
  
  bookingRow: { flexDirection: "row", gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  clientName: { fontSize: 17, fontWeight: "700", color: "#2E2E2E", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  timeText: { color: "#8D8D8D", fontSize: 13 },
  address: { color: "#9A9A9A", fontSize: 13, marginBottom: 6 },
  
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusLabel: { color: "#8D8D8D", fontSize: 13 },
  statusValue: { color: "#886BC1", fontSize: 13, fontWeight: "700" },

  buttonRow: { flexDirection: "row", marginTop: 12, gap: 8, flexWrap: "wrap" },
  
  acceptBtn: {
    flexDirection: "row",
    backgroundColor: "#FF768A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  acceptText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  
  rejectBtn: {
    backgroundColor: "#FFF0F2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rejectText: { color: "#FF768A", fontWeight: "700", fontSize: 13 },
  
  detailsBtn: { 
    backgroundColor: "#F3F4F6", 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 12,
    justifyContent: "center"
  },
  detailsBtnText: { color: "#555", fontSize: 13, fontWeight: "600" },

  paymentBox: { alignItems: "flex-end" },
  payment: { color: "#886BC1", fontSize: 18, fontWeight: "700" },
  children: { fontSize: 12, color: "#9A9A9A", marginTop: 4 },

  // Grid de Acciones Rápidas
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 2,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    }),
  },
  quickTitle: { marginTop: 10, fontSize: 14, fontWeight: "600", color: "#2E2E2E" },

  // Navbar Inferior Flotante
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    }),
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navText: { marginTop: 4, fontSize: 12, color: "#B0B0B0", fontWeight: "500" },

  // Estilos de Modales
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    width: "88%",
    maxHeight: "85%",
    borderRadius: 24,
    padding: 20,
    elevation: 5,
  },
  close: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#2E2E2E", marginBottom: 16, paddingRight: 30 },
  modalText: { fontSize: 15, color: "#555", marginBottom: 8, lineHeight: 22 },
  modalLabel: { fontWeight: "600", color: "#2E2E2E" },
  
  okBtn: {
    backgroundColor: "#FF768A",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
  },
  okBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  // Modal Disponibilidad
  availabilityScrollArea: { flexGrow: 0 },
  availabilityScrollContent: { paddingTop: 4, paddingBottom: 16 },
  inputLabel: { marginTop: 10, marginBottom: 8, color: "#2E2E2E", fontSize: 15, fontWeight: "600" },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  
  optionChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  optionChipActive: { backgroundColor: "#886BC1" },
  optionChipText: { color: "#555", fontSize: 14, fontWeight: "500" },
  optionChipTextActive: { color: "#FFFFFF", fontWeight: "700" },

  addAvailabilityBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addAvailabilityBtnText: { color: "#886BC1", fontWeight: "700", fontSize: 15 },

  availabilityListWrap: { marginTop: 16, gap: 10 },
  availabilityItem: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availabilityText: { fontSize: 16, fontWeight: "700", color: "#2E2E2E" },
  availabilitySubText: { fontSize: 14, color: "#8D8D8D", marginTop: 2 },
  removeText: { color: "#FF768A", fontWeight: "700", fontSize: 14 },

  // Botones Confirmación Modal
  confirmButtonsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelBtnText: { color: "#555", fontWeight: "700", fontSize: 16 },
  
  reasonInput: {
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 16,
    fontSize: 15,
  },
  
  confirmRejectBtn: {
    flex: 2,
    backgroundColor: "#FF768A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
});