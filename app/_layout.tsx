import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor("#1a1a1a");
      RNStatusBar.setBarStyle("light-content");
    }
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#1a1a1a" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarAnimation: "slide",
          statusBarTranslucent: true,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(routes)/login/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(routes)/register/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(routes)/misc/config"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(routes)/misc/feedback"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(routes)/(tabs)"
          options={{ headerShown: false, presentation: "modal" }}
        />
      </Stack>
    </>
  );
}
