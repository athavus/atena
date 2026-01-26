import { Platform } from "react-native";

/**
 * Configuração de fontes do aplicativo
 * Usa fontes do sistema com estilos personalizados para uma aparência mais chamativa
 */
export const Fonts = {
  // Fonte principal - usa fontes do sistema com configurações otimizadas
  regular: Platform.select({
    ios: "System", // SF Pro no iOS
    android: "Roboto", // Roboto no Android
    default: "System",
  }),

  // Fonte para títulos e textos destacados
  bold: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),

  // Pesos de fonte personalizados
  weights: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
    black: "900" as const,
  },

  // Tamanhos de fonte com escala responsiva
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 36,
    "6xl": 48,
  },

  // Estilos pré-configurados para uso comum
  styles: {
    // Títulos grandes e chamativos
    display: {
      fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        default: "System",
      }),
      fontWeight: Platform.select({
        ios: "800",
        android: "700",
        default: "800",
      }) as "800" | "700",
      fontSize: 36,
      letterSpacing: -0.5,
    },

    // Títulos de seção
    heading: {
      fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        default: "System",
      }),
      fontWeight: Platform.select({
        ios: "700",
        android: "700",
        default: "700",
      }) as "700",
      fontSize: 24,
      letterSpacing: -0.3,
    },

    // Subtítulos
    subheading: {
      fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        default: "System",
      }),
      fontWeight: Platform.select({
        ios: "600",
        android: "600",
        default: "600",
      }) as "600",
      fontSize: 18,
      letterSpacing: -0.2,
    },

    // Texto de corpo
    body: {
      fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        default: "System",
      }),
      fontWeight: Platform.select({
        ios: "400",
        android: "400",
        default: "400",
      }) as "400",
      fontSize: 16,
      letterSpacing: 0,
    },

    // Texto pequeno
    caption: {
      fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        default: "System",
      }),
      fontWeight: Platform.select({
        ios: "400",
        android: "400",
        default: "400",
      }) as "400",
      fontSize: 14,
      letterSpacing: 0.1,
    },

    // Botões e ações
    button: {
      fontFamily: Platform.select({
        ios: "System",
        android: "Roboto",
        default: "System",
      }),
      fontWeight: Platform.select({
        ios: "600",
        android: "600",
        default: "600",
      }) as "600",
      fontSize: 16,
      letterSpacing: 0.3,
    },
  },
};

