import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
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
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { Fonts } from "../../../constants/Fonts";
import { api } from "../../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MIN_TITULO_LENGTH = 20;
const MAX_TITULO_LENGTH = 100;
const MIN_TEXTO_LENGTH = 300;
const MAX_TEXTO_LENGTH = 5000;

export default function AddScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [suggestedTheme, setSuggestedTheme] = useState<{
    tema: string;
    textos_motivadores: string[];
  } | null>(null);

  // Auto-save Draft
  useEffect(() => {
    if (titulo || texto) {
      const saveDraft = async () => {
        try {
          await AsyncStorage.setItem(
            "atena_draft",
            JSON.stringify({ titulo, texto }),
          );
        } catch (e) { }
      };
      saveDraft();
    }
  }, [titulo, texto]);

  // Restore Draft on Mount
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem("atena_draft");
        if (draft) {
          const { titulo: dTitulo, texto: dTexto } = JSON.parse(draft);
          // Só oferece se estiver vazio
          if (!titulo && !texto && (dTitulo || dTexto)) {
            Alert.alert(
              "Restaurar Rascunho",
              "Você tem um rascunho salvo. Deseja restaurá-lo?",
              [
                {
                  text: "Descartar",
                  style: "destructive",
                  onPress: () => AsyncStorage.removeItem("atena_draft"),
                },
                {
                  text: "Restaurar",
                  onPress: () => {
                    setTitulo(dTitulo);
                    setTexto(dTexto);
                  },
                },
              ],
            );
          }
        }
      } catch (e) { }
    };
    checkDraft();
  }, []);

  const handleSubmit = async () => {
    // Validação extra por segurança
    if (
      titulo.length < MIN_TITULO_LENGTH ||
      titulo.length > MAX_TITULO_LENGTH
    ) {
      Alert.alert(
        "Erro",
        `O título deve ter entre ${MIN_TITULO_LENGTH} e ${MAX_TITULO_LENGTH} caracteres.`,
      );
      return;
    }

    if (texto.length < MIN_TEXTO_LENGTH || texto.length > MAX_TEXTO_LENGTH) {
      Alert.alert(
        "Erro",
        `A redação deve ter entre ${MIN_TEXTO_LENGTH} e ${MAX_TEXTO_LENGTH} caracteres.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      // Enviar redação para a API
      const response = await api.criarRedacao({
        tema: titulo,
        texto_redacao: texto,
      });

      // Navegar para a tela de resultados com o ID da redação
      router.push({
        pathname: "/(routes)/results",
        params: {
          redacaoId: response.id.toString(),
          titulo: titulo,
        },
      });

      // Limpar após envio e remover rascunho
      setTitulo("");
      setTexto("");
      await AsyncStorage.removeItem("atena_draft");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao enviar redação. Tente novamente.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTheme = async () => {
    setIsGeneratingTheme(true);
    try {
      const suggestion = await api.getThemeSuggestion();
      setSuggestedTheme(suggestion);
      setShowThemeModal(true);
    } catch (error) {
      console.error("Erro ao gerar tema:", error);
      Alert.alert(
        "Erro",
        "Não foi possível gerar um tema. Tente novamente mais tarde.",
      );
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const useSuggestedTheme = () => {
    if (suggestedTheme) {
      setTitulo(suggestedTheme.tema);
      setShowThemeModal(false);
    }
  };

  const podeEnviar =
    titulo.length >= MIN_TITULO_LENGTH &&
    titulo.length <= MAX_TITULO_LENGTH &&
    texto.length >= MIN_TEXTO_LENGTH &&
    texto.length <= MAX_TEXTO_LENGTH;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
              <View style={styles.sectionHeader}>
                <View style={styles.titleWithIcon}>
                  <Text style={styles.sectionTitle}>Título da Redação</Text>
                  <TouchableOpacity
                    onPress={handleGenerateTheme}
                    disabled={isGeneratingTheme}
                    style={styles.suggestionButton}
                  >
                    {isGeneratingTheme ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Ionicons
                        name="sparkles"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    styles.countBadge,
                    titulo.length > 0 &&
                    titulo.length < MIN_TITULO_LENGTH &&
                    styles.countBadgeError,
                  ]}
                >
                  {titulo.length}/{MAX_TITULO_LENGTH}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.titleInput,
                  titulo.length > 0 &&
                  titulo.length < MIN_TITULO_LENGTH &&
                  styles.inputError,
                ]}
                placeholder="Digite o título da sua redação..."
                placeholderTextColor={Colors.textSecondary}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={MAX_TITULO_LENGTH}
              />
              {titulo.length > 0 && titulo.length < MIN_TITULO_LENGTH && (
                <Text style={styles.errorText}>
                  Mínimo de {MIN_TITULO_LENGTH} caracteres
                </Text>
              )}
            </View>

            {/* Área de Input */}
            <View style={styles.inputSection}>
              <View style={styles.textInputContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Texto da Redação</Text>
                  <Text
                    style={[
                      styles.countBadge,
                      texto.length > 0 &&
                      texto.length < MIN_TEXTO_LENGTH &&
                      styles.countBadgeError,
                    ]}
                  >
                    {texto.length}/{MAX_TEXTO_LENGTH}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    texto.length > 0 &&
                    texto.length < MIN_TEXTO_LENGTH &&
                    styles.inputError,
                  ]}
                  placeholder="Digite ou cole o texto da sua redação aqui (mínimo 300 caracteres)..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  value={texto}
                  onChangeText={setTexto}
                  textAlignVertical="top"
                  maxLength={MAX_TEXTO_LENGTH}
                />
                <View style={styles.inputFooter}>
                  {texto.length > 0 && texto.length < MIN_TEXTO_LENGTH ? (
                    <Text style={styles.errorText}>
                      Mínimo de {MIN_TEXTO_LENGTH} caracteres necessários
                    </Text>
                  ) : (
                    <Text style={styles.charCount}>
                      {texto.length} caracteres
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Botão de Enviar */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!podeEnviar || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!podeEnviar || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={Colors.background} />
                  <Text style={styles.submitButtonText}>Enviando...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={20}
                    color={
                      podeEnviar ? Colors.background : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.submitButtonText,
                      !podeEnviar && styles.submitButtonTextDisabled,
                    ]}
                  >
                    Enviar para Correção
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!podeEnviar && !isLoading && (
              <Text style={styles.helperText}>
                {texto.length < MIN_TEXTO_LENGTH
                  ? "Sua redação precisa ter pelo menos 300 caracteres para ser enviada."
                  : titulo.length < MIN_TITULO_LENGTH
                    ? "O título é muito curto."
                    : ""}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Modal de Sugestão de Tema */}
        <Modal
          visible={showThemeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="sparkles" size={24} color={Colors.primary} />
                <Text style={styles.modalTitle}>Sugestão de Tema</Text>
                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.suggestedThemeLabel}>Tema Proposto:</Text>
                <Text style={styles.suggestedThemeText}>
                  {suggestedTheme?.tema}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.suggestedThemeLabel}>
                  Textos Motivadores:
                </Text>
                {suggestedTheme?.textos_motivadores.map((texto, index) => (
                  <View key={index} style={styles.motivatorCard}>
                    <Text style={styles.motivatorText}>{texto}</Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.useThemeButton}
                onPress={useSuggestedTheme}
              >
                <Text style={styles.useThemeButtonText}>Usar este Tema</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    ...Fonts.styles.subheading,
    marginBottom: 0, // Adjusted for row alignment
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  suggestionButton: {
    padding: 4,
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
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  countBadge: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    color: Colors.textSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  countBadgeError: {
    borderColor: "#ff4a4a",
    color: "#ff4a4a",
  },
  inputError: {
    borderColor: "#ff4a4a",
  },
  errorText: {
    color: "#ff4a4a",
    fontSize: 12,
    marginTop: 6,
  },
  inputFooter: {
    marginTop: 12,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
  submitButtonBase: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 12,
  },
  modalScroll: {
    marginBottom: 20,
  },
  suggestedThemeLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  suggestedThemeText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  motivatorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  motivatorText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  useThemeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  useThemeButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
