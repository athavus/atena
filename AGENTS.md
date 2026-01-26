Este documento fornece informações essenciais sobre a estrutura e arquitetura do projeto Atena para agentes de inteligência artificial que trabalham neste código.

## Visão Geral do Projeto

O **Atena** é uma aplicação mobile de correção inteligente de redações para o ENEM, construída com uma arquitetura de monorepo contendo múltiplos packages:

- **packages/api**: Backend FastAPI com processamento assíncrono via Celery
- **packages/client**: Aplicativo mobile React Native/Expo
- **packages/privacy-terms**: Site estático para termos de privacidade

## Estrutura do Monorepo

```
atena/
├── packages/
│   ├── api/              # Backend FastAPI + Worker Celery
│   ├── client/           # App mobile React Native/Expo
│   └── privacy-terms/    # Site estático Vite/React
└── README.md
```

## Packages Principais

### 1. packages/api
**Tipo**: Backend Python (FastAPI + Celery)  
**Propósito**: API REST para autenticação e processamento de redações  
**Tecnologias**: FastAPI, SQLAlchemy, Celery, PostgreSQL, Redis, Google Gemini API

**Estrutura**:
- `backend/`: Aplicação FastAPI principal
  - `routers/`: Endpoints da API (auth, redacoes)
  - `core/`: Configurações de segurança e banco de dados
- `worker/`: Processamento assíncrono de correções
  - `agents/`: Lógica de correção com IA
  - `banca/`: Regras de negócio e validação
- `shared/`: Código compartilhado (models, schemas, config)

**Ver**: `packages/api/AGENTS.md` para detalhes completos

### 2. packages/client
**Tipo**: Aplicativo Mobile (React Native/Expo)  
**Propósito**: Interface do usuário para submissão e visualização de correções  
**Tecnologias**: React Native, Expo, Expo Router, TypeScript

**Estrutura**:
- `app/`: Rotas e telas (file-based routing)
- `components/`: Componentes React reutilizáveis
- `utils/`: Funções auxiliares e configurações
- `constants/`: Cores, temas e constantes

**Ver**: `packages/client/AGENTS.md` para detalhes completos

### 3. packages/privacy-terms
**Tipo**: Site Estático (Vite + React)  
**Propósito**: Página web para termos de privacidade  
**Tecnologias**: Vite, React, TypeScript

**Ver**: `packages/privacy-terms/AGENTS.md` para detalhes completos

## Fluxo de Dados Principal

```
1. Usuário submete redação (client)
   ↓
2. API recebe e valida (backend)
   ↓
3. Tarefa enfileirada no Celery (worker)
   ↓
4. Worker processa com IA (Google Gemini)
   ↓
5. Resultado salvo no banco (PostgreSQL)
   ↓
6. Client consulta status via polling
```

## Autenticação

O sistema usa **OAuth2 com JWT tokens**:
- Endpoint de registro: `POST /register`
- Endpoint de login: `POST /token`
- Tokens devem ser incluídos no header: `Authorization: Bearer <token>`

## Convenções Importantes

1. **Linguagem**: Código em português (comentários, mensagens, variáveis)
2. **Formatação**: Seguir padrões do projeto (Black para Python, ESLint para TypeScript)
3. **Commits**: Mensagens descritivas em português
4. **Documentação**: Manter este arquivo e os AGENTS.md dos packages atualizados

## Configuração de Ambiente

Cada package possui suas próprias configurações:
- **API**: Variáveis de ambiente em `.env` (ver `packages/api/.env.example` e `SETUP.md`)
- **Client**: Configurações em `packages/client/utils/config.tsx` (URL da API configurável)
- **Privacy Terms**: Build estático, sem configuração especial

## Dependências Entre Packages

- **Client → API**: O client faz requisições HTTP para a API (totalmente integrado)
  - Autenticação JWT
  - Endpoints de redações
  - Polling para status de correções
- **Worker → API**: Worker compartilha models/schemas via `shared/`
- **Privacy Terms**: Independente, apenas referenciado pelo client

## Pontos de Atenção para Agentes

1. **Não modificar** a estrutura de pastas sem entender o impacto
2. **Sempre verificar** dependências entre packages antes de mudanças
3. **Manter consistência** de nomenclatura e padrões
4. **Testar** mudanças em ambos os ambientes (desenvolvimento e produção)
5. **Documentar** mudanças significativas nos AGENTS.md relevantes

## Arquivos de Configuração Importantes

- **`.env.example`**: Modelo de variáveis de ambiente para a API (`packages/api/.env.example`)
- **`SETUP.md`**: Guia completo de configuração do projeto
- **`VPS.md`**: Tutorial de deploy na VPS Hostinger

## Recursos Adicionais

- Documentação da API: `packages/api/README.md` e `packages/api/AGENTS.md`
- Documentação do Client: `packages/client/README.md` e `packages/client/AGENTS.md`
- Documentação Privacy Terms: `packages/privacy-terms/AGENTS.md`
- Setup do projeto: `SETUP.md` (na raiz)
- Deploy em VPS: `VPS.md` (na raiz)

## Contato e Suporte

Para questões sobre o projeto, consulte os arquivos README.md específicos de cada package ou os arquivos AGENTS.md individuais.
