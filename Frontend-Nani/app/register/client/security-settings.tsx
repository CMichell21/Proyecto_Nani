import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
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

type PasswordForm = {
  current: string;
  new: string;
  confirm: string;
};

type SessionItem = {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
};

type SecurityState = {
  twoFactorEnabled: boolean;
  lastPasswordUpdate: string;
};

const STORAGE_KEY = "client_security_settings";

const DEFAULT_SECURITY: SecurityState = {
  twoFactorEnabled: false,
  lastPasswordUpdate: "Hace 3 meses",
};

const DEFAULT_SESSIONS: SessionItem[] = [
  {
    id: 1,
    device: "Android actual",
    location: "Tegucigalpa, Honduras",
    lastActive: "Activo ahora",
    isCurrent: true,
  },
  {
    id: 2,
    device: "Chrome en Windows",
    location: "Tegucigalpa, Honduras",
    lastActive: "Hace 2 días",
    isCurrent: false,
  },
];

export default function SecuritySettingsScreen() {
  const [loading, setLoading] = useState(true);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [securityData, setSecurityData] =
    useState<SecurityState>(DEFAULT_SECURITY);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current: "",
    new: "",
    confirm: "",
  });

  const [sessions, setSessions] = useState<SessionItem[]>(DEFAULT_SESSIONS);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setSecurityData({ ...DEFAULT_SECURITY, ...parsed });
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_SECURITY)
        );
      }
    } catch (error) {
      console.log("Error cargando seguridad:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSecurityData = async (updatedData: SecurityState) => {
    try {
      setSecurityData(updatedData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.log("Error guardando seguridad:", error);
    }
  };

  const handleToggleTwoFactor = async () => {
    const updated = {
      ...securityData,
      twoFactorEnabled: !securityData.twoFactorEnabled,
    };

    await saveSecurityData(updated);
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      current: "",
      new: "",
      confirm: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowChangePassword(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu contraseña actual.");
      return;
    }

    if (!passwordForm.new.trim()) {
      Alert.alert("Campo requerido", "Ingresa una nueva contraseña.");
      return;
    }

    if (passwordForm.new.length < 6) {
      Alert.alert(
        "Contraseña inválida",
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      Alert.alert(
        "Confirmación incorrecta",
        "La nueva contraseña y su confirmación no coinciden."
      );
      return;
    }

    const updated = {
      ...securityData,
      lastPasswordUpdate: "Justo ahora",
    };

    await saveSecurityData(updated);

    Alert.alert("Éxito", "Contraseña actualizada correctamente.");
    resetPasswordForm();
  };

  const handleRemoveSession = (id: number) => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar esta sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => {
            setSessions((prev) => prev.filter((session) => session.id !== id));
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Descargar mis datos",
      "Tu solicitud de descarga de datos ha sido registrada."
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción no se puede deshacer. ¿Deseas continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Solicitud enviada",
              "Tu solicitud de eliminación de cuenta ha sido registrada."
            );
          },
        },
      ]
    );
  };

  const renderPasswordInput = ({
    label,
    value,
    onChangeText,
    secure,
    onToggleSecure,
    placeholder,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secure: boolean;
    onToggleSecure: () => void;
    placeholder: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={styles.passwordInputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!secure}
          style={styles.passwordInput}
        />

        <TouchableOpacity
          onPress={onToggleSecure}
          style={styles.eyeButton}
          activeOpacity={0.8}
        >
          <Feather
            name={secure ? "eye-off" : "eye"}
            size={18}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#886BC1" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#886BC1" />
          <Text style={styles.loadingText}>Cargando seguridad...</Text>
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

            <Text style={styles.headerTitle}>Seguridad y privacidad</Text>
            <Text style={styles.headerSubtitle}>Protege tu cuenta</Text>
          </LinearGradient>

          <View style={styles.content}>
            {/* Contraseña */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Feather name="lock" size={20} color="#886BC1" />
                </View>

                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Contraseña</Text>
                  <Text style={styles.cardSubtitle}>
                    Última actualización: {securityData.lastPasswordUpdate}
                  </Text>
                </View>
              </View>

              {!showChangePassword ? (
                <TouchableOpacity
                  onPress={() => setShowChangePassword(true)}
                  style={styles.secondaryButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryButtonText}>
                    Cambiar contraseña
                  </Text>
                </TouchableOpacity>
              ) : (
                <View>
                  {renderPasswordInput({
                    label: "Contraseña actual",
                    value: passwordForm.current,
                    onChangeText: (text) =>
                      handlePasswordChange("current", text),
                    secure: showCurrentPassword,
                    onToggleSecure: () =>
                      setShowCurrentPassword(!showCurrentPassword),
                    placeholder: "Ingresa tu contraseña actual",
                  })}

                  {renderPasswordInput({
                    label: "Nueva contraseña",
                    value: passwordForm.new,
                    onChangeText: (text) => handlePasswordChange("new", text),
                    secure: showNewPassword,
                    onToggleSecure: () =>
                      setShowNewPassword(!showNewPassword),
                    placeholder: "Ingresa tu nueva contraseña",
                  })}

                  {renderPasswordInput({
                    label: "Confirmar contraseña",
                    value: passwordForm.confirm,
                    onChangeText: (text) =>
                      handlePasswordChange("confirm", text),
                    secure: showConfirmPassword,
                    onToggleSecure: () =>
                      setShowConfirmPassword(!showConfirmPassword),
                    placeholder: "Confirma tu nueva contraseña",
                  })}

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={resetPasswordForm}
                      style={styles.cancelButton}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleChangePassword}
                      style={styles.updateButtonWrapper}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={["#886BC1", "#FF768A"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.updateButton}
                      >
                        <Text style={styles.updateButtonText}>Actualizar</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* 2FA */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Feather name="key" size={20} color="#886BC1" />
                </View>

                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>
                    Autenticación de dos factores
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Añade una capa extra de seguridad
                  </Text>
                </View>
              </View>

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.settingMainText}>Estado</Text>
                  <Text style={styles.settingSubText}>
                    {securityData.twoFactorEnabled ? "Activada" : "Desactivada"}
                  </Text>
                </View>

                <Switch
                  value={securityData.twoFactorEnabled}
                  onValueChange={handleToggleTwoFactor}
                  trackColor={{ false: "#D1D5DB", true: "#B8A4E5" }}
                  thumbColor={
                    securityData.twoFactorEnabled ? "#886BC1" : "#FFFFFF"
                  }
                />
              </View>

              {securityData.twoFactorEnabled && (
                <View style={styles.successBox}>
                  <Text style={styles.successTitle}>✓ Protección activada</Text>
                  <Text style={styles.successText}>
                    Se enviará un código a tu teléfono al iniciar sesión.
                  </Text>
                </View>
              )}
            </View>

            {/* Sesiones activas */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Feather name="smartphone" size={20} color="#886BC1" />
                </View>
                <Text style={styles.cardTitle}>Sesiones activas</Text>
              </View>

              {sessions.map((session) => (
                <View key={session.id} style={styles.sessionBox}>
                  <View style={styles.sessionTopRow}>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionTitleRow}>
                        <Text style={styles.sessionDevice}>{session.device}</Text>

                        {session.isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Actual</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.sessionLocation}>
                        {session.location}
                      </Text>
                      <Text style={styles.sessionLastActive}>
                        {session.lastActive}
                      </Text>
                    </View>

                    {!session.isCurrent && (
                      <TouchableOpacity
                        onPress={() => handleRemoveSession(session.id)}
                        style={styles.sessionDeleteButton}
                        activeOpacity={0.8}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Privacidad */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Feather name="shield" size={20} color="#886BC1" />
                </View>
                <Text style={styles.cardTitle}>Privacidad</Text>
              </View>

              <TouchableOpacity
                onPress={handleDownloadData}
                style={styles.privacyButton}
                activeOpacity={0.85}
              >
                <Text style={styles.privacyButtonText}>
                  Descargar mis datos
                </Text>
                <MaterialIcons
                  name="file-download"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={styles.deleteAccountButton}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteAccountText}>Eliminar mi cuenta</Text>
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Feather
                  name="shield"
                  size={20}
                  color="#3B82F6"
                  style={styles.infoIcon}
                />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>
                    Tu seguridad es importante
                  </Text>
                  <Text style={styles.infoDescription}>
                    Mantén tu contraseña segura y activa la autenticación de dos
                    factores para mayor protección.
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
  cardHeaderText: {
    flex: 1,
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
    fontSize: 17,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#F6D9F1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#886BC1",
    fontSize: 15,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#4B5563",
    fontSize: 14,
    marginBottom: 8,
  },
  passwordInputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    alignSelf: "center",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  updateButtonWrapper: {
    flex: 1,
    marginLeft: 6,
  },
  updateButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingMainText: {
    color: "#2E2E2E",
    fontSize: 14,
    fontWeight: "500",
  },
  settingSubText: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  successBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  successTitle: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  successText: {
    color: "#15803D",
    fontSize: 12,
    lineHeight: 18,
  },
  sessionBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sessionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  sessionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  sessionDevice: {
    color: "#2E2E2E",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },
  currentBadgeText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "600",
  },
  sessionLocation: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 2,
  },
  sessionLastActive: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  sessionDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  privacyButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  privacyButtonText: {
    color: "#2E2E2E",
    fontSize: 14,
  },
  deleteAccountButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deleteAccountText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
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