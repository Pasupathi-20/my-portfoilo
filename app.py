from flask import Flask, render_template, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import anthropic
import smtplib
import re
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

limiter = Limiter(get_remote_address, app=app, default_limits=[])

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

EMAIL_USER = os.environ.get("EMAIL_USER")
EMAIL_PASS = os.environ.get("EMAIL_PASS")

# ── Routes ────────────────────────────────────────
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/projects")
def projects():
    return render_template("projects.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/ping")
def ping():
    return "OK", 200

# ── Contact Form ──────────────────────────────────
@app.route("/send-message", methods=["POST"])
@limiter.limit("5 per minute")
def send_message():
    name    = request.form.get("name", "").strip()
    email   = request.form.get("email", "").strip()
    message = request.form.get("message", "").strip()

    # Validation
    if not name or not email or not message:
        return jsonify({"error": "Please fill in all fields."}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Please enter a valid email address."}), 400
    if len(message) < 10:
        return jsonify({"error": "Message is too short. Please tell me more!"}), 400

    # Spam check
    spam_words = ["casino", "crypto", "bitcoin", "loan", "win money", "click here"]
    if any(word in message.lower() for word in spam_words):
        return jsonify({"error": "Your message looks like spam. Please try again."}), 400

    # AI reply
    ai_reply = f"Hi {name}, thanks for reaching out! I've received your message and will get back to you soon. — Pasupathi Ragavan"
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": (
                    f"Someone submitted a contact form on Pasupathi Ragavan's portfolio. "
                    f"Write a warm, friendly thank you reply. Mention their name. "
                    f"Reference what they said briefly. Sign off as Pasupathi Ragavan. Under 70 words.\n\n"
                    f"Name: {name}\nEmail: {email}\nMessage: {message}"
                )
            }]
        )
        ai_reply = response.content[0].text
    except Exception:
        pass

    # Send emails via Gmail SMTP
    try:
        if EMAIL_USER and EMAIL_PASS:
            # Email to Pasupathi (notification)
            notify = MIMEMultipart()
            notify["Subject"] = f"📬 New Portfolio Message from {name}"
            notify["From"]    = EMAIL_USER
            notify["To"]      = EMAIL_USER
            notify.attach(MIMEText(
                f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}", "plain"
            ))

            # Auto-reply to visitor
            autoreply = MIMEMultipart()
            autoreply["Subject"] = "Thanks for contacting Pasupathi Ragavan!"
            autoreply["From"]    = EMAIL_USER
            autoreply["To"]      = email
            autoreply.attach(MIMEText(ai_reply, "plain"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(EMAIL_USER, EMAIL_PASS)
                server.send_message(notify)
                server.send_message(autoreply)
    except Exception as e:
        print(f"Email error: {e}")

    return jsonify({"reply": ai_reply})


@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({"error": "Please wait a few seconds before sending again ⏳"}), 429


if __name__ == "__main__":
    app.run(debug=True)
