import resend
from app.core.config import settings
import logging

resend.api_key = settings.RESEND_API_KEY
logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str, attachments: list = None):
        try:
            params = {
                "from": "NyayaAI <noreply@nyayaai.com>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            if attachments:
                params["attachments"] = attachments
                
            email = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}. ID: {email['id']}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}. Error: {str(e)}")
            return False

    @staticmethod
    def send_welcome_email(to_email: str, name: str):
        subject = "Welcome to NyayaAI - Justice Made Simple"
        html = f"""
        <html>
            <body>
                <h2>Welcome, {name}!</h2>
                <p>We are thrilled to have you on board. NyayaAI is designed to help you understand complex legal issues using the power of AI.</p>
                <p><strong>Remember:</strong> Our platform provides information for educational purposes and is not a substitute for professional legal advice.</p>
                <br>
                <a href="https://nyayaai.com/dashboard" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
            </body>
        </html>
        """
        return EmailService.send_email(to_email, subject, html)

    @staticmethod
    def send_case_created_email(to_email: str, case_title: str, case_id: str):
        subject = f"Case Registered: {case_title}"
        html = f"""
        <html>
            <body>
                <h2>Your case has been registered.</h2>
                <p>Case ID: <strong>{case_id}</strong></p>
                <p>Our AI is currently analyzing your issue. You will receive an update once a lawyer reviews your evidence.</p>
            </body>
        </html>
        """
        return EmailService.send_email(to_email, subject, html)
