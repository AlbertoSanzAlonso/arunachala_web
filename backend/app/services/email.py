import os
import aiosmtplib
import base64
import httpx
from email.message import EmailMessage
from email.utils import formataddr
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
        self.mail_from_name = os.getenv("MAIL_FROM_NAME", "Aruṇāchala Yoga & Terapias")
        self.frontend_url = os.getenv("FRONTEND_URL", "https://www.yogayterapiasarunachala.es")
        
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
        raw_from = self.mail_from or self.mail_username
        message["From"] = formataddr((self.mail_from_name, raw_from))
        message["To"] = email
        message["Subject"] = "Recupera tu contraseña - Aruṇāchala"
        
        html_content = f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #becf81;">Hola,</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Aruṇāchala Yoga.</p>
                <p>Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #becf81; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer contraseña</a>
                </div>
                <p style="font-size: 0.8em; color: #666;">Este enlace expirará en 15 minutos.</p>
                <p style="font-size: 0.8em; color: #666;">Si no has solicitado este cambio, puedes ignorar este correo.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 0.8em; color: #999; text-align: center;">Aruṇāchala Yoga & Terapias</p>
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

        logo_url = f"{self.frontend_url}/logo_icon.webp"
        
        # Static translations for the email template
        translations = {
            "es": {
                "subject_new": "🌿 Nueva Actividad: {title} - Aruṇāchala",
                "subject_update": "🌿 Actualización: {title} - Aruṇāchala",
                "subject_delete": "🌿 Aviso: {title} - Aruṇāchala",
                "greeting": "¡Hola {name}! 🌿",
                "intro": "Esperamos que estés teniendo un día lleno de paz y equilibrio.",
                "body_new": "Nos hace mucha ilusión contarte que hemos preparado una <strong>nueva actividad</strong> que creemos que te va a encantar:",
                "body_update": "Te informamos que ha habido cambios importantes en la actividad <strong>{title}</strong>:",
                "body_delete": "Te comunicamos que la actividad <strong>{title}</strong> ha finalizado o ha sido cancelada.",
                "details_p": "¿Quieres saber más? Tienes todos los detalles, fechas y reserva directa en nuestra web:",
                "button_new": "Ver Detalles de la Actividad",
                "button_update": "Ver Cambios",
                "whatsapp_note": "Si tienes cualquier duda, recuerda que puedes escribirnos respondiendo a este correo o por WhatsApp.",
                "sign_off": "Con cariño,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Has recibido este correo porque estás suscrito a nuestras novedades.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject_new": "🌿 Nova Activitat: {title} - Aruṇāchala",
                "subject_update": "🌿 Actualització: {title} - Aruṇāchala",
                "subject_delete": "🌿 Avís: {title} - Aruṇāchala",
                "greeting": "Hola {name}! 🌿",
                "intro": "Esperem que estiguis tenint un dia ple de pau i equilibri.",
                "body_new": "Ens fa molta il·lusió explicar-te que hem preparat una <strong>nova activitat</strong> que creiem que t'encantarà:",
                "body_update": "T'informem que hi ha hagut canvis importants en l'activitat <strong>{title}</strong>:",
                "body_delete": "Et comuniquem que l'activitat <strong>{title}</strong> ha finalitzat o ha estat cancel·lada.",
                "details_p": "Vols saber-ne més? Tens tots els detalls, dates i reserva directa a la nostra web:",
                "button_new": "Veure Detalls de l'Activitat",
                "button_update": "Veure Canvis",
                "whatsapp_note": "Si tens qualsevol dubte, recorda que pots escriure'ns responent a aquest correu o per WhatsApp.",
                "sign_off": "Amb carinyo,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Has rebut aquest correu perquè estàs subscrit a les nostres novetats.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject_new": "🌿 New Activity: {title} - Aruṇāchala",
                "subject_update": "🌿 Update: {title} - Aruṇāchala",
                "subject_delete": "🌿 Notice: {title} - Aruṇāchala",
                "greeting": "Hello {name}! 🌿",
                "intro": "We hope you are having a day full of peace and balance.",
                "body_new": "We are very excited to tell you that we have prepared a <strong>new activity</strong> that we think you will love:",
                "body_update": "We inform you that there have been important changes to the activity <strong>{title}</strong>:",
                "body_delete": "We inform you that the activity <strong>{title}</strong> has finished or has been canceled.",
                "details_p": "Want to know more? You have all the details, dates, and direct booking on our website:",
                "button_new": "View Activity Details",
                "button_update": "View Updates",
                "whatsapp_note": "If you have any questions, remember you can write to us by replying to this email or via WhatsApp.",
                "sign_off": "With love,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "You received this email because you are subscribed to our news.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        import asyncio

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("first_name") or ("compañer@ de camino" if recipient.get("language") != "en" else "fellow traveler")
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
            raw_from = self.mail_from or self.mail_username
            message["From"] = formataddr((self.mail_from_name, raw_from))
            message["To"] = email
            message["Subject"] = t[f"subject_{notification_type}"].format(title=title)
            
            unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
            
            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                <!-- Header with Logo -->
                <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                        <img src="{logo_url}" alt="Aruṇāchala Logo" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
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

            if self.use_smtp:
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
                    # Pequeño retraso para evitar rate-limits
                    await asyncio.sleep(0.5)
                except Exception as e:
                    print(f"❌ SMTP Send Error for {email}: {str(e)}", flush=True)

        return True

    async def send_confirmation_email(self, email: str, token: str, first_name: Optional[str] = None, language: str = "es"):
        """
        Sends a confirmation email for double opt-in.
        """
        actual_logo_url = f"{self.frontend_url}/logo_icon.webp"
        logo_data = None
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(actual_logo_url, timeout=5.0)
                if resp.status_code == 200:
                    logo_data = resp.content
        except Exception as e:
            print(f"⚠️ Could not fetch logo for embedding: {e}")

        name = first_name or ("compañer@ de camino" if language != "en" else "fellow traveler")
        
        translations = {
            "es": {
                "subject": "🌿 Confirma tu suscripción - Aruṇāchala",
                "greeting": "¡Hola, {name}! 🌿",
                "intro": "¡Gracias por querer formar parte de Aruṇāchala!",
                "body": "Para completar tu suscripción y asegurarte de recibir todas nuestras novedades en tu bandeja de entrada, por favor confirma tu correo electrónico haciendo clic en el botón de abajo.",
                "button": "Confirmar Suscripción",
                "spam_note": "Si no confirmas tu suscripción, no recibirás más correos nuestros. Este paso nos ayuda a que nuestros futuros correos no acaben en tu carpeta de spam.",
                "sign_off": "Con cariño,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Has recibido este correo porque te has apuntado a nuestra lista en la web."
            },
            "ca": {
                "subject": "🌿 Confirma la teva subscripció - Aruṇāchala",
                "greeting": "Hola, {name}! 🌿",
                "intro": "Gràcies per voler formar part d'Aruṇāchala!",
                "body": "Per completar la teva subscripció i assegurar-te de rebre totes les nostres novetats a la teva bústia d'entrada, si us plau confirma el teu correu electrònic fent clic al botó de sota.",
                "button": "Confirmar Subscripció",
                "spam_note": "Si no confirmes la teva subscripció, no rebràs més correus nostres. Aquest pas ens ajuda a que els nostres futurs correus no acabin a la teva carpeta de correu brossa.",
                "sign_off": "Amb carinyo,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Has rebut aquest correu perquè t'has apuntat a la nostra llista a la web."
            },
            "en": {
                "subject": "🌿 Confirm your subscription - Aruṇāchala",
                "greeting": "Hello, {name}! 🌿",
                "intro": "Thank you for wanting to be part of Aruṇāchala!",
                "body": "To complete your subscription and ensure you receive all our news in your inbox, please confirm your email by clicking the button below.",
                "button": "Confirm Subscription",
                "spam_note": "If you don't confirm your subscription, you won't receive any more emails from us. This step helps us ensure our future emails don't end up in your spam folder.",
                "sign_off": "With love,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "You received this email because you signed up on our website."
            }
        }
        
        t = translations.get(language, translations["es"])
        
        confirmation_url = f"{self.frontend_url}/confirmar-suscripcion?token={token}&lng={language}"
        
        if not self.use_smtp:
            print(f"📧 [DEV MODE] Confirmation Email to {email} ({language}). Link: {confirmation_url}", flush=True)
            return True

        message = EmailMessage()
        raw_from = self.mail_from or self.mail_username
        message["From"] = formataddr((self.mail_from_name, raw_from))
        message["To"] = email
        message["Subject"] = t["subject"]
        
        html_content = f"""
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
            <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                    <img src="cid:logo_cid" alt="Aruṇāchala" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                </div>
                <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
                <p style="color: #F5F5DC; opacity: 0.8; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Yoga & Terapias</p>
            </div>
            
            <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                <p>{t["intro"]}</p>
                <p>{t["body"]}</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{confirmation_url}" style="background-color: #5c6b3c; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(92, 107, 60, 0.3); font-size: 16px;">{t["button"]}</a>
                </div>
                
                <p style="font-size: 14px; color: #777; font-style: italic; background-color: #f9fbf4; padding: 15px; border-radius: 10px;">{t["spam_note"]}</p>
                
                <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; color: #5c6b3c; font-weight: 500;">{t["sign_off"]}</p>
            </div>
            
            <div style="background-color: #f4f6f0; padding: 30px 20px; text-align: center; font-size: 12px; color: #8a9478; border-top: 1px solid #eef2e6;">
                <p style="margin-bottom: 8px;">{t["address"]}</p>
                <p style="margin-top: 0;">{t["footer_info"]}</p>
            </div>
        </div>
        """
        message.set_content(f"{t['greeting'].format(name=name)}. {t['intro']} {t['body']} Link: {confirmation_url}")
        message.add_alternative(html_content, subtype="html")
        
        if logo_data:
            for part in message.iter_parts():
                if part.get_content_subtype() == 'html':
                    part.add_related(logo_data, maintype='image', subtype='webp', cid='<logo_cid>', filename='logo.webp')
                    break

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
            print(f"❌ SMTP Error for confirmation to {email}: {str(e)}", flush=True)
            return False

    async def send_welcome_email(self, email: str, first_name: Optional[str] = None, language: str = "es"):
        """
        Sends a warm welcome email to new subscribers.
        """
        # Fetch logo bytes for CID embedding
        actual_logo_url = f"{self.frontend_url}/logo_icon.webp"
        logo_data = None
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(actual_logo_url, timeout=5.0)
                if resp.status_code == 200:
                    logo_data = resp.content
        except Exception as e:
            print(f"⚠️ Could not fetch logo for embedding: {e}")

        name = first_name or ("compañer@ de camino" if language != "en" else "fellow traveler")
        
        translations = {
            "es": {
                "subject": "✨ ¡Te damos la bienvenida a Aruṇāchala! 🌿",
                "greeting": "¡Hola, {name}! ✨",
                "intro": "Me alegra muchísimo que te unas a la comunidad.",
                "body": "A partir de ahora, recibirás las novedades de mis <strong>próximas actividades, talleres y retiros</strong> antes que nadie. También compartiré contigo reflexiones sobre yoga y bienestar para acompañarte en tu camino.",
                "button": "Explorar Actividades",
                "whatsapp_note": "Si alguna vez tienes una duda o simplemente quieres saludar, puedes responder a este correo o escribirme por WhatsApp.",
                "sign_off": "Con gratitud,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Este es un correo de bienvenida. Para no recibir más correos, puedes darte de baja en cualquier momento.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject": "✨ Et dono la benvinguda a Aruṇāchala! 🌿",
                "greeting": "Hola, {name}! ✨",
                "intro": "M'alegro moltíssim que t'uneixis a la comunitat.",
                "body": "A partir d'ara, rebràs les novetats de les meves <strong>properes activitats, tallers i retirs</strong> abans que ningú. També compartiré amb tu reflexions sobre ioga i benestar per acompanyar-te en el teu camí.",
                "button": "Explorar Activitats",
                "whatsapp_note": "Si algun cop tens un dubte o simplement vols saludar, pots respondre a aquest correu o escriure'm per WhatsApp.",
                "sign_off": "Amb gratitud,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Aquest és un correu de benvinguda. Per no rebre més correus, pots donar-te de baixa en qualsevol moment.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject": "✨ Welcome to Aruṇāchala! 🌿",
                "greeting": "Hello, {name}! ✨",
                "intro": "I'm delighted to have you join the community.",
                "body": "From now on, you'll be the first to know about my <strong>upcoming activities, workshops, and retreats</strong>. I will also share insights on yoga and wellness to support you on your journey.",
                "button": "Explore Activities",
                "whatsapp_note": "If you ever have a question or just want to say hi, you can reply to this email or reach out to me via WhatsApp.",
                "sign_off": "With gratitude,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "This is a welcome email. To stop receiving emails, you can unsubscribe at any time.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        t = translations.get(language, translations["es"])
        
        if not self.use_smtp:
            print(f"📧 [DEV MODE] Welcome Email to {email} ({language})", flush=True)
            return True

        message = EmailMessage()
        raw_from = self.mail_from or self.mail_username
        message["From"] = formataddr((self.mail_from_name, raw_from))
        message["To"] = email
        message["Subject"] = t["subject"]
        
        unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}&lng={language}"
        explore_url = f"{self.frontend_url}/actividades?lng={language}"
        
        html_content = f"""
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
            <!-- Header with Logo -->
            <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                    <img src="cid:logo_cid" alt="Aruṇāchala" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                </div>
                <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
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
        
        # Add the HTML alternative
        message.add_alternative(html_content, subtype="html")
        
        # Add the related image as CID
        if logo_data:
            # We need to find the html part to add the related image to it
            for part in message.iter_parts():
                if part.get_content_subtype() == 'html':
                    part.add_related(logo_data, maintype='image', subtype='webp', cid='<logo_cid>', filename='logo.webp')
                    break

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

    async def send_custom_email(self, recipients: list[dict], subject: str, content: str):
        """
        Sends a custom email created manually from the dashboard.
        """
        if not recipients:
            return True

        actual_logo_url = f"{self.frontend_url}/logo_icon.webp"
        logo_data = None
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(actual_logo_url, timeout=5.0)
                if resp.status_code == 200:
                    logo_data = resp.content
        except Exception as e:
            print(f"⚠️ Could not fetch logo for embedding: {e}")

        translations = {
            "es": {
                "greeting": "¡Hola {name}! 🌿",
                "sign_off": "Con gratitud,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Has recibido este correo porque estás suscrito a nuestras novedades.",
                "unsubscribe": "Darme de baja",
                "fallback_name": "compañer@ de camino",
                "plain_text_info": "Este correo contiene contenido en formato HTML. Por favor, visualízalo en un cliente que soporte HTML."
            },
            "ca": {
                "greeting": "Hola {name}! 🌿",
                "sign_off": "Amb gratitud,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Has rebut aquest correu perquè estàs subscrit a les nostres novetats.",
                "unsubscribe": "Donar-me de baixa",
                "fallback_name": "company/a de camí",
                "plain_text_info": "Aquest correu conté contingut en format HTML. Si us plau, visualitza'l en un client que suporti HTML."
            },
            "en": {
                "greeting": "Hello {name}! 🌿",
                "sign_off": "With gratitude,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "You received this email because you are subscribed to our news.",
                "unsubscribe": "Unsubscribe",
                "fallback_name": "fellow traveler",
                "plain_text_info": "This email contains HTML content. Please view it in an HTML-supported client."
            }
        }

        import asyncio

        for recipient in recipients:
            email = recipient.get("email")
            raw_lang = recipient.get("language") or "es"
            lang = raw_lang[:2].lower()
            t = translations.get(lang, translations["es"])
            
            # Check if name is provided and not empty
            first_name = recipient.get("first_name")
            if first_name and isinstance(first_name, str) and first_name.strip():
                name = first_name.strip()
            else:
                name = t["fallback_name"]
            
            if not self.use_smtp:
                print(f"📧 [DEV MODE] Custom Email to {email}: {subject}", flush=True)
                continue

            try:
                # AUTOMATIC TRANSLATION FOR CUSTOM EMAIL
                # We translate the subject and content for EACH recipient's language
                # unless they are already in that language.
                final_subject = subject
                final_content = content
                
                if lang != 'es':
                    from app.core.translation_utils import translate_content
                    # We use a wrapper or direct call. translate_content takes dict.
                    trans = await translate_content({"s": subject, "c": content}, target_languages=[lang])
                    if trans and lang in trans:
                        final_subject = trans[lang].get("s", subject)
                        final_content = trans[lang].get("c", content)

                message = EmailMessage()
                raw_from = self.mail_from or self.mail_username
                message["From"] = formataddr((self.mail_from_name, raw_from))
                message["To"] = email
                message["Subject"] = final_subject
                
                unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}&lng={lang}"
                
                html_content = f"""
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                    <!-- Header with Logo -->
                    <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                        <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                            <img src="cid:logo_cid" alt="Aruṇāchala" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        </div>
                        <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
                        <p style="color: #F5F5DC; opacity: 0.8; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Yoga & Terapias</p>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                        <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                        <div style="white-space: pre-wrap;">{final_content}</div>
                        
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
                message.set_content(f"{t['greeting'].format(name=name)}\n\n{t['plain_text_info']}")
                message.add_alternative(html_content, subtype="html")
                
                if logo_data:
                    for part in message.iter_parts():
                        if part.get_content_subtype() == 'html':
                            part.add_related(logo_data, maintype='image', subtype='webp', cid='logo_cid', filename='logo.webp')
                            break

                await aiosmtplib.send(
                    message,
                    hostname=self.mail_server,
                    port=self.mail_port,
                    username=self.mail_username,
                    password=self.mail_password,
                    start_tls=(self.mail_port == 587),
                    use_tls=(self.mail_port == 465),
                )
                await asyncio.sleep(0.5)
            except Exception as e:
                print(f"❌ SMTP Error custom email for {email}: {str(e)}", flush=True)

        return True

    async def send_announcement_notification(self, recipients: list[dict], content_data: dict, content_url: str):
        """
        Sends a notification email for a new announcement/news.
        """
        if not recipients:
            return True

        logo_url = f"{self.frontend_url}/logo_icon.webp"
        
        translations = {
            "es": {
                "subject": "🌿 Últimas Noticias: {title} - Aruṇāchala",
                "greeting": "¡Hola {name}! 🌿",
                "intro": "Queremos compartir contigo una noticia importante de nuestro centro:",
                "button": "Leer Noticia Completa",
                "whatsapp_note": "Si tienes cualquier duda, recuerda que puedes escribirnos por WhatsApp.",
                "sign_off": "Con cariño,<br>Aruṇāchala",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject": "🌿 Últimes Notícies: {title} - Aruṇāchala",
                "greeting": "Hola {name}! 🌿",
                "intro": "Volem compartir amb tu una notícia important del nostre centre:",
                "button": "Llegir Notícia Completa",
                "whatsapp_note": "Si tens qualsevol dubte, recorda que pots escriure'ns per WhatsApp.",
                "sign_off": "Amb carinyo,<br>Aruṇāchala",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject": "🌿 Latest News: {title} - Aruṇāchala",
                "greeting": "Hello {name}! 🌿",
                "intro": "We want to share some important news from our center with you:",
                "button": "Read Full News",
                "whatsapp_note": "If you have any questions, remember you can write to us via WhatsApp.",
                "sign_off": "With love,<br>Aruṇāchala",
                "unsubscribe": "Unsubscribe"
            }
        }

        import asyncio

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("first_name") or ("compañer@ de camino" if recipient.get("language") != "en" else "fellow traveler")
            lang = recipient.get("language") or "es"
            t = translations.get(lang, translations["es"])
            
            title = content_data.get("title")
            body = content_data.get("body") or content_data.get("excerpt") or ""
            if content_data.get("translations") and lang in content_data["translations"]:
                title = content_data["translations"][lang].get("title") or title
                body = content_data["translations"][lang].get("body") or content_data["translations"][lang].get("excerpt") or body

            # Basic HTML strip for plain text
            import re
            clean_body = re.sub('<[^<]+?>', '', body)
            preview = clean_body[:200] + "..." if len(clean_body) > 200 else clean_body

            if not self.use_smtp:
                print(f"📧 [DEV MODE] Announcement to {email}: {title}", flush=True)
                continue

            message = EmailMessage()
            raw_from = self.mail_from or self.mail_username
            message["From"] = formataddr((self.mail_from_name, raw_from))
            message["To"] = email
            message["Subject"] = t["subject"].format(title=title)
            
            unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
            
            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                        <img src="{logo_url}" alt="Aruṇāchala Logo" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
                    <p style="color: #F5F5DC; opacity: 0.8; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Yoga & Terapias</p>
                </div>
                <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                    <h2 style="color: #5c6b3c; margin-top: 0;">{t["greeting"].format(name=name)}</h2>
                    <p>{t["intro"]}</p>
                    <div style="background-color: #f9fbf4; padding: 25px; margin: 25px 0; border-radius: 12px;">
                        <h3 style="margin: 0 0 10px 0; color: #2d341d;">{title}</h3>
                        <p style="margin: 0; font-style: italic; color: #666;">{preview}</p>
                    </div>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="{content_url}" style="background-color: #5c6b3c; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">{t["button"]}</a>
                    </div>
                    <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px;">{t["sign_off"]}</p>
                </div>
                <div style="background-color: #f4f6f0; padding: 20px; text-align: center; font-size: 12px; color: #8a9478;">
                    <a href="{unsubscribe_url}" style="color: #5c6b3c;">{t["unsubscribe"]}</a>
                </div>
            </div>
            """
            message.set_content(f"{t['greeting'].format(name=name)}. {t['intro']} {title}")
            message.add_alternative(html_content, subtype="html")

            try:
                await aiosmtplib.send(message, hostname=self.mail_server, port=self.mail_port, username=self.mail_username, password=self.mail_password, start_tls=(self.mail_port == 587), use_tls=(self.mail_port == 465))
                await asyncio.sleep(0.3)
            except Exception as e:
                print(f"❌ Error sending announcement email to {email}: {e}")

        return True


    async def send_promotion_notification(self, recipients: list[dict], promotion_data: dict, promotion_url: str, notification_type: str = "new"):
        if not recipients:
            return True

        logo_url = f"{self.frontend_url}/logo_icon.webp"
        
        translations = {
            "es": {
                "subject_new": "🌿 Nueva Promoción: {title} - Aruṇāchala",
                "subject_delete": "🌿 Promoción Finalizada: {title} - Aruṇāchala",
                "greeting": "¡Hola {name}! 🌿",
                "intro": "Tenemos una nueva oportunidad pensada para ti y tu bienestar.",
                "body_new": "Te traemos una <strong>nueva promoción</strong> que puedes aprovechar:",
                "body_delete": "Te comunicamos que la promoción <strong>{title}</strong> ha finalizado.",
                "details_p": "¿Quieres saber más? Tienes todos los detalles y condiciones en nuestra web:",
                "button_new": "Ver Detalles de la Promoción",
                "whatsapp_note": "Si tienes cualquier duda, puedes escribirnos respondiendo a este correo o por WhatsApp.",
                "sign_off": "Con cariño,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Has recibido este correo porque estás suscrito a nuestras novedades.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject_new": "🌿 Nova Promoció: {title} - Aruṇāchala",
                "subject_delete": "🌿 Promoció Finalitzada: {title} - Aruṇāchala",
                "greeting": "Hola {name}! 🌿",
                "intro": "Tenim una nova oportunitat pensada per tu i el teu benestar.",
                "body_new": "Et portem una <strong>nova promoció</strong> que pots aprofitar:",
                "body_delete": "Et comuniquem que la promoció <strong>{title}</strong> ha finalitzat.",
                "details_p": "Vols saber-ne més? Tens tots els detalls i condicions a la nostra web:",
                "button_new": "Veure Detalls de la Promoció",
                "whatsapp_note": "Si tens qualsevol dubte, pots escriure'ns responent a aquest correu o per WhatsApp.",
                "sign_off": "Amb carinyo,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Has rebut aquest correu perquè estàs subscrit a les nostres novetats.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject_new": "🌿 New Promotion: {title} - Aruṇāchala",
                "subject_delete": "🌿 Promotion Ended: {title} - Aruṇāchala",
                "greeting": "Hello {name}! 🌿",
                "intro": "We have a new opportunity designed for you and your well-being.",
                "body_new": "We bring you a <strong>new promotion</strong> that you can take advantage of:",
                "body_delete": "We inform you that the promotion <strong>{title}</strong> has ended.",
                "details_p": "Want to know more? You have all the details and conditions on our website:",
                "button_new": "View Promotion Details",
                "whatsapp_note": "If you have any questions, you can write to us by replying to this email or via WhatsApp.",
                "sign_off": "With love,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "You received this email because you are subscribed to our news.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        import asyncio

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("first_name") or ("compañer@ de camino" if recipient.get("language") != "en" else "fellow traveler")
            lang = recipient.get("language") or "es"
            if lang not in translations:
                lang = "es"
            
            t = translations[lang]
            title = promotion_data.get("title")
            if promotion_data.get("translations") and lang in promotion_data["translations"]:
                title = promotion_data["translations"][lang].get("title") or title

            if not self.use_smtp:
                print(f"📧 [DEV MODE] Promotion to {email}: {title}", flush=True)
                continue

            message = EmailMessage()
            raw_from = self.mail_from or self.mail_username
            message["From"] = formataddr((self.mail_from_name, raw_from))
            message["To"] = email
            message["Subject"] = t[f"subject_{notification_type}"].format(title=title)
            
            unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
            
            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                        <img src="{logo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
                </div>
                <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                    <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                    <p>{t["intro"]}</p>
                    <p>{t[f"body_{notification_type}"].format(title=title)}</p>
                    <div style="background-color: #f9fbf4; border-left: 4px solid #becf81; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #2d341d; font-size: 20px; font-weight: 600;">{title}</h3>
                    </div>
                    {'<p>'+t["details_p"]+'</p><div style="text-align: center; margin: 40px 0;"><a href="'+promotion_url+'" style="background-color: #5c6b3c; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">'+t["button_new"]+'</a></div>' if notification_type != "delete" else ""}
                    <p style="font-size: 14px; color: #777;">{t["whatsapp_note"]}</p>
                    <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; color: #5c6b3c; font-weight: 500;">{t["sign_off"]}</p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f4f6f0; padding: 30px 20px; text-align: center; font-size: 12px; color: #8a9478;">
                    <p style="margin-bottom: 8px;">{t["address"]}</p>
                    <p style="margin-top: 0;">{t["footer_info"]}</p>
                    <div style="margin-top: 15px;"><a href="{unsubscribe_url}" style="color: #5c6b3c;">{t["unsubscribe"]}</a></div>
                </div>
            </div>
            """
            message.set_content(f"{t['greeting'].format(name=name)}, {title}. {promotion_url}")
            message.add_alternative(html_content, subtype="html")

            if self.use_smtp:
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
                    await asyncio.sleep(0.5)
                except Exception as e:
                    print(f"❌ Error sending promotion email to {email}: {e}")
        return True

    async def send_suggestion_notification(self, recipients: list[dict], suggestion_data: dict, suggestion_url: str, notification_type: str = "new"):
        if not recipients:
            return True

        logo_url = f"{self.frontend_url}/logo_icon.webp"
        
        translations = {
            "es": {
                "subject_new": "🌿 Nueva Sugerencia para Votar: {title} - Aruṇāchala",
                "subject_delete": "🌿 Sugerencia Finalizada - Aruṇāchala",
                "greeting": "¡Hola {name}! 🌿",
                "intro": "Queremos hacer partícipe a nuestra comunidad de los próximos pasos.",
                "body_new": "Alguien ha propuesto una idea y la hemos convertido en una votación. Puedes dejar tu voto para:",
                "body_delete": "La votación sobre <strong>{title}</strong> ha finalizado o ha sido descartada.",
                "details_p": "¿Quieres dar tu opinión? Entra en el siguiente enlace para votar si te interesa:",
                "button_new": "Votar Sugerencia",
                "whatsapp_note": "Si tienes cualquier duda o propuesta adicional, puedes escribirnos por WhatsApp.",
                "sign_off": "Con cariño,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Has recibido este correo porque estás suscrito a nuestras novedades.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject_new": "🌿 Nova Suggerència per Votar: {title} - Aruṇāchala",
                "subject_delete": "🌿 Suggerència Finalitzada - Aruṇāchala",
                "greeting": "Hola {name}! 🌿",
                "intro": "Volem fer partícep la nostra comunitat dels propers passos.",
                "body_new": "Algú ha proposat una idea i l'hem convertit en una votació. Pots deixar el teu vot per:",
                "body_delete": "La votació sobre <strong>{title}</strong> ha finalitzat o ha estat descartada.",
                "details_p": "Vols donar la teva opinió? Entra al següent enllaç per votar si t'interessa:",
                "button_new": "Votar Suggerència",
                "whatsapp_note": "Si tens qualsevol dubte o proposta addicional, ens pots escriure per WhatsApp.",
                "sign_off": "Amb carinyo,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Has rebut aquest correu perquè estàs subscrit a les nostres novetats.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject_new": "🌿 New Suggestion to Vote: {title} - Aruṇāchala",
                "subject_delete": "🌿 Suggestion Ended - Aruṇāchala",
                "greeting": "Hello {name}! 🌿",
                "intro": "We want our community to be part of our next steps.",
                "body_new": "Someone has proposed an idea and we made it a poll. You can leave your vote for:",
                "body_delete": "The poll about <strong>{title}</strong> has finished or has been discarded.",
                "details_p": "Want to give your opinion? Enter the following link to cast your vote:",
                "button_new": "Vote Suggestion",
                "whatsapp_note": "If you have any questions or additional proposals, you can write to us via WhatsApp.",
                "sign_off": "With love,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "You received this email because you are subscribed to our news.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        import asyncio

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("first_name") or ("compañer@ de camino" if recipient.get("language") != "en" else "fellow traveler")
            lang = recipient.get("language") or "es"
            if lang not in translations:
                lang = "es"
            
            t = translations[lang]
            title = suggestion_data.get("title")
            if suggestion_data.get("translations") and lang in suggestion_data["translations"]:
                title = suggestion_data["translations"][lang].get("title") or title

            if not self.use_smtp:
                print(f"📧 [DEV MODE] Suggestion to {email}: {title}", flush=True)
                continue

            message = EmailMessage()
            raw_from = self.mail_from or self.mail_username
            message["From"] = formataddr((self.mail_from_name, raw_from))
            message["To"] = email
            message["Subject"] = t[f"subject_{notification_type}"].format(title=title)
            
            unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
            
            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                        <img src="{logo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
                </div>
                <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                    <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                    <p>{t["intro"]}</p>
                    <p>{t[f"body_{notification_type}"].format(title=title)}</p>
                    <div style="background-color: #f9fbf4; border-left: 4px solid #becf81; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #2d341d; font-size: 20px; font-weight: 600;">{title}</h3>
                    </div>
                    {'<p>'+t["details_p"]+'</p><div style="text-align: center; margin: 40px 0;"><a href="'+suggestion_url+'" style="background-color: #5c6b3c; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">'+t["button_new"]+'</a></div>' if notification_type != "delete" else ""}
                    <p style="font-size: 14px; color: #777;">{t["whatsapp_note"]}</p>
                    <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; color: #5c6b3c; font-weight: 500;">{t["sign_off"]}</p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f4f6f0; padding: 30px 20px; text-align: center; font-size: 12px; color: #8a9478;">
                    <p style="margin-bottom: 8px;">{t["address"]}</p>
                    <p style="margin-top: 0;">{t["footer_info"]}</p>
                    <div style="margin-top: 15px;"><a href="{unsubscribe_url}" style="color: #5c6b3c;">{t["unsubscribe"]}</a></div>
                </div>
            </div>
            """
            message.set_content(f"{t['greeting'].format(name=name)}, {title}. {suggestion_url}")
            message.add_alternative(html_content, subtype="html")

            if self.use_smtp:
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
                    await asyncio.sleep(0.5)
                except Exception as e:
                    print(f"❌ Error sending suggestion email to {email}: {e}")

        return True

    async def send_schedule_notification(self, recipients: list[dict], schedule_data: dict, notification_type: str = "update"):
        if not recipients:
            return True

        logo_url = f"{self.frontend_url}/logo_icon.webp"
        
        translations = {
            "es": {
                "subject_new": "🌿 Nuevo Horario: {title} - Aruṇāchala",
                "subject_update": "🌿 Actualización de Horario: {title} - Aruṇāchala",
                "subject_delete": "🌿 Horario Cancelado: {title} - Aruṇāchala",
                "greeting": "¡Hola {name}! 🌿",
                "intro": "Queremos informarte sobre un cambio en nuestros horarios de clase.",
                "body_new": "Hemos añadido un <strong>nuevo horario</strong> para la clase:",
                "body_update": "Hay una <strong>modificación en el horario</strong> de la clase:",
                "body_delete": "Te comunicamos que el horario de la clase <strong>{title}</strong> ha sido cancelado.",
                "schedule_details": "<strong>{day_of_week}</strong> de <strong>{start_time}</strong> a <strong>{end_time}</strong>.",
                "details_p": "Puedes ver el horario completo y actualizado en nuestra web:",
                "button": "Ver Horarios",
                "whatsapp_note": "Si tienes cualquier duda, puedes escribirnos respondiendo a este correo o por WhatsApp.",
                "sign_off": "Con cariño,<br>Aruṇāchala",
                "address": "📍 Pasaje de Mateo Oliva, 3 - Cornellá de Llobregat",
                "footer_info": "Has recibido este correo porque estás suscrito a nuestras novedades.",
                "unsubscribe": "Darme de baja"
            },
            "ca": {
                "subject_new": "🌿 Nou Horari: {title} - Aruṇāchala",
                "subject_update": "🌿 Actualització d'Horari: {title} - Aruṇāchala",
                "subject_delete": "🌿 Horari Cancel·lat: {title} - Aruṇāchala",
                "greeting": "Hola {name}! 🌿",
                "intro": "Volem informar-te sobre un canvi en els nostres horaris de classe.",
                "body_new": "Hem afegit un <strong>nou horari</strong> per a la classe:",
                "body_update": "Hi ha una <strong>modificació en l'horari</strong> de la classe:",
                "body_delete": "Et comuniquem que l'horari de la classe <strong>{title}</strong> ha estat cancel·lat.",
                "schedule_details": "<strong>{day_of_week}</strong> de <strong>{start_time}</strong> a <strong>{end_time}</strong>.",
                "details_p": "Pots veure l'horari complet i actualitzat a la nostra web:",
                "button": "Veure Horaris",
                "whatsapp_note": "Si tens qualsevol dubte, pots escriure'ns responent a aquest correu o per WhatsApp.",
                "sign_off": "Amb carinyo,<br>Aruṇāchala",
                "address": "📍 Passatge de Mateu Oliva, 3 - Cornellà de Llobregat",
                "footer_info": "Has rebut aquest correu perquè estàs subscrit a les nostres novetats.",
                "unsubscribe": "Donar-me de baixa"
            },
            "en": {
                "subject_new": "🌿 New Schedule: {title} - Aruṇāchala",
                "subject_update": "🌿 Schedule Update: {title} - Aruṇāchala",
                "subject_delete": "🌿 Schedule Canceled: {title} - Aruṇāchala",
                "greeting": "Hello {name}! 🌿",
                "intro": "We want to inform you about a change in our class schedules.",
                "body_new": "We have added a <strong>new schedule</strong> for the class:",
                "body_update": "There is a <strong>modification in the schedule</strong> for the class:",
                "body_delete": "We inform you that the schedule for the class <strong>{title}</strong> has been canceled.",
                "schedule_details": "<strong>{day_of_week}</strong> from <strong>{start_time}</strong> to <strong>{end_time}</strong>.",
                "details_p": "You can view the complete and updated schedule on our website:",
                "button": "View Schedules",
                "whatsapp_note": "If you have any questions, you can write to us by replying to this email or via WhatsApp.",
                "sign_off": "With love,<br>Aruṇāchala",
                "address": "📍 Mateo Oliva's Passage, 3 - Cornella de Llobregat",
                "footer_info": "You received this email because you are subscribed to our news.",
                "unsubscribe": "Unsubscribe"
            }
        }
        
        import asyncio

        for recipient in recipients:
            email = recipient.get("email")
            name = recipient.get("first_name") or ("compañer@ de camino" if recipient.get("language") != "en" else "fellow traveler")
            lang = recipient.get("language") or "es"
            if lang not in translations:
                lang = "es"
            
            t = translations[lang]
            title = schedule_data.get("title")
            if schedule_data.get("translations") and lang in schedule_data["translations"]:
                title = schedule_data["translations"][lang].get("name", title)

            if not self.use_smtp:
                print(f"📧 [DEV MODE] Schedule {notification_type} to {email}: {title}", flush=True)
                continue

            message = EmailMessage()
            raw_from = self.mail_from or self.mail_username
            message["From"] = formataddr((self.mail_from_name, raw_from))
            message["To"] = email
            message["Subject"] = t[f"subject_{notification_type}"].format(title=title)
            
            unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={email}"
            schedule_url = f"{self.frontend_url}/clases-de-yoga#horarios"
            
            day_of_week = schedule_data.get('day_of_week', '')
            days_translation = {
                'es': {'Lunes': 'Lunes', 'Martes': 'Martes', 'Miércoles': 'Miércoles', 'Jueves': 'Jueves', 'Viernes': 'Viernes', 'Sábado': 'Sábado', 'Domingo': 'Domingo'},
                'ca': {'Lunes': 'Dilluns', 'Martes': 'Dimarts', 'Miércoles': 'Dimecres', 'Jueves': 'Dijous', 'Viernes': 'Divendres', 'Sábado': 'Dissabte', 'Domingo': 'Diumenge'},
                'en': {'Lunes': 'Monday', 'Martes': 'Tuesday', 'Miércoles': 'Wednesday', 'Jueves': 'Thursday', 'Viernes': 'Friday', 'Sábado': 'Saturday', 'Domingo': 'Sunday'}
            }
            localized_day = days_translation.get(lang, days_translation['es']).get(day_of_week, day_of_week)

            schedule_info = ""
            if notification_type != "delete":
                schedule_info = f"<p style='text-align: center; font-size: 18px; margin: 20px 0; color: #5c6b3c;'>" + t["schedule_details"].format(day_of_week=localized_day, start_time=schedule_data.get('start_time', ''), end_time=schedule_data.get('end_time', '')) + "</p>"

            html_content = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2e6;">
                <div style="background-color: #5c6b3c; padding: 30px 20px; text-align: center;">
                    <div style="display: inline-block; width: 130px; height: 130px; border-radius: 50%; background-color: #ffffff; padding: 0; overflow: hidden;">
                        <img src="{logo_url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <h1 style="color: #F5F5DC; margin: 15px 0 0 0; font-size: 24px; letter-spacing: 2px; font-weight: 300;">ARUṆĀCHALA</h1>
                </div>
                <div style="padding: 40px 30px; color: #3d3d3d; line-height: 1.6;">
                    <h2 style="color: #5c6b3c; margin-top: 0; font-weight: 400;">{t["greeting"].format(name=name)}</h2>
                    <p>{t["intro"]}</p>
                    <p>{t[f"body_{notification_type}"].format(title=title)}</p>
                    <div style="background-color: #f9fbf4; border-left: 4px solid #becf81; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #2d341d; font-size: 20px; font-weight: 600;">{title}</h3>
                        {schedule_info}
                    </div>
                    {'<p>'+t["details_p"]+'</p><div style="text-align: center; margin: 40px 0;"><a href="'+schedule_url+'" style="background-color: #5c6b3c; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">'+t["button"]+'</a></div>'}
                    <p style="font-size: 14px; color: #777;">{t["whatsapp_note"]}</p>
                    <p style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px; color: #5c6b3c; font-weight: 500;">{t["sign_off"]}</p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f4f6f0; padding: 30px 20px; text-align: center; font-size: 12px; color: #8a9478;">
                    <p style="margin-bottom: 8px;">{t["address"]}</p>
                    <p style="margin-top: 0;">{t["footer_info"]}</p>
                    <div style="margin-top: 15px;"><a href="{unsubscribe_url}" style="color: #5c6b3c;">{t["unsubscribe"]}</a></div>
                </div>
            </div>
            """
            message.set_content(f"{t['greeting'].format(name=name)}, {title}. {schedule_url}")
            message.add_alternative(html_content, subtype="html")

            if self.use_smtp:
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
                    await asyncio.sleep(0.5)
                except Exception as e:
                    print(f"❌ Error sending schedule email to {email}: {e}")

        return True


email_service = EmailService()
