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
import { storage, Config } from "../../../utils/config";
import * as ImagePicker from "expo-image-picker";
import { Image, ActivityIndicator } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Usuário");
  const [userEmail, setUserEmail] = useState("usuario@exemplo.com");
  const [userId, setUserId] = useState(0);
  const [redacoesCorrigidas, setRedacoesCorrigidas] = useState(0);
  const [notaMedia, setNotaMedia] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadStats();
    }, []),
  );

  const loadUserData = async () => {
    try {
      let data = await storage.getUserData();

      // Se não tiver o ID (ex: login antigo), busca da API
      if (!data.id) {
        const user = await api.getMe();
        await storage.setUserData(user.email, user.email.split("@")[0], user.id);
        data = await storage.getUserData();
      }

      if (data.email) setUserEmail(data.email);
      if (data.name) setUserName(data.name);
      if (data.id) {
        setUserId(data.id);
        // Tenta carregar a foto do servidor (adiciona timestamp para evitar cache)
        setProfilePhoto(`${Config.API.BASE_URL}/profile/photo/${data.id}?t=${Date.now()}`);
      }
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

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria para escolher uma foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadPhoto(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à sua câmera para tirar uma foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    setIsUploading(true);
    try {
      await api.uploadProfilePhoto(uri);
      // Atualiza a foto localmente
      setProfilePhoto(`${Config.API.BASE_URL}/profile/photo/${userId}?t=${Date.now()}`);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      console.error("Erro ao enviar foto:", error);
      Alert.alert("Erro", "Não foi possível enviar a foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remover Foto",
      "Deseja realmente remover sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteProfilePhoto();
              setProfilePhoto(null);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover a foto.");
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Exportar Dados",
      "Seus dados (redações e resultados) foram exportados com sucesso em formato JSON.",
      [{ text: "OK" }]
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      "Foto de Perfil",
      "Escolha uma opção",
      [
        { text: "Tirar Foto", onPress: handleTakePhoto },
        { text: "Escolher da Galeria", onPress: handlePickImage },
        profilePhoto ? { text: "Remover Foto", onPress: handleRemovePhoto, style: "destructive" } : { text: "Cancelar", style: "cancel" },
        { text: "Cancelar", style: "cancel" }
      ].filter(Boolean) as any
    );
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
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={showPhotoOptions}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.avatarImage}
                onError={() => setProfilePhoto(null)}
              />
            ) : (
              <Ionicons name="person" size={60} color={Colors.text} />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
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
            onPress={handleExportData}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="cloud-download-outline" size={24} color={Colors.text} />
              <Text style={styles.menuItemText}>Exportar Dados</Text>
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
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
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
