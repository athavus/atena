import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { Feedback } from "../../../utils/feedback";

export default function FeedbackScreen() {
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const handleSendFeedback = async () => {
    if (!message.trim()) {
      alert("Por favor, escreva sua mensagem");
      return;
    }

    setIsSending(true);
    await Feedback.sendEmail();
    setIsSending(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Feedback</Text>
          <Text style={styles.subtitle}>
            Ajude-nos a melhorar o Atena! Conte o que achou ou sugira melhorias.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Seu Email (opcional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Sua Mensagem</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escreva aqui sua sugestão, elogio ou crítica..."
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>
            <Text style={styles.charCount}>
              {message.length}/1000 caracteres
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendFeedback}
            disabled={!message.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? "Enviando..." : "Enviar Feedback"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  textAreaContainer: {
    marginBottom: 24,
  },
  textAreaWrapper: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 160,
  },
  textArea: {
    padding: 0,
    paddingTop: 4,
    textAlignVertical: "top",
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
