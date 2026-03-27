import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

type CardItem = {
  id: number;
  type: "Visa" | "Mastercard";
  lastDigits: string;
  expiryDate: string;
  isDefault: boolean;
};

type NewCardForm = {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
};

const INITIAL_CARDS: CardItem[] = [
  {
    id: 1,
    type: "Visa",
    lastDigits: "4532",
    expiryDate: "12/26",
    isDefault: true,
  },
  {
    id: 2,
    type: "Mastercard",
    lastDigits: "8901",
    expiryDate: "08/27",
    isDefault: false,
  },
];

const INITIAL_NEW_CARD: NewCardForm = {
  number: "",
  name: "",
  expiry: "",
  cvv: "",
};

export default function PaymentMethodsScreen() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cards, setCards] = useState<CardItem[]>(INITIAL_CARDS);
  const [newCard, setNewCard] = useState<NewCardForm>(INITIAL_NEW_CARD);

  const nextId = useMemo(() => {
    if (cards.length === 0) return 1;
    return Math.max(...cards.map((card) => card.id)) + 1;
  }, [cards]);

  const getCardType = (cardNumber: string): "Visa" | "Mastercard" => {
    const sanitized = cardNumber.replace(/\s/g, "");
    if (sanitized.startsWith("5")) return "Mastercard";
    return "Visa";
  };

  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
    return digitsOnly.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    if (digitsOnly.length <= 2) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  };

  const handleChangeNewCard = (field: keyof NewCardForm, value: string) => {
    let finalValue = value;

    if (field === "number") {
      finalValue = formatCardNumber(value);
    }

    if (field === "expiry") {
      finalValue = formatExpiry(value);
    }

    if (field === "cvv") {
      finalValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setNewCard((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  const handleAddCard = () => {
    const numberDigits = newCard.number.replace(/\s/g, "");

    if (!numberDigits || !newCard.name || !newCard.expiry || !newCard.cvv) {
      Alert.alert("Campos incompletos", "Completa todos los campos de la tarjeta.");
      return;
    }

    if (numberDigits.length < 16) {
      Alert.alert("Tarjeta inválida", "El número de tarjeta debe tener 16 dígitos.");
      return;
    }

    if (newCard.expiry.length !== 5) {
      Alert.alert("Fecha inválida", "El vencimiento debe tener formato MM/AA.");
      return;
    }

    if (newCard.cvv.length < 3) {
      Alert.alert("CVV inválido", "El CVV debe tener 3 dígitos.");
      return;
    }

    const cardType = getCardType(numberDigits);
    const lastDigits = numberDigits.slice(-4);

    const newCardData: CardItem = {
      id: nextId,
      type: cardType,
      lastDigits,
      expiryDate: newCard.expiry,
      isDefault: cards.length === 0,
    };

    setCards((prev) => [...prev, newCardData]);
    setNewCard(INITIAL_NEW_CARD);
    setShowAddCard(false);

    Alert.alert("Éxito", "Tarjeta agregada correctamente.");
  };

  const handleDelete = (id: number) => {
    const cardToDelete = cards.find((card) => card.id === id);

    if (!cardToDelete) return;

    Alert.alert(
      "Eliminar tarjeta",
      "¿Estás seguro de que deseas eliminar esta tarjeta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const updatedCards = cards.filter((card) => card.id !== id);

            if (
              cardToDelete.isDefault &&
              updatedCards.length > 0 &&
              !updatedCards.some((card) => card.isDefault)
            ) {
              updatedCards[0].isDefault = true;
            }

            setCards([...updatedCards]);
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: number) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }))
    );
  };

  const getCardBadgeStyle = (type: CardItem["type"]) => {
    if (type === "Visa") {
      return styles.visaBadge;
    }
    return styles.mastercardBadge;
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

            <Text style={styles.headerTitle}>Métodos de pago</Text>
            <Text style={styles.headerSubtitle}>Administra tus tarjetas</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.cardsList}>
              {cards.map((card) => (
                <View key={card.id} style={styles.cardBox}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.cardBadge, getCardBadgeStyle(card.type)]}>
                      <Text style={styles.cardBadgeText}>{card.type}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDelete(card.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.8}
                    >
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoBlock}>
                    <Text style={styles.infoLabel}>Número de tarjeta</Text>
                    <Text style={styles.infoValue}>
                      •••• •••• •••• {card.lastDigits}
                    </Text>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.infoLabel}>Vencimiento</Text>
                      <Text style={styles.infoValue}>{card.expiryDate}</Text>
                    </View>

                    <View>
                      {card.isDefault ? (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>
                            Predeterminada
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleSetDefault(card.id)}
                          style={styles.makeDefaultButton}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.makeDefaultButtonText}>
                            Hacer predeterminada
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {!showAddCard && (
              <TouchableOpacity
                onPress={() => setShowAddCard(true)}
                style={styles.addCardButton}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={20} color="#6B7280" />
                <Text style={styles.addCardButtonText}>Agregar nueva tarjeta</Text>
              </TouchableOpacity>
            )}

            {showAddCard && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Nueva tarjeta</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Número de tarjeta</Text>
                  <TextInput
                    value={newCard.number}
                    onChangeText={(text) => handleChangeNewCard("number", text)}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={19}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del titular</Text>
                  <TextInput
                    value={newCard.name}
                    onChangeText={(text) => handleChangeNewCard("name", text)}
                    placeholder="JAIRO RAMIREZ"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.inputLabel}>Vencimiento</Text>
                    <TextInput
                      value={newCard.expiry}
                      onChangeText={(text) => handleChangeNewCard("expiry", text)}
                      placeholder="MM/AA"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={5}
                      style={styles.input}
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      value={newCard.cvv}
                      onChangeText={(text) => handleChangeNewCard("cvv", text)}
                      placeholder="123"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.formButtonsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddCard(false);
                      setNewCard(INITIAL_NEW_CARD);
                    }}
                    style={styles.cancelButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleAddCard}
                    style={styles.addButtonWrapper}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={["#886BC1", "#FF768A"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addButton}
                    >
                      <Text style={styles.addButtonText}>Agregar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="credit-card"
                  size={20}
                  color="#3B82F6"
                  style={styles.infoIcon}
                />
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>Pagos seguros</Text>
                  <Text style={styles.infoDescription}>
                    Tus datos están protegidos con encriptación de extremo a extremo.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
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
  headerSubtitle: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 14,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -16,
  },
  cardsList: {
    marginBottom: 24,
  },
  cardBox: {
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
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  cardBadge: {
    width: 48,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  visaBadge: {
    backgroundColor: "#1A1F71",
  },
  mastercardBadge: {
    backgroundColor: "#EB001B",
  },
  cardBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlock: {
    marginBottom: 18,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: "#2E2E2E",
    fontWeight: "500",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F6D9F1",
    borderRadius: 999,
  },
  defaultBadgeText: {
    color: "#886BC1",
    fontSize: 13,
    fontWeight: "500",
  },
  makeDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
  },
  makeDefaultButtonText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
  },
  addCardButton: {
    width: "100%",
    paddingVertical: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  addCardButtonText: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  formButtonsRow: {
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
  addButtonWrapper: {
    flex: 1,
    marginLeft: 6,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 16,
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
});