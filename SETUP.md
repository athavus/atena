# SETUP.md - Guia de Configuração do Projeto Atena

Este documento explica todas as configurações necessárias para executar o projeto Atena em desenvolvimento e produção.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Backend (API)](#configuração-do-backend-api)
3. [Configuração do Client (Mobile)](#configuração-do-client-mobile)
4. [Configuração do Privacy Terms](#configuração-do-privacy-terms)
5. [Executando o Projeto](#executando-o-projeto)
6. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Para o Backend
- **Docker** (v20.10+) e **Docker Compose** (v2.0+)
- **Google API Key** para acesso ao Gemini (ou outra chave LLM)
- **Python 3.11+** (opcional, se executar sem Docker)

### Para o Client
- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- Dispositivo móvel com **Expo Go** ou emulador Android/iOS

### Para Privacy Terms
- **Node.js** (v18 ou superior)
- **npm** ou **pnpm**

---

## Configuração do Backend (API)

### 1. Gerar SECRET_KEY

Para gerar uma chave secreta segura, você pode usar:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Obter Google API Key

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Cole no arquivo `.env`

---

## Configuração do Client (Mobile)

### 1. Configurar URL da API

Edite o arquivo `packages/client/utils/config.tsx`:

```typescript
API: {
  // Para desenvolvimento local (Android Emulator)
  BASE_URL: __DEV__ 
    ? "http://10.0.2.2:8000"  // Android Emulator
    // Para desenvolvimento local (iOS Simulator / Dispositivo físico)
    // BASE_URL: __DEV__ ? "http://localhost:8000"  // iOS / Dispositivo
    : "https://api.atena.com.br",  // Produção
}
```

**Nota importante sobre URLs:**
- **Android Emulator**: Use `http://10.0.2.2:8000` (IP especial do emulador)
- **iOS Simulator**: Use `http://localhost:8000`
- **Dispositivo físico**: Use o IP da sua máquina na rede local (ex: `http://192.168.1.100:8000`)

### 2. Verificar Configuração de CORS

Certifique-se de que o backend está configurado para aceitar requisições do client. No arquivo `packages/api/backend/main.py`, a configuração CORS deve permitir a origem do client:

```python
origins = [
    "http://localhost:8081",  # Expo dev server
    "exp://192.168.1.100:8081",  # Expo em dispositivo físico
    # Adicione outras origens conforme necessário
]
```

---

## Configuração do Privacy Terms

### 1. Instalar Dependências

```bash
cd packages/privacy-terms
npm install
# ou
pnpm install
```

### 2. Build (Opcional)

Para gerar o build de produção:

```bash
npm run build
```

Os arquivos serão gerados em `packages/privacy-terms/dist/`.

---

## Executando o Projeto

### Backend (API)

1. **Iniciar containers Docker:**

```bash
cd packages/api
docker compose up --build -d
```

2. **Verificar se está rodando:**

- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

3. **Ver logs:**

```bash
docker compose logs -f api
docker compose logs -f worker
```

4. **Parar containers:**

```bash
docker compose down
```

### Client (Mobile)

1. **Iniciar servidor de desenvolvimento:**

```bash
cd packages/client
npm start
```

2. **Escanear QR Code:**

- Abra o app **Expo Go** no seu dispositivo
- Escaneie o QR code exibido no terminal
- Ou pressione `a` para Android, `i` para iOS

3. **Executar em emulador:**

```bash
npm run android  # Android
npm run ios       # iOS
```

### Privacy Terms

```bash
cd packages/privacy-terms
npm run dev
```

Acesse: http://localhost:5173

---

## Configurações Adicionais

### Variáveis de Ambiente do Client

Se necessário, você pode criar um arquivo `.env` no `packages/client/` e usar uma biblioteca como `react-native-dotenv` para carregar variáveis. Por enquanto, a configuração está hardcoded em `utils/config.tsx`.

### Configuração de Produção

#### Backend

1. **Altere o SECRET_KEY** para uma chave forte e única
2. **Configure CORS** para permitir apenas o domínio de produção
3. **Use variáveis de ambiente** do servidor/hosting
4. **Configure SSL/HTTPS**
5. **Configure backup do banco de dados**

#### Client

1. **Altere BASE_URL** para a URL de produção da API
2. **Configure code signing** para builds de produção
3. **Configure push notifications** (se necessário)
4. **Teste em dispositivos reais** antes de publicar

---

## Troubleshooting

### Problema: Client não consegue conectar à API

**Soluções:**
1. Verifique se a API está rodando (`docker compose ps`)
2. Verifique a URL configurada no client
3. Para Android Emulator, use `10.0.2.2` em vez de `localhost`
4. Para dispositivo físico, use o IP da sua máquina na rede
5. Verifique o firewall e permissões de rede

### Problema: Erro de CORS

**Sintoma:** Erro no console do navegador sobre CORS

**Solução:** Adicione a origem do client na lista de `origins` em `packages/api/backend/main.py`

### Problema: Migrações não executam

**Solução:**
```bash
cd packages/api
docker compose run --rm api alembic upgrade head
```

### Problema: Worker não processa tarefas

**Soluções:**
1. Verifique se o Redis está rodando: `docker compose ps redis`
2. Verifique os logs do worker: `docker compose logs worker`
3. Verifique se a GOOGLE_API_KEY está configurada corretamente

### Problema: Token expira muito rápido

**Solução:** Aumente `ACCESS_TOKEN_EXPIRE_MINUTES` no `.env` do backend

### Problema: Erro ao fazer login/registro

**Soluções:**
1. Verifique se o banco de dados está rodando
2. Verifique se as migrações foram executadas
3. Verifique os logs da API: `docker compose logs api`
4. Verifique se a URL da API está correta no client

---

## Checklist de Setup Completo

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env` criado em `packages/api/` com todas as variáveis
- [ ] Google API Key configurada
- [ ] SECRET_KEY gerada e configurada
- [ ] Containers Docker rodando (`docker compose ps`)
- [ ] Migrações executadas (`alembic upgrade head`)
- [ ] API acessível em http://localhost:8000
- [ ] Node.js instalado (v18+)
- [ ] Dependências do client instaladas (`npm install`)
- [ ] URL da API configurada no client
- [ ] Expo Go instalado no dispositivo ou emulador configurado
- [ ] Client consegue fazer requisições para a API

---

## Próximos Passos

Após completar o setup:

1. **Teste o fluxo completo:**
   - Criar conta
   - Fazer login
   - Enviar uma redação
   - Verificar resultado

2. **Leia a documentação:**
   - `AGENTS.md` (raiz) - Visão geral
   - `packages/api/AGENTS.md` - Detalhes da API
   - `packages/client/AGENTS.md` - Detalhes do client

3. **Explore a API:**
   - Acesse http://localhost:8000/docs
   - Teste os endpoints manualmente

---

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker compose logs`
2. Consulte os arquivos `AGENTS.md` de cada package
3. Verifique a documentação da API em `/docs`

---

**Última atualização:** Janeiro 2025
