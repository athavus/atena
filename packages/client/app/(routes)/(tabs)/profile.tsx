import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { api, RedacaoStatus } from "../../../utils/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Usuário");
  const [userEmail, setUserEmail] = useState("usuario@exemplo.com");
  const [redacoesCorrigidas, setRedacoesCorrigidas] = useState(0);
  const [notaMedia, setNotaMedia] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadStats();
    }, []),
  );

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("@user_email");
      const name = await AsyncStorage.getItem("@user_name");

      if (email) setUserEmail(email);
      if (name) setUserName(name);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const loadStats = async () => {
    try {
      const redacoes = await api.listarRedacoes();
      const concluidas = redacoes.filter(
        (r) =>
          r.status === RedacaoStatus.CONCLUIDO && r.resultado_json?.nota_final,
      );

      setRedacoesCorrigidas(concluidas.length);

      if (concluidas.length > 0) {
        const totalNota = concluidas.reduce(
          (acc, curr) => acc + (curr.resultado_json?.nota_final || 0),
          0,
        );
        setNotaMedia(totalNota / concluidas.length);
      } else {
        setNotaMedia(0);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      router.replace("/(routes)/login");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar e Info do Usuário */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={60} color={Colors.text} />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/(routes)/(tabs)/history")}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{redacoesCorrigidas}</Text>
            <Text style={styles.statLabel}>Redações Corrigidas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/(routes)/(tabs)/history")}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>
              {notaMedia > 0 ? Math.round(notaMedia) : "-"}
            </Text>
            <Text style={styles.statLabel}>Nota Média</Text>
          </TouchableOpacity>
        </View>

        {/* Opções do Perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(routes)/profile/edit")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={Colors.text} />
              <Text style={styles.menuItemText}>Editar Perfil</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(routes)/profile/help")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={Colors.text}
              />
              <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(routes)/profile/about")}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.text}
              />
              <Text style={styles.menuItemText}>Sobre o Atena</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Botão de Sair */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

        {/* Versão */}
        <Text style={styles.versionText}>Versão 0.6.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#2a2a2a",
  },
  userName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border, // Changed from Red margin to neutral border
  },
  logoutButtonText: {
    color: "#FFFFFF", // Changed from Red to White
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
});
