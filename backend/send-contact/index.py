import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


TO_EMAIL = "maiya.tarolog@yandex.ru"
FROM_EMAIL = "maiya.tarolog@yandex.ru"
SMTP_HOST = "smtp.yandex.ru"
SMTP_PORT = 465  # SSL


def send_email(subject: str, html: str):
    """Отправляет письмо через Яндекс SMTP."""
    password = os.environ["YANDEX_SMTP_PASSWORD"]
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = TO_EMAIL
    msg.attach(MIMEText(html, "html", "utf-8"))
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(FROM_EMAIL, password)
        server.sendmail(FROM_EMAIL, TO_EMAIL, msg.as_string())


def handler(event: dict, context) -> dict:
    """Принимает заявку с сайта и отправляет уведомление на почту."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    name = (body.get("name") or "").strip()
    messenger = (body.get("messenger") or "").strip()
    message = (body.get("message") or "").strip()

    if not name or not messenger or not message:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Все поля обязательны"})}

    html = f"""
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0c0e14; color: #c8d0d8; padding: 32px; border-radius: 4px; border: 1px solid #2a2e3a;">
      <h2 style="color: #c8a050; font-weight: 300; font-size: 22px; margin: 0 0 24px;">Новая заявка с сайта</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; width: 120px;">Имя</td>
          <td style="padding: 10px 0; color: #e2e8f0;">{name}</td>
        </tr>
        <tr style="border-top: 1px solid #1e2130;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Мессенджер</td>
          <td style="padding: 10px 0; color: #e2e8f0;">{messenger}</td>
        </tr>
        <tr style="border-top: 1px solid #1e2130;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Ситуация</td>
          <td style="padding: 10px 0; color: #e2e8f0; line-height: 1.6;">{message}</td>
        </tr>
      </table>
    </div>
    """

    send_email("📋 Новая заявка на диагностику", html)

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({"ok": True}),
    }