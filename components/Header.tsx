import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/Colors";

export default function Header() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleProfilePress = () => {
    router.push("/_routes/(tabs)/profile");
  };

  const handleMenuPress = () => {
    setMenuVisible((prev) => !prev);
  };

  const handleLogoPress = () => {
    router.push("/_routes/(tabs)/add");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@user_logged");
      await AsyncStorage.removeItem("@user_email");
      await AsyncStorage.removeItem("@user_name");
      setMenuVisible(false);
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleFeedback = () => {
    setMenuVisible(false);
    router.push("/_routes/misc/feedback");
  };

  const handleSettings = () => {
    setMenuVisible(false);
    router.push("/_routes/misc/config"); // ou outra rota de configurações
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoContainer}
          onPress={handleLogoPress}
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/images/logo-atena.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>ATENA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleSettings}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={22} color={Colors.text} />
              <Text style={styles.menuItemText}>Configurações</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleFeedback}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color={Colors.text}
              />
              <Text style={styles.menuItemText}>Feedback</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                Sair da Conta
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    zIndex: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
  },
  iconButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  menu: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItemText: {
    color: Colors.text,
    fontSize: 16,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },
  logoutText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
});
