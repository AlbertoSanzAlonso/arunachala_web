import os
import aiosmtplib
from email.message import EmailMessage
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

class EmailService:
    def __init__(self):
        self.mail_server = os.getenv("MAIL_SERVER")
        self.mail_port = int(os.getenv("MAIL_PORT", 587))
        self.mail_username = os.getenv("MAIL_USERNAME")
        self.mail_password = os.getenv("MAIL_PASSWORD")
        self.mail_from = os.getenv("MAIL_FROM")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Check if we have enough info for SMTP
        self.use_smtp = all([self.mail_server, self.mail_username, self.mail_password])

    async def send_reset_password_email(self, email: str, token: str):
        """
        Sends a reset password email using SMTP.
        Falls back to console login if SMTP is not configured.
        """
        print(f"DEBUG: use_smtp={self.use_smtp}, server={self.mail_server}, user={self.mail_username}", flush=True)
        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        
        if not self.use_smtp:
            print("=================================================================", flush=True)
            print(f"📧 [DEV MODE] SMTP NOT CONFIGURED. EMAIL TO: {email}", flush=True)
            print(f"🔗 RESET LINK: {reset_link}", flush=True)
            print("=================================================================", flush=True)
            return True

        message = EmailMessage()
        message["From"] = self.mail_from or self.mail_username
        message["To"] = email
        message["Subject"] = "Recupera tu contraseña - Arunachala"
        
        html_content = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #becf81;">Hola,</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Arunachala Yoga.</p>
                <p>Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #becf81; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer contraseña</a>
                </div>
                <p style="font-size: 0.8em; color: #666;">Este enlace expirará en 15 minutos.</p>
                <p style="font-size: 0.8em; color: #666;">Si no has solicitado este cambio, puedes ignorar este correo.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 0.8em; color: #999; text-align: center;">Arunachala Yoga & Terapias</p>
            </div>
        """
        message.set_content("Usa el siguiente enlace para restablecer tu contraseña: " + reset_link)
        message.add_alternative(html_content, subtype="html")

        try:
            await aiosmtplib.send(
                message,
                hostname=self.mail_server,
                port=self.mail_port,
                username=self.mail_username,
                password=self.mail_password,
                start_tls=(self.mail_port == 587),
                use_tls=(self.mail_port == 465),
            )
            print(f"✅ Success: Email sent to {email}", flush=True)
            return True
        except Exception as e:
            print(f"❌ SMTP Error: {str(e)}", flush=True)
            return False

email_service = EmailService()
