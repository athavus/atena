import { Ionicons } from "@expo/vector-icons";
import { ImagePicker } from "expo-image-picker";
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
  const [imagens, setImagens] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelecionarImagem = () => {
    setModalVisible(true);
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de acesso à câmera e galeria para esta funcionalidade.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImagens(prev => [...prev, ...newImages]);
    }
    setModalVisible(false);
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImagens(prev => [...prev, result.assets[0].uri]);
    }
    setModalVisible(false);
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
      const textoSimulado = "Este é um texto simulado extraído via OCR da imagem. Na implementação real, este texto viria do processamento da imagem.";

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
    setImagens([]);
  };

  const podeEnviar =
    titulo.trim().length > 0 &&
    (inputType === "texto" ? texto.trim().length > 0 : imagens.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Texto da Redação</Text>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Digite ou cole o texto da sua redação aqui..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  value={texto}
                  onChangeText={setTexto}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{texto.length} caracteres</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Foto da Redação</Text>

                {imagens.length > 0 ? (
                  <View style={styles.imagesPreview}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {imagens.map((uri, index) => (
                        <View key={index} style={styles.imageContainer}>
                          <Image source={{ uri }} style={styles.imagePreview} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => {
                              const newImages = imagens.filter((_, i) => i !== index);
                              setImagens(newImages);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.addMoreButton}
                      onPress={handleSelecionarImagem}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle" size={20} color={Colors.primary} />
                      <Text style={styles.addMoreText}>Adicionar mais imagens</Text>
                    </TouchableOpacity>
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
    flex: 1,
    minHeight: 0,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    color: Colors.text,
    fontSize: 15,
    minHeight: 0,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
  },
  uploadArea: {
    width: "100%",
    minHeight: 0,
    height: "80%",
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
  imagensCount: {
    color: Colors.primary,
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '80%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
  },
  modalCancel: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  imagesPreview: {
    flex: 1,
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 2,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  addMoreText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
