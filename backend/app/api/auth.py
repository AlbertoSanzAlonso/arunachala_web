from fastapi import APIRouter, Depends, HTTPException, status, Body, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import jwt, JWTError
from app.core.database import get_db
from app.models.models import User, UserRole
from app.core.security import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from app.services.email import email_service
from pydantic import BaseModel, EmailStr
import os
import shutil
import uuid

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == username).first()
    if user is None:
        raise credentials_exception
    return user

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str | None = None
    last_name: str | None = None
    role: str
    profile_picture: str | None = None
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=UserRole.USER, # Default to user
        # is_active removed from model since it's not in DB yet or defaults to True? 
        # Wait, the SQL I ran in Step 184 DID NOT include is_active!
        # "CREATE TABLE IF NOT EXISTS users ( ... role VARCHAR(50) DEFAULT 'user', created_at ... );"
        # I should probably remove is_active assignment here or add it to the DB schema if needed. 
        # For now, let's stick to what's in the DB. The model update in Step 220 removed is_active.
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.email.split('@')[0], 
            "role": user.role
        }
    }

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.email.split('@')[0], 
            "role": user.role
        }
    }

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: Forgot password called for {request.email}", flush=True)
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        print(f"DEBUG: User {request.email} NOT FOUND in DB", flush=True)
        # Don't reveal if user exists
        return {"message": "Si el email existe, se enviará un enlace."}

    print(f"DEBUG: User found via API endpoint.", flush=True)

    # Generate a password reset token (valid for 15 mins)
    reset_token_expires = timedelta(minutes=15)
    reset_token = create_access_token(
        data={"sub": user.email, "type": "reset"}, 
        expires_delta=reset_token_expires
    )

    await email_service.send_reset_password_email(user.email, reset_token)
    return {"message": "Email enviado"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Token inválido")
            
    except JWTError:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    new_password: str | None = None

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user profile fields
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    
    # Update password if provided
    if profile_data.new_password is not None and profile_data.new_password.strip():
        # Validate password length
        if len(profile_data.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="La contraseña debe tener al menos 6 caracteres"
            )
        
        # Check if new password is same as current password
        if verify_password(profile_data.new_password, current_user.password_hash):
            raise HTTPException(
                status_code=400,
                detail="La nueva contraseña no puede ser igual a la contraseña actual"
            )
        
        # Update password
        current_user.password_hash = get_password_hash(profile_data.new_password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/me/upload-picture")
async def upload_profile_picture(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from PIL import Image
    import io
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido. Solo se aceptan imágenes JPEG, PNG o WebP"
        )
    
    # Define upload directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_dir = os.path.join(base_dir, "static", "profiles")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Delete old profile picture if exists
    if current_user.profile_picture:
        old_file_path = os.path.join(base_dir, "static", current_user.profile_picture.lstrip('/static/'))
        if os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
            except Exception as e:
                print(f"Error deleting old profile picture: {e}")
    
    # Read and optimize image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Convert to RGB if necessary (for PNG with transparency)
    if image.mode in ('RGBA', 'LA', 'P'):
        # Create white background
        background = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
        image = background
    elif image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to max 500x500 while maintaining aspect ratio
    max_size = (500, 500)
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Generate unique filename with .webp extension
    filename = f"{current_user.id}_{uuid.uuid4()}.webp"
    file_path = os.path.join(upload_dir, filename)
    
    # Save as WebP with optimization
    image.save(file_path, "WEBP", quality=85, method=6)
    
    # Update user profile picture URL in database
    picture_url = f"/static/profiles/{filename}"
    current_user.profile_picture = picture_url
    db.commit()
    db.refresh(current_user)
    
    return {"url": picture_url}

class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str | None = None
    last_name: str | None = None
    role: str = "USER"  # USER or ADMIN

@router.post("/admin/create-user", response_model=UserResponse)
def admin_create_user(
    user_in: AdminUserCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if current user is admin
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para crear usuarios"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Validate role
    try:
        user_role = UserRole[user_in.role.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail="Rol inválido. Usa USER o ADMIN")
    
    # Create new user
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role=user_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
