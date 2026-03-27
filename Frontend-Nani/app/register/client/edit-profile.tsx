import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ChildData = {
  id: string;
  name: string;
  age: string;
};

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  photo: string;
  children: ChildData[];
};

const STORAGE_KEY = "client_profile";

const DEFAULT_PROFILE: ProfileData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  photo:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  children: [
    {
      id: "1",
      name: "",
      age: "",
    },
  ],
};

export default function EditProfileScreen() {
  const [formData, setFormData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedProfile) {
        const parsedProfile: ProfileData = JSON.parse(savedProfile);

        setFormData({
          ...DEFAULT_PROFILE,
          ...parsedProfile,
          children:
            parsedProfile.children && Array.isArray(parsedProfile.children)
              ? parsedProfile.children
              : DEFAULT_PROFILE.children,
        });
      }
    } catch (error) {
      console.log("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof Omit<ProfileData, "children">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso requerido",
          "Debes permitir acceso a tus fotos para cambiar la imagen."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        handleChange("photo", result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  const handleChildChange = (
    childId: string,
    field: keyof Omit<ChildData, "id">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === childId ? { ...child, [field]: value } : child
      ),
    }));
  };

  const handleAddChild = () => {
    const newChild: ChildData = {
      id: Date.now().toString(),
      name: "",
      age: "",
    };

    setFormData((prev) => ({
      ...prev,
      children: [...prev.children, newChild],
    }));
  };

  const handleRemoveChild = (childId: string) => {
    Alert.alert("Eliminar hijo", "¿Deseas eliminar este hijo del registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setFormData((prev) => ({
            ...prev,
            children: prev.children.filter((child) => child.id !== childId),
          }));
        },
      },
    ]);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu nombre completo.");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu correo electrónico.");
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu teléfono.");
      return false;
    }

    if (!formData.address.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu dirección.");
      return false;
    }

    if (!formData.city.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu ciudad.");
      return false;
    }

    for (let i = 0; i < formData.children.length; i++) {
      const child = formData.children[i];

      if (!child.name.trim()) {
        Alert.alert("Campo requerido", `Ingresa el nombre del hijo ${i + 1}.`);
        return false;
      }

      if (!child.age.trim()) {
        Alert.alert("Campo requerido", `Ingresa la edad del hijo ${i + 1}.`);
        return false;
      }

      const ageNumber = Number(child.age);

      if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 17) {
        Alert.alert(
          "Edad inválida",
          `La edad del hijo ${i + 1} debe estar entre 0 y 17 años.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

      Alert.alert("Éxito", "Tu perfil ha sido actualizado.", [
        {
          text: "Aceptar",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#886BC1" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#886BC1" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

            <Text style={styles.headerTitle}>Editar perfil</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.photoCard}>
              <View style={styles.photoSection}>
                <View style={styles.photoWrapper}>
                  <Image
                    source={{ uri: formData.photo }}
                    style={styles.profileImage}
                  />

                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    <Feather name="camera" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.photoHint}>Toca para cambiar la foto</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => handleChange("name", text)}
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  placeholder="Ingresa tu correo"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                  placeholder="Ingresa tu teléfono"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  value={formData.address}
                  onChangeText={(text) => handleChange("address", text)}
                  placeholder="Ingresa tu dirección"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(text) => handleChange("city", text)}
                  placeholder="Ingresa tu ciudad"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.childrenCard}>
              <View style={styles.childrenHeader}>
                <Text style={styles.childrenTitle}>Información de los hijos</Text>

                <TouchableOpacity
                  style={styles.addChildButton}
                  onPress={handleAddChild}
                  activeOpacity={0.85}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <Text style={styles.addChildButtonText}>Agregar hijo</Text>
                </TouchableOpacity>
              </View>

              {formData.children.length === 0 ? (
                <View style={styles.emptyChildrenBox}>
                  <Text style={styles.emptyChildrenText}>
                    No has agregado hijos todavía.
                  </Text>
                </View>
              ) : (
                formData.children.map((child, index) => (
                  <View key={child.id} style={styles.childBox}>
                    <View style={styles.childTopRow}>
                      <Text style={styles.childLabel}>Hijo {index + 1}</Text>

                      <TouchableOpacity
                        onPress={() => handleRemoveChild(child.id)}
                        style={styles.deleteChildButton}
                        activeOpacity={0.8}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nombre del hijo</Text>
                      <TextInput
                        value={child.name}
                        onChangeText={(text) =>
                          handleChildChange(child.id, "name", text)
                        }
                        placeholder="Ejemplo: Mateo"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Edad</Text>
                      <TextInput
                        value={child.age}
                        onChangeText={(text) =>
                          handleChildChange(
                            child.id,
                            "age",
                            text.replace(/[^0-9]/g, "")
                          )
                        }
                        placeholder="Ejemplo: 5"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        style={styles.input}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              <LinearGradient
                colors={["#886BC1", "#FF768A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <MaterialIcons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
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
  content: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  photoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  photoSection: {
    alignItems: "center",
  },
  photoWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF768A",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  photoHint: {
    fontSize: 13,
    color: "#6B7280",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  childrenCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  childrenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  childrenTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#2E2E2E",
    marginRight: 10,
  },
  addChildButton: {
    backgroundColor: "#886BC1",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  addChildButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyChildrenBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 18,
  },
  emptyChildrenText: {
    fontSize: 14,
    color: "#6B7280",
  },
  childBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  childTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  childLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E2E2E",
  },
  deleteChildButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  saveButtonWrapper: {
    marginTop: 4,
  },
  saveButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
});