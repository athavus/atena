# VPS.md - Guia de Deploy na Hostinger

Este documento fornece um tutorial passo a passo para configurar e executar a API do Atena em uma VPS da Hostinger.

---

## Configuração Inicial da VPS

### 1. Conectar via SSH

```bash
ssh root@seu-ip-vps
# ou
ssh usuario@seu-ip-vps
```

### 2. Atualizar o Sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 3. Criar Usuário Não-Root (Recomendado)

```bash
adduser atena
usermod -aG sudo atena
su - atena
```

---

## Configuração do packages/api/.env


```env
GOOGLE_API_KEY=
PPLX_API_KEY=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=

CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=

SECRET_KEY=
```

# Subir o frontend

``` bash
cd packages/client
npm install
npx expo start --host lan
```

# Subir o backend
``` bash
cd packages/api
docker compose up --build -d
```

**Última atualização:** Janeiro 2025
