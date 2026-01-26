# VPS.md - Guia de Deploy na Hostinger

Este documento fornece um tutorial passo a passo para configurar e executar a API do Atena em uma VPS da Hostinger.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial da VPS](#configuração-inicial-da-vps)
3. [Instalação de Dependências](#instalação-de-dependências)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Configuração da API](#configuração-da-api)
6. [Configuração do Nginx (Proxy Reverso)](#configuração-do-nginx-proxy-reverso)
7. [Configuração do SSL (HTTPS)](#configuração-do-ssl-https)
8. [Gerenciamento com Systemd](#gerenciamento-com-systemd)
9. [Monitoramento e Logs](#monitoramento-e-logs)
10. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

- VPS da Hostinger com acesso SSH
- Domínio apontado para o IP da VPS (opcional, mas recomendado)
- Conhecimento básico de Linux e linha de comando

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

## Instalação de Dependências

### 1. Instalar Python 3.11+

```bash
# Ubuntu/Debian
sudo apt install -y python3.11 python3.11-venv python3-pip

# Verificar versão
python3.11 --version
```

### 2. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# Iniciar e habilitar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### 3. Instalar Redis

```bash
# Ubuntu/Debian
sudo apt install -y redis-server

# Iniciar e habilitar serviço
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar status
sudo systemctl status redis-server
```

### 4. Instalar Nginx

```bash
sudo apt install -y nginx

# Iniciar e habilitar serviço
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Instalar Certbot (para SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Configuração do Banco de Dados

### 1. Criar Banco de Dados e Usuário

```bash
# Acessar PostgreSQL como superusuário
sudo -u postgres psql

# No prompt do PostgreSQL:
CREATE DATABASE enem_correcoes_db;
CREATE USER atena_user WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';
ALTER ROLE atena_user SET client_encoding TO 'utf8';
ALTER ROLE atena_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE atena_user SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE enem_correcoes_db TO atena_user;
\q
```

### 2. Testar Conexão

```bash
psql -U atena_user -d enem_correcoes_db -h localhost
# Digite a senha quando solicitado
```

---

## Configuração da API

### 1. Clonar o Repositório

```bash
cd /home/atena
git clone https://github.com/seu-usuario/atena.git
cd atena/packages/api
```

### 2. Criar Ambiente Virtual

```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

**Configurações importantes no `.env`:**

```env
# Database (use o usuário e senha criados acima)
DATABASE_URL=postgresql://atena_user:SUA_SENHA@localhost:5432/enem_correcoes_db

# Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# JWT (gere uma chave forte)
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Google API Key
GOOGLE_API_KEY=sua_chave_aqui
```

### 5. Executar Migrações

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Executar migrações
alembic upgrade head
```

### 6. Testar a API Localmente

```bash
# Executar API
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Em outro terminal, testar:
curl http://localhost:8000/
```

---

## Configuração do Nginx (Proxy Reverso)

### 1. Criar Configuração do Nginx

```bash
sudo nano /etc/nginx/sites-available/atena-api
```

**Conteúdo do arquivo:**

```nginx
server {
    listen 80;
    server_name api.seudominio.com.br;  # Substitua pelo seu domínio

    # Logs
    access_log /var/log/nginx/atena-api-access.log;
    error_log /var/log/nginx/atena-api-error.log;

    # Tamanho máximo de upload (para redações grandes)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para processamento assíncrono
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. Habilitar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/atena-api /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## Configuração do SSL (HTTPS)

### 1. Obter Certificado SSL

```bash
# Com domínio configurado
sudo certbot --nginx -d api.seudominio.com.br

# Seguir as instruções do Certbot
# O certificado será renovado automaticamente
```

### 2. Verificar Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run
```

---

## Gerenciamento com Systemd

### 1. Criar Serviço para a API

```bash
sudo nano /etc/systemd/system/atena-api.service
```

**Conteúdo:**

```ini
[Unit]
Description=Atena API - Correção de Redações ENEM
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=atena
WorkingDirectory=/home/atena/atena/packages/api
Environment="PATH=/home/atena/atena/packages/api/venv/bin"
ExecStart=/home/atena/atena/packages/api/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Criar Serviço para o Worker Celery

```bash
sudo nano /etc/systemd/system/atena-worker.service
```

**Conteúdo:**

```ini
[Unit]
Description=Atena Celery Worker
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=atena
WorkingDirectory=/home/atena/atena/packages/api
Environment="PATH=/home/atena/atena/packages/api/venv/bin"
ExecStart=/home/atena/atena/packages/api/venv/bin/celery -A worker.celery_app.celery_app worker --loglevel=info
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. Habilitar e Iniciar Serviços

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar serviços
sudo systemctl enable atena-api
sudo systemctl enable atena-worker

# Iniciar serviços
sudo systemctl start atena-api
sudo systemctl start atena-worker

# Verificar status
sudo systemctl status atena-api
sudo systemctl status atena-worker
```

### 4. Comandos Úteis

```bash
# Ver logs
sudo journalctl -u atena-api -f
sudo journalctl -u atena-worker -f

# Reiniciar serviços
sudo systemctl restart atena-api
sudo systemctl restart atena-worker

# Parar serviços
sudo systemctl stop atena-api
sudo systemctl stop atena-worker
```

---

## Monitoramento e Logs

### 1. Verificar Logs da API

```bash
# Logs do systemd
sudo journalctl -u atena-api -n 100

# Logs do Nginx
sudo tail -f /var/log/nginx/atena-api-access.log
sudo tail -f /var/log/nginx/atena-api-error.log
```

### 2. Monitorar Recursos

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Processos Python
ps aux | grep python
```

### 3. Verificar Status dos Serviços

```bash
# Status geral
sudo systemctl status atena-api
sudo systemctl status atena-worker
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
```

---

## Troubleshooting

### Problema: API não inicia

**Soluções:**
1. Verificar logs: `sudo journalctl -u atena-api -n 50`
2. Verificar se o ambiente virtual está ativo
3. Verificar se as variáveis de ambiente estão corretas
4. Verificar se a porta 8000 está livre: `sudo netstat -tulpn | grep 8000`

### Problema: Erro de conexão com banco

**Soluções:**
1. Verificar se PostgreSQL está rodando: `sudo systemctl status postgresql`
2. Verificar credenciais no `.env`
3. Testar conexão: `psql -U atena_user -d enem_correcoes_db -h localhost`

### Problema: Worker não processa tarefas

**Soluções:**
1. Verificar se Redis está rodando: `sudo systemctl status redis-server`
2. Verificar logs do worker: `sudo journalctl -u atena-worker -f`
3. Verificar conexão Redis: `redis-cli ping`

### Problema: Nginx retorna 502 Bad Gateway

**Soluções:**
1. Verificar se a API está rodando: `sudo systemctl status atena-api`
2. Verificar se a API responde: `curl http://127.0.0.1:8000/`
3. Verificar logs do Nginx: `sudo tail -f /var/log/nginx/atena-api-error.log`

### Problema: Certificado SSL não renova

**Soluções:**
1. Verificar se o domínio está apontando para o IP correto
2. Testar renovação manual: `sudo certbot renew --dry-run`
3. Verificar firewall (porta 80 e 443 devem estar abertas)

---

## Checklist de Deploy

- [ ] VPS configurada e atualizada
- [ ] Python 3.11+ instalado
- [ ] PostgreSQL instalado e configurado
- [ ] Redis instalado e rodando
- [ ] Nginx instalado e configurado
- [ ] Repositório clonado
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Arquivo `.env` configurado
- [ ] Migrações executadas
- [ ] Serviços systemd criados e habilitados
- [ ] API respondendo em `http://api.seudominio.com.br`
- [ ] SSL configurado (HTTPS)
- [ ] Worker processando tarefas
- [ ] Logs sendo monitorados

---

## Próximos Passos

1. **Configurar Backup Automático:**
   - Backup do banco de dados PostgreSQL
   - Backup dos arquivos de configuração

2. **Monitoramento:**
   - Configurar alertas (ex: UptimeRobot)
   - Monitorar uso de recursos

3. **Segurança:**
   - Configurar firewall (UFW)
   - Desabilitar login root via SSH
   - Configurar fail2ban

4. **Performance:**
   - Otimizar configurações do PostgreSQL
   - Configurar cache Redis
   - Considerar múltiplos workers Celery

---

**Última atualização:** Janeiro 2025

