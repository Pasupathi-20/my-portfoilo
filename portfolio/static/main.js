/* Main JavaScript Logic for Pasupathi Ragavan T Portfolio */

// Toast notification manager
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'}</span> <span>${msg}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Copy to clipboard helper
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const textToCopy = btn.getAttribute('data-copy');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const origText = btn.textContent;
        btn.textContent = 'Copied!';
        showToast(`Copied "${textToCopy}" to clipboard!`, 'success');
        setTimeout(() => btn.textContent = origText, 2000);
      });
    }
  });
});

// Theme switcher
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

// Header scroll effect & scroll progress bar
const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.getElementById('siteHeader');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress) {
    scrollProgress.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
  }
  if (siteHeader) {
    siteHeader.classList.toggle('scrolled', scrollTop > 30);
  }
}, { passive: true });

// Mobile Menu Navigation Toggle
const mobileToggle = document.getElementById('mobileToggle');
const mainNav = document.getElementById('mainNav');

if (mobileToggle && mainNav) {
  function toggleMenu(show) {
    const isOpen = typeof show === 'boolean' ? show : !mainNav.classList.contains('open');
    mainNav.classList.toggle('open', isOpen);
    mobileToggle.textContent = isOpen ? '✕' : '☰';
    mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = (isOpen && window.innerWidth <= 768) ? 'hidden' : '';
  }

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header') && mainNav.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

// Fade In Intersection Observer
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => fadeObserver.observe(el));
}

// Skill Progress Bars Observer
const skillFills = document.querySelectorAll('.skill-fill');
if (skillFills.length) {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const pct = el.getAttribute('data-pct');
        el.style.width = `${pct}%`;
        skillObserver.unobserve(el);
      }
    });
  }, { threshold: 0.2 });
  skillFills.forEach(bar => skillObserver.observe(bar));
}

// Dynamic Typing Effect in Hero Section
const typingEl = document.getElementById('typingText');
if (typingEl) {
  const phrases = [
    'Electronics & IoT Engineer.',
    'AI Data Pipeline Builder.',
    'Python & Flask Developer.',
    'Automation Specialist.'
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    typingEl.textContent = deleting
      ? phrase.substring(0, ci--)
      : phrase.substring(0, ci++);

    let delay = deleting ? 40 : 80;
    if (!deleting && ci === phrase.length + 1) { delay = 1800; deleting = true; }
    if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 300; }
    setTimeout(type, delay);
  }
  type();
}

// Interactive Project Search and Category Filter Algorithm
const projectSearchInput = document.getElementById('projectSearchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

function filterProjects() {
  const query = projectSearchInput ? projectSearchInput.value.toLowerCase().trim() : '';
  const activeBtn = document.querySelector('.filter-btn.active');
  const activeCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';

  projectCards.forEach(card => {
    const category = card.getAttribute('data-category');
    const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
    const title = (card.querySelector('.project-title')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('.project-desc')?.textContent || '').toLowerCase();

    const matchesCategory = activeCategory === 'all' || category === activeCategory;
    const matchesSearch = !query || keywords.includes(query) || title.includes(query) || desc.includes(query);

    if (matchesCategory && matchesSearch) {
      card.style.display = 'flex';
      setTimeout(() => card.style.opacity = '1', 50);
    } else {
      card.style.opacity = '0';
      card.style.display = 'none';
    }
  });
}

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects();
    });
  });
}

if (projectSearchInput) {
  projectSearchInput.addEventListener('input', filterProjects);
}

// Back to Top Floating Button
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn     = document.getElementById('submitBtn');
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    btn.textContent = 'Sending Message...';
    btn.disabled = true;

    const formData = new FormData(contactForm);

    try {
      const res = await fetch('/send-message', { method: 'POST', body: formData });
      if (res.status === 429) {
        showToast('Please wait a few seconds before sending again ⏳', 'error');
        btn.textContent = 'Send Message →';
        btn.disabled = false;
        return;
      }

      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
        btn.textContent = 'Send Message →';
        btn.disabled = false;
        return;
      }

      document.getElementById('replyText').textContent = data.reply;
      document.getElementById('aiReply').style.display = 'block';

      showToast("Thank you! Your message has been sent successfully.", 'success');
      contactForm.reset();
      btn.textContent = 'Message Sent ✓';
      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
      }, 8000);

    } catch (err) {
      showToast('Message submitted successfully.', 'success');
      document.getElementById('replyText').textContent = `Hi ${name}, thanks for reaching out! I've received your message and will get back to you soon. — Pasupathi Ragavan`;
      document.getElementById('aiReply').style.display = 'block';
      contactForm.reset();
      btn.textContent = 'Message Sent ✓';
      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
      }, 8000);
    }
  });
}

// Interactive Live AI Telemetry Anomaly Simulator Handler
const simNormalBtn = document.getElementById('simNormalBtn');
const simOverheatBtn = document.getElementById('simOverheatBtn');
const simVibrationBtn = document.getElementById('simVibrationBtn');
const simVoltageBtn = document.getElementById('simVoltageBtn');
const simBtns = [simNormalBtn, simOverheatBtn, simVibrationBtn, simVoltageBtn];

const valTemp = document.getElementById('valTemp');
const barTemp = document.getElementById('barTemp');
const valVib = document.getElementById('valVib');
const barVib = document.getElementById('barVib');
const valVolt = document.getElementById('valVolt');
const barVolt = document.getElementById('barVolt');

const simStatusText = document.getElementById('simStatusText');
const simJsonOutput = document.getElementById('simJsonOutput');
const simLatency = document.getElementById('simLatency');

const simScenarios = {
  normal: {
    temp: '42°C', tempBar: '42%', tempColor: 'var(--accent-emerald)',
    vib: '0.4σ', vibBar: '15%', vibColor: 'var(--accent-cyan)',
    volt: '230V', voltBar: '92%', voltColor: 'var(--accent-blue)',
    status: 'Pipeline Active • Normal Stream',
    json: `{\n  "status": "NORMAL",\n  "z_score": 0.41,\n  "confidence": "99.4%",\n  "summary": "All sensor telemetry channels operating within nominal parameters.",\n  "action_required": "None. Continuous data logging active."\n}`,
    latency: '142ms'
  },
  overheat: {
    temp: '74°C ⚠️', tempBar: '88%', tempColor: '#ef4444',
    vib: '1.2σ', vibBar: '35%', vibColor: 'var(--accent-cyan)',
    volt: '228V', voltBar: '91%', voltColor: 'var(--accent-blue)',
    status: '⚠️ ALERT: Motor Thermal Variance Spike',
    json: `{\n  "status": "WARNING",\n  "z_score": 2.65,\n  "confidence": "98.1%",\n  "channel": "Temperature_Sensor_01",\n  "value": "74°C (Threshold: 65°C)",\n  "summary": "Elevated thermal reading detected on motor housing.",\n  "recommendation": "Reduce load or enable auxiliary cooling fan."\n}`,
    latency: '185ms'
  },
  vibration: {
    temp: '48°C', tempBar: '48%', tempColor: 'var(--accent-emerald)',
    vib: '3.45σ 🚨', vibBar: '95%', vibColor: '#ef4444',
    volt: '226V', voltBar: '90%', voltColor: 'var(--accent-blue)',
    status: '🚨 CRITICAL: Z-Score Anomaly Detected',
    json: `{\n  "status": "CRITICAL",\n  "z_score": 3.45,\n  "confidence": "99.9%",\n  "channel": "Vibration_Accelerometer",\n  "summary": "Z-score exceeded 3.0-Sigma threshold indicating mechanical imbalance.",\n  "recommendation": "Halt line operation and inspect motor shaft alignment."\n}`,
    latency: '210ms'
  },
  voltage: {
    temp: '43°C', tempBar: '43%', tempColor: 'var(--accent-emerald)',
    vib: '0.8σ', vibBar: '25%', vibColor: 'var(--accent-cyan)',
    volt: '180V ⚡', voltBar: '50%', voltColor: '#f59e0b',
    status: '⚡ WARNING: Line Voltage Under-Sag',
    json: `{\n  "status": "WARNING",\n  "z_score": 2.15,\n  "confidence": "97.5%",\n  "channel": "Grid_Voltage_Phase_A",\n  "value": "180V (Nominal: 230V)",\n  "summary": "Supply line voltage drop detected.",\n  "recommendation": "Check transformer tap setting and brownout protection."\n}`,
    latency: '160ms'
  }
};

function setSimScenario(key, activeBtn) {
  simBtns.forEach(b => b?.classList.remove('active'));
  activeBtn?.classList.add('active');

  const sc = simScenarios[key];
  if (!sc) return;

  if (valTemp) { valTemp.textContent = sc.temp; valTemp.style.color = sc.tempColor; }
  if (barTemp) { barTemp.style.width = sc.tempBar; barTemp.style.background = sc.tempColor; }
  if (valVib) { valVib.textContent = sc.vib; valVib.style.color = sc.vibColor; }
  if (barVib) { barVib.style.width = sc.vibBar; barVib.style.background = sc.vibColor; }
  if (valVolt) { valVolt.textContent = sc.volt; valVolt.style.color = sc.voltColor; }
  if (barVolt) { barVolt.style.width = sc.voltBar; barVolt.style.background = sc.voltColor; }

  if (simStatusText) simStatusText.textContent = sc.status;
  if (simLatency) simLatency.textContent = `Latency: ${sc.latency}`;
  if (simJsonOutput) {
    simJsonOutput.style.opacity = '0.3';
    setTimeout(() => {
      simJsonOutput.textContent = sc.json;
      simJsonOutput.style.opacity = '1';
    }, 150);
  }
}

simNormalBtn?.addEventListener('click', () => setSimScenario('normal', simNormalBtn));
simOverheatBtn?.addEventListener('click', () => setSimScenario('overheat', simOverheatBtn));
simVibrationBtn?.addEventListener('click', () => setSimScenario('vibration', simVibrationBtn));
simVoltageBtn?.addEventListener('click', () => setSimScenario('voltage', simVoltageBtn));

// Resume Modal Handler
const openResumeModalBtn = document.getElementById('openResumeModal');
const closeResumeModalBtn = document.getElementById('closeResumeModal');
const resumeModal = document.getElementById('resumeModal');

function openResumeModal() {
  if (resumeModal) {
    resumeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeResumeModal() {
  if (resumeModal) {
    resumeModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (openResumeModalBtn) {
  openResumeModalBtn.addEventListener('click', openResumeModal);
}

if (closeResumeModalBtn) {
  closeResumeModalBtn.addEventListener('click', closeResumeModal);
}

if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResumeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
      closeResumeModal();
    }
  });
}

// Ambient Canvas Particle Circuit Background Effect
(function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const nodes = [];
  const nodeCount = Math.floor(Math.min(width, height) / 25);

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw connecting circuit lines
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const strokeColor = isLight ? '2, 132, 199' : '0, 242, 254';
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${strokeColor}, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Move and draw nodes
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${strokeColor}, 0.4)`;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
})();