from flask import Flask, render_template, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import smtplib
import re
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# Automatically load .env file if present locally
env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                parts = line.strip().split("=", 1)
                if len(parts) == 2:
                    os.environ.setdefault(parts[0].strip(), parts[1].strip())

limiter = Limiter(get_remote_address, app=app, default_limits=[])

EMAIL_USER = os.environ.get("EMAIL_USER")
EMAIL_PASS = os.environ.get("EMAIL_PASS")


BLOG_POSTS = [
    {
        "slug": "ai-sensor-diagnostic-pipeline",
        "title": "IoT Sensor Data Explainer: AI Powered Diagnostic Pipeline",
        "excerpt": "End-to-end AI data pipeline in Python applying z-score anomaly detection and GPT-4o / Groq LLMs for automated plain-English diagnostic reports.",
        "category": "AI & LLM Pipelines",
        "date": "May 10, 2026",
        "read_time": 6,
        "image": "/static/images/project_ai_diagnostic.png",
        "github": "https://github.com/Pasupathi-20",
        "content": """
            <h2>📌 Objective & Background</h2>
            <p>Industrial IoT systems stream high volumes of telemetry data. Manually interpreting sensor readings to diagnose hardware failures is slow and error-prone. This project builds an automated AI diagnostic pipeline that ingests sensor streams, flags anomalies using statistical algorithms, and leverages LLMs to produce structured diagnostic reports.</p>

            <h2>⚙️ Pipeline Architecture</h2>
            <ul>
                <li><strong>Data Ingestion:</strong> Python pipeline reading multi-channel CSV sensor streams (vibration, temperature, voltage).</li>
                <li><strong>Statistical Anomaly Detection:</strong> Computes rolling Z-score / 2-Sigma variance to isolate abnormal spikes.</li>
                <li><strong>LLM Inference (Groq & OpenAI APIs):</strong> Formats detected anomalies into engineered system prompts for GPT-4o-mini and LLaMA 3.3.</li>
                <li><strong>Structured JSON Output:</strong> Enforces JSON schema outputs from the LLM for reliable frontend rendering.</li>
            </ul>

            <h2>💡 Key Learnings</h2>
            <p>Mastered prompt engineering for deterministic JSON extraction, integrating statistical filtering before LLM calls to minimize API cost, and building full-stack dark-mode dashboards.</p>
        """
    },
    {
        "slug": "smart-iot-alert-engine",
        "title": "Smart IoT Alert System — Real Time AI Alert Engine",
        "excerpt": "AI-powered real-time alert system using Groq LLM API to classify multi-channel sensor severity into CRITICAL, WARNING, and NORMAL states.",
        "category": "AI & LLM Pipelines",
        "date": "May 02, 2026",
        "read_time": 7,
        "image": "/static/images/project_smart_alert.png",
        "github": "https://github.com/Pasupathi-20",
        "content": """
            <h2>📌 Problem Statement</h2>
            <p>Traditional threshold alerts trigger false positives or miss multi-factor failures (e.g. slight temperature rise combined with voltage drop). An intelligent decision engine is needed to evaluate multi-sensor context.</p>

            <h2>🎯 Implementation Details</h2>
            <ul>
                <li>Simulated 4 sensor channels: Temperature, Humidity, Vibration, and Voltage.</li>
                <li>Evaluated 3 real-world failure scenarios including motor overheat (72°C) and sudden line voltage drop.</li>
                <li>Groq API integration providing real-time severity classification with recommended action steps.</li>
            </ul>
        """
    },
    {
        "slug": "rain-sensing-wiper",
        "title": "From Manual to Automatic: Rain Sensing Wiper System",
        "excerpt": "Automating windshield wipers using Arduino, rain sensors, and servo motors to improve driving safety.",
        "category": "Arduino & Microcontrollers",
        "date": "Apr 20, 2026",
        "read_time": 5,
        "image": "/static/images/project_rain_wiper.png",
        "github": "https://github.com/Pasupathi-20/my-projects/tree/main/rain-sensing-wipe", 
        "content": """
            <h2>📌 Why I Built This</h2>
            <p>While riding during sudden rain, I noticed how distracting it is to manually control wipers. This inspired me to build a state-machine driven sensor response system.</p>

            <h2>⚙️ How It Works</h2>
            <p>The rain sensor outputs an analog signal based on moisture level. The Arduino calculates threshold values and controls servo motor sweep speeds dynamically.</p>
        """
    },
    {
        "slug": "bridge-monitoring",
        "title": "Building a Bridge Health Monitoring System Using IoT",
        "excerpt": "Using sensor networks and NodeMCU to monitor bridge conditions in real-time and push mobile alert notifications.",
        "category": "IoT & Cloud",
        "date": "Apr 10, 2026",
        "read_time": 6,
        "image": "/static/images/project_bridge_monitoring.png",
        "github": "https://github.com/Pasupathi-20/my-projects/tree/main/bridge-monitoring",
        "content": """
            <h2>📌 Why Structural Monitoring Matters</h2>
            <p>Structural wear in bridges can lead to catastrophic failure. Early predictive maintenance using IoT sensors saves lives and infrastructure costs.</p>

            <h2>💡 Approach</h2>
            <p>Deploying distributed vibration and tilt sensor nodes transmitting telemetry to cloud endpoints with real-time threshold alerts.</p>
        """
    }
]

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
    """Keep-alive endpoint for GitHub Actions"""
    return "OK", 200

@app.route("/blog")
def blog():
    return render_template("blog.html", posts=BLOG_POSTS)

@app.route("/blog/<slug>")
def blog_post(slug):
    post = next((p for p in BLOG_POSTS if p["slug"] == slug), None)
    if not post: return "Post not found", 404
    
    idx = BLOG_POSTS.index(post)
    prev_post = BLOG_POSTS[idx - 1] if idx > 0 else None
    next_post = BLOG_POSTS[idx + 1] if idx < len(BLOG_POSTS) - 1 else None
    
    return render_template("blog_post.html", post=post, prev_post=prev_post, next_post=next_post)

@app.route("/send-message", methods=["POST"])
@limiter.limit("5 per minute")
def send_message():
    name    = request.form.get("name", "").strip()
    email   = request.form.get("email", "").strip()
    message = request.form.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Please fill in all fields."}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Please enter a valid email address."}), 400
    if len(message) < 10:
        return jsonify({"error": "Message is too short. Please tell me more!"}), 400

    if request.form.get("website"):
        return jsonify({"error": "Spam detected."}), 400

    spam_words = ["casino", "crypto", "bitcoin", "loan", "win money", "click here", "prize", "viagra"]
    if any(word in message.lower() for word in spam_words):
        return jsonify({"error": "Your message looks like spam. Please try again."}), 400

    ai_reply = f"Hi {name}, thanks for reaching out! I've received your message and will get back to you soon. — Pasupathi Ragavan"

    # Send real email notifications if EMAIL_USER and EMAIL_PASS environment variables are configured
    if EMAIL_USER and EMAIL_PASS:
        try:
            # 1. Notification email to Pasupathi
            notify = MIMEMultipart()
            notify["Subject"] = f"New Portfolio Inquiry from {name}"
            notify["From"]    = EMAIL_USER
            notify["To"]      = EMAIL_USER
            notify.attach(MIMEText(
                f"New contact form submission:\n\nName: {name}\nEmail: {email}\n\nMessage:\n{message}", "plain", "utf-8"
            ))

            # 2. Rich HTML Auto-Reply Email to the visitor
            autoreply = MIMEMultipart("alternative")
            autoreply["Subject"] = "Thank you for reaching out — Pasupathi Ragavan T"
            autoreply["From"]    = f"Pasupathi Ragavan T <{EMAIL_USER}>"
            autoreply["To"]      = email

            plain_text = f"""Hi {name},

Thank you for reaching out through my portfolio website!

I have received your message regarding:
"{message}"

I will review your inquiry and get back to you shortly.

Best regards,
Pasupathi Ragavan T
Electronics & IoT Engineer | AI & Automation Specialist
Website: https://pasupathis-portfoilo.onrender.com
LinkedIn: https://linkedin.com/in/pasupathi-ragavan-t-5660a1238
GitHub: https://github.com/Pasupathi-20
"""

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 20px; }}
                    .email-card {{ max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
                    .header {{ border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px; text-align: center; }}
                    .logo-title {{ font-size: 22px; font-weight: 700; color: #00f2fe; margin: 0; }}
                    .sub-title {{ font-size: 13px; color: #9ca3af; margin-top: 4px; }}
                    .content {{ font-size: 15px; line-height: 1.7; color: #e5e7eb; }}
                    .msg-box {{ background: rgba(0, 242, 254, 0.08); border-left: 4px solid #00f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic; color: #cbd5e1; }}
                    .btn-group {{ margin: 25px 0; text-align: center; }}
                    .btn {{ display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00f2fe, #4facfe); color: #000000 !important; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 14px; margin: 0 5px; }}
                    .footer {{ border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 30px; font-size: 13px; color: #6b7280; text-align: center; }}
                    .footer a {{ color: #00f2fe; text-decoration: none; margin: 0 8px; }}
                </style>
            </head>
            <body>
                <div class="email-card">
                    <div class="header">
                        <h2 class="logo-title">Pasupathi Ragavan T</h2>
                        <div class="sub-title">Electronics & IoT Engineer • AI & Automation Developer</div>
                    </div>
                    <div class="content">
                        <p>Hi <strong>{name}</strong>,</p>
                        <p>Thank you for reaching out through my portfolio website! I have received your message and will review it as soon as possible.</p>
                        
                        <div class="msg-box">
                            <strong>Your Message:</strong><br>
                            "{message}"
                        </div>

                        <p>I look forward to discussing potential opportunities and collaborations with you.</p>

                        <div class="btn-group">
                            <a href="https://pasupathis-portfoilo.onrender.com" class="btn">View Live Portfolio ↗</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Pasupathi Ragavan T • Coimbatore, Tamil Nadu, India</p>
                        <p>
                            <a href="https://github.com/Pasupathi-20">GitHub</a> | 
                            <a href="https://linkedin.com/in/pasupathi-ragavan-t-5660a1238">LinkedIn</a> | 
                            <a href="mailto:pasupathiragavan2004@gmail.com">Email</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """

            autoreply.attach(MIMEText(plain_text, "plain", "utf-8"))
            autoreply.attach(MIMEText(html_content, "html", "utf-8"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(EMAIL_USER, EMAIL_PASS)
                server.send_message(notify)
                server.send_message(autoreply)
            print(f"[Email] Notification and HTML auto-reply sent successfully for {email}")
        except Exception as e:
            print(f"[Email] Delivery error: {e}")
    else:
        print("[Email] Note: EMAIL_USER and EMAIL_PASS not set. Simulating contact form response.")

    return jsonify({"reply": ai_reply})


@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({"error": "Please wait a few seconds before sending again ⏳"}), 429


if __name__ == "__main__":
    app.run(debug=True)