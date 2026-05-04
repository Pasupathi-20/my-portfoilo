from flask import Flask, render_template, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import smtplib
import re
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

limiter = Limiter(get_remote_address, app=app, default_limits=[])

EMAIL_USER = os.environ.get("EMAIL_USER")
EMAIL_PASS = os.environ.get("EMAIL_PASS")


BLOG_POSTS = [
    {
        "slug": "rain-sensing-wiper",
        "title": "From Manual to Automatic: Rain Sensing Wiper System",
        "excerpt": "Automating windshield wipers using Arduino and rain sensors to improve driving safety.",
        "category": "Arduino",
        "date": "Apr 20, 2026",
        "read_time": 5,
        "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
        "github": "#", 
        "content": """
            <h2>📌 Why I Built This</h2>
            <p>While riding during sudden rain, I noticed how distracting it is to manually control wipers. This gave me the idea to automate the process using a simple sensor-based system.</p>

            <h2>🎯 The Goal</h2>
            <ul>
                <li>Detect rain automatically</li>
                <li>Activate a wiper motor</li>
                <li>Reduce manual intervention</li>
            </ul>

            <h2>⚙️ How It Works</h2>
            <p>The rain sensor outputs a signal based on moisture level. I defined a threshold value in the Arduino code:</p>
            <ul>
                <li><strong>If moisture > threshold:</strong> Wiper ON</li>
                <li><strong>If moisture < threshold:</strong> Wiper OFF</li>
            </ul>

            <h2>⚠️ Challenges I Faced</h2>
            <h3>1. False Triggering</h3>
            <p>Even small moisture caused unwanted activation. <strong>Fix:</strong> Adjusted threshold values and tested multiple conditions.</p>
            
            <h3>2. Sensor Noise</h3>
            <p>Readings were inconsistent. <strong>Fix:</strong> Added delay and stabilized input reading.</p>

            <h2>✅ What I Learned</h2>
            <p>Importance of calibration in sensors, handling noisy signals, and interfacing relays safely.</p>
        """
    },
    {
        "slug": "iot-circuit-breaker",
        "title": "Designing an IoT-Based Circuit Breaker for Lineman Safety",
        "excerpt": "A smart system preventing unauthorized power switching to ensure safety for maintenance workers.",
        "category": "IoT",
        "date": "Apr 15, 2026",
        "read_time": 7,
        "image": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
        "github": "#",
        "content": """
            <h2>📌 Problem That Inspired This</h2>
            <p>In many electrical maintenance scenarios, linemen are at risk due to accidental power restoration. This can lead to serious injuries or fatalities.</p>

            <h2>🎯 Objective</h2>
            <ul>
                <li>Prevent unauthorized power switching</li>
                <li>Allow remote monitoring</li>
                <li>Ensure safety for maintenance workers</li>
            </ul>

            <h2>⚙️ Working Mechanism</h2>
            <ol>
                <li>System monitors breaker state</li>
                <li>Only authorized control is allowed</li>
                <li>If unsafe condition detected, power remains OFF and an alert is triggered</li>
            </ol>

            <h2>⚠️ Challenges Faced</h2>
            <h3>1. Reliable Switching</h3>
            <p>Ensuring relay operates correctly under load. <strong>Solution:</strong> Used proper relay module and tested with different conditions.</p>

            <h2>✅ Key Learnings</h2>
            <p>Safety-critical system design, real-world application of IoT, and the importance of fail-safe mechanisms.</p>
        """
    },
    {
        "slug": "bridge-monitoring",
        "title": "Building a Bridge Health Monitoring System Using IoT",
        "excerpt": "Using sensors and IoT to monitor bridge conditions in real-time and detect abnormal situations.",
        "category": "Raspberry Pi",
        "date": "Apr 10, 2026",
        "read_time": 6,
        "image": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80",
        "github": "#",
        "content": """
            <h2>📌 Why This Project Matters</h2>
            <p>Structural failures in bridges can cause major disasters. Early detection is crucial.</p>

            <h2>💡 Approach</h2>
            <p>Using sensors and IoT to collect data (vibration, environment), analyze conditions, and send alerts if needed.</p>

            <h2>⚙️ Working</h2>
            <p>Sensors continuously monitor conditions and send data to the controller. If values exceed safe limits, alerts are generated immediately.</p>

            <h2>✅ Learnings</h2>
            <ul>
                <li>IoT data handling</li>
                <li>Sensor integration</li>
                <li>Real-time monitoring systems</li>
            </ul>

            <h2>🚀 Future Scope</h2>
            <p>Cloud dashboard integration, AI prediction for structural decay, and wireless sensor networks.</p>
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

    if not EMAIL_USER or not EMAIL_PASS:
        return jsonify({
            "error": "Email service is not configured on server. Set EMAIL_USER and EMAIL_PASS."
        }), 500

    try:
        if EMAIL_USER and EMAIL_PASS:
            notify = MIMEMultipart()
            notify["Subject"] = f"New Portfolio Message from {name}"
            notify["From"]    = EMAIL_USER
            notify["To"]      = EMAIL_USER
            notify.attach(MIMEText(
                f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}", "plain"
            ))

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
        print(f"📧 Email delivery error: {e}")

    return jsonify({"reply": ai_reply})


@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({"error": "Please wait a few seconds before sending again ⏳"}), 429


if __name__ == "__main__":
    app.run(debug=True)
