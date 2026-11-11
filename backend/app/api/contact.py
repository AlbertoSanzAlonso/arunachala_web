from fastapi import APIRouter, BackgroundTasks, HTTPException, status
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


async def _notify_owner_contact(payload: ContactMessage) -> None:
    await email_service.send_owner_notification(
        subject=f"Nuevo mensaje de contacto: {payload.name}",
        kind_label="Mensaje de contacto",
        fields={
            "Nombre": payload.name,
            "Email": payload.email,
            "Teléfono": payload.phone or "—",
            "Mensaje": payload.message.replace("\n", "<br>"),
        },
        reply_to=str(payload.email),
    )


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def send_contact_message(
    payload: ContactMessage,
    background_tasks: BackgroundTasks,
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    background_tasks.add_task(_notify_owner_contact, payload)
    return {"ok": True, "message": "Mensaje enviado correctamente"}
