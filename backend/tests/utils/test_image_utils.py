"""
Tests unitarios para app.core.image_utils
"""
import pytest
import os
import tempfile
import shutil
from io import BytesIO
from PIL import Image
from fastapi import UploadFile
from app.core.image_utils import save_upload_file, delete_file


class TestImageUtils:
    """Tests para utilidades de manejo de imágenes."""
    
    @pytest.fixture
    def temp_static_dir(self, monkeypatch):
        """Fixture que crea un directorio temporal para static files."""
        temp_dir = tempfile.mkdtemp()
        # Mockear STATIC_DIR en image_utils
        import app.core.image_utils as img_utils
        original_static_dir = img_utils.STATIC_DIR
        img_utils.STATIC_DIR = temp_dir
        
        yield temp_dir
        
        # Restaurar y limpiar
        img_utils.STATIC_DIR = original_static_dir
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @pytest.fixture
    def sample_image(self):
        """Fixture que crea una imagen de prueba en memoria."""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes
    
    def test_save_upload_file_creates_webp(self, temp_static_dir, sample_image):
        """Verifica que save_upload_file guarda la imagen como WebP."""
        upload_file = UploadFile(filename="test.png", file=sample_image)
        
        result_path = save_upload_file(upload_file, subdirectory="uploads")
        
        assert result_path.startswith("/static/uploads/")
        assert result_path.endswith(".webp")
        
        # Verificar que el archivo existe
        relative_path = result_path[len("/static/"):]
        full_path = os.path.join(temp_static_dir, relative_path)
        assert os.path.exists(full_path)
        
        # Verificar que es WebP
        saved_img = Image.open(full_path)
        assert saved_img.format == "WEBP"
    
    def test_save_upload_file_creates_subdirectory(self, temp_static_dir, sample_image):
        """Verifica que save_upload_file crea el subdirectorio si no existe."""
        upload_file = UploadFile(filename="test.png", file=sample_image)
        
        result_path = save_upload_file(upload_file, subdirectory="test_subdir")
        
        subdir_path = os.path.join(temp_static_dir, "test_subdir")
        assert os.path.exists(subdir_path)
        assert os.path.isdir(subdir_path)
    
    def test_delete_file_existing_file(self, temp_static_dir):
        """Verifica que delete_file elimina un archivo existente."""
        # Crear un archivo de prueba
        test_file_path = os.path.join(temp_static_dir, "uploads", "test.webp")
        os.makedirs(os.path.dirname(test_file_path), exist_ok=True)
        with open(test_file_path, "w") as f:
            f.write("test")
        
        file_url = "/static/uploads/test.webp"
        result = delete_file(file_url)
        
        assert result is True
        assert not os.path.exists(test_file_path)
    
    def test_delete_file_nonexistent(self, temp_static_dir):
        """Verifica que delete_file retorna False para archivos inexistentes."""
        file_url = "/static/uploads/nonexistent.webp"
        result = delete_file(file_url)
        
        assert result is False
    
    def test_delete_file_invalid_url(self, temp_static_dir):
        """Verifica que delete_file maneja URLs inválidas."""
        result = delete_file("invalid_url")
        assert result is False
        
        result = delete_file(None)
        assert result is False
