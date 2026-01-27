from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routers import auth, redacoes
from shared.models import Base, engine
import time
import traceback

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Correção de Redação ENEM", version="1.0.0")

# Middleware de Log e Proteção
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        print(f"DEBUG: {request.method} {request.url.path} - Status: {response.status_code} - Duração: {duration:.4f}s")
        return response
    except Exception as e:
        print(f"FATAL ERROR: {request.method} {request.url.path}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": f"Erro interno no servidor: {str(e)}"}
        )

# Configuração de CORS Ultra-Permissiva
# Colocamos o middleware de CORS ANTES dos routers para garantir os headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router)
app.include_router(redacoes.router)

@app.get("/", summary="Endpoint raiz da API")
def read_root():
    return {"message": "API de Correção de Redações do ENEM no ar!"}
