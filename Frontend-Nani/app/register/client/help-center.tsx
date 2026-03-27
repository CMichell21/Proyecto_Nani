import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

type FAQItem = {
  q: string;
  a: string;
};

type FAQCategory = {
  id: number;
  title: string;
  icon: string;
  questions: FAQItem[];
};

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 1,
    title: "Cómo funciona Nani",
    icon: "❓",
    questions: [
      {
        q: "¿Cómo busco una niñera?",
        a: "Puedes buscar niñeras desde la pantalla principal usando filtros de ubicación, experiencia, tarifa horaria y disponibilidad.",
      },
      {
        q: "¿Cómo hago una reserva?",
        a: "Selecciona una niñera, revisa su perfil, elige fecha y hora, y confirma la reserva. Recibirás una notificación cuando sea confirmada.",
      },
      {
        q: "¿Puedo cancelar una reserva?",
        a: "Sí, puedes cancelar hasta 24 horas antes sin cargo. Las cancelaciones tardías pueden tener una penalización del 50%.",
      },
    ],
  },
  {
    id: 2,
    title: "Pagos y tarifas",
    icon: "💳",
    questions: [
      {
        q: "¿Cómo funciona el pago?",
        a: "Puedes pagar con tarjeta de crédito o débito, y también en efectivo si está disponible. El pago se procesa después de confirmar la reserva.",
      },
      {
        q: "¿Cuándo se cobra el servicio?",
        a: "El cobro se realiza al finalizar la sesión, basado en el tiempo real registrado mediante el sistema de QR.",
      },
      {
        q: "¿Puedo obtener un reembolso?",
        a: "Los reembolsos se procesan según nuestra política de cancelación. Contacta a soporte para casos especiales.",
      },
    ],
  },
  {
    id: 3,
    title: "Seguridad",
    icon: "🛡️",
    questions: [
      {
        q: "¿Cómo verifican a las niñeras?",
        a: "Todas las niñeras pasan por verificación de identidad, antecedentes penales y referencias profesionales.",
      },
      {
        q: "¿Qué hago en caso de emergencia?",
        a: "Usa el botón de emergencia en la app o llama directamente a los servicios de emergencia. También notificaremos a nuestro equipo.",
      },
      {
        q: "¿Mis datos están seguros?",
        a: "Sí, usamos encriptación de extremo a extremo y cumplimos con las regulaciones de protección de datos.",
      },
    ],
  },
  {
    id: 4,
    title: "Mi cuenta",
    icon: "👤",
    questions: [
      {
        q: "¿Cómo edito mi perfil?",
        a: "Ve a la sección de Perfil y toca 'Editar perfil' para actualizar tu información personal.",
      },
      {
        q: "¿Cómo cambio mi contraseña?",
        a: "En Perfil > Seguridad y privacidad > Cambiar contraseña.",
      },
      {
        q: "¿Puedo tener múltiples métodos de pago?",
        a: "Sí, puedes agregar varias tarjetas y seleccionar una como predeterminada en Métodos de pago.",
      },
    ],
  },
];

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return FAQ_CATEGORIES;

    return FAQ_CATEGORIES.map((category) => {
      const filteredQuestions = category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(normalizedSearch) ||
          item.a.toLowerCase().includes(normalizedSearch) ||
          category.title.toLowerCase().includes(normalizedSearch)
      );

      return {
        ...category,
        questions: filteredQuestions,
      };
    }).filter((category) => category.questions.length > 0);
  }, [normalizedSearch]);

  const toggleCategory = (id: number) => {
    setExpandedCategory(expandedCategory === id ? null : id);
    setExpandedQuestion(null);
  };

  const toggleQuestion = (question: string) => {
    setExpandedQuestion(expandedQuestion === question ? null : question);
  };

  const handleLiveChat = () => {
    router.push("/register/client/chat");
  };

  const handlePhoneCall = async () => {
    const phoneNumber = "tel:+12345678900";
    const supported = await Linking.canOpenURL(phoneNumber);

    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      Alert.alert("No disponible", "No se pudo abrir la aplicación de llamadas.");
    }
  };

  const handleEmail = async () => {
    const email = "mailto:soporte@nani.com?subject=Ayuda%20Nani";
    const supported = await Linking.canOpenURL(email);

    if (supported) {
      await Linking.openURL(email);
    } else {
      Alert.alert("No disponible", "No se pudo abrir la aplicación de correo.");
    }
  };

  const handleResourcePress = (resource: string) => {
    Alert.alert("Recurso", `Abrir: ${resource}`);
  };

  const renderQuestionItem = (item: FAQItem) => {
    const isExpanded = expandedQuestion === item.q;

    return (
      <View key={item.q} style={styles.questionCard}>
        <TouchableOpacity
          onPress={() => toggleQuestion(item.q)}
          style={styles.questionButton}
          activeOpacity={0.8}
        >
          <View style={styles.questionLeft}>
            <Feather
              name="help-circle"
              size={18}
              color="#886BC1"
              style={styles.questionIcon}
            />
            <Text style={styles.questionText}>{item.q}</Text>
          </View>

          <MaterialIcons
            name="keyboard-arrow-right"
            size={20}
            color="#9CA3AF"
            style={isExpanded ? styles.arrowExpanded : undefined}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{item.a}</Text>
          </View>
        )}
      </View>
    );
  };

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

            <Text style={styles.headerTitle}>Ayuda y soporte</Text>
            <Text style={styles.headerSubtitle}>Centro de ayuda</Text>
          </LinearGradient>

          <View style={styles.content}>
            {/* Search */}
            <View style={styles.searchCard}>
              <View style={styles.searchWrapper}>
                <Feather
                  name="search"
                  size={18}
                  color="#9CA3AF"
                  style={styles.searchIcon}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar en preguntas frecuentes..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>
            </View>

            {/* Quick Contact */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Contacto rápido</Text>

              <TouchableOpacity
                style={styles.liveChatButton}
                onPress={handleLiveChat}
                activeOpacity={0.85}
              >
                <View style={styles.contactLeft}>
                  <View style={styles.liveChatIconCircle}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <View>
                    <Text style={styles.liveChatTitle}>Chat en vivo</Text>
                    <Text style={styles.liveChatSubtitle}>
                      Disponible 24/7
                    </Text>
                  </View>
                </View>

                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={handlePhoneCall}
                activeOpacity={0.85}
              >
                <View style={styles.contactLeft}>
                  <View style={styles.contactIconCircle}>
                    <Feather name="phone" size={20} color="#886BC1" />
                  </View>
                  <View>
                    <Text style={styles.contactTitle}>Llamar a soporte</Text>
                    <Text style={styles.contactSubtitle}>
                      +1 (234) 567-8900
                    </Text>
                  </View>
                </View>

                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleEmail}
                activeOpacity={0.85}
              >
                <View style={styles.contactLeft}>
                  <View style={styles.contactIconCircle}>
                    <Feather name="mail" size={20} color="#886BC1" />
                  </View>
                  <View>
                    <Text style={styles.contactTitle}>Enviar correo</Text>
                    <Text style={styles.contactSubtitle}>soporte@nani.com</Text>
                  </View>
                </View>

                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* FAQ */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>

              {filteredCategories.length === 0 ? (
                <View style={styles.noResultsBox}>
                  <Text style={styles.noResultsTitle}>
                    No se encontraron resultados
                  </Text>
                  <Text style={styles.noResultsSubtitle}>
                    Prueba con otra palabra clave.
                  </Text>
                </View>
              ) : (
                filteredCategories.map((category) => {
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <View key={category.id} style={styles.categoryCard}>
                      <TouchableOpacity
                        onPress={() => toggleCategory(category.id)}
                        style={styles.categoryButton}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.categoryEmoji}>{category.icon}</Text>

                        <Text style={styles.categoryTitle}>{category.title}</Text>

                        <MaterialIcons
                          name="keyboard-arrow-right"
                          size={22}
                          color="#9CA3AF"
                          style={isExpanded ? styles.arrowExpanded : undefined}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.questionsContainer}>
                          {category.questions.map(renderQuestionItem)}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            {/* Resources */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Recursos adicionales</Text>

              {[
                "Términos y condiciones",
                "Política de privacidad",
                "Política de cancelación",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.resourceButton}
                  onPress={() => handleResourcePress(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resourceText}>{item}</Text>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* App Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoVersion}>Nani v1.0.0</Text>
              <Text style={styles.infoCopyright}>
                © 2026 Nani. Todos los derechos reservados.
              </Text>
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
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  searchWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    paddingLeft: 40,
    paddingRight: 14,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#F3F4F6",
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
  sectionTitle: {
    color: "#2E2E2E",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  liveChatButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#886BC1",
  },
  liveChatIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  liveChatTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  liveChatSubtitle: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 12,
    marginTop: 2,
  },
  contactButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F6D9F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactTitle: {
    color: "#2E2E2E",
    fontSize: 15,
    fontWeight: "600",
  },
  contactSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    flex: 1,
    color: "#2E2E2E",
    fontSize: 15,
    fontWeight: "500",
  },
  questionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  questionButton: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 14,
  },
  questionLeft: {
    flexDirection: "row",
    flex: 1,
    paddingRight: 10,
  },
  questionIcon: {
    marginTop: 1,
    marginRight: 8,
  },
  questionText: {
    flex: 1,
    color: "#2E2E2E",
    fontSize: 14,
    lineHeight: 20,
  },
  answerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingLeft: 40,
  },
  answerText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 20,
  },
  noResultsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  noResultsTitle: {
    color: "#2E2E2E",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  noResultsSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },
  resourceButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resourceText: {
    color: "#2E2E2E",
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: "#F3E8FF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  infoVersion: {
    color: "#581C87",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoCopyright: {
    color: "#6B21A8",
    fontSize: 12,
    textAlign: "center",
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
  arrowExpanded: {
    transform: [{ rotate: "90deg" }],
  },
});