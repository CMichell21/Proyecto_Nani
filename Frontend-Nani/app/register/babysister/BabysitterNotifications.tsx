import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ENDPOINTS } from "../../../constants/apiConfig";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
};

export default function BabysitterNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setNotifications([]);
        return;
      }

      const response = await fetch(ENDPOINTS.get_notificaciones_ninera(userId));
      const data = await response.json();

      if (!response.ok) {
        setNotifications([]);
        return;
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error cargando notificaciones:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* APLICAMOS EL LINEAR GRADIENT IGUAL AL HOMESCREEN */}
          <LinearGradient
            colors={["#886BC1", "#FF768A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/register/babysister/BabysitterDashboard")}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Notificaciones</Text>

              <View style={styles.bellContainer}>
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>

            {unreadCount > 0 && (
              <Text style={styles.unreadText}>{unreadCount} sin leer</Text>
            )}
          </LinearGradient>

          <View style={styles.notificationsContainer}>
            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#886BC1" />
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No hay notificaciones</Text>
                <Text style={styles.emptyText}>
                  Aquí aparecerán solicitudes, reseñas y movimientos de tus reservas.
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadCard,
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: notification.color },
                    ]}
                  >
                    {notification.icon === "calendar" && (
                      <MaterialIcons
                        name="calendar-month"
                        size={22}
                        color="#FFFFFF"
                      />
                    )}
                    {notification.icon === "star" && (
                      <FontAwesome name="star" size={20} color="#FFFFFF" />
                    )}
                    {notification.icon === "chatbubble" && (
                      <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                    )}
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          !notification.read && styles.unreadTitle,
                        ]}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.message}>{notification.message}</Text>
                    <Text style={styles.time}>{notification.time}</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#886BC1", // Combina con el inicio del degradado
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Fondo gris claro de la app
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.18)", // Mismo estilo translúcido que los chips
    padding: 10,
    borderRadius: 999,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    marginLeft: 14,
  },
  bellContainer: {
    position: "relative",
    marginRight: 6,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFFFFF",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FF768A",
    fontSize: 10,
    fontWeight: "700",
  },
  unreadText: {
    color: "#FFFFFF",
    marginTop: 10,
    marginLeft: 46,
    opacity: 0.9,
    fontSize: 14,
    fontWeight: "500",
  },
  notificationsContainer: {
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  centerState: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 20, // Igual que HomeScreen
    alignItems: "center",
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  emptyText: {
    color: "#8D8D8D",
    textAlign: "center",
    lineHeight: 22,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20, // Igual que HomeScreen
    marginBottom: 14,
    elevation: 2, // Reemplazamos los bordes planos por sombra
  },
  unreadCard: {
    borderWidth: 1.5,
    borderColor: "#FF768A", // Resalta en rosa si no está leída
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#2E2E2E",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700", // Negrita para las no leídas
  },
  unreadDot: {
    width: 10,
    height: 10,
    backgroundColor: "#FF768A",
    borderRadius: 5,
  },
  message: {
    color: "#8D8D8D", // Gris secundario de la app
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#9A9A9A",
    marginTop: 6,
    fontWeight: "500",
  },
});