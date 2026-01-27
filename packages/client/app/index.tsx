import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";
import { storage } from "../utils/config";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await storage.isLoggedIn();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error("Erro ao verificar login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return isLoggedIn ? (
    <Redirect href="/(routes)/(tabs)/home" />
  ) : (
    <Redirect href="/(routes)/login" />
  );
}
