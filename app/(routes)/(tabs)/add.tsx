import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
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

type InputType = "texto" | "imagem";

export default function AddScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [inputType, setInputType] = useState<InputType>("texto");
  const [texto, setTexto] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImageVisible, setFullScreenImageVisible] = useState(false);

  const handleSelecionarImagem = () => {
    setModalVisible(true);
  };

  const requestPermissions = async (needsCamera: boolean = false) => {
    try {
      // Verificar se o ImagePicker está disponível
      if (!ImagePicker || !ImagePicker.requestMediaLibraryPermissionsAsync) {
        Alert.alert(
          "Erro",
          "O módulo de seleção de imagens não está disponível. Por favor, reinicie o aplicativo.",
          [{ text: "OK" }],
        );
        return false;
      }

      if (needsCamera) {
        if (!ImagePicker.requestCameraPermissionsAsync) {
          Alert.alert("Erro", "O módulo de câmera não está disponível.", [
            { text: "OK" },
          ]);
          return false;
        }
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "Precisamos de acesso à câmera para tirar fotos.",
            [{ text: "OK" }],
          );
          return false;
        }
      }

      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à galeria para selecionar imagens.",
          [{ text: "OK" }],
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao solicitar permissões:", error);
      Alert.alert(
        "Erro",
        "Não foi possível solicitar as permissões necessárias.",
        [{ text: "OK" }],
      );
      return false;
    }
  };

  const pickFromGallery = async () => {
    try {
      setModalVisible(false);
      const hasPermission = await requestPermissions(false);
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagem(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert(
        "Erro",
        "Não foi possível selecionar a imagem. Tente novamente.",
        [{ text: "OK" }],
      );
    }
  };

  const takePhoto = async () => {
    try {
      setModalVisible(false);
      const hasPermission = await requestPermissions(true);
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagem(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto. Tente novamente.", [
        { text: "OK" },
      ]);
    }
  };

  const handleSubmit = () => {
    if (inputType === "texto") {
      // Para texto direto, vai direto para resultados
      router.push({
        pathname: "/(routes)/results",
        params: {
          titulo: titulo,
          texto: texto,
          tipo: "texto",
        },
      });
    } else {
      // Para imagens, simular OCR e ir para revisão
      // TODO: Implementar OCR real aqui
      const textoSimulado =
        "Este é um texto simulado extraído via OCR da imagem. Na implementação real, este texto viria do processamento da imagem.";

      router.push({
        pathname: "/(routes)/review",
        params: {
          titulo: titulo,
          texto: textoSimulado,
        },
      });
    }

    // Limpar após envio
    setTitulo("");
    setTexto("");
    setImagem(null);
  };

  const podeEnviar =
    titulo.trim().length > 0 &&
    (inputType === "texto" ? texto.trim().length > 0 : imagem !== null);

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

            {/* Seletor de Tipo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Envio</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    inputType === "texto" && styles.typeButtonActive,
                  ]}
                  onPress={() => setInputType("texto")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="text"
                    size={28}
                    color={
                      inputType === "texto"
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      inputType === "texto" && styles.typeButtonTextActive,
                    ]}
                  >
                    Texto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    inputType === "imagem" && styles.typeButtonActive,
                  ]}
                  onPress={() => setInputType("imagem")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="image"
                    size={28}
                    color={
                      inputType === "imagem"
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      inputType === "imagem" && styles.typeButtonTextActive,
                    ]}
                  >
                    Imagem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Área de Input Condicional */}
            <View style={styles.inputSection}>
              {inputType === "texto" ? (
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
              ) : (
                <View style={styles.imageInputContainer}>
                  <Text style={styles.sectionTitle}>Foto da Redação</Text>

                  {imagem ? (
                    <View style={styles.imagePreviewContainer}>
                      <TouchableOpacity
                        style={styles.imageWrapper}
                        onPress={() => setFullScreenImageVisible(true)}
                        activeOpacity={0.9}
                      >
                        <Image 
                          source={{ uri: imagem }} 
                          style={styles.imagePreview}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <View style={styles.imageActions}>
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={handleSelecionarImagem}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="camera" size={18} color={Colors.primary} />
                          <Text style={styles.changeImageText}>Trocar foto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => setImagem(null)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash" size={18} color="#FF6B6B" />
                          <Text style={styles.removeImageText}>Remover</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadArea}
                      onPress={handleSelecionarImagem}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dashedBorder}>
                        <Ionicons
                          name="image-outline"
                          size={40}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.uploadText}>
                          Toque para adicionar imagem
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
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

      {/* Modal de seleção de imagem */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolher imagem</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickFromGallery}
              activeOpacity={0.7}
            >
              <Ionicons name="images" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Escolher da galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de visualização em tela cheia */}
      <Modal
        visible={fullScreenImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImageVisible(false)}
      >
        <View style={styles.fullScreenModalOverlay}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={() => setFullScreenImageVisible(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={Colors.background} />
          </TouchableOpacity>
          {imagem && (
            <Image
              source={{ uri: imagem }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "15",
  },
  typeButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: Colors.primary,
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
  imageInputContainer: {
    minHeight: 300,
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
  },
  uploadArea: {
    width: "100%",
    height: 300,
  },
  dashedBorder: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.cardBackground + "40",
  },
  uploadText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "80%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  modalOptionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  modalCancel: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  imagePreviewContainer: {
    width: "100%",
    gap: 12,
  },
  imageWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    backgroundColor: Colors.cardBackground,
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    flex: 1,
  },
  changeImageText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  removeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    flex: 1,
  },
  removeImageText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
  },
  fullScreenModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
