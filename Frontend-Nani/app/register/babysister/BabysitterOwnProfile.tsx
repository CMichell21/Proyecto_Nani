import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  MapPin,
  Pencil,
  Shield,
  Star,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ENDPOINTS } from "../../../constants/apiConfig";

type EditMode = "presentacion" | "habilidades" | "certificaciones" | null;

export default function BabysitterOwnProfile() {
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editValue, setEditValue] = useState("");
  const [stats, setStats] = useState({
    monthEarnings: 0,
    completedBookings: 0,
    chats: 0,
  });

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const savedUserId = await AsyncStorage.getItem("userId");

      if (!savedUserId) {
        Alert.alert("Error", "No se encontro el ID del usuario");
        setProfile(null);
        return;
      }

      const response = await fetch(ENDPOINTS.get_perfil_ninera(savedUserId));
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar perfil");
      }

      setProfile(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo cargar el perfil");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const savedUserId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      if (!savedUserId) return;

      const [bookingsResponse, chatsResponse] = await Promise.all([
        fetch(ENDPOINTS.get_reservas_ninera(savedUserId)),
        fetch(ENDPOINTS.get_chat_conversations, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const bookingsData = await bookingsResponse.json().catch(() => []);
      const chatsData = await chatsResponse.json().catch(() => []);

      const bookings = Array.isArray(bookingsData) ? bookingsData : [];
      const completedBookings = bookings.filter(
        (item: any) => String(item.estado || "").toLowerCase() === "completada",
      );

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;

      const monthEarnings = completedBookings
        .filter(
          (item: any) => String(item.fecha_servicio || "").slice(0, 7) === currentMonth,
        )
        .reduce((total: number, item: any) => total + Number(item.monto_total || 0), 0);

      setStats({
        monthEarnings,
        completedBookings: completedBookings.length,
        chats: Array.isArray(chatsData) ? chatsData.length : 0,
      });
    } catch (error) {
      console.log("Error cargando stats del perfil:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      fetchStats();
    }, [fetchProfileData, fetchStats]),
  );

  const handleChangePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "No se encontro el usuario");
        return;
      }

      const formData = new FormData();
      formData.append("foto", {
        uri: image.uri,
        name: "foto.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(ENDPOINTS.update_foto_ninera(userId), {
        method: "PATCH",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        Alert.alert("Error", data.message || "No se pudo actualizar la foto");
        return;
      }

      Alert.alert("Exito", "Foto actualizada");
      fetchProfileData();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Ocurrio un error al cambiar la foto",
      );
    }
  };

  const openEditModal = (mode: EditMode) => {
    if (!profile) return;

    if (mode === "presentacion") {
      setEditValue(profile?.presentacion || "");
    } else if (mode === "habilidades") {
      const items = Array.isArray(profile?.habilidades)
        ? profile.habilidades.map((item: any) => item?.nombre || "").filter(Boolean)
        : [];
      setEditValue(items.join(", "));
    } else if (mode === "certificaciones") {
      const items = Array.isArray(profile?.certificaciones)
        ? profile.certificaciones.map((item: any) => item?.nombre || "").filter(Boolean)
        : [];
      setEditValue(items.join(", "));
    }

    setEditMode(mode);
  };

  const saveProfileSection = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId || !editMode) return;

      setSavingProfile(true);

      const payload: any = {};
      if (editMode === "presentacion") {
        payload.presentacion = editValue.trim();
      }
      if (editMode === "habilidades") {
        payload.habilidades = editValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      if (editMode === "certificaciones") {
        payload.certificaciones = editValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      const response = await fetch(ENDPOINTS.update_perfil_ninera(userId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No se pudo guardar");
      }

      setProfile(data);
      setEditMode(null);
      setEditValue("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await AsyncStorage.multiRemove(["userToken", "userId"]);
    router.replace("/login");
  };

  const profileImage = useMemo(
    () =>
      profile?.foto_url ||
      profile?.persona?.foto_url ||
      "https://images.unsplash.com/photo-1584446456661-1039ed1a39d7?w=800",
    [profile],
  );

  const fullName = useMemo(
    () =>
      `${profile?.persona?.nombre || ""} ${profile?.persona?.apellido || ""}`.trim() ||
      "Ninera",
    [profile],
  );

  const ubicacion = useMemo(
    () =>
      profile?.persona?.direccion?.direccion_completa || "Ubicacion no disponible",
    [profile],
  );

  const habilidades = Array.isArray(profile?.habilidades) ? profile.habilidades : [];
  const certificaciones = Array.isArray(profile?.certificaciones)
    ? profile.certificaciones
    : [];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF768A" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loaderText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8}>
          <Image source={{ uri: profileImage }} style={styles.headerImage} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#2E2E2E" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{fullName}</Text>

            <View style={styles.row}>
              <Star size={14} color="#FF768A" />
              <Text style={styles.rating}>{Number(profile?.promedio_rating || 0).toFixed(1)}</Text>
            </View>

            <View style={styles.row}>
              <MapPin size={14} color="#8D8D8D" />
              <Text style={styles.location}>{ubicacion}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>L {profile?.tarifa ?? 0}</Text>
            <Text style={styles.priceLabel}>/hora</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {profile?.verificada && (
            <View style={styles.badge}>
              <Shield size={14} color="#886BC1" />
              <Text style={styles.badgeText}>Verificada</Text>
            </View>
          )}

          <View style={styles.badge}>
            <Award size={14} color="#886BC1" />
            <Text style={styles.badgeText}>
              {profile?.experiencia || "Sin experiencia"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCardPurple}>
          <Text style={styles.statValue}>L {stats.monthEarnings}</Text>
          <Text style={styles.statLabelLight}>Ganado este mes</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValuePurple}>{stats.completedBookings}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValuePurple}>{stats.chats}</Text>
          <Text style={styles.statLabel}>Chats activos</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "profile" && styles.activeTab]}
          onPress={() => setActiveTab("profile")}
          activeOpacity={0.8}
        >
          <Text style={activeTab === "profile" ? styles.tabTextActive : styles.tabText}>
            Mi Perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "bookings" && styles.activeTab]}
          onPress={() => setActiveTab("bookings")}
          activeOpacity={0.8}
        >
          <Text style={activeTab === "bookings" ? styles.tabTextActive : styles.tabText}>
            Reservas
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "profile" ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Presentación</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal("presentacion")}
            >
              <Pencil size={14} color="#886BC1" />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.about}>
            {profile?.presentacion || "Sin descripción disponible."}
          </Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal("habilidades")}
            >
              <Pencil size={14} color="#886BC1" />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skillWrap}>
            {habilidades.length > 0 ? (
              habilidades.map((skill: any, index: number) => (
                <View key={`${skill?.nombre}-${index}`} style={styles.skill}>
                  <Text style={styles.skillText}>{skill?.nombre || String(skill)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.about}>No hay habilidades registradas.</Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certificaciones</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal("certificaciones")}
            >
              <Pencil size={14} color="#886BC1" />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>

          {certificaciones.length > 0 ? (
            certificaciones.map((cert: any, index: number) => (
              <View key={`${cert?.nombre}-${index}`} style={styles.certRow}>
                <CheckCircle size={18} color="#FF768A" />
                <Text style={styles.certText}>{cert?.nombre || String(cert)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.about}>No hay certificaciones registradas.</Text>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.bookingSummaryCard}>
            <Text style={styles.summaryTitle}>Resumen rápido</Text>
            <Text style={styles.summaryText}>
              Este mes llevas <Text style={{fontWeight: "700", color: "#886BC1"}}>L {stats.monthEarnings}</Text> y {stats.completedBookings} reservas completadas.
            </Text>
            <Text style={styles.summaryText}>
              También tienes {stats.chats} chats activos con clientes.
            </Text>
          </View>
        </View>
      )}

      {/* MODAL DE EDICIÓN */}
      <Modal
        visible={!!editMode}
        transparent
        animationType="fade"
        onRequestClose={() => setEditMode(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editMode === "presentacion" && "Editar presentación"}
              {editMode === "habilidades" && "Editar habilidades"}
              {editMode === "certificaciones" && "Editar certificaciones"}
            </Text>
            <Text style={styles.modalText}>
              {editMode === "presentacion"
                ? "Escribe una descripción breve de tu perfil."
                : "Separa cada elemento con coma."}
            </Text>

            <TextInput
              style={[
                styles.input,
                editMode === "presentacion" && styles.textArea,
              ]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={
                editMode === "presentacion"
                  ? "Cuéntales a los clientes sobre ti"
                  : "Ejemplo: Paciencia, Primeros auxilios"
              }
              placeholderTextColor="#A0A0A0"
              multiline={editMode === "presentacion"}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditMode(null)}
                disabled={savingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={saveProfileSection}
                disabled={savingProfile}
              >
                <Text style={styles.confirmButtonText}>
                  {savingProfile ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CERRAR SESIÓN */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalText}>
              ¿Estás segura de que quieres cerrar tu sesión en Nani?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutConfirmButton} onPress={handleLogout}>
                <Text style={styles.confirmButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" }, // Fondo gris suave
  centerContent: { justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16, color: "#886BC1", fontWeight: "600" },
  
  headerContainer: { height: 240 },
  headerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 999,
    elevation: 3,
  },
  
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20, // Borde igual que HomeScreen
    marginTop: -30,
    elevation: 2, // Sombra suave
  },
  profileTop: { flexDirection: "row", justifyContent: "space-between" },
  profileInfo: { flex: 1, marginRight: 10 },
  name: { fontSize: 20, fontWeight: "700", color: "#2E2E2E", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  rating: { fontSize: 14, fontWeight: "600", color: "#2E2E2E" },
  location: { fontSize: 13, color: "#8D8D8D", flexShrink: 1 },
  
  priceContainer: { alignItems: "flex-end" },
  price: { color: "#886BC1", fontSize: 18, fontWeight: "700" },
  priceLabel: { color: "#9A9A9A", fontSize: 13 },
  
  badges: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(136, 107, 193, 0.1)", // Morado suave
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { fontSize: 12, color: "#886BC1", fontWeight: "600" },
  
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCardPurple: {
    flex: 1.2,
    backgroundColor: "#886BC1",
    padding: 16,
    borderRadius: 20,
    justifyContent: "center",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    justifyContent: "center",
  },
  statValue: { fontSize: 20, color: "#FFFFFF", fontWeight: "700" },
  statValuePurple: { fontSize: 20, color: "#886BC1", fontWeight: "700" },
  statLabel: { fontSize: 11, color: "#9A9A9A", marginTop: 4, fontWeight: "500" },
  statLabelLight: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 16 },
  activeTab: { backgroundColor: "#FF768A" }, // Rosa activo
  tabText: { color: "#9A9A9A", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  
  section: { paddingHorizontal: 16, gap: 16, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2E2E2E" },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(136, 107, 193, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editText: { color: "#886BC1", fontSize: 13, fontWeight: "600" },
  about: { color: "#8D8D8D", fontSize: 14, lineHeight: 22 },
  
  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skill: {
    backgroundColor: "rgba(255, 118, 138, 0.1)", // Rosa suave
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  skillText: { fontSize: 13, color: "#FF768A", fontWeight: "600" },
  
  certRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  certText: { fontSize: 15, color: "#2E2E2E", flex: 1, fontWeight: "500" },
  
  bookingSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  summaryTitle: { fontSize: 17, fontWeight: "700", color: "#2E2E2E", marginBottom: 12 },
  summaryText: { color: "#8D8D8D", fontSize: 14, marginBottom: 8, lineHeight: 22 },
  
  logoutButton: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutButtonText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // Un poco más claro
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#2E2E2E", textAlign: "center", marginBottom: 8 },
  modalText: { fontSize: 14, color: "#8D8D8D", textAlign: "center", marginBottom: 20 },
  
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#2E2E2E",
  },
  textArea: { minHeight: 120 },
  
  modalButtons: { flexDirection: "row", marginTop: 24, gap: 12 },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 15, fontWeight: "600", color: "#8D8D8D" },
  
  confirmButton: {
    flex: 1,
    backgroundColor: "#FF768A", // Rosa de la app para guardar
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: "#EF4444", // Mantenemos rojo para la acción destructiva (cerrar sesión)
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  confirmButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});