import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { Feedback } from "../../../utils/feedback";
import { storage } from "../../../utils/config";

export default function ConfigScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await storage.clearUserData();
            router.replace("/(routes)/login");
          } catch (error) {
            Alert.alert("Erro", "Erro ao fazer logout");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Personalize sua experiência</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors.text}
              />
              <Text style={styles.menuItemText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon-outline" size={24} color={Colors.text} />
              <Text style={styles.menuItemText}>Modo Escuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Feedback.checkForUpdates()}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="download-outline" size={24} color={Colors.text} />
              <Text style={styles.menuItemText}>Verificar Atualizações</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.menuItem, styles.feedbackButton]}
          onPress={() => Feedback.sendEmail()}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={[styles.menuItemText, styles.feedbackText]}>
              Enviar Feedback
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// styles iguais ao anterior...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    color: Colors.text,
    fontSize: 16,
  },
  feedbackButton: {
    backgroundColor: Colors.cardBackground + "CC",
    borderColor: Colors.primary,
  },
  feedbackText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    marginTop: 8,
  },
  logoutText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
});
