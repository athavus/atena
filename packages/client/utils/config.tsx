import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const Config = {
  // AsyncStorage keys
  STORAGE: {
    USER_LOGGED: "@user_logged",
    USER_EMAIL: "@user_email",
    USER_NAME: "@user_name",
    USER_ID: "@user_id",
  },

  // API
  API: {
    // Para desenvolvimento local, use: "http://192.168.15.2:8000"
    // Para produção, use: "https://api.atena.com.br"
    BASE_URL: __DEV__
      ? "http://192.168.15.2:8000" // IP fixo para garantir que mobile e web se falem
      : "https://api.atena.com.br", // Produção
  },

  // App
  APP: {
    VERSION: "1.0.0",
    NAME: "Atena",
  },

  // Validações
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Funções utilitárias
export const storage = {
  setUserData: async (email: string, name: string, id: number) => {
    try {
      await AsyncStorage.setItem(Config.STORAGE.USER_LOGGED, "true");
      await AsyncStorage.setItem(Config.STORAGE.USER_EMAIL, email);
      await AsyncStorage.setItem(Config.STORAGE.USER_NAME, name);
      await AsyncStorage.setItem(Config.STORAGE.USER_ID, id.toString());
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error);
      throw error;
    }
  },

  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove([
        Config.STORAGE.USER_LOGGED,
        Config.STORAGE.USER_EMAIL,
        Config.STORAGE.USER_NAME,
        Config.STORAGE.USER_ID,
      ]);
    } catch (error) {
      console.error("Erro ao limpar dados do usuário:", error);
      throw error;
    }
  },

  isLoggedIn: async (): Promise<boolean> => {
    try {
      const userLogged = await AsyncStorage.getItem(Config.STORAGE.USER_LOGGED);
      return userLogged === "true";
    } catch (error) {
      console.error("Erro ao verificar login:", error);
      return false;
    }
  },

  getUserData: async () => {
    try {
      const [email, name, id] = await AsyncStorage.multiGet([
        Config.STORAGE.USER_EMAIL,
        Config.STORAGE.USER_NAME,
        Config.STORAGE.USER_ID,
      ]);
      return {
        email: email[1] || "",
        name: name[1] || "",
        id: id[1] ? parseInt(id[1]) : 0,
      };
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      return { email: "", name: "", id: 0 };
    }
  },
};
