from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List

from shared import models, schemas
from shared.schemas import RedacaoStatusEnum
from backend.core.database import get_db
from backend.routers.auth import get_current_user
from backend.celery_app import celery_app

from worker.agents.themes import gerar_sugestao_tema_async
from worker.agents.ocr import extrair_texto_da_imagem_async

router = APIRouter(
    prefix="/api/v1/redacoes",
    tags=["Redacoes"],
)

@router.post("/extract-text")
async def extrair_texto(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    """
    Recebe uma foto de redação e retorna o texto transcrito via IA.
    """
    try:
        image_content = await file.read()
        texto = await extrair_texto_da_imagem_async(image_content)
        return {"texto": texto}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao processar imagem: {str(e)}"
        )


@router.get("/sugestao-tema")
async def obter_sugestao_tema():
    """
    Gera um tema inédito e textos motivadores via IA.
    """
    try:
        return await gerar_sugestao_tema_async()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar tema: {str(e)}"
        )


@router.post(
    "/",
    response_model=schemas.RedacaoStatus,
    status_code=202,
    summary="Submeter uma redação para correção",
)
def criar_correcao(
    redacao: schemas.RedacaoCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_redacao = models.Redacao(
        tema=redacao.tema, 
        texto_redacao=redacao.texto_redacao, 
        status=RedacaoStatusEnum.PENDENTE,
        user_id=current_user.id
    )
    db.add(db_redacao)
    db.commit()
    db.refresh(db_redacao)

    celery_app.send_task("correct_essay", args=[db_redacao.id])

    return {
        "id": db_redacao.id,
        "status": RedacaoStatusEnum.PENDENTE,
        "message": "Sua redação foi recebida e está na fila para correção.",
    }


@router.get(
    "/",
    response_model=List[schemas.RedacaoResult],
    summary="Listar todas as redações do usuário logado",
)
def listar_minhas_redacoes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Redacao).filter(models.Redacao.user_id == current_user.id).all()


@router.get("/{redacao_id}", response_model=schemas.RedacaoResult)
def read_redacao(
    redacao_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    redacao = (
        db.query(models.Redacao)
        .filter(
            models.Redacao.id == redacao_id, models.Redacao.user_id == current_user.id
        )
        .first()
    )
    if redacao is None:
        raise HTTPException(status_code=404, detail="Redação não encontrada")
    return redacao


@router.delete("/{redacao_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_redacao(
    redacao_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    redacao = (
        db.query(models.Redacao)
        .filter(
            models.Redacao.id == redacao_id, models.Redacao.user_id == current_user.id
        )
        .first()
    )
    if redacao is None:
        raise HTTPException(status_code=404, detail="Redação não encontrada")
    
    db.delete(redacao)
    db.commit()
    return None
