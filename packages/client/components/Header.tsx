import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { storage, Config } from "../utils/config";

export default function Header() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadUserPhoto();
    }, [])
  );

  const loadUserPhoto = async () => {
    const data = await storage.getUserData();
    if (data.id) {
      // Usamos timestamp para evitar cache de imagem antiga
      setProfilePhoto(`${Config.API.BASE_URL}/profile/photo/${data.id}?t=${Date.now()}`);
    } else {
      setProfilePhoto(null);
    }
  };

  const handleProfilePress = () => {
    router.push("/(routes)/(tabs)/profile");
  };

  const handleLogoPress = () => {
    router.push("/(routes)/(tabs)/home");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
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
          {profilePhoto ? (
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profilePhoto}
                onError={() => setProfilePhoto(null)}
              />
            </View>
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={Colors.text}
            />
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: "center", // Center content
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    position: "relative", // For absolute positioning of children
  },
  iconButton: {
    padding: 4,
    position: "absolute",
    right: 16, // Adjusted slightly
  },
  photoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
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
