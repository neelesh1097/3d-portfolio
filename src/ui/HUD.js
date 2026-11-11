import confetti from 'canvas-confetti';
import { resumeData } from '../data/resumeData.js';

export class HUD {
  constructor(onNavClick, onResetCar, onToggleMute, onHonk) {
    this.onNavClick = onNavClick;
    this.onResetCar = onResetCar;
    this.onToggleMute = onToggleMute;
    this.onHonk = onHonk;

    this.activeTrigger = null;
    this.isModalOpen = false;

    this.createElements();
    this.setupListeners();
  }

  createElements() {
    this.container = document.createElement('div');
    this.container.id = 'hud-container';
    this.container.innerHTML = `
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="brand">
          <div class="brand-avatar">NY</div>
          <div class="brand-text">
            <span class="brand-name">Neelesh Yadav</span>
            <span class="brand-role">Full-Stack & AI Developer</span>
          </div>
        </div>

        <nav class="nav-links">
          <button class="nav-btn" data-zone="spawn">🏠 Spawn</button>
          <button class="nav-btn" data-zone="projects">💼 Projects</button>
          <button class="nav-btn" data-zone="experience">🏢 Experience</button>
          <button class="nav-btn" data-zone="skills">⚡ Skills</button>
          <button class="nav-btn" data-zone="contact">📬 Contact</button>
        </nav>

        <div class="nav-actions">
          <button id="btn-sound" class="icon-btn" title="Toggle Sound">🔊</button>
          <button id="btn-reset" class="icon-btn" title="Reset Car [R]">🔄</button>
          <button id="btn-about" class="pill-btn">📄 About Me</button>
        </div>
      </header>

      <!-- Bottom Speedometer & Controls Helper -->
      <div class="bottom-hud">
        <div class="controls-card">
          <div class="controls-title">DRIVING CONTROLS</div>
          <div class="keys-grid">
            <div class="key-row">
              <span class="key-badge">W / ↑</span> <span>Accelerate</span>
            </div>
            <div class="key-row">
              <span class="key-badge">A / D / ← / →</span> <span>Steer</span>
            </div>
            <div class="key-row">
              <span class="key-badge">S / ↓</span> <span>Reverse</span>
            </div>
            <div class="key-row">
              <span class="key-badge">SPACE</span> <span>Brake / Interact</span>
            </div>
            <div class="key-row">
              <span class="key-badge">R</span> <span>Reset / Flip Car</span>
            </div>
            <div class="key-row">
              <span class="key-badge">H</span> <span>Honk Horn</span>
            </div>
          </div>
        </div>

        <div class="speed-card">
          <div class="speed-value" id="speed-display">0</div>
          <div class="speed-unit">KM/H</div>
        </div>
      </div>

      <!-- Action Prompt Banner (Triggered when near an interactive object) -->
      <div id="action-prompt" class="action-prompt hidden">
        <div class="prompt-icon">✦</div>
        <div class="prompt-content">
          <div class="prompt-title" id="prompt-title">INTERACT</div>
          <div class="prompt-sub" id="prompt-sub">Press [SPACE] or Tap Here</div>
        </div>
        <div class="prompt-btn">OPEN</div>
      </div>

      <!-- Modal Dialog -->
      <div id="modal-overlay" class="modal-overlay hidden">
        <div class="modal-card">
          <button id="modal-close" class="modal-close">&times;</button>
          <div id="modal-content"></div>
        </div>
      </div>

      <!-- Mobile Touch Controls -->
      <div class="mobile-controls">
        <div class="dpad">
          <button class="touch-btn" id="touch-left">◀</button>
          <div class="dpad-center"></div>
          <button class="touch-btn" id="touch-right">▶</button>
        </div>
        <div class="pedals">
          <button class="touch-pedal pedal-reverse" id="touch-down">REV</button>
          <button class="touch-pedal pedal-brake" id="touch-brake">BRAKE</button>
          <button class="touch-pedal pedal-gas" id="touch-up">GAS</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.promptEl = document.getElementById('action-prompt');
    this.promptTitle = document.getElementById('prompt-title');
    this.promptSub = document.getElementById('prompt-sub');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalContent = document.getElementById('modal-content');
    this.speedDisplay = document.getElementById('speed-display');
  }

  setupListeners() {
    // Navigation Zone teleport/fly-to clicks
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const zone = e.target.getAttribute('data-zone');
        if (this.onNavClick) this.onNavClick(zone);
      });
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound');
    soundBtn.addEventListener('click', () => {
      if (this.onToggleMute) {
        const isMuted = this.onToggleMute();
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
      }
    });

    // Reset car button
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (this.onResetCar) this.onResetCar();
    });

    // About Me Modal button
    document.getElementById('btn-about').addEventListener('click', () => {
      this.openAboutModal();
    });

    // Close Modal
    document.getElementById('modal-close').addEventListener('click', () => {
      this.closeModal();
    });

    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    // Action Prompt Click
    this.promptEl.addEventListener('click', () => {
      this.triggerActiveInteraction();
    });

    // Space key triggers interaction when near an object
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.activeTrigger && !this.isModalOpen) {
        this.triggerActiveInteraction();
      }
      if (e.code === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });

    // Setup Mobile Touch Controls
    this.setupTouchControls();
  }

  setupTouchControls() {
    const bindTouch = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      const setKey = (val) => {
        window.dispatchEvent(
          new KeyboardEvent(val ? 'keydown' : 'keyup', { code: keyName })
        );
      };
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setKey(true);
      });
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        setKey(false);
      });
      el.addEventListener('mousedown', () => setKey(true));
      el.addEventListener('mouseup', () => setKey(false));
      el.addEventListener('mouseleave', () => setKey(false));
    };

    bindTouch('touch-up', 'KeyW');
    bindTouch('touch-down', 'KeyS');
    bindTouch('touch-left', 'KeyA');
    bindTouch('touch-right', 'KeyD');
    bindTouch('touch-brake', 'Space');
  }

  setActiveTrigger(trigger) {
    this.activeTrigger = trigger;
    if (!trigger) {
      this.promptEl.classList.add('hidden');
      return;
    }

    this.promptEl.classList.remove('hidden');

    if (trigger.type === 'project') {
      this.promptTitle.textContent = trigger.data.title;
      this.promptSub.textContent = `[SPACE] or Click to view project details`;
    } else if (trigger.type === 'experience') {
      this.promptTitle.textContent = `${trigger.data.company} — ${trigger.data.role}`;
      this.promptSub.textContent = `[SPACE] or Click to view career highlights`;
    } else if (trigger.type === 'social') {
      this.promptTitle.textContent = `${trigger.data.title}: ${trigger.data.subtitle}`;
      this.promptSub.textContent = `[SPACE] or Click to visit`;
    }
  }

  triggerActiveInteraction() {
    if (!this.activeTrigger) return;

    if (this.activeTrigger.type === 'project') {
      this.openProjectModal(this.activeTrigger.data);
    } else if (this.activeTrigger.type === 'experience') {
      this.openExperienceModal(this.activeTrigger.data);
    } else if (this.activeTrigger.type === 'social') {
      window.open(this.activeTrigger.data.url, '_blank', 'noopener,noreferrer');
    }
  }

  openProjectModal(project) {
    this.isModalOpen = true;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    this.modalContent.innerHTML = `
      <div class="modal-badge" style="background: #${project.color.toString(16)};">
        ${project.category}
      </div>
      <h2 class="modal-title">${project.title}</h2>
      <p class="modal-tagline">${project.tagline}</p>
      
      <div class="modal-tech-stack">
        ${project.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
      </div>

      <div class="modal-section-title">Overview</div>
      <p class="modal-body-text">${project.description}</p>

      <div class="modal-section-title">Key Highlights</div>
      <ul class="modal-highlights">
        ${project.highlights.map((h) => `<li>${h}</li>`).join('')}
      </ul>

      <div class="modal-actions">
        <a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="primary-btn">
          GitHub Repository ➔
        </a>
      </div>
    `;

    this.modalOverlay.classList.remove('hidden');
  }

  openExperienceModal(exp) {
    this.isModalOpen = true;
    this.modalContent.innerHTML = `
      <div class="modal-badge">${exp.type}</div>
      <h2 class="modal-title">${exp.company}</h2>
      <p class="modal-tagline">${exp.role} • ${exp.period}</p>
      <p class="modal-location">📍 ${exp.location}</p>

      <div class="modal-section-title">Responsibilities & Impact</div>
      <p class="modal-body-text">${exp.description}</p>
    `;
    this.modalOverlay.classList.remove('hidden');
  }

  openAboutModal() {
    this.isModalOpen = true;
    this.modalContent.innerHTML = `
      <div class="modal-badge">About Me</div>
      <h2 class="modal-title">${resumeData.name}</h2>
      <p class="modal-tagline">${resumeData.title}</p>
      <p class="modal-location">📍 ${resumeData.location} | 🎓 ${resumeData.subtitle}</p>

      <div class="modal-section-title">Professional Summary</div>
      <p class="modal-body-text">${resumeData.summary}</p>

      <div class="modal-section-title">Technical Skillset</div>
      <div class="skills-categories">
        ${resumeData.skills
          .map(
            (cat) => `
          <div class="skill-cat-card">
            <div class="skill-cat-title">${cat.category}</div>
            <div class="skill-cat-items">
              ${cat.items.map((i) => `<span class="tech-tag">${i}</span>`).join('')}
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="modal-actions">
        <a href="${resumeData.socials.github}" target="_blank" rel="noopener" class="primary-btn">GitHub</a>
        <a href="${resumeData.socials.linkedin}" target="_blank" rel="noopener" class="secondary-btn">LinkedIn</a>
        <a href="mailto:${resumeData.socials.email}" class="secondary-btn">Email Me</a>
      </div>
    `;
    this.modalOverlay.classList.remove('hidden');
  }

  closeModal() {
    this.modalOverlay.classList.add('hidden');
    this.isModalOpen = false;
  }

  updateSpeed(speed) {
    const kmh = Math.round(speed * 3.6);
    this.speedDisplay.textContent = kmh;
  }
}
