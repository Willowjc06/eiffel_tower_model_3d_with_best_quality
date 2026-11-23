/**
 * charts-app.js
 * Chart.js Visualizations for UN SDG 5 Data.
 * Updated according to the Blueprint specifications:
 * - The 1 in 3 Crisis: Lifetime Intimate Partner vs Non-Partner Sexual Violence breakdown
 * - The Gender Pay & Opportunity Gap: Wage gap, female labor force, parliamentary representation
 * - Safety & Justice Index: Legal protections vs Reporting & Night Safety
 * - Interactive 20-Year Time Slider (2004 - 2024)
 * - Accessible high-contrast color coding: Vibrant Coral (#FF4B4B), Deep Violet (#a855f7), Survivor Teal (#14b8a6), Stark White (#ffffff)
 */

const ChartsApp = (function () {
  'use strict';

  let violenceChartInstance = null;
  let payGapChartInstance = null;
  let safetyChartInstance = null;
  let timelineChartInstance = null;
  let justiceChartInstance = null;

  // Accessible color palette specified by blueprint (No stereotypical pinks, bold urgent tones)
  const PALETTE = {
    coralUrgent: '#FF4B4B',
    coralAlpha: 'rgba(255, 75, 75, 0.35)',

    violetDeep: '#7c3aed',
    violetVibrant: '#a855f7',
    violetLight: '#c084fc',
    violetAlpha: 'rgba(168, 85, 247, 0.35)',

    tealPrimary: '#14b8a6',
    tealVibrant: '#2dd4bf',
    tealLight: '#5eead4',
    tealDark: '#0f766e',
    tealAlpha: 'rgba(20, 184, 166, 0.35)',

    starkWhite: '#ffffff',
    whiteAlpha: 'rgba(255, 255, 255, 0.35)',

    darkGrid: 'rgba(45, 212, 191, 0.1)',
    textLight: '#f0fdfa',
    textMuted: '#94a3b8'
  };

  function setDefaultChartGlobals() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = PALETTE.textMuted;
    Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = '#031a1e';
    Chart.defaults.plugins.tooltip.titleColor = PALETTE.tealVibrant;
    Chart.defaults.plugins.tooltip.bodyColor = '#f0fdfa';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(45, 212, 191, 0.3)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  }

  /**
   * Chart 1: Global & Regional Violence Prevalence (The 1 in 3 Crisis)
   * Visual breakdown of lifetime physical/sexual intimate partner violence vs. non-partner violence
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
            label: 'Intimate Partner Violence (%)',
            data: ipvRates,
            backgroundColor: PALETTE.coralUrgent,
            hoverBackgroundColor: '#ff6b6b',
            borderRadius: 5,
            borderSkipped: false
          },
          {
            label: 'Non-Partner Sexual Violence (%)',
            data: nonPartnerRates,
            backgroundColor: PALETTE.violetVibrant,
            hoverBackgroundColor: '#c084fc',
            borderRadius: 5,
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
              padding: 12
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
              font: { weight: '500' }
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
            label: 'Gender Pay Gap (%)',
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
            backgroundColor: PALETTE.violetVibrant,
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
            label: 'Women Feeling Safe Alone at Night (%)',
            data: femaleSafe,
            backgroundColor: PALETTE.coralUrgent,
            borderRadius: 6
          },
          {
            label: 'Men Feeling Safe Alone at Night (%)',
            data: maleSafe,
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
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
            label: 'Women, Business & Law Score (0-100)',
            data: lawScores,
            borderColor: PALETTE.tealVibrant,
            backgroundColor: 'rgba(45, 212, 191, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: PALETTE.tealVibrant
          },
          {
            label: 'Women Night Walking Safety Perception (%)',
            data: safetyScores,
            borderColor: PALETTE.coralUrgent,
            backgroundColor: 'rgba(255, 75, 75, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 5,
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
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              afterBody: function () {
                return "The Legal-Reality Gap: Strong laws on paper do not immediately translate to physical safety on streets.";
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
            label: 'Legal Protection Index (0-100)',
            data: legal,
            borderColor: PALETTE.tealVibrant,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: PALETTE.tealVibrant
          },
          {
            label: 'Women in Parliaments (%)',
            data: parliament,
            borderColor: PALETTE.violetVibrant,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: PALETTE.violetVibrant
          },
          {
            label: 'Global Gender Pay Gap (%)',
            data: payGap,
            borderColor: PALETTE.coralUrgent,
            backgroundColor: 'transparent',
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.25,
            pointRadius: 6,
            pointHoverRadius: 9,
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
              padding: 14
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

    // Wire up slider interactivity
    if (slider) {
      const yearValues = [2004, 2009, 2014, 2019, 2024];
      const milestoneNotes = {
        2004: "2004 Baseline: Women held under 16% of global parliamentary seats; few comprehensive legal protections against domestic coercive control.",
        2009: "2009 Progress: MDG 3 advanced primary school education parity, but economic wage disparities remained entrenched at 24.2%.",
        2014: "2014 Agenda Prep: Global consensus identified unpaid care burdens and systemic street harassment as urgent development blockers.",
        2019: "2019 Accelerations: The #MeToo and Ni Una Menos movements triggered legislative overhauls and sexual violence reforms in 40+ countries.",
        2024: "2024 Current Telemetry: Legal protections have climbed to 77.9/100, but evening public safety and equal pay require intensified male allyship."
      };

      slider.addEventListener('input', (e) => {
        const step = parseInt(e.target.value, 10);
        const selectedYear = yearValues[step];

        if (yearDisplay) yearDisplay.textContent = selectedYear;
        if (noteDisplay) noteDisplay.textContent = milestoneNotes[selectedYear];

        // Highlight selected point on the timeline chart
        if (timelineChartInstance) {
          timelineChartInstance.data.datasets.forEach(dataset => {
            dataset.pointRadius = dataset.data.map((_, i) => (i === step ? 10 : 5));
          });
          timelineChartInstance.update();
        }

        if (window.SoundFX) {
          window.SoundFX.playTealChime(350 + step * 60);
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
    countries.forEach((c, idx) => {
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
