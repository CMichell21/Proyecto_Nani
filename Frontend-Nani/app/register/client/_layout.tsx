import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Slot } from "expo-router";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function ClientProtectedLayout() {
  const { checkingAuth, isPublicRoute } = useProtectedRoute({
    allowedRoles: ["cliente"],
    publicRoutes: ["/register/client/ClientRegistrationForm"],
  });

  if (!isPublicRoute && checkingAuth) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#886BC1" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
