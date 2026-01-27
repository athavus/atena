from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, redacoes

app = FastAPI(title="API de Correção de Redação ENEM", version="1.0.0")

# Lista de origens permitidas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # Disable explicit list in favor of regex for dev
    allow_origin_regex=r"http://localhost(:\d+)?",  # Allow localhost with any port
    allow_credentials=True,  # Permite cookies (se você usar)
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

app.include_router(auth.router)
app.include_router(redacoes.router)

@app.get("/", summary="Endpoint raiz da API")
def read_root():
    return {"message": "API de Correção de Redações do ENEM no ar!"}

