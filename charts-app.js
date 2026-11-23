/**
 * charts-app.js
 * Chart.js Visualizations for UN SDG 5 Data.
 * Elevated with Survivor Colours:
 * - Teal: The International Ribbon for Sexual Assault Awareness & Survivor Solidarity (#14b8a6 / #2dd4bf)
 * - Purple: The International Ribbon for Domestic Violence Healing & Dignity (#8b5cf6 / #a855f7 / #c084fc)
 * Inspired by Our World in Data and why.zero.university editorial aesthetics.
 */

const ChartsApp = (function () {
  'use strict';

  let violenceChartInstance = null;
  let payGapChartInstance = null;
  let safetyChartInstance = null;
  let timelineChartInstance = null;
  let justiceChartInstance = null;

  // Survivor Teal & Hydrangea Purple Dual Palette
  const PALETTE = {
    tealPrimary: '#14b8a6',
    tealVibrant: '#2dd4bf',
    tealLight: '#5eead4',
    tealDark: '#0f766e',
    tealAlpha: 'rgba(20, 184, 166, 0.35)',
    tealGlow: 'rgba(45, 212, 191, 0.45)',

    purplePrimary: '#8b5cf6',
    purpleVibrant: '#a855f7',
    purpleLight: '#c084fc',
    purpleDeep: '#4c1d95',
    purpleAlpha: 'rgba(168, 85, 247, 0.35)',
    purpleGlow: 'rgba(192, 132, 252, 0.45)',

    coralUrgent: '#fb7185',
    coralAlpha: 'rgba(251, 113, 133, 0.3)',

    starkWhite: '#ffffff',
    whiteAlpha: 'rgba(255, 255, 255, 0.35)',

    darkGrid: 'rgba(45, 212, 191, 0.08)',
    textLight: '#f0fdfa',
    textMuted: '#94a3b8'
  };

  function setDefaultChartGlobals() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = PALETTE.textMuted;
    Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(4, 16, 21, 0.95)';
    Chart.defaults.plugins.tooltip.titleColor = PALETTE.tealVibrant;
    Chart.defaults.plugins.tooltip.bodyColor = '#f0fdfa';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(168, 85, 247, 0.35)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
  }

  /**
   * Chart 1: Global & Regional Violence Prevalence (The 1 in 3 Crisis)
   * Visual breakdown of Intimate Partner Violence (Purple) vs. Non-Partner Sexual Violence (Teal)
   */
  function initViolenceChart() {
    const ctx = document.getElementById('chart-violence-canvas');
    if (!ctx || typeof Chart === 'undefined') return;

    const data = window.DataService ? window.DataService.getRegionalViolence() : [];
    const labels = data.map(d => d.region);
    const ipvRates = data.map(d => d.intimatePartnerRate || d.rate);
    const nonPartnerRates = data.map(d => d.nonPartnerRate || 8.0);

    if (violenceChartInstance) {
      violenceChartInstance.destroy();
    }

    violenceChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Intimate Partner Violence (Purple Ribbon: Domestic Healing)',
            data: ipvRates,
            backgroundColor: PALETTE.purpleVibrant,
            hoverBackgroundColor: '#c084fc',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Non-Partner Sexual Violence (Teal Ribbon: Survivor Parity)',
            data: nonPartnerRates,
            backgroundColor: PALETTE.tealVibrant,
            hoverBackgroundColor: '#5eead4',
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: PALETTE.textLight,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              },
              afterLabel: function (context) {
                const item = data[context.dataIndex];
                return item ? `Context: ${item.description}` : '';
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            min: 0,
            max: 70,
            grid: { color: PALETTE.darkGrid },
            ticks: {
              callback: value => value + '%',
              color: PALETTE.textMuted
            }
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: PALETTE.textLight,
              font: { weight: '600' }
            }
          }
        }
      }
    });
  }

  /**
   * Chart 2: The Gender Pay & Opportunity Gap
   * Average wage gaps vs female labor force participation vs parliamentary leadership
   */
  function initPayGapChart() {
    const ctx = document.getElementById('chart-paygap-canvas');
    if (!ctx || typeof Chart === 'undefined') return;

    const rawData = window.DataService ? window.DataService.getPayGapComparison() : [];
    const selectedCountries = rawData.slice(0, 8);

    const labels = selectedCountries.map(c => c.country);
    const payGaps = selectedCountries.map(c => c.payGap);
    const labor = selectedCountries.map(c => c.femaleLabor);
    const parliament = selectedCountries.map(c => c.parliament);

    if (payGapChartInstance) {
      payGapChartInstance.destroy();
    }

    payGapChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Gender Wage Gap (%)',
            data: payGaps,
            backgroundColor: PALETTE.coralUrgent,
            borderRadius: 6
          },
          {
            label: 'Female Labor Participation (%)',
            data: labor,
            backgroundColor: PALETTE.tealPrimary,
            borderRadius: 6
          },
          {
            label: 'Parliamentary Seats Held (%)',
            data: parliament,
            backgroundColor: PALETTE.purpleVibrant,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: PALETTE.textLight,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: PALETTE.textLight }
          },
          y: {
            min: 0,
            max: 90,
            grid: { color: PALETTE.darkGrid },
            ticks: {
              callback: value => value + '%',
              color: PALETTE.textMuted
            }
          }
        }
      }
    });
  }

  /**
   * Chart 3: Street Safety Perception Divide (Gallup & ONS Data)
   */
  function initSafetyChart() {
    const ctx = document.getElementById('chart-safety-canvas');
    if (!ctx || typeof Chart === 'undefined') return;

    const data = window.DataService ? window.DataService.getStreetSafetyData() : [];
    const labels = data.map(d => d.country);
    const femaleSafe = data.map(d => d.femaleSafe);
    const maleSafe = data.map(d => d.maleSafe);

    if (safetyChartInstance) {
      safetyChartInstance.destroy();
    }

    safetyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Women Feeling Safe Alone at Night (Survivor Teal)',
            data: femaleSafe,
            backgroundColor: PALETTE.tealVibrant,
            borderRadius: 6
          },
          {
            label: 'Men Feeling Safe Alone at Night (Twilight Purple)',
            data: maleSafe,
            backgroundColor: 'rgba(168, 85, 247, 0.45)',
            hoverBackgroundColor: 'rgba(192, 132, 252, 0.7)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: PALETTE.textLight,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${context.raw}%`;
              },
              afterLabel: function (context) {
                const item = data[context.dataIndex];
                return item && context.datasetIndex === 0 ? `Context: ${item.quote}` : '';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: PALETTE.textLight }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: PALETTE.darkGrid },
            ticks: {
              callback: value => value + '%',
              color: PALETTE.textMuted
            }
          }
        }
      }
    });
  }

  /**
   * Chart 4: Safety & Justice Index (Legal Frameworks vs Reporting Rates)
   */
  function initJusticeChart() {
    const ctx = document.getElementById('chart-justice-canvas');
    if (!ctx || typeof Chart === 'undefined') return;

    const rawData = window.DataService ? window.DataService.getPayGapComparison() : [];
    const selected = rawData.slice(0, 10);

    const labels = selected.map(c => c.country);
    const lawScores = selected.map(c => c.lawScore || 80);
    const safetyScores = selected.map(c => c.safetyWalkWomen);

    if (justiceChartInstance) {
      justiceChartInstance.destroy();
    }

    justiceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Women, Business & Law Score (Survivor Teal)',
            data: lawScores,
            borderColor: PALETTE.tealVibrant,
            backgroundColor: 'rgba(45, 212, 191, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: PALETTE.tealVibrant,
            borderWidth: 2.5
          },
          {
            label: 'Night Walking Safety Perception (Hydrangea Purple)',
            data: safetyScores,
            borderColor: PALETTE.purpleVibrant,
            backgroundColor: 'rgba(168, 85, 247, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: PALETTE.purpleVibrant,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: PALETTE.textLight,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14
            }
          },
          tooltip: {
            callbacks: {
              afterBody: function () {
                return "The Legal-Reality Gap: Strong statutory protections on paper do not automatically guarantee safety in public spaces.";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: PALETTE.textLight }
          },
          y: {
            min: 0,
            max: 105,
            grid: { color: PALETTE.darkGrid },
            ticks: { color: PALETTE.textMuted }
          }
        }
      }
    });
  }

  /**
   * Chart 5: Interactive 20-Year Time Slider (2004 - 2024)
   * Visualizing SDG 5 indicator trajectory over the past 20 years
   */
  function initTimeSliderChart() {
    const ctx = document.getElementById('chart-timeline-canvas');
    const slider = document.getElementById('sdg-time-slider');
    const yearDisplay = document.getElementById('timeline-year-display');
    const noteDisplay = document.getElementById('timeline-note-display');

    if (!ctx || typeof Chart === 'undefined' || !window.DataService) return;

    const timelineData = window.DataService.getTimelineData();
    const years = timelineData.years;

    const parliament = timelineData.indicators.parliament.values;
    const payGap = timelineData.indicators.payGap.values;
    const legal = timelineData.indicators.legalProtectionIndex.values;

    if (timelineChartInstance) {
      timelineChartInstance.destroy();
    }

    timelineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years.map(y => y.toString()),
        datasets: [
          {
            label: 'Legal Protection Score (0-100) — Survivor Teal',
            data: legal,
            borderColor: PALETTE.tealVibrant,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: PALETTE.tealVibrant
          },
          {
            label: 'Women in Parliaments (%) — Hydrangea Purple',
            data: parliament,
            borderColor: PALETTE.purpleVibrant,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: PALETTE.purpleVibrant
          },
          {
            label: 'Global Gender Pay Gap (%) — Coral Alert',
            data: payGap,
            borderColor: PALETTE.coralUrgent,
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            borderDash: [5, 5],
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: PALETTE.coralUrgent
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: PALETTE.textLight,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: { color: PALETTE.darkGrid },
            ticks: { color: PALETTE.textLight, font: { weight: '600' } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: PALETTE.darkGrid },
            ticks: {
              callback: val => val + (val <= 35 ? '%' : ' pts'),
              color: PALETTE.textMuted
            }
          }
        }
      }
    });

    if (slider) {
      const yearValues = [2004, 2009, 2014, 2019, 2024];
      const milestoneNotes = {
        2004: "2004 Baseline: Women held under 16% of global parliamentary seats; widespread absence of statutory protections against domestic coercive control.",
        2009: "2009 Progress: MDG 3 advanced primary school parity, but structural wage disparities remained entrenched at 24.2%.",
        2014: "2014 Agenda Prep: Global consensus identified unpaid care burdens and public harassment as systemic barriers to parity.",
        2019: "2019 Acceleration: The #MeToo and Ni Una Menos movements triggered legislative overhauls and sexual violence reforms in 40+ countries.",
        2024: "2024 Current Telemetry: Legal protections have reached 77.9/100, but public night safety and equal pay require intensified active allyship."
      };

      slider.addEventListener('input', (e) => {
        const step = parseInt(e.target.value, 10);
        const selectedYear = yearValues[step];

        if (yearDisplay) yearDisplay.textContent = selectedYear;
        if (noteDisplay) noteDisplay.textContent = milestoneNotes[selectedYear];

        if (timelineChartInstance) {
          timelineChartInstance.data.datasets.forEach(dataset => {
            dataset.pointRadius = dataset.data.map((_, i) => (i === step ? 11 : 5));
          });
          timelineChartInstance.update();
        }

        if (window.SoundFX) {
          window.SoundFX.playTealChime(360 + step * 60);
        }
      });
    }
  }

  /**
   * Country Explorer Scorecard Selector
   */
  function setupCountryExplorer() {
    const select = document.getElementById('country-select');
    if (!select || !window.DataService) return;

    const countries = window.DataService.getPayGapComparison();

    select.innerHTML = '';
    countries.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = `${c.country} (${c.code})`;
      if (c.code === 'GBR') opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const code = e.target.value;
      const match = countries.find(c => c.code === code);
      if (match) {
        updateCountryScorecard(match);
      }
    });

    const initialMatch = countries.find(c => c.code === 'GBR') || countries[0];
    if (initialMatch) {
      updateCountryScorecard(initialMatch);
    }
  }

  function updateCountryScorecard(data) {
    const elName = document.getElementById('sc-country-name');
    const elPay = document.getElementById('sc-paygap');
    const elLabor = document.getElementById('sc-labor');
    const elParl = document.getElementById('sc-parliament');
    const elSafety = document.getElementById('sc-night-safety');
    const elLaw = document.getElementById('sc-law-score');

    if (elName) elName.textContent = data.country;
    if (elPay) elPay.textContent = `${data.payGap}%`;
    if (elLabor) elLabor.textContent = `${data.femaleLabor}%`;
    if (elParl) elParl.textContent = `${data.parliament}%`;
    if (elSafety) elSafety.textContent = `${data.safetyWalkWomen}%`;
    if (elLaw) elLaw.textContent = `${data.lawScore || 85.0}/100`;
  }

  function init() {
    setDefaultChartGlobals();
    initViolenceChart();
    initPayGapChart();
    initSafetyChart();
    initJusticeChart();
    initTimeSliderChart();
    setupCountryExplorer();
  }

  return {
    init,
    updateCountryScorecard
  };
})();

if (typeof window !== 'undefined') {
  window.ChartsApp = ChartsApp;
}
