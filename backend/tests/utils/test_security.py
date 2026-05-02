"""
Tests unitarios para app.core.security
"""
import pytest
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta
from jose import jwt
from app.core.security import SECRET_KEY, ALGORITHM


class TestPasswordHashing:
    """Tests para hash y verificación de contraseñas."""
    
    def test_get_password_hash_creates_hash(self):
        """Verifica que get_password_hash crea un hash válido."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")  # bcrypt hash format
    
    def test_verify_password_correct(self):
        """Verifica que verify_password valida correctamente una contraseña correcta."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Verifica que verify_password rechaza una contraseña incorrecta."""
        password = "test_password_123"
        wrong_password = "wrong_password"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_different_passwords_different_hashes(self):
        """Verifica que contraseñas diferentes generan hashes diferentes."""
        password1 = "password1"
        password2 = "password2"
        
        hash1 = get_password_hash(password1)
        hash2 = get_password_hash(password2)
        
        assert hash1 != hash2


class TestJWT:
    """Tests para creación y validación de tokens JWT."""
    
    def test_create_access_token_default_expiry(self):
        """Verifica que create_access_token crea un token con expiración por defecto."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Decodificar y verificar
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload
    
    def test_create_access_token_custom_expiry(self):
        """Verifica que create_access_token acepta un expires_delta personalizado."""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data, expires_delta=expires_delta)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
    
    def test_token_contains_correct_data(self):
        """Verifica que el token contiene los datos correctos."""
        data = {"sub": "user@example.com", "role": "admin"}
        token = create_access_token(data)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "user@example.com"
        assert payload["role"] == "admin"
