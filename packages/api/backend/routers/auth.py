from fastapi import APIRouter, Depends, HTTPException, status, Response, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional

from shared import models, schemas
from backend.core.database import get_db
from backend.core.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from shared.config import settings

router = APIRouter(tags=["Auth"])

# --- DEPENDENCIES ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# --- ENDPOINTS ---

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        name=user.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=schemas.User)
def update_profile(
    profile_data: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/profile/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Lê o conteúdo do arquivo
    content = await file.read()
    
    # Atualiza o usuário
    current_user.profile_pic = content
    db.commit()
    
    return {"message": "Foto de perfil atualizada com sucesso"}


@router.delete("/profile/photo")
async def delete_profile_photo(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_user.profile_pic = None
    db.commit()
    return {"message": "Foto de perfil removida com sucesso"}


@router.get("/profile/photo/{user_id}")
async def get_profile_photo(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.profile_pic:
        # Se não houver foto, podemos retornar um 404 ou um placeholder
        # Aqui, vamos lançar 404 para o app tratar
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    
    return Response(content=user.profile_pic, media_type="image/jpeg")
