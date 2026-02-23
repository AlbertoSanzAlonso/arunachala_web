import os
import aiosmtplib
from email.message import EmailMessage
from typing import Optional
from datetime import datetime
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

    async def send_activity_notification(self, recipients: list[dict], activity_data: dict, activity_url: str, notification_type: str = "new"):
        """
        Sends a personalized and multilingual notification email to multiple subscribers.
        recipients: list of {"email": str, "first_name": str, "language": str}
        notification_type: "new", "update", or "delete"
        """
        if not recipients:
            return True

        logo_url = f"{self.frontend_url}/logo_transparent.png"
        
        # Static translations for the email template
        translations = {
            "es": {
                "subject_new": "🌿 Nueva Actividad: {title} - Arunachala",
                "subject_update": "🌿 Actualización: {title} - Arunachala",
                "subject_delete": "🌿 Aviso: {title} - Arunachala",
                "greeting": "¡Hola {name}! 🌿",
                "intro": "Esperamos que estés teniendo un día lleno de paz y equilibrio.",
                "body_new": "Nos hace mucha ilusión contarte que hemos preparado una <strong>nueva actividad</strong> que creemos que te va a encantar:",
                "body_update": "Te informamos que ha habido cambios importantes en la actividad <strong>{title}</strong>:",
                "body_delete": "Te comunicamos que la actividad <strong>{title}</strong> ha finalizado o ha sido cancelada.",
                "details_p": "¿Quieres saber más? Tienes todos los detalles, fechas y reserva directa en nuestra web:",
                "button_new": "Ver Detalles de la Actividad",
                "button_update": "Ver Cambios",
                "whatsapp_note": "Si tienes cualquier duda, recuerda que puedes escribirnos respondiendo a este correo o por WhatsApp.",
                "sign_off": "Con cariño,<br>El equipo de Arunachala",
                "address": "📍 Cornellà de Llobregat, Barcelona",
                "footer_info": "Has recibido este correo porque estás suscrito a nuestras novedades.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject_new": "🌿 Nova Activitat: {title} - Arunachala",
                "subject_update": "🌿 Actualització: {title} - Arunachala",
                "subject_delete": "🌿 Avís: {title} - Arunachala",
                "greeting": "Hola {name}! 🌿",
                "intro": "Esperem que estiguis tenint un dia ple de pau i equilibri.",
                "body_new": "Ens fa molta il·lusió explicar-te que hem preparat una <strong>nova activitat</strong> que creiem que t'encantarà:",
                "body_update": "T'informem que hi ha hagut canvis importants en l'activitat <strong>{title}</strong>:",
                "body_delete": "Et comuniquem que l'activitat <strong>{title}</strong> ha finalitzat o ha estat cancel·lada.",
                "details_p": "Vols saber-ne més? Tens tots els detalls, dates i reserva directa a la nostra web:",
                "button_new": "Veure Detalls de l'Activitat",
                "button_update": "Veure Canvis",
                "whatsapp_note": "Si tens qualsevol dubte, recorda que pots escriure'ns responent a aquest correu o per WhatsApp.",
                "sign_off": "Amb carinyo,<br>L'equip d'Arunachala",
                "address": "📍 Cornellà de Llobregat, Barcelona",
                "footer_info": "Has rebut aquest correu perquè estàs subscrit a les nostres novetats.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject_new": "🌿 New Activity: {title} - Arunachala",
                "subject_update": "🌿 Update: {title} - Arunachala",
                "subject_delete": "🌿 Notice: {title} - Arunachala",
                "greeting": "Hello {name}! 🌿",
                "intro": "We hope you are having a day full of peace and balance.",
                "body_new": "We are very excited to tell you that we have prepared a <strong>new activity</strong> that we think you will love:",
                "body_update": "We inform you that there have been important changes to the activity <strong>{title}</strong>:",
                "body_delete": "We inform you that the activity <strong>{title}</strong> has finished or has been canceled.",
                "details_p": "Want to know more? You have all the details, dates, and direct booking on our website:",
                "button_new": "View Activity Details",
                "button_update": "View Updates",
                "whatsapp_note": "If you have any questions, remember you can write to us by replying to this email or via WhatsApp.",
                "sign_off": "With love,<br>The Arunachala Team",
                "address": "📍 Cornellà de Llobregat, Barcelona",
                "footer_info": "You received this email because you are subscribed to our news.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        # Connect to SMTP once and keep connection open for all emails
        smtp_client = None
        if self.use_smtp:
            try:
                smtp_client = aiosmtplib.SMTP(
                    hostname=self.mail_server,
                    port=self.mail_port,
                    start_tls=(self.mail_port == 587),
                    use_tls=(self.mail_port == 465),
                )
                await smtp_client.connect()
                await smtp_client.login(self.mail_username, self.mail_password)
            except Exception as e:
                print(f"❌ SMTP Connection Error: {str(e)}", flush=True)
                return False

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("first_name") or ("amig@ de Arunachala" if recipient.get("language") != "en" else "friend of Arunachala")
            lang = recipient.get("language") or "es"
            if lang not in translations:
                lang = "es"
            
            t = translations[lang]
            
            # Get translated activity title
            title = activity_data.get("title")
            if activity_data.get("translations") and lang in activity_data["translations"]:
                title = activity_data["translations"][lang].get("title") or title

            if not self.use_smtp:
                print(f"📧 [DEV MODE] Email ({notification_type}) in {lang} to {email}: {title}", flush=True)
                continue

            message = EmailMessage()
            message["From"] = self.mail_from or self.mail_username
            message["To"] = email
            message["Subject"] = t[f"subject_{notification_type}"].format(title=title)
            
            unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
            
            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                <!-- Header with Logo -->
                <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background-color: #F5F5DC; padding: 10px; border: 2px solid #F5F5DC;">
                        <img src="{logo_url}" alt="Arunachala Logo" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUNACHALA</h1>
                    <p style="color: #F5F5DC; opacity: 0.8; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Yoga & Terapias</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                    <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                    <p>{t["intro"]}</p>
                    <p>{t[f"body_{notification_type}"].format(title=title)}</p>
                    
                    <!-- Activity Card -->
                    <div style="background-color: #f9fbf4; border-left: 4px solid #becf81; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.02);">
                        <h3 style="margin: 0 0 10px 0; color: #2d341d; font-size: 20px; font-weight: 600;">{title}</h3>
                    </div>
                    
                    {f'<p>{t["details_p"]}</p><div style="text-align: center; margin: 40px 0;"><a href="{activity_url}" style="background-color: #5c6b3c; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(92, 107, 60, 0.3); font-size: 16px;">{t[f"button_{notification_type}"]}</a></div>' if notification_type != "delete" else ""}
                    
                    <p style="font-size: 14px; color: #777;">{t["whatsapp_note"]}</p>
                    
                    <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; color: #5c6b3c; font-weight: 500;">{t["sign_off"]}</p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f4f6f0; padding: 30px 20px; text-align: center; font-size: 12px; color: #8a9478; border-top: 1px solid #eef2e6;">
                    <p style="margin-bottom: 8px;">{t["address"]}</p>
                    <p style="margin-top: 0;">{t["footer_info"]}</p>
                    <div style="margin-top: 15px;">
                        <a href="{unsubscribe_url}" style="color: #5c6b3c; text-decoration: underline;">{t["unsubscribe"]}</a>
                    </div>
                </div>
            </div>
            """
            message.set_content(f"{t['greeting'].format(name=name)}, {title}. {activity_url}")
            message.add_alternative(html_content, subtype="html")

            if self.use_smtp and smtp_client:
                try:
                    await smtp_client.send_message(message)
                except Exception as e:
                    print(f"❌ SMTP Send Error for {email}: {str(e)}", flush=True)

        if smtp_client:
            try:
                await smtp_client.quit()
            except:
                pass

        return True

    async def send_welcome_email(self, email: str, first_name: Optional[str] = None, language: str = "es"):
        """
        Sends a warm welcome email to new subscribers.
        """
        logo_url = f"{self.frontend_url}/logo_transparent.png"
        name = first_name or ("amig@ de Arunachala" if language != "en" else "friend of Arunachala")
        
        translations = {
            "es": {
                "subject": "✨ ¡Bienvenido a Arunachala! 🌿",
                "greeting": "¡Bienvenido, {name}! ✨",
                "intro": "Estamos encantados de que te unas a nuestra comunidad.",
                "body": "A partir de ahora, serás el primero en enterarte de nuestras <strong>próximas actividades, talleres y retiros</strong>. También compartiremos contigo reflexiones sobre yoga y bienestar para acompañarte en tu camino.",
                "button": "Explorar Actividades",
                "whatsapp_note": "Si alguna vez tienes una duda o simplemente quieres saludarnos, puedes responder a este correo o escribirnos por WhatsApp.",
                "sign_off": "Con gratitud,<br>El equipo de Arunachala",
                "address": "📍 Cornellà de Llobregat, Barcelona",
                "footer_info": "Este es un correo de bienvenida. Para no recibir más correos, puedes darte de baja en cualquier momento.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject": "✨ Benvingut a Arunachala! 🌿",
                "greeting": "Benvingut, {name}! ✨",
                "intro": "Estem encantats que t'uneixis a la nostra comunitat.",
                "body": "A partir d'ara, seràs el primer en assabentar-te de les nostres <strong>properes activitats, tallers i retirs</strong>. També compartirem amb tu reflexions sobre ioga i benestar per acompanyar-te en el teu camí.",
                "button": "Explorar Activitats",
                "whatsapp_note": "Si algun cop tens un dubte o simplement vols saludar-nos, pots respondre a aquest correu o escriure'ns per WhatsApp.",
                "sign_off": "Amb gratitud,<br>L'equip d'Arunachala",
                "address": "📍 Cornellà de Llobregat, Barcelona",
                "footer_info": "Aquest és un correu de benvinguda. Per no rebre més correos, pots donar-te de baixa en qualsevol moment.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject": "✨ Welcome to Arunachala! 🌿",
                "greeting": "Welcome, {name}! ✨",
                "intro": "We are delighted to have you join our community.",
                "body": "From now on, you'll be the first to know about our <strong>upcoming activities, workshops, and retreats</strong>. We will also share insights on yoga and wellness to support you on your journey.",
                "button": "Explore Activities",
                "whatsapp_note": "If you ever have a question or just want to say hi, you can reply to this email or reach us via WhatsApp.",
                "sign_off": "With gratitude,<br>The Arunachala Team",
                "address": "📍 Cornellà de Llobregat, Barcelona",
                "footer_info": "This is a welcome email. To stop receiving emails, you can unsubscribe at any time.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        t = translations.get(language, translations["es"])
        
        if not self.use_smtp:
            print(f"📧 [DEV MODE] Welcome Email to {email} ({language})", flush=True)
            return True

        message = EmailMessage()
        message["From"] = self.mail_from or self.mail_username
        message["To"] = email
        message["Subject"] = t["subject"]
        
        unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
        explore_url = f"{self.frontend_url}/actividades"
        
        html_content = f"""
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
            <!-- Header with Logo -->
            <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background-color: #F5F5DC; padding: 10px; border: 2px solid #F5F5DC;">
                    <img src="{logo_url}" alt="Arunachala Logo" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUNACHALA</h1>
                <p style="color: #F5F5DC; opacity: 0.8; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Yoga & Terapias</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                <p>{t["intro"]}</p>
                <p>{t["body"]}</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{explore_url}" style="background-color: #5c6b3c; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(92, 107, 60, 0.3); font-size: 16px;">{t["button"]}</a>
                </div>
                
                <p style="font-size: 14px; color: #777;">{t["whatsapp_note"]}</p>
                
                <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; color: #5c6b3c; font-weight: 500;">{t["sign_off"]}</p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f4f6f0; padding: 30px 20px; text-align: center; font-size: 12px; color: #8a9478; border-top: 1px solid #eef2e6;">
                <p style="margin-bottom: 8px;">{t["address"]}</p>
                <p style="margin-top: 0;">{t["footer_info"]}</p>
                <div style="margin-top: 15px;">
                    <a href="{unsubscribe_url}" style="color: #5c6b3c; text-decoration: underline;">{t["unsubscribe"]}</a>
                </div>
            </div>
        </div>
        """
        message.set_content(f"{t['greeting'].format(name=name)}. {t['intro']} {t['body']}")
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
            return True
        except Exception as e:
            print(f"❌ SMTP Error for {email}: {str(e)}", flush=True)
            return False

email_service = EmailService()
