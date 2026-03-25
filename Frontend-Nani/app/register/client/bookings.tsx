import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  MapPin,
  Star,
  MessageCircle,
  CheckCircle2,
  XCircle,
  QrCode,
} from "lucide-react-native";

type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

type Booking = {
  id: number;
  babysitter: string;
  photo: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address?: string;
  status: BookingStatus;
  amount: string;
  rating: number;
  reviewed?: boolean;
  latitude?: number;
  longitude?: number;
};

export default function BookingsListScreen() {
  const router = useRouter();

  const upcomingBookings: Booking[] = [
    {
      id: 1,
      babysitter: "María González",
      photo:
        "https://images.unsplash.com/photo-1584446456661-1039ed1a39d7?w=200&h=200&fit=crop",
      date: "15 Feb 2026",
      time: "14:00 - 18:00",
      duration: "4 horas",
      location: "Centro, Ciudad",
      address: "Calle Principal 123, Centro",
      status: "confirmed",
      amount: "$60.00",
      rating: 4.9,
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      id: 2,
      babysitter: "Ana Rodríguez",
      photo:
        "https://images.unsplash.com/photo-1565310561974-f2dc282230d9?w=200&h=200&fit=crop",
      date: "18 Feb 2026",
      time: "18:00 - 22:00",
      duration: "4 horas",
      location: "Norte, Ciudad",
      address: "Av. Norte 456, Norte",
      status: "pending",
      amount: "$72.00",
      rating: 4.8,
      latitude: 40.758,
      longitude: -73.9855,
    },
  ];

  const pastBookings: Booking[] = [
    {
      id: 3,
      babysitter: "Sofia Martínez",
      photo:
        "https://images.unsplash.com/photo-1668752741330-8adc5cef7485?w=200&h=200&fit=crop",
      date: "08 Feb 2026",
      time: "14:00 - 19:00",
      duration: "5 horas",
      location: "Sur, Ciudad",
      status: "completed",
      amount: "$100.00",
      rating: 5.0,
      reviewed: true,
    },
    {
      id: 4,
      babysitter: "María González",
      photo:
        "https://images.unsplash.com/photo-1584446456661-1039ed1a39d7?w=200&h=200&fit=crop",
      date: "01 Feb 2026",
      time: "08:00 - 12:00",
      duration: "4 horas",
      location: "Centro, Ciudad",
      status: "completed",
      amount: "$60.00",
      rating: 4.9,
      reviewed: false,
    },
  ];

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <View style={[styles.badge, styles.badgeConfirmed]}>
            <CheckCircle2 size={12} color="#16A34A" />
            <Text style={[styles.badgeText, styles.badgeTextConfirmed]}>
              Confirmada
            </Text>
          </View>
        );

      case "pending":
        return (
          <View style={[styles.badge, styles.badgePending]}>
            <Clock3 size={12} color="#CA8A04" />
            <Text style={[styles.badgeText, styles.badgeTextPending]}>
              Pendiente
            </Text>
          </View>
        );

      case "completed":
        return (
          <View style={[styles.badge, styles.badgeCompleted]}>
            <CheckCircle2 size={12} color="#886BC1" />
            <Text style={[styles.badgeText, styles.badgeTextCompleted]}>
              Completada
            </Text>
          </View>
        );

      case "cancelled":
        return (
          <View style={[styles.badge, styles.badgeCancelled]}>
            <XCircle size={12} color="#DC2626" />
            <Text style={[styles.badgeText, styles.badgeTextCancelled]}>
              Cancelada
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const parseDurationHours = (duration: string) => {
    const clean = duration.replace(" horas", "").replace(" hora", "").trim();
    const numberValue = Number(clean);
    return Number.isFinite(numberValue) ? numberValue : 0;
  };

  const parseAmount = (amount: string) => {
    const clean = amount.replace("$", "").replace(",", "").trim();
    const numberValue = Number(clean);
    return Number.isFinite(numberValue) ? numberValue : 0;
  };

  const handleOpenCheckinQR = (booking: Booking) => {
    const scheduledHours = parseDurationHours(booking.duration);
    const payment = parseAmount(booking.amount);
    const hourlyRate =
      scheduledHours > 0 ? Number((payment / scheduledHours).toFixed(2)) : 0;

    router.push({
      pathname: "/register/client/ClientJobTracking",
      params: {
        bookingId: String(booking.id),
        babysitterName: booking.babysitter,
        babysitterPhoto: booking.photo,
        time: booking.time,
        children: "1",
        address: booking.address || "Dirección no disponible",
        payment: String(payment),
        paymentMethod: "Efectivo",
        childrenDetails: "Niño asignado en reserva",
        notes: "",
        scheduledHours: String(scheduledHours),
        hourlyRate: String(hourlyRate),
        latitude: String(booking.latitude || 0),
        longitude: String(booking.longitude || 0),
        babysitterPhone: "",
      },
    });
  };

  const handleOpenCheckoutQR = (booking: Booking) => {
    const scheduledHours = parseDurationHours(booking.duration);
    const payment = parseAmount(booking.amount);
    const hourlyRate =
      scheduledHours > 0 ? Number((payment / scheduledHours).toFixed(2)) : 0;

    router.push({
      pathname: "/register/client/ClientActiveSession",
      params: {
        bookingId: String(booking.id),
        babysitterName: booking.babysitter,
        babysitterPhoto: booking.photo,
        childrenDetails: "Niño asignado en reserva",
        scheduledHours: String(scheduledHours),
        hourlyRate: String(hourlyRate),
        latitude: String(booking.latitude || 0),
        longitude: String(booking.longitude || 0),
        checkInTime: String(Date.now()),
      },
    });
  };

  const handleViewDetails = (bookingId: number) => {
    router.push({
      pathname: "./register/client/BookingDetails",
      params: { bookingId: String(bookingId) },
    });
  };

  const handleChat = () => {
    router.push("./register/client/chat");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Mis reservas</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas</Text>

          {upcomingBookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: booking.photo }} style={styles.avatar} />

                <View style={styles.cardTopInfo}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.nameText}>{booking.babysitter}</Text>

                      <View style={styles.ratingRow}>
                        <Star
                          size={12}
                          color="#FF768A"
                          fill="#FF768A"
                        />
                        <Text style={styles.ratingText}>{booking.rating}</Text>
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
                  <MapPin size={16} color="#886BC1" />
                  <Text style={styles.bookingInfoText}>{booking.location}</Text>
                </View>
              </View>

              {booking.status === "confirmed" && (
                <View style={styles.qrButtonsRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenCheckinQR(booking)}
                    style={styles.qrEntryButton}
                    activeOpacity={0.85}
                  >
                    <QrCode size={16} color="#16A34A" />
                    <Text style={styles.qrEntryButtonText}>QR Entrada</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleOpenCheckoutQR(booking)}
                    style={styles.qrExitButton}
                    activeOpacity={0.85}
                  >
                    <QrCode size={16} color="#EA580C" />
                    <Text style={styles.qrExitButtonText}>QR Salida</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.amountText}>{booking.amount}</Text>

                <View style={styles.cardFooterActions}>
                  <TouchableOpacity
                    onPress={handleChat}
                    style={styles.chatButton}
                    activeOpacity={0.85}
                  >
                    <MessageCircle size={16} color="#886BC1" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleViewDetails(booking.id)}
                    style={styles.detailsButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.detailsButtonText}>Ver detalles</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial</Text>

          {pastBookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: booking.photo }} style={styles.avatar} />

                <View style={styles.cardTopInfo}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.nameText}>{booking.babysitter}</Text>

                      <View style={styles.ratingRow}>
                        <Star
                          size={12}
                          color="#FF768A"
                          fill="#FF768A"
                        />
                        <Text style={styles.ratingText}>{booking.rating}</Text>
                      </View>
                    </View>

                    {getStatusBadge(booking.status)}
                  </View>
                </View>
              </View>

              <View style={styles.bookingInfoGroup}>
                <View style={styles.bookingInfoRow}>
                  <Calendar size={16} color="#9CA3AF" />
                  <Text style={styles.bookingInfoText}>{booking.date}</Text>
                </View>

                <View style={styles.bookingInfoRow}>
                  <Clock3 size={16} color="#9CA3AF" />
                  <Text style={styles.bookingInfoText}>
                    {booking.time} ({booking.duration})
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.historyAmountText}>{booking.amount}</Text>

                {booking.reviewed ? (
                  <View style={styles.reviewedButton}>
                    <Text style={styles.reviewedButtonText}>Reseña enviada</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.reviewButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reviewButtonText}>Dejar reseña</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {upcomingBookings.length === 0 && pastBookings.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={40} color="#886BC1" />
            </View>

            <Text style={styles.emptyTitle}>No tienes reservas</Text>
            <Text style={styles.emptySubtitle}>
              Encuentra la niñera perfecta y haz tu primera reserva
            </Text>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.emptyButton}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>Explorar niñeras</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    backgroundColor: "#886BC1",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    color: "#2E2E2E",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: "#EEE",
  },
  cardTopInfo: {
    flex: 1,
    justifyContent: "center",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameText: {
    color: "#2E2E2E",
    fontSize: 17,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  badgeConfirmed: {
    backgroundColor: "#ECFDF5",
  },
  badgeTextConfirmed: {
    color: "#16A34A",
  },
  badgePending: {
    backgroundColor: "#FEFCE8",
  },
  badgeTextPending: {
    color: "#CA8A04",
  },
  badgeCompleted: {
    backgroundColor: "#F6D9F1",
  },
  badgeTextCompleted: {
    color: "#886BC1",
  },
  badgeCancelled: {
    backgroundColor: "#FEF2F2",
  },
  badgeTextCancelled: {
    color: "#DC2626",
  },
  bookingInfoGroup: {
    marginBottom: 14,
  },
  bookingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingInfoText: {
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  qrButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  qrEntryButton: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  qrEntryButtonText: {
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  qrExitButton: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  qrExitButtonText: {
    color: "#EA580C",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountText: {
    color: "#886BC1",
    fontSize: 18,
    fontWeight: "700",
  },
  historyAmountText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  cardFooterActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    backgroundColor: "#F6D9F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  chatButtonText: {
    color: "#886BC1",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  detailsButton: {
    backgroundColor: "#FF768A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewedButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reviewedButtonText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewButton: {
    backgroundColor: "#FF768A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 50,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F6D9F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#2E2E2E",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#FF768A",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});