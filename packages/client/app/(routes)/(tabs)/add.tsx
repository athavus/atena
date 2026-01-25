import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

export default function AddScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");




  const handleSubmit = () => {
    router.push({
      pathname: "/(routes)/results",
      params: {
        titulo: titulo,
        texto: texto,
        tipo: "texto",
      },
    });

    // Limpar após envio
    setTitulo("");
    setTexto("");
  };

  const podeEnviar =
    titulo.trim().length > 0 && texto.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Campo de Título */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Título da Redação</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Digite o título da sua redação..."
                placeholderTextColor={Colors.textSecondary}
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>

            {/* Área de Input */}
            <View style={styles.inputSection}>
              <View style={styles.textInputContainer}>
                <Text style={styles.sectionTitle}>Texto da Redação</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Digite ou cole o texto da sua redação aqui..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  value={texto}
                  onChangeText={setTexto}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>
                  {texto.length} caracteres
                </Text>
              </View>
            </View>

            {/* Botão de Enviar */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !podeEnviar && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!podeEnviar}
              activeOpacity={0.8}
            >
              <Ionicons
                name="send"
                size={20}
                color={podeEnviar ? Colors.background : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.submitButtonText,
                  !podeEnviar && styles.submitButtonTextDisabled,
                ]}
              >
                Enviar para Correção
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
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
  inputSection: {
    minHeight: 300,
    marginBottom: 20,
  },
  textInputContainer: {
    minHeight: 300,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    color: Colors.text,
    fontSize: 15,
    height: 300,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.cardBackground,
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  submitButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});
