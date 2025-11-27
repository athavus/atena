import { Alert, Linking, Platform } from "react-native";
import { Config } from "./config";

export const Feedback = {
  // Enviar feedback por email
  sendEmail: async () => {
    const subject = `Feedback - Atena v${Config.APP.VERSION}`;
    const body = `Olá! Gostaria de enviar um feedback sobre o Atena:\n\n`;

    const mailtoUrl = `mailto:feedback@atena.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const supported = await Linking.canOpenURL(mailtoUrl);
    if (supported) {
      await Linking.openURL(mailtoUrl);
    } else {
      Alert.alert(
        "Feedback",
        "Não foi possível abrir o app de email. Copie a mensagem abaixo:",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Copiar",
            onPress: () => {
              // Implementar clipboard depois se quiser
              Alert.alert(
                "Mensagem copiada!",
                "Envie para feedback@atena.com.br",
              );
            },
          },
        ],
      );
    }
  },

  // Abrir configurações do app
  openAppSettings: async () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  },

  // Verificar atualizações (futuro)
  checkForUpdates: async () => {
    Alert.alert(
      "Atualizações",
      `Atena v${Config.APP.VERSION} está atualizado!`,
      [{ text: "OK" }],
    );
  },
};
