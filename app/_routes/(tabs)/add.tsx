import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

type InputType = "texto" | "imagem";

export default function AddScreen() {
  const [titulo, setTitulo] = useState("");
  const [inputType, setInputType] = useState<InputType>("texto");
  const [texto, setTexto] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);

  const handleSelecionarImagem = () => {
    // TODO: Implementar seleção de imagem
    console.log("Selecionar imagem");
  };

  const handleSubmit = () => {
    // TODO: Enviar para o backend
    console.log("Enviando:", { titulo, tipo: inputType, texto, imagens });

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
                    {imagens.length > 0 && (
                      <Text style={styles.imagensCount}>
                        {imagens.length}{" "}
                        {imagens.length === 1 ? "imagem" : "imagens"}{" "}
                        selecionada(s)
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
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
});
