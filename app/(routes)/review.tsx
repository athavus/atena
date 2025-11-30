import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Colors } from "../../constants/Colors";

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [textoExtraido, setTextoExtraido] = useState(
    (params.texto as string) || "",
  );
  const [titulo, setTitulo] = useState((params.titulo as string) || "");

  const handleConfirmar = () => {
    if (textoExtraido.trim().length === 0) {
      Alert.alert("Erro", "Por favor, revise o texto antes de confirmar.");
      return;
    }

    // Navegar para tela de resultados com os dados
    router.push({
      pathname: "/(routes)/results",
      params: {
        titulo: titulo,
        texto: textoExtraido,
        tipo: "ocr",
      },
    });
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleVoltar}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Revisar Texto</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Revise o texto extraído da imagem. Você pode editar qualquer parte
              que não esteja correta.
            </Text>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.sectionTitle}>Título da Redação</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Digite o título da redação..."
              placeholderTextColor={Colors.textSecondary}
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>Texto Extraído</Text>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.textInput}
                placeholder="Texto extraído aparecerá aqui..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                value={textoExtraido}
                onChangeText={setTextoExtraido}
                textAlignVertical="top"
              />
            </ScrollView>
            <Text style={styles.charCount}>
              {textoExtraido.length} caracteres
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleVoltar}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
              <Text style={styles.cancelButtonText}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                textoExtraido.trim().length === 0 &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmar}
              disabled={textoExtraido.trim().length === 0}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={
                  textoExtraido.trim().length > 0
                    ? Colors.background
                    : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.confirmButtonText,
                  textoExtraido.trim().length === 0 &&
                    styles.confirmButtonTextDisabled,
                ]}
              >
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: Colors.primary + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  infoText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  titleInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textSection: {
    flex: 1,
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    padding: 16,
    color: Colors.text,
    fontSize: 15,
    minHeight: 300,
    textAlignVertical: "top",
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.cardBackground,
  },
  confirmButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});
