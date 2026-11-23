/**
 * app.js
 * Master Application Controller for UN SDG 5: Beyond the Shadows
 * Inspired by why.zero.university editorial aesthetic.
 * Integrates:
 * - Flower3D: Hydrangea Purple centerpiece & ambient hero background
 * - Earth3D: 3D Earth Globe operating in tandem with World Bank Open Data & UN SDG 5 APIs
 * - Phone3D: 3D Mobile Phone for emergency helplines & trauma-informed crisis lifelines
 * - Maze3D: Everyday Night Safety Walk simulation
 * - ChartsApp: Chart.js empirical analytics in Survivor Teal & Hydrangea Violet
 * - SoundFX: Synthesized Web Audio API procedural soundscapes
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    setupQuickExit();
    setupSmoothNavigation();
    setupMythBusters();
    setupAllyshipPledge();
    setupStatCounters();
    setupCharityFilters();
    setupCursorFollower();
    setupAmbientSoundToggle();
    setupReducedMotion();
    setupTriggerWarning();

    // 1. Initialize 3D Hydrangea Purple Flower Showcase (The Main Background Experience)
    if (window.Flower3D && typeof window.Flower3D.init === 'function') {
      window.Flower3D.init();
    }

    // 2. Initialize 3D Earth Globe (In tandem with live API)
    if (window.Earth3D && typeof window.Earth3D.init === 'function') {
      window.Earth3D.init();
    }

    // 3. Initialize 3D Mobile Phone (Emergency Helplines)
    if (window.Phone3D && typeof window.Phone3D.init === 'function') {
      window.Phone3D.init();
    }

    // 4. Initialize 3D Night Safety Walk
    if (window.Maze3D && typeof window.Maze3D.init === 'function') {
      window.Maze3D.init();
    }

    // 5. Initialize Chart.js Data Visualizations
    if (window.ChartsApp && typeof window.ChartsApp.init === 'function') {
      window.ChartsApp.init();
    }

    // 6. Initialize Interactive Allyship Assessment Tool
    if (window.AllyshipAssessment && typeof window.AllyshipAssessment.init === 'function') {
      window.AllyshipAssessment.init();
    }

    // 7. Initialize Live API Data Sync with World Bank & UN SDG
    if (window.DataService && typeof window.DataService.initLiveSync === 'function') {
      window.DataService.initLiveSync(updateApiStatusBadge);
    }

    setupMazeControls();
  }

  /**
   * Trauma-Informed Safety Feature: Emergency Quick Exit
   * Standard feature on domestic violence websites (e.g. Refuge UK, Women's Aid, RAINN).
   * Instantly redirects to BBC Weather to protect someone in an unsafe environment.
   */
  function setupQuickExit() {
    const neutralUrl = 'https://www.bbc.co.uk/weather';

    function triggerQuickExit() {
      try {
        sessionStorage.clear();
        localStorage.removeItem('sdg5_cache_wb_SG.GEN.PARL.ZS_WLD');
      } catch (e) {}
      window.location.replace(neutralUrl);
    }

    // Button click listener
    const quickExitBtns = document.querySelectorAll('.js-quick-exit');
    quickExitBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerQuickExit();
      });
    });

    // Keyboard ESC shortcut
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        triggerQuickExit();
      }
    });
  }

  /**
   * Mindful Content Warning Banner
   */
  function setupTriggerWarning() {
    const warning = document.getElementById('trigger-warning');
    const dismissBtn = document.getElementById('btn-dismiss-warning');
    if (!warning || !dismissBtn) return;

    dismissBtn.addEventListener('click', () => {
      warning.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      warning.style.opacity = '0';
      warning.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        warning.style.display = 'none';
      }, 300);
      if (window.SoundFX) window.SoundFX.playTealChime(500);
    });
  }

  /**
   * WCAG 2.1 AA Reduced Motion Toggle
   */
  function setupReducedMotion() {
    const btnMotion = document.getElementById('btn-motion-toggle');
    if (!btnMotion) return;

    let isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    updateMotionState(isReduced);

    btnMotion.addEventListener('click', () => {
      isReduced = !isReduced;
      updateMotionState(isReduced);
    });

    function updateMotionState(reduced) {
      document.body.classList.toggle('reduced-motion', reduced);
      btnMotion.innerHTML = reduced
        ? '<span class="icon">🛑</span> Motion: OFF'
        : '<span class="icon">⚡</span> Motion: Auto';
      btnMotion.classList.toggle('active', reduced);

      if (window.Flower3D && typeof window.Flower3D.setReducedMotion === 'function') {
        window.Flower3D.setReducedMotion(reduced);
      }
      if (window.Earth3D && typeof window.Earth3D.setReducedMotion === 'function') {
        window.Earth3D.setReducedMotion(reduced);
      }
    }
  }

  /**
   * Live API Connectivity Status Badge
   */
  function updateApiStatusBadge(report) {
    const badge = document.getElementById('api-live-indicator');
    const label = document.getElementById('api-live-label');
    if (!badge || !label) return;

    if (report.isLive) {
      badge.classList.remove('status-fallback');
      badge.classList.add('status-live');
      label.innerHTML = `<strong>Live APIs Connected:</strong> ${report.sources.join(', ')} &bull; Synced: ${report.timestamp}`;
    } else {
      badge.classList.add('status-fallback');
      label.innerHTML = `<strong>Cached UN SDG & World Bank Baseline:</strong> Resilient Mode &bull; Synced: ${report.timestamp}`;
    }
  }

  /**
   * Ambient Soundscape Toggle (Web Audio API)
   */
  function setupAmbientSoundToggle() {
    const btnAudio = document.getElementById('btn-soundscape-toggle');
    if (!btnAudio) return;

    btnAudio.addEventListener('click', () => {
      if (window.SoundFX) {
        const isPlaying = window.SoundFX.toggleAmbientSoundscape();
        btnAudio.innerHTML = isPlaying
          ? '<span class="icon">🌿</span> Soundscape: ON'
          : '<span class="icon">🔇</span> Soundscape: OFF';
        btnAudio.classList.toggle('active', isPlaying);
      }
    });
  }

  /**
   * Controls for 3D Maze / Night Walk
   */
  function setupMazeControls() {
    const btnNext = document.getElementById('btn-maze-next');
    const btnPrev = document.getElementById('btn-maze-prev');
    const dots = document.querySelectorAll('.maze-step-dot');
    const btnAudio = document.getElementById('btn-maze-audio');

    if (btnNext && window.Maze3D) {
      btnNext.addEventListener('click', () => {
        window.Maze3D.nextStep();
        highlightActiveMazeDot();
        if (window.SoundFX) window.SoundFX.playWalkFootstep();
      });
    }

    if (btnPrev && window.Maze3D) {
      btnPrev.addEventListener('click', () => {
        window.Maze3D.prevStep();
        highlightActiveMazeDot();
        if (window.SoundFX) window.SoundFX.playWalkFootstep();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-step'), 10);
        if (window.Maze3D) {
          window.Maze3D.setStep(idx);
          dots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          if (window.SoundFX) window.SoundFX.playWalkFootstep();
        }
      });
    });

    if (btnAudio && window.Maze3D) {
      btnAudio.addEventListener('click', () => {
        const isAudioActive = window.Maze3D.toggleAudio();
        btnAudio.innerHTML = isAudioActive
          ? '<span class="icon">🔊</span> Footstep Audio: ON'
          : '<span class="icon">🔈</span> Footstep Audio: OFF';
        btnAudio.classList.toggle('active', isAudioActive);
      });
    }

    function highlightActiveMazeDot() {
      const badge = document.getElementById('maze-step-badge');
      if (!badge) return;
      const text = badge.textContent || '';
      const match = text.match(/Stage (\d+)/);
      if (match && match[1]) {
        const currentIdx = parseInt(match[1], 10) - 1;
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIdx);
        });
      }
    }
  }

  /**
   * Flippable Myth vs. Reality Cards
   */
  function setupMythBusters() {
    const cards = document.querySelectorAll('.myth-card-container');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
        if (window.SoundFX) {
          window.SoundFX.playTealChime(580);
        }
      });

      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-flipped');
          if (window.SoundFX) {
            window.SoundFX.playTealChime(580);
          }
        }
      });
    });
  }

  /**
   * Everyday Allyship Interactive Checklist
   */
  function setupAllyshipPledge() {
    const checkboxes = document.querySelectorAll('.ally-check-input');
    const scoreBar = document.getElementById('ally-score-bar');
    const scoreText = document.getElementById('ally-score-text');
    const feedbackText = document.getElementById('ally-feedback-text');

    if (!checkboxes.length || !scoreBar || !scoreText) return;

    function updateScore() {
      const total = checkboxes.length;
      let checkedCount = 0;
      checkboxes.forEach(cb => {
        if (cb.checked) checkedCount++;
      });

      const percentage = Math.round((checkedCount / total) * 100);
      scoreBar.style.width = `${percentage}%`;
      scoreText.textContent = `${percentage}% Commitment`;

      if (feedbackText) {
        if (percentage === 0) {
          feedbackText.textContent = "🌱 The Journey Begins: Small conscious shifts in everyday habits create safer public spaces for everyone.";
          feedbackText.style.borderColor = "var(--border-subtle)";
        } else if (percentage < 60) {
          feedbackText.textContent = "✨ Stepping Up: Every conscious effort to call out harassment makes communities safer.";
          feedbackText.style.borderColor = "var(--accent-teal)";
        } else if (percentage < 100) {
          feedbackText.textContent = "🛡️ Active Defender: You are establishing safe norms in your workplaces and streets.";
          feedbackText.style.borderColor = "var(--accent-teal)";
        } else {
          feedbackText.textContent = "🌟 Universal Ally: Thank you. True equality requires collective accountability and unwavering solidarity.";
          feedbackText.style.borderColor = "var(--accent-teal)";

          // Trigger Confetti Celebration
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#14b8a6', '#2dd4bf', '#a855f7', '#f0fdfa']
            });
          }
          if (window.SoundFX) {
            window.SoundFX.playTealChime(660);
          }
        }
      }
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateScore();
        if (cb.checked && window.SoundFX) {
          window.SoundFX.playTealChime(520);
        }
      });
    });
  }

  /**
   * Smooth Anchor Navigation
   */
  function setupSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /**
   * Stat Counters with Easing
   */
  function setupStatCounters() {
    const counters = document.querySelectorAll('.js-counter');
    if (!counters.length) return;

    let hasRun = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target')) || 0;
            const suffix = counter.getAttribute('data-suffix') || '';
            const isFloat = counter.getAttribute('data-target').includes('.');

            let start = 0;
            const duration = 1600;
            const startTime = performance.now();

            function tick(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease Out Quart
              const ease = 1 - Math.pow(1 - progress, 4);
              const val = start + (target - start) * ease;

              counter.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;

              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                counter.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
              }
            }
            requestAnimationFrame(tick);
          });
        }
      });
    }, { threshold: 0.3 });

    const heroSection = document.querySelector('.hero-section');
    if (heroSection) observer.observe(heroSection);
  }

  /**
   * Charity Category Filters
   */
  function setupCharityFilters() {
    const filterBtns = document.querySelectorAll('.charity-filter-btn');
    const cards = document.querySelectorAll('.charity-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const cat = e.currentTarget.getAttribute('data-category');
        cards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });

        if (window.SoundFX) {
          window.SoundFX.playTealChime(480);
        }
      });
    });
  }

  /**
   * Glowing Cursor Follower (why.zero.university inspired)
   */
  function setupCursorFollower() {
    const cursor = document.getElementById('cursor-glow');
    if (!cursor) return;

    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

})();
