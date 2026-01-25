import os
import resend
from typing import Optional

class EmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        if self.api_key:
            resend.api_key = self.api_key

    async def send_reset_password_email(self, email: str, token: str):
        """
        Sends a reset password email. 
        Uses Resend if API key is present, otherwise logs to console.
        """
        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        
        if not self.api_key:
            print("=================================================================", flush=True)
            print(f"📧 [DEV MODE] SIMULATED EMAIL TO: {email}", flush=True)
            print(f"🔗 RESET LINK: {reset_link}", flush=True)
            print("=================================================================", flush=True)
            return True

        try:
            params = {
                "from": f"Arunachala Yoga <{self.from_email}>",
                "to": [email],
                "subject": "Recupera tu contraseña - Arunachala",
                "html": f"""
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">Hola,</h2>
                        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Arunachala Yoga.</p>
                        <p>Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer contraseña</a>
                        </div>
                        <p style="font-size: 0.8em; color: #666;">Este enlace expirará en 15 minutos.</p>
                        <p style="font-size: 0.8em; color: #666;">Si no has solicitado este cambio, puedes ignorar este correo.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 0.8em; color: #999; text-align: center;">Arunachala Yoga & Terapias</p>
                    </div>
                """
            }
            resend.Emails.send(params)
            print(f"✅ Real email sent via Resend to {email}", flush=True)
            return True
        except Exception as e:
            print(f"❌ Error sending email via Resend: {e}", flush=True)
            # Fallback to console if real send fails
            print(f"🔗 [FALLBACK] RESET LINK: {reset_link}", flush=True)
            return False

email_service = EmailService()
