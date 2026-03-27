import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

type NotificationSettingsState = {
  bookingConfirmed: boolean;
  bookingReminder: boolean;
  babysitterArrival: boolean;
  sessionStarted: boolean;
  sessionEnded: boolean;
  newMessage: boolean;
  messageReply: boolean;
  promotions: boolean;
  recommendations: boolean;
  securityAlerts: boolean;
  loginAttempts: boolean;
};

const STORAGE_KEY = "client_notification_settings";

const DEFAULT_SETTINGS: NotificationSettingsState = {
  bookingConfirmed: true,
  bookingReminder: true,
  babysitterArrival: true,
  sessionStarted: true,
  sessionEnded: true,
  newMessage: true,
  messageReply: true,
  promotions: false,
  recommendations: true,
  securityAlerts: true,
  loginAttempts: true,
};

type SettingKey = keyof NotificationSettingsState;

export default function NotificationSettingsScreen() {
  const [settings, setSettings] =
    useState<NotificationSettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_SETTINGS)
        );
      }
    } catch (error) {
      console.log("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: SettingKey) => {
    try {
      const updatedSettings = {
        ...settings,
        [key]: !settings[key],
      };

      setSettings(updatedSettings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.log("Error guardando notificaciones:", error);
    }
  };

  const renderSettingRow = (
    title: string,
    subtitle: string,
    settingKey: SettingKey
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingTextWrap}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: "#D1D5DB", true: "#B8A4E5" }}
        thumbColor={settings[settingKey] ? "#886BC1" : "#FFFFFF"}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#886BC1" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#886BC1" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#886BC1" />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#886BC1", "#FF768A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Notificaciones</Text>
            <Text style={styles.headerSubtitle}>Configura alertas</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="calendar-outline" size={20} color="#886BC1" />
                </View>
                <Text style={styles.cardTitle}>Reservas</Text>
              </View>

              {renderSettingRow(
                "Reserva confirmada",
                "Cuando una niñera confirme",
                "bookingConfirmed"
              )}
              {renderSettingRow(
                "Recordatorio de reserva",
                "1 hora antes de la cita",
                "bookingReminder"
              )}
              {renderSettingRow(
                "Niñera en camino",
                "Cuando esté cerca de tu ubicación",
                "babysitterArrival"
              )}
              {renderSettingRow(
                "Sesión iniciada",
                "Cuando se escanee el QR de entrada",
                "sessionStarted"
              )}
              {renderSettingRow(
                "Sesión finalizada",
                "Cuando se escanee el QR de salida",
                "sessionEnded"
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#886BC1"
                  />
                </View>
                <Text style={styles.cardTitle}>Mensajes</Text>
              </View>

              {renderSettingRow(
                "Nuevo mensaje",
                "Cuando recibas un mensaje",
                "newMessage"
              )}
              {renderSettingRow(
                "Respuesta de mensajes",
                "Cuando te respondan",
                "messageReply"
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="notifications-outline" size={20} color="#886BC1" />
                </View>
                <Text style={styles.cardTitle}>Promociones y consejos</Text>
              </View>

              {renderSettingRow(
                "Promociones",
                "Ofertas especiales y descuentos",
                "promotions"
              )}
              {renderSettingRow(
                "Recomendaciones",
                "Niñeras sugeridas para ti",
                "recommendations"
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="shield-outline"
                    size={20}
                    color="#886BC1"
                  />
                </View>
                <Text style={styles.cardTitle}>Seguridad</Text>
              </View>

              {renderSettingRow(
                "Alertas de seguridad",
                "Actividad inusual en tu cuenta",
                "securityAlerts"
              )}
              {renderSettingRow(
                "Intentos de inicio de sesión",
                "Notificar nuevos inicios de sesión",
                "loginAttempts"
              )}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="access-time"
                  size={20}
                  color="#3B82F6"
                  style={styles.infoIcon}
                />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>
                    Horario de notificaciones
                  </Text>
                  <Text style={styles.infoDescription}>
                    Las notificaciones se enviarán en horario de 8:00 AM a
                    10:00 PM.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/register/client/home")}
          >
            <Feather name="home" size={22} color="#9CA3AF" />
            <Text style={styles.navText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/register/client/bookings")}
          >
            <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
            <Text style={styles.navText}>Reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/register/client/chat")}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#9CA3AF" />
            <Text style={styles.navText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/register/client/UserProfile")}
          >
            <Feather name="user" size={22} color="#9CA3AF" />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 120,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
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
    marginBottom: 24,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 14,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F6D9F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    color: "#2E2E2E",
    fontSize: 18,
    fontWeight: "700",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: "#2E2E2E",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 3,
  },
  settingSubtitle: {
    color: "#6B7280",
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: "#1E3A8A",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoDescription: {
    color: "#1D4ED8",
    fontSize: 12,
    lineHeight: 18,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
  },
});