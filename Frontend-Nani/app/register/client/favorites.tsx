import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

type FavoriteBabysitter = {
  id: number;
  name: string;
  photo: string;
  rating: number;
  hourlyRate: number;
  experience: string;
  location: string;
  availability: "Disponible" | "Ocupada";
};

const STORAGE_KEY = "client_favorites";

const DEFAULT_DATA: FavoriteBabysitter[] = [
  {
    id: 1,
    name: "María González",
    photo:
      "https://images.unsplash.com/photo-1584446456661-1039ed1a39d7?w=200&h=200&fit=crop",
    rating: 4.9,
    hourlyRate: 15,
    experience: "5 años",
    location: "Centro",
    availability: "Disponible",
  },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteBabysitter[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Cargar favoritas
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEY);

      if (data) {
        setFavorites(JSON.parse(data));
      } else {
        setFavorites(DEFAULT_DATA);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // 💾 Guardar favoritas
  const saveFavorites = async (list: FavoriteBabysitter[]) => {
    setFavorites(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  // ❌ Eliminar favorita
  const handleRemove = (id: number) => {
    Alert.alert("Eliminar", "¿Quitar de favoritas?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        onPress: async () => {
          const updated = favorites.filter((item) => item.id !== id);
          await saveFavorites(updated);
        },
      },
    ]);
  };

  // 🔥 NAVEGACIÓN CORRECTA (como tu Home)
  const handleViewProfile = (id: number) => {
    const nani = favorites.find((b) => b.id === id);

    if (nani) {
      router.push({
        pathname: "/register/client/BabysitterProfile",
        params: {
          babysitterId: nani.id,
          name: nani.name,
          photo: nani.photo,
          hourlyRate: nani.hourlyRate,
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#886BC1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <ScrollView>
          {/* HEADER */}
          <LinearGradient
            colors={["#886BC1", "#FF768A"]}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>Favoritas ({favorites.length})</Text>
          </LinearGradient>

          {/* LISTA */}
          <View style={styles.content}>
            {favorites.length === 0 ? (
              <Text>No tienes favoritas</Text>
            ) : (
              favorites.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.row}>
                    <Image
                      source={{ uri: item.photo }}
                      style={styles.image}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.sub}>
                        ⭐ {item.rating} • {item.experience}
                      </Text>
                      <Text style={styles.sub}>{item.location}</Text>
                      <Text style={styles.price}>
                        L {item.hourlyRate}/hora
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => handleRemove(item.id)}>
                      <Feather name="trash-2" size={18} color="red" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => handleViewProfile(item.id)}
                  >
                    <Text style={styles.btnText}>Ver perfil</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* NAV */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.push("/register/client/home")}>
            <Text>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/register/client/bookings")}
          >
            <Text>Reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/register/client/chat")}
          >
            <Text>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/register/client/UserProfile")}
          >
            <Text>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { color: "#fff", fontSize: 20, marginTop: 10 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 10 },
  image: { width: 70, height: 70, borderRadius: 35 },
  name: { fontWeight: "bold", fontSize: 16 },
  sub: { color: "#666", fontSize: 12 },
  price: { color: "#886BC1", fontWeight: "bold" },
  btn: {
    backgroundColor: "#FF768A",
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#fff",
  },
});