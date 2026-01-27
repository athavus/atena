from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, redacoes
from shared.models import Base, engine
import time

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Correção de Redação ENEM", version="1.0.0")

# Middleware de Log para Debug
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"DEBUG: {request.method} {request.url.path} - Status: {response.status_code} - Duração: {duration:.4f}s")
    return response

# Configuração de CORS Ultra-Permissiva
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(redacoes.router)

@app.get("/", summary="Endpoint raiz da API")
def read_root():
    return {"message": "API de Correção de Redações do ENEM no ar!"}

