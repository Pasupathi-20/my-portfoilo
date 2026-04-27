// ── Toast notification ────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Dark/Light Mode Toggle ──────────────────────
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ── Scroll Progress & Header Glass ────────────────
const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.getElementById('siteHeader');

window.addEventListener('scroll', () => {
  // Progress bar
  if (scrollProgress) {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = docHeight ? `${(scrollTop / docHeight) * 100}%` : '0%';
  }
  // Header glass effect
  if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Mobile Menu Toggle ───────────────────────────
const mobileToggle = document.getElementById('mobileToggle');
const mainNav = document.getElementById('mainNav');

if (mobileToggle && mainNav) {
  mobileToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header') && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
    }
  });
}

// ── Fade-in on scroll ─────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => fadeObserver.observe(el));
}

// ── Skill bars ────────────────────────────────────
const bars = document.querySelectorAll('.skill-bar-fill');
if (bars.length) {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.width = el.getAttribute('data-pct') + '%';
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

// ── Back to Top Button ───────────────────────────
c// ── Back to Top (Deep Scroll + Glassmorphism) ─────────────────────────
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  const showThreshold = 600; // px to consider "deep scroll"

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Show if scrolled past threshold OR past 25% of page (whichever is smaller)
    const isDeepScroll = scrollY > showThreshold || (docHeight > 0 && scrollY > docHeight * 0.25);
    
    backToTop.classList.toggle('visible', isDeepScroll);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
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

    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error'); return;
    }
    if (message.length < 10) {
      showToast('Message is too short. Please tell me more!', 'error'); return;
    }

    // Honeypot check
    if (contactForm.querySelector('.honeypot')?.value) return;

    btn.textContent = 'Sending...';
    btn.disabled    = true;

    const formData = new FormData(contactForm);

    try {
      const res = await fetch('/send-message', { method: 'POST', body: formData });
      if (res.status === 429) {
        showToast('Please wait a few seconds before sending again ⏳', 'error');
        btn.textContent = 'Send Message'; btn.disabled = false; return;
      }

      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
        btn.textContent = 'Send Message'; btn.disabled = false; return;
      }

      document.getElementById('replyText').textContent = data.reply;
      document.getElementById('aiReply').style.display = 'block';

      showToast("Thanks! Your message has been sent 😊", 'success');
      contactForm.reset();
      btn.textContent = 'Message Sent ✓';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 10000);

    } catch (err) {
      showToast('Oops! Something went wrong. Please try again.', 'error');
      btn.textContent = 'Send Message'; btn.disabled = false;
    }
  });
}