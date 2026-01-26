# API Package

Este documento fornece informações detalhadas sobre o package `api` do projeto Atena para agentes de IA.

## Visão Geral

O package `api` contém o backend completo do sistema de correção de redações, incluindo:
- API REST FastAPI para autenticação e gerenciamento de redações
- Worker Celery para processamento assíncrono de correções
- Integração com Google Gemini para análise de textos
- Sistema de banco de dados PostgreSQL
- Sistema de filas Redis

## Estrutura de Diretórios

```
packages/api/
├── backend/              # Aplicação FastAPI principal
│   ├── routers/          # Endpoints da API
│   │   ├── auth.py       # Autenticação (register, login)
│   │   └── redacoes.py   # Gerenciamento de redações
│   ├── core/             # Configurações centrais
│   │   ├── database.py   # Configuração SQLAlchemy
│   │   └── security.py   # JWT e hash de senhas
│   ├── main.py           # Ponto de entrada FastAPI
│   └── celery_app.py     # Configuração Celery (backend)
├── worker/               # Processamento assíncrono
│   ├── agents/           # Lógica de correção com IA
│   │   ├── core.py       # Execução de correções
│   │   └── prompts.py    # Prompts para o LLM
│   ├── banca/            # Regras de negócio
│   │   └── rules.py      # Validação e cálculo de notas
│   └── tasks.py          # Tarefas Celery
├── shared/               # Código compartilhado
│   ├── models.py         # Modelos SQLAlchemy
│   ├── schemas.py        # Schemas Pydantic
│   └── config.py         # Configurações (Settings)
├── alembic/              # Migrações de banco de dados
├── tests/                # Testes automatizados
├── docker-compose.yml     # Orquestração de containers
└── requirements.txt      # Dependências Python
```

## Endpoints da API

### Autenticação (`/register`, `/token`)

**POST /register**
- Cria novo usuário
- Payload: `{ "email": string, "password": string }`
- Retorna: `User` (id, email)

**POST /token**
- OAuth2 password flow
- Form data: `username` (email), `password`
- Retorna: `{ "access_token": string, "token_type": "bearer" }`

### Redações (`/api/v1/redacoes`)

**POST /api/v1/redacoes/**
- Submete redação para correção
- Requer autenticação (Bearer token)
- Payload: `{ "tema": string, "texto_redacao": string }`
- Retorna: `{ "id": int, "status": "PENDENTE", "message": string }`
- Status: `202 Accepted`

**GET /api/v1/redacoes/**
- Lista todas as redações do usuário logado
- Requer autenticação
- Retorna: `List[RedacaoResult]`

**GET /api/v1/redacoes/{redacao_id}**
- Obtém status e resultado de uma redação específica
- Requer autenticação
- Retorna: `RedacaoResult` com `resultado_json` quando `status == "CONCLUIDO"`

## Modelos de Dados

### User (SQLAlchemy)
- `id`: Integer (PK)
- `email`: String (unique, indexed)
- `hashed_password`: String
- `redacoes`: Relationship → Redacao[]

### Redacao (SQLAlchemy)
- `id`: Integer (PK)
- `tema`: String
- `texto_redacao`: Text
- `status`: String (PENDENTE, PROCESSANDO, CONCLUIDO, ERRO)
- `resultado_json`: JSON (nullable)
- `user_id`: Integer (FK → User.id)

### Schemas Pydantic

**RedacaoCreate**: `{ tema: str, texto_redacao: str }`  
**RedacaoResult**: `{ id: int, status: RedacaoStatusEnum, tema: str, resultado_json: Optional[Dict] }`  
**RedacaoStatus**: `{ id: int, status: RedacaoStatusEnum, message: str }`

## Fluxo de Processamento

1. **Submissão**: Client → POST /api/v1/redacoes/
2. **Enfileiramento**: API cria registro com status `PENDENTE` e envia tarefa Celery
3. **Processamento**: Worker executa `correct_essay` task
   - Atualiza status para `PROCESSANDO`
   - Executa dois corretores em paralelo
   - Verifica discrepâncias
   - Se houver discrepância, executa supervisor
   - Calcula nota consolidada
4. **Finalização**: Status atualizado para `CONCLUIDO` com `resultado_json`
5. **Consulta**: Client faz polling em GET /api/v1/redacoes/{id}

## Configuração de Ambiente

Variáveis necessárias no `.env`. **Use o arquivo `.env.example` como modelo:**

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

**Variáveis principais:**
- `DATABASE_URL`: URL de conexão PostgreSQL
- `SECRET_KEY`: Chave secreta para JWT (gere uma forte)
- `GOOGLE_API_KEY`: Chave da API do Google Gemini
- `CELERY_BROKER_URL`: URL do Redis para filas
- Ver `packages/api/.env.example` para lista completa com explicações

## Segurança

- **JWT Tokens**: Tokens expiram em 30 minutos (configurável)
- **Password Hashing**: Usa bcrypt via `get_password_hash()`
- **OAuth2**: Implementação padrão FastAPI OAuth2PasswordBearer
- **Validação**: Todos os inputs validados com Pydantic V2

## Processamento Assíncrono

### Tarefa Celery: `correct_essay`

**Parâmetros**:
- `redacao_id`: ID da redação no banco
- `correcao_1_json`: (opcional) JSON da primeira correção (para retry)
- `correcao_2_json`: (opcional) JSON da segunda correção (para retry)
- `correcao_supervisor_json`: (opcional) JSON do supervisor (para retry)

**Fluxo Interno**:
1. Carrega redação do banco
2. Executa dois corretores em paralelo (async)
3. Verifica discrepância entre correções
4. Se discrepante, executa supervisor
5. Calcula nota final usando regras de negócio
6. Salva resultado no banco

**Status Possíveis**:
- `PENDENTE`: Aguardando processamento
- `PROCESSANDO`: Em execução
- `CONCLUIDO`: Finalizado com sucesso
- `ERRO`: Falha no processamento

## Regras de Negócio

Localizadas em `worker/banca/rules.py`:

- `verificar_discrepancia()`: Verifica se há diferença significativa entre corretores
- `calcular_nota_consolidada()`: Calcula média quando não há discrepância
- `resolver_discrepancia_com_supervisor()`: Usa supervisor para decidir em caso de discrepância

## Testes

### Testes Unitários

Testes localizados em `backend/tests/`:
- `test_auth.py`: Testes de autenticação
- `test_redacoes.py`: Testes de endpoints de redações
- `conftest.py`: Fixtures compartilhadas

Executar testes unitários:
```bash
docker compose run --rm api pytest
```

### Testes de Precisão

Scripts de teste de precisão na raiz do package:
- `test_precision_complete.py`: Teste completo com 6 redações de diferentes faixas de nota
- `test_precision_8_essays.py`: Teste com 8 redações
- `test_low_scores.py`: Teste focado em redações com notas baixas

**Como executar testes de precisão:**
1. Certifique-se de que a API está rodando
2. Obtenha um token JWT fazendo login
3. Edite o script e atualize a variável `TOKEN` com seu token
4. Execute: `python test_precision_complete.py`

Os testes enviam redações reais e comparam os resultados da IA com as notas oficiais, calculando desvios e estatísticas de precisão.

## Migrações de Banco

Usa Alembic para migrações:
```bash
docker compose run --rm api alembic upgrade head
```

## Docker Compose

Serviços definidos:
- `api`: FastAPI backend (porta 8000)
- `worker`: Celery worker
- `db`: PostgreSQL
- `redis`: Redis (broker e cache)

## Pontos de Atenção

1. **Async/Await**: Worker usa `asyncio.run()` para executar código assíncrono dentro de tasks Celery
2. **Sessões de Banco**: Cada task cria sua própria sessão e fecha no `finally`
3. **Retry Logic**: Tasks podem receber JSONs parciais para retry após falhas
4. **CORS**: Configurado para permitir todas as origens (desenvolvimento)
5. **Error Handling**: Erros são capturados e status atualizado para `ERRO`

## Dependências Principais

- `fastapi`: Framework web
- `sqlalchemy`: ORM
- `pydantic`: Validação de dados
- `celery`: Processamento assíncrono
- `jose`: JWT tokens
- `passlib`: Hash de senhas
- `httpx`: Cliente HTTP assíncrono (para Gemini API)
- `alembic`: Migrações de banco

## Próximos Passos Sugeridos

1. Implementar WebSockets para notificações em tempo real
2. Adicionar rate limiting
3. Implementar cache Redis para consultas frequentes
4. Adicionar logging estruturado
5. Implementar métricas e monitoramento
