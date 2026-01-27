import asyncio
import json
import logging
from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

from .core import get_llm_client
from google.api_core.exceptions import ResourceExhausted

logger = logging.getLogger(__name__)

class SugestaoTema(BaseModel):
    tema: str = Field(description="Um tema inédito no formato ENEM (problema social brasileiro).")
    textos_motivadores: List[str] = Field(description="Uma lista de 3 a 4 parágrafos curtos com fatos, dados ou reflexões sobre o tema.")

PROMPT_SUGESTAO_TEMA = ChatPromptTemplate.from_template("""
Você é um especialista em criação de propostas de redação no estilo ENEM.
Sua tarefa é gerar um tema inédito e relevante focado em desafios da sociedade brasileira contemporânea.

=== REQUISITOS DO TEMA ===
1. Deve seguir o padrão "A democratização de...", "O desafio de...", "Caminhos para combater...", etc.
2. Deve ser um problema social, político, cultural ou ambiental do Brasil.
3. Deve ser inédito e não repetitivo (evite temas batidos como 'Lixo Eletrônico' ou 'Doação de Órgãos').

=== REQUISITOS DOS TEXTOS MOTIVADORES ===
1. Forneça de 3 a 4 parágrafos curtos.
2. Inclua pelo menos um dado estatístico (pode ser verossímil/realista mas não precisa ser real, apenas coerente com o problema).
3. Inclua uma reflexão social ou referência a um conceito sociológico.

=== SAÍDA ===
Retorne estritamente um JSON com:
- "tema": string.
- "textos_motivadores": lista de strings.

{format_instructions}
""")

async def gerar_sugestao_tema_async() -> Dict[str, Any]:
    """
    Gera um tema e textos motivadores usando o LLM configurado.
    """
    # Usamos uma temperatura um pouco mais alta (0.7) para criatividade no tema
    llm = get_llm_client(temperature=0.8, json_mode=True)
    parser = JsonOutputParser(pydantic_object=SugestaoTema)
    
    chain = PROMPT_SUGESTAO_TEMA | llm | parser

    while True:
        try:
            resultado = await chain.ainvoke({
                "format_instructions": parser.get_format_instructions(),
            })
            return resultado

        except ResourceExhausted:
            logger.warning("Rate limit ao sugerir tema. Aguardando...")
            await asyncio.sleep(10)
            continue
        except Exception as e:
            logger.error(f"Erro ao gerar sugestão de tema: {e}")
            raise e
