# Client Package

Este documento fornece informações detalhadas sobre o package `client` (aplicativo mobile) do projeto Atena.

## Visão Geral

O package `client` é um aplicativo mobile React Native construído com Expo, que fornece a interface do usuário para:
- Autenticação (login/registro) com integração completa à API
- Submissão de redações para correção
- Visualização de resultados de correções com polling automático
- Histórico de redações corrigidas
- Perfil e configurações do usuário

## Estrutura de Diretórios

```
packages/client/
├── app/                      # Rotas (Expo Router - file-based)
│   ├── _layout.tsx           # Layout raiz
│   ├── index.tsx             # Tela inicial (splash/auth check)
│   └── (routes)/             # Rotas agrupadas
│       ├── login.tsx         # Tela de login (integrada com API)
│       ├── register.tsx      # Tela de registro (integrada com API)
│       ├── results.tsx      # Tela de resultados (com polling)
│       ├── review.tsx        # Tela de revisão
│       ├── (tabs)/          # Navegação por abas
│       │   ├── _layout.tsx  # Layout das abas
│       │   ├── add.tsx       # Adicionar nova redação (integrada)
│       │   ├── history.tsx  # Histórico de redações (integrada)
│       │   └── profile.tsx  # Perfil do usuário
│       └── misc/            # Telas diversas
│           ├── config.tsx   # Configurações
│           └── feedback.tsx # Feedback
├── components/               # Componentes reutilizáveis
│   └── Header.tsx            # Cabeçalho da aplicação
├── constants/                # Constantes
│   ├── Colors.ts             # Paleta de cores
│   └── Fonts.ts              # Configuração de fontes
├── utils/                    # Utilitários
│   ├── api.ts                # Serviço de API (integração completa)
│   ├── config.tsx            # Configurações do app
│   └── feedback.tsx          # Funções de feedback
├── assets/                   # Recursos estáticos
│   └── images/               # Imagens e ícones
└── package.json
```

## Tecnologias Principais

- **React Native**: Framework mobile
- **Expo**: Plataforma e ferramentas (v54.0.20)
- **Expo Router**: Roteamento file-based (v6.0.13)
- **TypeScript**: Tipagem estática
- **AsyncStorage**: Persistência local
- **React 19.1.0**: Versão mais recente

## Rotas e Navegação

### Estrutura de Rotas

```
/ (index.tsx)
  ├── /(routes)/login         # Login com API
  ├── /(routes)/register      # Registro com API
  ├── /(routes)/(tabs)/       # Navegação por abas
  │   ├── add                 # Criar redação (API)
  │   ├── history             # Histórico (API)
  │   └── profile             # Perfil
  ├── /(routes)/results       # Resultados (API + polling)
  ├── /(routes)/review        # Revisão
  └── /(routes)/misc/
      ├── config              # Configurações
      └── feedback            # Feedback
```

### Fluxo de Navegação

1. **Splash/Auth Check** (`index.tsx`): Verifica se usuário está logado
2. **Login/Register**: Autenticação via API com JWT
3. **Tabs**: Navegação principal após login
   - `add`: Criar nova redação (envia para API)
   - `history`: Ver histórico (busca da API)
   - `profile`: Perfil e configurações
4. **Results**: Visualização de resultados com polling automático

## Integração com API

### Status: Totalmente Integrado

O client está **completamente integrado** com a API através do serviço centralizado em `utils/api.ts`.

### Serviço de API (`utils/api.ts`)

**Funcionalidades:**
- Gerenciamento automático de tokens JWT
- Tratamento de erros robusto
- Limpeza automática de token em caso de 401
- Tipagem TypeScript completa

**Métodos disponíveis:**

```typescript
// Autenticação
api.register(userData: UserCreate): Promise<User>
api.login(email: string, password: string): Promise<TokenResponse>
api.logout(): Promise<void>
api.isAuthenticated(): Promise<boolean>

// Redações
api.criarRedacao(redacao: RedacaoCreate): Promise<RedacaoStatusResponse>
api.listarRedacoes(): Promise<RedacaoResult[]>
api.obterRedacao(id: number): Promise<RedacaoResult>
```

### Endpoints Integrados

1. **POST /register**: Criar conta
2. **POST /token**: Login (OAuth2)
3. **POST /api/v1/redacoes/**: Submeter redação
4. **GET /api/v1/redacoes/**: Listar redações
5. **GET /api/v1/redacoes/{id}**: Obter resultado (com polling)

### Autenticação

O sistema usa **Bearer tokens JWT**:
- Token armazenado em AsyncStorage (`@access_token`)
- Incluído automaticamente em todas as requisições autenticadas
- Limpeza automática em caso de erro 401

## Estado e Persistência

### AsyncStorage

Chaves utilizadas:
- `@user_logged`: Boolean (usuário está logado)
- `@user_email`: String (email do usuário)
- `@user_name`: String (nome do usuário)
- `@access_token`: String (token JWT)

### Funções de Storage

Localizadas em `utils/config.tsx`:
- `storage.setUserData()`: Salva dados do usuário
- `storage.clearUserData()`: Remove dados do usuário
- `storage.isLoggedIn()`: Verifica se está logado
- `storage.getUserData()`: Obtém dados do usuário

## Configurações

### Config Object (`utils/config.tsx`)

```typescript
Config = {
  STORAGE: { ... },        // Chaves AsyncStorage
  API: {
    BASE_URL: __DEV__ 
      ? "http://localhost:8000"      // Desenvolvimento
      : "https://api.atena.com.br"    // Produção
  },
  APP: {
    VERSION: "1.0.0",
    NAME: "Atena"
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
}
```

**Nota**: Para Android Emulator, use `http://10.0.2.2:8000` em desenvolvimento.

## Componentes Principais

### Header (`components/Header.tsx`)

Componente de cabeçalho usado em várias telas:
- Exibe logo/título
- Botão de voltar (quando aplicável)
- Navegação entre telas

### Colors (`constants/Colors.ts`)

Paleta de cores do tema dark:
```typescript
{
  background: '#1a1a1a',
  cardBackground: '#2a2a2a',
  primary: '#4a9eff',
  text: '#ffffff',
  textSecondary: '#999999',
  border: '#444444'
}
```

### Fonts (`constants/Fonts.ts`)

Sistema de fontes otimizado:
- Usa fontes do sistema (SF Pro no iOS, Roboto no Android)
- Estilos pré-configurados (display, heading, subheading, body, caption, button)
- Pesos e tamanhos padronizados

## Telas Principais

### Login (`app/(routes)/login.tsx`)

- Integrado com API (`api.login()`)
- Campos: email, senha
- Validação de email
- Tratamento de erros
- Navegação para registro

### Register (`app/(routes)/register.tsx`)

- Integrado com API (`api.register()` + `api.login()`)
- Campos: nome, email, senha, confirmar senha
- Validação de senha (mínimo 8 caracteres)
- Login automático após registro
- Tratamento de erros

### Add (`app/(routes)/(tabs)/add.tsx`)

- Integrado com API (`api.criarRedacao()`)
- Campo de título da redação
- Campo de texto da redação (multiline)
- Contador de caracteres
- Loading state durante envio
- Navegação para results com ID da redação

### History (`app/(routes)/(tabs)/history.tsx`)

- Integrado com API (`api.listarRedacoes()`)
- Lista todas as redações do usuário
- Pull-to-refresh
- Exibe status e nota (quando disponível)
- Navegação para resultados ao tocar
- Loading state e empty state

### Results (`app/(routes)/results.tsx`)

- Integrado com API (`api.obterRedacao()`)
- Polling automático a cada 3 segundos
- Exibe resultados quando status for CONCLUIDO
- Mostra nota geral e por competência
- Animações de entrada
- Loading state durante processamento

### Profile (`app/(routes)/(tabs)/profile.tsx`)

- Exibe informações do usuário
- Opções de configurações
- Logout (usa `api.logout()`)

## Estilização

### StyleSheet

Todas as telas usam `StyleSheet.create()` do React Native:
- Cores importadas de `constants/Colors.ts`
- Fontes importadas de `constants/Fonts.ts`
- Design dark mode consistente
- Bordas arredondadas (borderRadius: 12-16)
- Espaçamento consistente (padding: 16-24)

### Fontes

Sistema de fontes implementado em `constants/Fonts.ts`:
- Usa fontes nativas do sistema
- Estilos pré-configurados para diferentes contextos
- Pesos e tamanhos padronizados
- Letter spacing otimizado

## Validações

### Email
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Validação básica: verifica presença de "@"

### Senha
- Mínimo: 6 caracteres (configurável)
- No registro: mínimo 8 caracteres
- Confirmação: senhas devem coincidir

## Tratamento de Erros

Sistema robusto de tratamento de erros:
- `Alert.alert()` para exibir erros ao usuário
- Mensagens de erro claras e específicas
- Limpeza automática de token em caso de 401
- Tratamento de erros de rede
- Loading states em todas as operações assíncronas

## Dependências Principais

- `expo`: ~54.0.20
- `expo-router`: ~6.0.13
- `react-native`: 0.81.5
- `react`: 19.1.0
- `@react-native-async-storage/async-storage`: 2.2.0
- `@expo/vector-icons`: ^15.0.3
- `react-native-safe-area-context`: ~5.6.0
- `expo-font`: ~14.0.9

## Scripts Disponíveis

```bash
npm start          # Inicia Expo dev server
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa no navegador
npm run lint       # Executa ESLint
```

## Pontos de Atenção

1. **Integração API**: Totalmente implementada
2. **Polling**: Implementado em Results para verificar status
3. **Token Storage**: Token JWT armazenado de forma segura
4. **Error Handling**: Tratamento robusto de erros
5. **Loading States**: Implementados em todas as operações
6. **Offline Support**: Não implementado (futuro)
7. **Refresh Token**: Não implementado (tokens expiram em 30min)

## Próximos Passos Sugeridos

1. Implementar refresh token para sessões longas
2. Adicionar suporte offline com cache
3. Implementar notificações push
4. Adicionar testes unitários
5. Melhorar acessibilidade (ARIA labels)
6. Implementar analytics
