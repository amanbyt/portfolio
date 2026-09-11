/**
 * AMAN KUMAR SINGH — 3D PORTFOLIO INTERACTIONS & CONTROLS
 * Handles: 3D card tilt physics, Web Audio synthesizer,
 * scroll spy, HUD sticky states, mobile navigation, and contact form.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. WEB AUDIO SYNTHESIZER FOR CYBER MICRO-INTERACTIONS
  // =========================================================================
  let audioCtx = null;
  let isAudioMuted = true; // Default muted for respectful UX

  try {
    isAudioMuted = localStorage.getItem('portfolioAudioMuted') !== 'false';
  } catch (error) {
    // Storage can be unavailable in private or restricted browser contexts.
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  window.playSfx = function (type) {
    if (isAudioMuted) return;
    initAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'hover') {
      // Soft high-frequency subtle tick
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'click') {
      // Crisp cyber electronic chirp
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'mode') {
      // Cyber chord transition
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.04, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + 0.35);
      });
    }
  };

  // Audio Toggle UI
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');

  function updateAudioToggle() {
    if (!audioToggleBtn || !audioIcon) return;
    const label = isAudioMuted ? 'Audio FX Muted (Click to Enable)' : 'Audio FX Active (Click to Mute)';
    audioIcon.textContent = isAudioMuted ? '🔇' : '🔊';
    audioToggleBtn.title = label;
    audioToggleBtn.setAttribute('aria-label', label);
  }

  if (audioToggleBtn && audioIcon) {
    updateAudioToggle();
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      isAudioMuted = !isAudioMuted;
      try {
        localStorage.setItem('portfolioAudioMuted', String(isAudioMuted));
      } catch (error) {
        // The toggle still works if the preference cannot be persisted.
      }
      updateAudioToggle();
      if (!isAudioMuted) {
        window.playSfx('mode');
      }
    });
  }

  // =========================================================================
  // 1b. SKILL RADAR SCANNER — Data-Driven Blips from Portfolio Content
  // =========================================================================
  function initSkillRadar() {
    const radar = document.getElementById('skillRadar');
    const telTools = document.getElementById('telTools');
    const telCerts = document.getElementById('telCerts');
    const telProjects = document.getElementById('telProjects');
    const telStatus = document.getElementById('telStatus');
    if (!radar) return;

    // Count actual portfolio items from the DOM
    const toolCount = document.querySelectorAll('#skills .tool-3d-card').length;
    const certCount = document.querySelectorAll('#certifications .cert-card').length;
    const projectCount = document.querySelectorAll('#projects .featured-project-card, #projects .project-item-card').length;
    const totalBlips = toolCount + certCount;

    // Place blips on the radar — distribute in a circular pattern
    const centerX = 75; // px, center of 150px radar
    const centerY = 75;

    function addBlip(index, total, isCert, delay) {
      const blip = document.createElement('div');
      blip.className = 'radar-blip' + (isCert ? ' blip-cert' : '');

      // Distribute around center with some randomness
      const angle = (index / total) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const minR = 15;
      const maxR = 64;
      const radius = minR + Math.random() * (maxR - minR);
      const x = centerX + Math.cos(angle) * radius - 3; // -3 for half the blip width
      const y = centerY + Math.sin(angle) * radius - 3;

      blip.style.left = x + 'px';
      blip.style.top = y + 'px';
      blip.style.opacity = '0';
      blip.style.animationDelay = (delay * 0.15) + 's';

      radar.appendChild(blip);

      // Fade-in with staggered delay for scanning effect
      setTimeout(() => {
        blip.style.opacity = '1';
      }, delay * 150 + 300);
    }

    // Generate blips — gold for tools, cyan for certs
    let blipIndex = 0;
    for (let i = 0; i < toolCount; i++) {
      addBlip(blipIndex, totalBlips, false, blipIndex);
      blipIndex++;
    }
    for (let i = 0; i < certCount; i++) {
      addBlip(blipIndex, totalBlips, true, blipIndex);
      blipIndex++;
    }

    // Populate telemetry readout with staggered typewriter effect
    setTimeout(() => {
      if (telTools) telTools.textContent = toolCount + ' DETECTED';
    }, 400);
    setTimeout(() => {
      if (telCerts) telCerts.textContent = certCount + ' VERIFIED';
    }, 800);
    setTimeout(() => {
      if (telProjects) telProjects.textContent = projectCount + ' ACTIVE';
    }, 1200);
    setTimeout(() => {
      if (telStatus) telStatus.textContent = totalBlips + ' HIGHLIGHTS';
    }, totalBlips * 150 + 500);
  }

  // Run after DOM is fully rendered
  window.addEventListener('load', initSkillRadar);

  // =========================================================================
  // 2. 3D CARD TILT PHYSICS WITH DYNAMIC SPECULAR SHINE
  // =========================================================================
  const tiltCards = document.querySelectorAll('[data-tilt]');
  const canUseTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canUseTilt) tiltCards.forEach((card) => {
    // Add dynamic specular shine element if not present
    if (!card.querySelector('.card-specular')) {
      const specular = document.createElement('div');
      specular.className = 'card-specular';
      card.appendChild(specular);
    }

    let rect = card.getBoundingClientRect();
    const maxTilt = 10; // degrees

    const handleMouseMove = (e) => {
      rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update specular position
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate tilt angles
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = -((y - centerY) / centerY) * maxTilt;
      const tiltY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(8px)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    };

    const handleMouseEnter = () => {
      window.playSfx('hover');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);
  });

  // Buttons Audio Feedback
  document.querySelectorAll('.btn, .nav-link, .c-link-box, .cert-btn').forEach((btn) => {
    btn.addEventListener('mouseenter', () => window.playSfx('hover'));
    btn.addEventListener('click', () => window.playSfx('click'));
  });

  // =========================================================================
  // 3. HUD SCROLL SPY & STICKY HEADER STATE
  // =========================================================================
  const header = document.querySelector('.hud-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onWindowScroll() {
    // Header shadow state
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll spy for navigation
    let currentSectionId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onWindowScroll, { passive: true });
  onWindowScroll();

  // =========================================================================
  // 4. MOBILE NAVIGATION DRAWER
  // =========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    let previousFocus = null;

    function setMobileMenu(open) {
      navMenu.classList.toggle('active', open);
      mobileToggle.classList.toggle('open', open);
      mobileToggle.setAttribute('aria-expanded', String(open));
      mobileToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      document.documentElement.classList.toggle('menu-open', open);

      if (open) {
        previousFocus = document.activeElement;
        const firstLink = navMenu.querySelector('.nav-link');
        if (firstLink) firstLink.focus();
      } else if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
        previousFocus = null;
      }
    }

    mobileToggle.addEventListener('click', () => {
      setMobileMenu(!navMenu.classList.contains('active'));
      window.playSfx('click');
    });

    // Close mobile nav on link click
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        setMobileMenu(false);
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        setMobileMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!navMenu.classList.contains('active')) return;

      if (e.key === 'Escape') {
        setMobileMenu(false);
      } else if (e.key === 'Tab') {
        const focusable = [...navMenu.querySelectorAll('a[href], button:not([disabled])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // =========================================================================
  // 5. ANIMATED STAT NUMBER COUNTERS
  // =========================================================================
  const statElements = document.querySelectorAll('.stat-value[data-count]');

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        let count = 0;
        const speed = 40; // ms
        const timer = setInterval(() => {
          count++;
          el.textContent = count;
          if (count >= target) {
            clearInterval(timer);
          }
        }, speed);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statElements.forEach((el) => statObserver.observe(el));

  // =========================================================================
  // 6. CONTACT FORM TRANSMISSION HANDLER
  // =========================================================================
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitFormBtn');

  if (contactForm && formFeedback && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const subject = document.getElementById('formSubject').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      if (!name || !email || !subject || !message) {
        formFeedback.className = 'form-feedback';
        formFeedback.style.display = 'block';
        formFeedback.style.color = '#ff5d6c';
        formFeedback.textContent = 'Please fill out all required fields.';
        return;
      }

      // Transmission button state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting...</span>';
      window.playSfx('mode');

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Open Email Draft →</span>';

        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `✓ Opening an email draft addressed to <strong>amansingh.2135@gmail.com</strong>...`;
        window.playSfx('click');

        // Prepare mailto link with prefilled payload
        const mailtoUrl = `mailto:amansingh.2135@gmail.com?subject=${encodeURIComponent(subject || 'Opportunity Inquiry')}&body=${encodeURIComponent(`Hi Aman,\n\n${message}\n\nFrom: ${name} (${email})`)}`;
        
        // Open default mail client
        window.location.href = mailtoUrl;

        // Reset form
        contactForm.reset();
      }, 1200);
    });
  }

  // Smooth scroll fallback for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });

})();
