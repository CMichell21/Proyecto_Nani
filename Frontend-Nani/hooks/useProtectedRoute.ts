import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { ENDPOINTS } from "@/constants/apiConfig";

type AllowedRole = "cliente" | "ninera";

type UseProtectedRouteOptions = {
  allowedRoles: AllowedRole[];
  publicRoutes?: string[];
};

export function useProtectedRoute({
  allowedRoles,
  publicRoutes = [],
}: UseProtectedRouteOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  const validateSession = useCallback(async () => {
    if (isPublicRoute) {
      setCheckingAuth(false);
      return;
    }

    try {
      setCheckingAuth(true);

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
        router.replace("/login");
        return;
      }

      const response = await fetch(ENDPOINTS.me, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.rol || !allowedRoles.includes(data.rol)) {
        await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
        router.replace("/login");
        return;
      }

      if (data?.id) {
        await AsyncStorage.setItem("userId", String(data.id));
      }

      await AsyncStorage.setItem("userRole", data.rol);
      setCheckingAuth(false);
    } catch (error) {
      console.log("Error validando sesion:", error);
      await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
      router.replace("/");
    }
  }, [allowedRoles, isPublicRoute, router]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  useFocusEffect(
    useCallback(() => {
      validateSession();
    }, [validateSession]),
  );

  return {
    checkingAuth,
    isPublicRoute,
  };
}
