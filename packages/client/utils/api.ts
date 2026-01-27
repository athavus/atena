import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Platform } from "react-native";
import { Config } from "./config";

// Tipos para as respostas da API
export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  name?: string;
}

export interface RedacaoCreate {
  tema: string;
  texto_redacao: string;
}

export enum RedacaoStatus {
  PENDENTE = "PENDENTE",
  PROCESSANDO = "PROCESSANDO",
  CONCLUIDO = "CONCLUIDO",
  ERRO = "ERRO",
}

export interface RedacaoStatusResponse {
  id: number;
  status: RedacaoStatus;
  message: string;
}

export interface RedacaoResult {
  id: number;
  status: RedacaoStatus;
  tema: string;
  criado_em: string;
  resultado_json?: {
    nota_final?: number;
    competencias?: Array<{
      competencia: number;
      nota: number;
      justificativa: string;
      analise_critica?: string;
    }>;
  };
}

// Chave para armazenar o token
const TOKEN_KEY = "@access_token";

// Função auxiliar para obter o token
async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return null;
  }
}

// Função auxiliar para salvar o token
async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    throw error;
  }
}

// Função auxiliar para remover o token
async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Erro ao remover token:", error);
  }
}

/**
 * Função auxiliar para fazer requisições HTTP
 * Gerencia automaticamente autenticação e tratamento de erros
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const url = `${Config.API.BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Adiciona token de autenticação se disponível
  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Tratamento de erros HTTP
    if (!response.ok) {
      // Tenta extrair mensagem de erro da API
      const errorData = await response.json().catch(() => ({
        detail: response.statusText || "Erro desconhecido",
      }));

      // Se for erro de autenticação, limpa o token
      if (response.status === 401) {
        await removeToken();
        router.replace("/(routes)/login");
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      throw new Error(errorData.detail || `Erro ${response.status}`);
    }

    // Se a resposta for vazia (204 No Content), retorna null
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    // Re-lança erros conhecidos
    if (error instanceof Error) {
      throw error;
    }
    // Erro de rede ou desconhecido
    throw new Error("Erro de rede. Verifique sua conexão e tente novamente.");
  }
}

/**
 * Função auxiliar para preparar arquivos para o FormData
 * No Web, precisa ser um Blob real. No Mobile, o objeto com URI.
 */
async function createFormDataFile(uri: string, name: string, type: string) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], name, { type });
  }
  return {
    uri,
    name,
    type,
  } as any;
}

// API Service
export const api = {
  // Autenticação
  async register(userData: UserCreate): Promise<User> {
    return request<User>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async getMe(): Promise<User> {
    return request<User>("/me");
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    // OAuth2 password flow usa form data
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const url = `${Config.API.BASE_URL}/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || `Erro ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    await saveToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    await removeToken();
    await AsyncStorage.multiRemove([
      Config.STORAGE.USER_LOGGED,
      Config.STORAGE.USER_EMAIL,
      Config.STORAGE.USER_NAME,
      Config.STORAGE.USER_ID,
    ]);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return token !== null;
  },

  // Redações
  async criarRedacao(
    redacao: RedacaoCreate
  ): Promise<RedacaoStatusResponse> {
    return request<RedacaoStatusResponse>("/api/v1/redacoes/", {
      method: "POST",
      body: JSON.stringify(redacao),
    });
  },

  async listarRedacoes(): Promise<RedacaoResult[]> {
    return request<RedacaoResult[]>("/api/v1/redacoes/");
  },

  async obterRedacao(id: number): Promise<RedacaoResult> {
    return request<RedacaoResult>(`/api/v1/redacoes/${id}`);
  },

  async deletarRedacao(id: number): Promise<void> {
    await request<void>(`/api/v1/redacoes/${id}`, {
      method: "DELETE",
    });
  },

  // Perfil / Fotos
  async uploadProfilePhoto(uri: string): Promise<any> {
    const token = await getToken();
    const url = `${Config.API.BASE_URL}/profile/photo`;

    const formData = new FormData();
    // Prepara o arquivo de forma compatível (Web/Mobile)
    const file = await createFormDataFile(uri, "profile.jpg", "image/jpeg");
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: NÃO defina Content-Type manualmente aqui, o fetch fará isso para multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || `Erro ${response.status}`);
    }

    return await response.json();
  },

  async deleteProfilePhoto(): Promise<any> {
    return request<any>("/profile/photo", {
      method: "DELETE",
    });
  },

  async updateProfile(data: { name: string }): Promise<User> {
    return request<User>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getThemeSuggestion(): Promise<{ tema: string; textos_motivadores: string[] }> {
    return request<{ tema: string; textos_motivadores: string[] }>("/api/v1/redacoes/sugestao-tema");
  },

  async extractTextFromImage(uri: string): Promise<{ texto: string }> {
    const token = await getToken();
    const url = `${Config.API.BASE_URL}/api/v1/redacoes/extract-text`;

    const formData = new FormData();
    const file = await createFormDataFile(uri, "handwriting.jpg", "image/jpeg");
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao transcrever imagem.");
    }

    return response.json();
  },
};
