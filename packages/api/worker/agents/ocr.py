import logging
import base64
from typing import Dict, Any
from google.generativeai import GenerativeModel
import google.generativeai as genai
from shared.config import settings

logger = logging.getLogger(__name__)

# Configura o SDK do Google para Vision (mais direto que Langchain para arquivos brutos)
genai.configure(api_key=settings.GOOGLE_API_KEY)

async def extrair_texto_da_imagem_async(image_bytes: bytes) -> str:
    """
    Usa o modelo multimodal do Gemini para transcrever uma imagem de redação.
    """
    try:
        # Usamos o modelo Flash para velocidade e visão
        model = genai.GenerativeModel(model_name="gemini-2.0-flash")
        
        prompt = (
            "Você é um especialista em transcrição de manuscritos. "
            "Sua tarefa é transcrever fielmente esta redação para texto digital. "
            "REGRAS:\n"
            "1. Mantenha os parágrafos originais.\n"
            "2. Preserve a pontuação e ortografia exata (mesmo se houver erros).\n"
            "3. NÃO adicione nenhum comentário seu, apenas o texto da redação.\n"
            "4. Se houver partes ilegíveis, tente inferir pelo contexto ou use [ilegível].\n"
            "5. Se a imagem não for uma redação ou estiver em branco, retorne apenas: [ERRO: IMAGEM INVÁLIDA]"
        )

        # Prepara o conteúdo da imagem
        contents = [
            prompt,
            {
                "mime_type": "image/jpeg",
                "data": image_bytes
            }
        ]

        logger.info("Enviando imagem para transcrição via Gemini Vision...")
        response = model.generate_content(contents)
        
        texto_extraido = response.text.strip()
        
        if "[ERRO: IMAGEM INVÁLIDA]" in texto_extraido:
            raise ValueError("A imagem enviada não parece ser uma redação válida.")
            
        return texto_extraido

    except Exception as e:
        logger.error(f"Erro na extração OCR: {e}")
        raise e
