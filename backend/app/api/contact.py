from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.services.email import email_service

router = APIRouter(prefix="/api/contact", tags=["contact"])


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    message: str = Field(..., min_length=5, max_length=4000)

    @field_validator("name", "message", "phone")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return (v or "").strip()


@router.get("/mail-status")
async def contact_mail_status():
    """Diagnóstico sin secretos: si el backend puede enviar correo."""
    return {
        "smtp_configured": email_service.use_smtp,
        "mail_server_set": bool(email_service.mail_server),
        "mail_username_set": bool(email_service.mail_username),
        "mail_from_set": bool(email_service.mail_from or email_service.mail_username),
        "notify_recipients": email_service.contact_emails,
    }


@router.post("", status_code=status.HTTP_200_OK)
async def send_contact_message(payload: ContactMessage):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    if not email_service.use_smtp:
        raise HTTPException(
            status_code=503,
            detail=(
                "El envío de correo no está configurado en el servidor. "
                "Faltan MAIL_SERVER / MAIL_USERNAME / MAIL_PASSWORD en Coolify."
            ),
        )

    ok = await email_service.send_owner_notification(
        subject=f"Nuevo mensaje de contacto: {payload.name}",
        kind_label="Mensaje de contacto",
        fields={
            "Nombre": payload.name,
            "Email": str(payload.email),
            "Teléfono": payload.phone or "—",
            "Mensaje": payload.message.replace("\n", "<br>"),
        },
        reply_to=str(payload.email),
    )
    if not ok:
        raise HTTPException(
            status_code=502,
            detail="No se pudo enviar el correo. Revisa los logs SMTP del backend.",
        )

    return {"ok": True, "message": "Mensaje enviado correctamente"}
