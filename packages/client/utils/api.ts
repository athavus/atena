import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "./config";

// Tipos para as respostas da API
export interface User {
  id: number;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
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
    headers["Authorization"] = `Bearer ${token}`;
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

// API Service
export const api = {
  // Autenticação
  async register(userData: UserCreate): Promise<User> {
    return request<User>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    // OAuth2 password flow usa form data
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const token = await getToken();
    const url = `${Config.API.BASE_URL}/token`;

    const headers: HeadersInit = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
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
};

