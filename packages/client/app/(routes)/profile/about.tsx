import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Sobre o Atena</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/logo-atena.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Atena</Text>
          <Text style={styles.version}>Versão 0.7.8 (Beta)</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.description}>
            O Atena é seu assistente pessoal de correção de redações. Utilizamos
            inteligência artificial avançada para analisar seus textos e
            fornecer feedbacks detalhados baseados nas competências do ENEM.
          </Text>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL("https://atena-privacy-terms.vercel.app/")}
          >
            <Text style={styles.menuText}>Termos de Uso</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL("https://atena-privacy-terms.vercel.app/")}
          >
            <Text style={styles.menuText}>Política de Privacidade</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2026 Atena AI. Todos os direitos reservados.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    marginTop: 24,
    gap: 32,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  version: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: 40,
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  description: {
    color: Colors.text, // White/Light
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  menu: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  footer: {
    marginTop: "auto",
    marginBottom: 20,
    alignItems: "center",
  },
  copyright: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
