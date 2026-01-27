import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

export default function HelpScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    Linking.openURL("mailto:suporte@atena.com.br");
  };

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
        <Text style={styles.title}>Ajuda e Suporte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>

          <View style={styles.faqItem}>
            <Text style={styles.question}>Como funcionam as correções?</Text>
            <Text style={styles.answer}>
              Nossa IA analisa sua redação com base nas competências oficiais do
              ENEM, fornecendo uma nota detalhada e sugestões de melhoria.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>Quantas redações posso enviar?</Text>
            <Text style={styles.answer}>
              No momento, o envio é ilimitado para todos os usuários
              cadastrados.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>A nota é oficial?</Text>
            <Text style={styles.answer}>
              Não. A nota é uma estimativa baseada nos critérios do ENEM, mas
              serve apenas para treino e não substitui a correção oficial.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fale Conosco</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL("mailto:laplin.ifpb@gmail.com")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="mail-outline"
                size={24}
                color={Colors.text}
                style={styles.icon}
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>laplin.ifpb@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL("tel:+5583988864397")}
              activeOpacity={0.3}
            >
              <Ionicons
                name="call-outline"
                size={24}
                color={Colors.text}
                style={styles.icon}
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Telefone</Text>
                <Text style={styles.contactValue}>+55 (83) 98886-4397</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  faqItem: {
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  question: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  answer: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  contactContainer: {
    gap: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  contactValue: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "400",
  },
});
