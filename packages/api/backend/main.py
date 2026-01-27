from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, redacoes
from shared.models import Base, engine

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Correção de Redação ENEM", version="1.0.0")

# Lista de origens permitidas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"^https?://.*$",  # Permitir qualquer origem via regex para suportar credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(redacoes.router)

@app.get("/", summary="Endpoint raiz da API")
def read_root():
    return {"message": "API de Correção de Redações do ENEM no ar!"}

