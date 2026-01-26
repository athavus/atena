import AsyncStorage from "@react-native-async-storage/async-storage";

export const Config = {
  // AsyncStorage keys
  STORAGE: {
    USER_LOGGED: "@user_logged",
    USER_EMAIL: "@user_email",
    USER_NAME: "@user_name",
  },

  // API
  API: {
    // Para desenvolvimento local, use: "http://localhost:8000"
    // Para produção, use: "https://api.atena.com.br"
    BASE_URL: __DEV__ 
      ? "http://localhost:8000"  // Desenvolvimento local
      : "https://api.atena.com.br",  // Produção
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
  setUserData: async (email: string, name: string) => {
    try {
      await AsyncStorage.setItem(Config.STORAGE.USER_LOGGED, "true");
      await AsyncStorage.setItem(Config.STORAGE.USER_EMAIL, email);
      await AsyncStorage.setItem(Config.STORAGE.USER_NAME, name);
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
      const [email, name] = await AsyncStorage.multiGet([
        Config.STORAGE.USER_EMAIL,
        Config.STORAGE.USER_NAME,
      ]);
      return {
        email: email[1] || "",
        name: name[1] || "",
      };
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      return { email: "", name: "" };
    }
  },
};
