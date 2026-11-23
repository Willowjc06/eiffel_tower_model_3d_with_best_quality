/**
 * allyship-assessment.js
 * Interactive Allyship Assessment Prompt Tool (SDG 5 Act 3)
 * Non-judgmental interactive scenario prompt tool challenging everyday complacency,
 * addressing subconscious bias, and teaching active bystander intervention (The 5 Ds).
 */

const AllyshipAssessment = (function () {
  'use strict';

  const SCENARIOS = [
    {
      id: 1,
      badge: "Scenario 1: Digital & Group Dynamics",
      question: "How do you react when a peer makes a sexist joke or shares a demeaning meme in a group chat?",
      options: [
        {
          text: "Stay silent to keep the peace and avoid creating awkward tension.",
          score: 1,
          feedback: "Silence is often perceived as passive agreement. Perpetrators assume the group endorses the behavior when no one speaks up.",
          category: "Passive"
        },
        {
          text: "DM the sender privately hours later, but leave the message unchallenged in the group.",
          score: 2,
          feedback: "A helpful step, but others in the group still perceive the space as permissive to sexism.",
          category: "Moderate"
        },
        {
          text: "Directly call it out or shift norms in the group: 'Not cool, mate' or 'We don't do that here.'",
          score: 3,
          feedback: "Active Intervention: Clear, immediate pushback signals that degrading humor is unacceptable, protecting everyone in the space.",
          category: "Active Ally"
        }
      ]
    },
    {
      id: 2,
      badge: "Scenario 2: Night Mobility & Public Space",
      question: "You are walking down an empty street at night and realize you are walking directly behind a woman who looks uneasy.",
      options: [
        {
          text: "Speed up your pace to overtake her quickly so she knows you're not following.",
          score: 1,
          feedback: "Quickening your pace from behind can feel like an acceleration of threat, spiking immediate fight-or-flight panic.",
          category: "Misguided"
        },
        {
          text: "Call out 'Don't worry, I'm friendly!' from 15 paces behind her.",
          score: 2,
          feedback: "While well-intentioned, verbal calls in the dark often heighten alarm rather than reducing it.",
          category: "Moderate"
        },
        {
          text: "Cross over to the opposite pavement or noticeably hang back to give clear, open physical distance.",
          score: 3,
          feedback: "Conscious Allyship: Removing the looming silhouette de-escalates the involuntary threat calculation instantly.",
          category: "Active Ally"
        }
      ]
    },
    {
      id: 3,
      badge: "Scenario 3: Workplace Voice & Attribution",
      question: "In a meeting, a female colleague proposes an innovative idea that gets ignored. Five minutes later, a male colleague repeats it to great praise.",
      options: [
        {
          text: "Say nothing and assume the second explanation was simply better phrased.",
          score: 1,
          feedback: "This perpetuates the 'idea theft' phenomenon documented extensively in gender equity workplace research.",
          category: "Passive"
        },
        {
          text: "Tell the female colleague after the meeting that you noticed what happened and felt bad for her.",
          score: 2,
          feedback: "Emotional validation is kind, but it leaves the systemic erasure uncorrected where it counts: in front of leadership.",
          category: "Moderate"
        },
        {
          text: "Intervene publicly in the moment: 'Great to see this resonated—that builds directly on what Sarah proposed a few minutes ago. Sarah, would you expand on that?'",
          score: 3,
          feedback: "Amplification Allyship: Gives proper attribution and returns authority to the originator with professionalism and grace.",
          category: "Active Ally"
        }
      ]
    },
    {
      id: 4,
      badge: "Scenario 4: Transit Safety & The 5 Ds",
      question: "You witness someone being aggressively harassed, cornered, or filmed on a train or bus.",
      options: [
        {
          text: "Put on headphones and look away so you don't provoke the aggressor toward yourself.",
          score: 1,
          feedback: "The bystander effect leaves the survivor feeling utterly isolated and abandoned in terror.",
          category: "Passive"
        },
        {
          text: "Physically confront the aggressor with aggressive posturing and shouting.",
          score: 2,
          feedback: "Escalating physically can increase the danger for both the survivor and bystanders. De-escalation strategies are safer and more effective.",
          category: "High Risk"
        },
        {
          text: "Use the 5 Ds of Active Bystander Intervention (e.g. Distract: 'Excuse me, is this the next stop?' or Delegate: Alert the conductor/driver).",
          score: 3,
          feedback: "Gold Standard Bystander Intervention: Distraction interrupts the aggression without escalating into a dangerous physical altercation.",
          category: "Active Ally"
        }
      ]
    }
  ];

  let userAnswers = {};

  function init() {
    renderQuiz();
  }

  function renderQuiz() {
    const container = document.getElementById('allyship-assessment-container');
    if (!container) return;

    container.innerHTML = `
      <div class="assessment-card">
        <div class="assessment-intro">
          <div class="assessment-header-tag">Interactive Allyship Assessment</div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">
            Everyday Intervention: Where Do You Stand?
          </h3>
          <p class="stat-subtext" style="margin-bottom: 1.5rem;">
            A non-judgmental prompt tool designed to foster self-awareness and active bystander intervention.
            Select how you would genuinely respond in each scenario to receive constructive guidance.
          </p>
        </div>

        <div id="assessment-scenarios-list" class="assessment-scenarios-list">
          ${SCENARIOS.map((s, sIndex) => `
            <div class="assessment-scenario-box" data-scenario-id="${s.id}">
              <div class="scenario-badge">${s.badge}</div>
              <h4 class="scenario-question">${s.question}</h4>
              <div class="scenario-options">
                ${s.options.map((opt, optIndex) => `
                  <button class="scenario-opt-btn" data-scenario="${s.id}" data-opt="${optIndex}">
                    <span class="opt-letter">${String.fromCharCode(65 + optIndex)}</span>
                    <span class="opt-text">${opt.text}</span>
                  </button>
                `).join('')}
              </div>
              <div id="scenario-feedback-${s.id}" class="scenario-feedback-box" style="display: none;"></div>
            </div>
          `).join('')}
        </div>

        <div id="assessment-summary-card" class="assessment-summary-card" style="display: none;">
          <div class="summary-top">
            <div>
              <span class="spot-tag" style="color: var(--teal-vibrant);">Your Allyship Assessment Result</span>
              <h3 id="assessment-result-title" style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem;">The Proactive Ally</h3>
            </div>
            <div id="assessment-score-badge" class="assessment-score-badge">12 / 12 Pts</div>
          </div>
          <p id="assessment-result-desc" class="stat-subtext" style="color: var(--text-body); margin-bottom: 1rem;"></p>
          
          <div class="five-ds-box">
            <h5 style="font-size: 0.95rem; font-weight: 700; color: var(--teal-light); margin-bottom: 0.5rem;">
              Remember the 5 Ds of Active Bystander Intervention:
            </h5>
            <div class="five-ds-grid">
              <div class="five-d-item"><strong>1. Direct:</strong> Speak up directly if it's safe to do so.</div>
              <div class="five-d-item"><strong>2. Distract:</strong> Create a benign interruption or ask for directions.</div>
              <div class="five-d-item"><strong>3. Delegate:</strong> Enlist help from transit staff, security, or others.</div>
              <div class="five-d-item"><strong>4. Delay:</strong> Check in with the survivor after the incident has calmed.</div>
              <div class="five-d-item"><strong>5. Document:</strong> Record video or notes safely, respecting privacy.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind click events on options
    const optButtons = container.querySelectorAll('.scenario-opt-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const scenarioId = parseInt(targetBtn.getAttribute('data-scenario'), 10);
        const optIndex = parseInt(targetBtn.getAttribute('data-opt'), 10);

        handleOptionSelect(scenarioId, optIndex);
      });
    });
  }

  function handleOptionSelect(scenarioId, optIndex) {
    userAnswers[scenarioId] = optIndex;

    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    const option = scenario.options[optIndex];
    const scenarioBox = document.querySelector(`.assessment-scenario-box[data-scenario-id="${scenarioId}"]`);
    if (!scenarioBox) return;

    // Toggle active state on buttons
    const btns = scenarioBox.querySelectorAll('.scenario-opt-btn');
    btns.forEach((btn, idx) => {
      btn.classList.toggle('selected', idx === optIndex);
      btn.classList.toggle('is-recommended', idx === 2); // Highlight the recommended path
    });

    // Show instant feedback box
    const feedbackBox = document.getElementById(`scenario-feedback-${scenarioId}`);
    if (feedbackBox) {
      feedbackBox.style.display = 'block';
      feedbackBox.innerHTML = `
        <div class="feedback-inner">
          <span class="feedback-tag feedback-tag-${option.category.toLowerCase().replace(/\s+/g, '-')}">${option.category}</span>
          <p class="feedback-text">${option.feedback}</p>
        </div>
      `;
    }

    if (window.SoundFX) {
      window.SoundFX.playTealChime(option.score === 3 ? 560 : 420);
    }

    // Check if all scenarios have been answered
    if (Object.keys(userAnswers).length === SCENARIOS.length) {
      renderSummary();
    }
  }

  function renderSummary() {
    const summaryCard = document.getElementById('assessment-summary-card');
    const resultTitle = document.getElementById('assessment-result-title');
    const scoreBadge = document.getElementById('assessment-score-badge');
    const resultDesc = document.getElementById('assessment-result-desc');

    if (!summaryCard || !resultTitle || !scoreBadge || !resultDesc) return;

    let totalScore = 0;
    SCENARIOS.forEach(s => {
      const chosenOpt = userAnswers[s.id];
      if (chosenOpt !== undefined) {
        totalScore += s.options[chosenOpt].score;
      }
    });

    summaryCard.style.display = 'block';
    scoreBadge.textContent = `${totalScore} / 12 Points`;

    if (totalScore >= 11) {
      resultTitle.textContent = "🌟 Exemplary Active Ally";
      resultDesc.textContent = "You instinctively prioritize active de-escalation, bystander intervention, and systemic equity. Your voice and actions create real safety for women and girls in public and private spaces.";
    } else if (totalScore >= 8) {
      resultTitle.textContent = "🛡️ Conscious Supporter";
      resultDesc.textContent = "You have great empathy and awareness of everyday dangers. By adopting the 5 Ds of bystander intervention and practicing vocal amplification, you can transition from supportive bystander to active protector.";
    } else {
      resultTitle.textContent = "🌱 Developing Advocate";
      resultDesc.textContent = "Recognizing subtle power dynamics and risk calculations is the first step. Small habit shifts—such as giving space after dark and refusing to laugh at sexist banter—make an immediate positive impact.";
    }

    // Smooth scroll to summary card
    summaryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2dd4bf', '#a855f7', '#f0fdfa']
      });
    }
  }

  return {
    init,
    getScenarios: () => SCENARIOS
  };
})();

if (typeof window !== 'undefined') {
  window.AllyshipAssessment = AllyshipAssessment;
}
