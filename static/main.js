// ── Toast notification ────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Sticky navbar shadow on scroll ───────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile hamburger menu ─────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ── Fade-in on scroll ─────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => fadeObserver.observe(el));

// ── Skill bars ────────────────────────────────────
const bars = document.querySelectorAll('.skill-bar-fill');
if (bars.length) {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const pct = el.getAttribute('data-pct');
        el.style.width = pct + '%';
        barObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(bar => barObserver.observe(bar));
}

// ── Typing effect ─────────────────────────────────
const typingEl = document.getElementById('typingText');
if (typingEl) {
  const phrases = [
    'Embedded Systems Engineer.',
    'IoT Developer.',
    'Flask & Python Builder.',
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    typingEl.textContent = deleting
      ? phrase.substring(0, ci--)
      : phrase.substring(0, ci++);

    let delay = deleting ? 50 : 80;
    if (!deleting && ci === phrase.length + 1) { delay = 1800; deleting = true; }
    if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 300; }
    setTimeout(type, delay);
  }
  type();
}

// ── Contact form ──────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn     = document.getElementById('submitBtn');
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error'); return;
    }
    if (message.length < 10) {
      showToast('Message is too short. Please tell me more!', 'error'); return;
    }

    btn.textContent = 'Sending...';
    btn.disabled    = true;

    // Send to Formspree + Flask simultaneously
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);

    const aiPromise = fetch('/send-message', { method: 'POST', body: formData });

    try {
      const aiRes = await aiPromise;
      if (aiRes.status === 429) {
        showToast('Please wait a few seconds before sending again ⏳', 'error');
        btn.textContent = 'Send Message';
        btn.disabled    = false;
        return;
      }

      const data = await aiRes.json();

      if (data.error) {
        showToast(data.error, 'error');
        btn.textContent = 'Send Message';
        btn.disabled    = false;
        return;
      }

      document.getElementById('replyText').textContent = data.reply;
      document.getElementById('aiReply').style.display = 'block';

      showToast("Thanks! Your message has been sent 😊", 'success');
      this.reset();
      btn.textContent = 'Message Sent ✓';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 10000);

    } catch (err) {
      showToast('Oops! Something went wrong. Please try again.', 'error');
      btn.textContent = 'Send Message';
      btn.disabled    = false;
    }
  });
}
