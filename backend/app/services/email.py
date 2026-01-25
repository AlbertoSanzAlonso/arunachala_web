from typing import Optional

class EmailService:
    def __init__(self):
        # In a real scenario, initialize SMTP client here
        pass

    async def send_reset_password_email(self, email: str, token: str):
        """
        Sends a reset password email. 
        For dev/demo, it just logs the link to stdout.
        """
        # Construction of the link (assuming frontend runs on localhost:3000)
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        
        print("=================================================================", flush=True)
        print(f"📧 SENDING EMAIL TO: {email}", flush=True)
        print(f"🔗 RESET LINK: {reset_link}", flush=True)
        print("=================================================================", flush=True)
        
        return True

email_service = EmailService()
