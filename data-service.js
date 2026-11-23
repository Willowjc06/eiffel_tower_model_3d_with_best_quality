/**
 * data-service.js
 * Comprehensive live API service with resilient fallback data for UN SDG 5 (Gender Equality).
 * Integrates:
 * - World Bank Open Data API (Indicators: SG.VAW.1549.ZS, SL.TLF.CACT.FE.ZS, SG.GEN.PARL.ZS, SG.LAW.INDX)
 * - UN SDG Indicators API (Goal 5: Targets 5.1.1, 5.2.1, 5.5.1)
 * - WHO Global Health Observatory (GHO) OData API (VIOLENCE_IPV_LIFETIME)
 * - 24-hour localStorage caching with verified local snapshot fallback files
 */

const DataService = (function () {
  'use strict';

  const CACHE_PREFIX = 'sdg5_cache_';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Verified empirical baseline data (Sources: UN Women 2024, WHO 2023, World Bank 2024, Gallup Safety Index)
  const FALLBACK_GLOBAL = {
    violenceStat: "1 in 3",
    violencePercent: 31.8,
    globalPayGapPercent: 20.0,
    parliamentPercent: 26.9,
    walkingAloneFearGap: 27.0,
    legalIndexScore: 77.9,
    femaleLaborRate: 47.3,
    updatedYear: 2024
  };

  const REGIONAL_VIOLENCE_DATA = [
    {
      region: "Oceania (Excl. Aus/NZ)",
      rate: 51.0,
      intimatePartnerRate: 51.0,
      nonPartnerRate: 12.0,
      combinedRate: 53.0,
      legalScore: 42,
      description: "Highest global rate of intimate partner violence; remote geography and customary legal barriers."
    },
    {
      region: "Sub-Saharan Africa",
      rate: 33.0,
      intimatePartnerRate: 33.0,
      nonPartnerRate: 9.5,
      combinedRate: 36.5,
      legalScore: 58,
      description: "Persistent economic marginalization compounded by conflict zones and customary land tenure."
    },
    {
      region: "South Asia",
      rate: 35.0,
      intimatePartnerRate: 35.0,
      nonPartnerRate: 6.8,
      combinedRate: 37.0,
      legalScore: 62,
      description: "Deep cultural norms, early marriage, and mobility fears depressing formal female workforce."
    },
    {
      region: "Latin America & Caribbean",
      rate: 25.0,
      intimatePartnerRate: 25.0,
      nonPartnerRate: 8.0,
      combinedRate: 29.8,
      legalScore: 76,
      description: "Severe femicide crisis countered by monumental grassroots movements (Ni Una Menos)."
    },
    {
      region: "Middle East & North Africa",
      rate: 31.0,
      intimatePartnerRate: 31.0,
      nonPartnerRate: 5.2,
      combinedRate: 32.5,
      legalScore: 48,
      description: "Guardianship statutes and restricted civic participation limiting autonomous legal recourse."
    },
    {
      region: "Northern America",
      rate: 25.0,
      intimatePartnerRate: 25.0,
      nonPartnerRate: 14.2,
      combinedRate: 32.0,
      legalScore: 88,
      description: "1 in 4 women experience severe intimate partner violence; high lifetime non-partner assault reports."
    },
    {
      region: "Europe & Central Asia",
      rate: 22.0,
      intimatePartnerRate: 22.0,
      nonPartnerRate: 9.0,
      combinedRate: 26.5,
      legalScore: 92,
      description: "Strong legal frameworks, yet high rates of street harassment and digital/cyber intimidation."
    },
    {
      region: "East Asia & Pacific",
      rate: 20.0,
      intimatePartnerRate: 20.0,
      nonPartnerRate: 4.5,
      combinedRate: 22.4,
      legalScore: 79,
      description: "OECD-leading wage disparities and intense corporate cultures curtailing leadership parity."
    }
  ];

  const PAY_GAP_COMPARISON = [
    { country: "South Korea", code: "KOR", payGap: 31.1, femaleLabor: 55.2, parliament: 19.0, safetyWalkWomen: 46, lawScore: 85.0 },
    { country: "Japan", code: "JPN", payGap: 21.3, femaleLabor: 54.8, parliament: 15.7, safetyWalkWomen: 58, lawScore: 78.8 },
    { country: "United States", code: "USA", payGap: 16.9, femaleLabor: 56.8, parliament: 28.7, safetyWalkWomen: 52, lawScore: 91.3 },
    { country: "United Kingdom", code: "GBR", payGap: 14.3, femaleLabor: 59.1, parliament: 34.6, safetyWalkWomen: 42, lawScore: 97.5 },
    { country: "Germany", code: "DEU", payGap: 17.7, femaleLabor: 57.2, parliament: 35.3, safetyWalkWomen: 61, lawScore: 100.0 },
    { country: "Australia", code: "AUS", payGap: 13.0, femaleLabor: 62.1, parliament: 38.4, safetyWalkWomen: 48, lawScore: 96.9 },
    { country: "France", code: "FRA", payGap: 15.3, femaleLabor: 52.9, parliament: 37.8, safetyWalkWomen: 55, lawScore: 100.0 },
    { country: "South Africa", code: "ZAF", payGap: 23.0, femaleLabor: 48.0, parliament: 46.3, safetyWalkWomen: 25, lawScore: 88.1 },
    { country: "Brazil", code: "BRA", payGap: 20.1, femaleLabor: 53.4, parliament: 17.5, safetyWalkWomen: 32, lawScore: 85.0 },
    { country: "India", code: "IND", payGap: 28.0, femaleLabor: 32.8, parliament: 15.2, safetyWalkWomen: 41, lawScore: 74.4 },
    { country: "Kenya", code: "KEN", payGap: 24.5, femaleLabor: 68.3, parliament: 23.3, safetyWalkWomen: 38, lawScore: 80.6 },
    { country: "Sweden", code: "SWE", payGap: 7.2, femaleLabor: 69.8, parliament: 46.7, safetyWalkWomen: 71, lawScore: 100.0 },
    { country: "Rwanda", code: "RWA", payGap: 11.2, femaleLabor: 80.4, parliament: 61.3, safetyWalkWomen: 64, lawScore: 80.6 },
    { country: "Norway", code: "NOR", payGap: 4.8, femaleLabor: 66.5, parliament: 45.0, safetyWalkWomen: 78, lawScore: 96.9 }
  ];

  const STREET_SAFETY_DATA = [
    { country: "United Kingdom", femaleSafe: 42, maleSafe: 79, quote: "Liverpool listening sessions highlighted constant personal safety calculations walking alone after dark." },
    { country: "United States", femaleSafe: 52, maleSafe: 83, quote: "Over 81% of US women report experiencing sexual harassment in public spaces during their lifetime." },
    { country: "South Africa", femaleSafe: 25, maleSafe: 48, quote: "Severe gender-based violence has spurred nationwide emergency declarations." },
    { country: "India", femaleSafe: 41, maleSafe: 75, quote: "Fear of transit safety curbs female university enrollment and formal workforce participation." },
    { country: "Brazil", femaleSafe: 32, maleSafe: 64, quote: "Public transport and evening commutes require collective grouping and digital tracking check-ins." },
    { country: "Germany", femaleSafe: 61, maleSafe: 86, quote: "Despite robust infrastructure, 58% of German women avoid specific stations and parks at night." },
    { country: "Japan", femaleSafe: 58, maleSafe: 84, quote: "Persistent train harassment led to women-only transit carriages in major cities." },
    { country: "Sweden", femaleSafe: 71, maleSafe: 91, quote: "Even in top-ranking gender equality nations, a 20-point perception gap persists after dark." }
  ];

  // 3D Globe Hotspots Coordinates
  const GLOBE_HOTSPOTS = [
    {
      name: "United Kingdom & Western Europe",
      lat: 53.4808,
      lon: -2.2426,
      stat: "14.3% Pay Gap & 58% Night Anxiety",
      quote: "Lillian Greenwood, UK Roads Minister: 'I listened as a group of women and girls in Liverpool shared their personal safety worries when walking, particularly alone after dark.'",
      detail: "1 in 3 women in the UK have experienced street harassment in public transit or sidewalks in the last 12 months.",
      hotline: "Refuge UK: 0808 2000 247"
    },
    {
      name: "North America",
      lat: 38.9072,
      lon: -77.0369,
      stat: "1 in 4 Women Face Intimate Partner Violence",
      quote: "RAINN: Every 68 seconds an American is sexually assaulted; women represent over 90% of adult victims.",
      detail: "Over 81% of women report experiencing some form of sexual harassment in public spaces.",
      hotline: "RAINN: 1-800-656-4673"
    },
    {
      name: "Sub-Saharan Africa (East & Southern Hub)",
      lat: -1.2921,
      lon: 36.8219,
      stat: "33% Lifetime Violence Prevalence",
      quote: "Grassroots women provide over 70% of agricultural labor yet hold minority land title representation.",
      detail: "Community-led rapid safe shelters and mobile-first reporting systems are driving national accountability.",
      hotline: "Gender Violence Recovery Centre: 1195"
    },
    {
      name: "South Asia (India & Regional)",
      lat: 28.6139,
      lon: 77.2090,
      stat: "35% Intimate Partner Violence",
      quote: "Transit safety and street harassment depress female formal labor force participation to under 33%.",
      detail: "Community SOS networks and public lighting campaigns are challenging deep structural inequalities.",
      hotline: "Women Helpline: 1091 / 181"
    },
    {
      name: "Latin America (Brazil & Southern Cone)",
      lat: -15.7975,
      lon: -47.8919,
      stat: "Over 4,000 Femicides Annually Across Region",
      quote: "Ni Una Menos: Millions march demanding an end to impunity and the systemic devaluation of women's lives.",
      detail: "Specialized women's police stations (Delegacias da Mulher) lead frontline interventions.",
      hotline: "Central de Atendimento: 180"
    },
    {
      name: "East Asia & Pacific (Japan & Korea)",
      lat: 35.6762,
      lon: 139.6503,
      stat: "OECD-Leading Pay Gaps (21% - 31%)",
      quote: "Rigid corporate overtime cultures and domestic expectations stall female parliamentary representation below 19%.",
      detail: "Subway safety measures and digital voyeurism penalties have prompted landmark legal reforms.",
      hotline: "Japan Violence Prevention: #8008"
    },
    {
      name: "Oceania & Pacific Islands",
      lat: -9.4438,
      lon: 147.1803,
      stat: "Up to 51% Violence Prevalence",
      quote: "Geographic isolation and customary legal friction present acute barriers to crisis shelters.",
      detail: "Target 5.2 of UN SDG requires emergency telecommunication lifelines and decentralized clinics.",
      hotline: "1-Tok Kaunselin Helpim Lain: 7100-5555"
    }
  ];

  // Timeline Progress Data (2004 - 2024)
  const TIMELINE_DATA = {
    years: [2004, 2009, 2014, 2019, 2024],
    indicators: {
      parliament: {
        title: "Women in Parliaments (%)",
        values: [15.6, 18.8, 22.1, 24.6, 26.9],
        note: "Steady rise from 15.6% to 26.9%, yet far short of the 50% parity target."
      },
      payGap: {
        title: "Global Gender Pay Gap (%)",
        values: [26.0, 24.2, 22.5, 21.1, 20.0],
        note: "Reduced from 26% to 20%; at this rate, full economic parity is 134 years away."
      },
      laborParticipation: {
        title: "Female Labor Participation (%)",
        values: [51.2, 49.8, 48.9, 47.7, 47.3],
        note: "Stagnated due to disproportionate caregiving burdens and safety barriers."
      },
      legalProtectionIndex: {
        title: "Legal Protection Index (0-100)",
        values: [64.2, 68.5, 71.8, 75.3, 77.9],
        note: "Substantial legislative progress, but enforcement and reporting gaps persist."
      },
      nightSafetyAnxiety: {
        title: "Night Walk Fear (%)",
        values: [62.0, 60.5, 59.2, 58.6, 58.0],
        note: "58% of women still feel unsafe walking alone after dark in urban areas."
      }
    }
  };

  /**
   * Helper: Read from cache if valid
   */
  function getCached(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp < CACHE_TTL_MS) {
        return data.payload;
      }
    } catch (e) {
      console.warn("Storage cache read failed:", e);
    }
    return null;
  }

  /**
   * Helper: Store to cache
   */
  function setCache(key, payload) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        timestamp: Date.now(),
        payload: payload
      }));
    } catch (e) {
      console.warn("Storage cache write failed:", e);
    }
  }

  /**
   * Fetch live indicators from World Bank API with snapshot fallback
   */
  async function fetchWorldBankIndicator(indicatorCode, countryCode = 'WLD') {
    const cacheKey = `wb_${indicatorCode}_${countryCode}`;
    const cached = getCached(cacheKey);
    if (cached) return { data: cached, source: 'cache' };

    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=10`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      if (Array.isArray(json) && json.length > 1 && Array.isArray(json[1])) {
        const validEntry = json[1].find(item => item.value !== null && item.value !== undefined);
        if (validEntry) {
          const result = {
            indicator: validEntry.indicator.value,
            country: validEntry.country.value,
            year: validEntry.date,
            value: parseFloat(validEntry.value.toFixed(1))
          };
          setCache(cacheKey, result);
          return { data: result, source: 'live' };
        }
      }
      throw new Error("No valid data found in World Bank response");
    } catch (err) {
      console.warn(`World Bank fetch failed for ${indicatorCode} (${countryCode}), loading bundled snapshot:`, err.message);
      // Attempt to load from bundled local snapshot
      try {
        const snapRes = await fetch('data/worldbank_gender_snapshot.json');
        if (snapRes.ok) {
          const snapJson = await snapRes.json();
          if (snapJson.indicators && snapJson.indicators[indicatorCode]) {
            const indObj = snapJson.indicators[indicatorCode];
            const val = indObj.values[countryCode] !== undefined ? indObj.values[countryCode] : indObj.values['WLD'];
            const fallbackResult = {
              indicator: indObj.name,
              country: countryCode,
              year: '2024 (Snapshot)',
              value: val
            };
            return { data: fallbackResult, source: 'snapshot' };
          }
        }
      } catch (snapErr) {
        console.warn("Snapshot fallback read failed:", snapErr);
      }
      return { data: null, error: err.message, source: 'fallback' };
    }
  }

  /**
   * Fetch UN SDG Indicator data (Target 5.1.1, 5.2.1, 5.5.1)
   */
  async function fetchUnSdgIndicator(targetCode = '5.1.1') {
    const cacheKey = `un_sdg_${targetCode}`;
    const cached = getCached(cacheKey);
    if (cached) return { data: cached, source: 'cache' };

    const url = `https://unstats.un.org/SDGAPI/v1/sdg/Goal/5/Target/Data`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setCache(cacheKey, json);
      return { data: json, source: 'live' };
    } catch (err) {
      console.warn(`UN SDG API fetch failed, loading bundled snapshot:`, err.message);
      try {
        const snapRes = await fetch('data/un_sdg5_snapshot.json');
        if (snapRes.ok) {
          const snapJson = await snapRes.json();
          return { data: snapJson, source: 'snapshot' };
        }
      } catch (snapErr) {}
      return { data: null, source: 'fallback' };
    }
  }

  /**
   * Fetch WHO Global Health Observatory Violence Data
   */
  async function fetchWhoViolenceData() {
    const cacheKey = 'who_violence_ipv';
    const cached = getCached(cacheKey);
    if (cached) return { data: cached, source: 'cache' };

    const url = 'https://ghoapi.azureedge.net/api/VIOLENCE_IPV_LIFETIME';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setCache(cacheKey, json);
      return { data: json, source: 'live' };
    } catch (err) {
      console.warn("WHO GHO API fetch failed, loading bundled snapshot:", err.message);
      try {
        const snapRes = await fetch('data/who_violence_snapshot.json');
        if (snapRes.ok) {
          const snapJson = await snapRes.json();
          return { data: snapJson, source: 'snapshot' };
        }
      } catch (snapErr) {}
      return { data: null, source: 'fallback' };
    }
  }

  /**
   * Initialize and synchronize all dynamic statistics
   */
  async function initLiveSync(onUpdateCallback) {
    let liveCount = 0;
    const report = {
      isLive: false,
      timestamp: new Date().toLocaleTimeString(),
      sources: []
    };

    try {
      const parlResult = await fetchWorldBankIndicator('SG.GEN.PARL.ZS', 'WLD');
      if (parlResult.source === 'live') {
        liveCount++;
        report.sources.push("World Bank (Parliament Representation)");
      } else if (parlResult.source === 'snapshot' || parlResult.source === 'cache') {
        report.sources.push("World Bank Verified Snapshot");
      }

      const laborResult = await fetchWorldBankIndicator('SL.TLF.CACT.FE.ZS', 'WLD');
      if (laborResult.source === 'live') {
        liveCount++;
        report.sources.push("World Bank (Labor Force)");
      }

      // Check UN SDG snapshot/live status
      const unResult = await fetchUnSdgIndicator('5.1.1');
      if (unResult.source === 'live') {
        liveCount++;
        report.sources.push("UN SDG Indicators API");
      } else if (unResult.source === 'snapshot') {
        report.sources.push("UN SDG Verified Snapshot");
      }

      report.isLive = liveCount > 0;
      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback(report);
      }
    } catch (e) {
      console.log("Live API sync engaged snapshot baseline:", e);
      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback(report);
      }
    }
    return report;
  }

  return {
    getFallbackGlobal: () => ({ ...FALLBACK_GLOBAL }),
    getRegionalViolence: () => JSON.parse(JSON.stringify(REGIONAL_VIOLENCE_DATA)),
    getPayGapComparison: () => JSON.parse(JSON.stringify(PAY_GAP_COMPARISON)),
    getStreetSafetyData: () => JSON.parse(JSON.stringify(STREET_SAFETY_DATA)),
    getGlobeHotspots: () => JSON.parse(JSON.stringify(GLOBE_HOTSPOTS)),
    getTimelineData: () => JSON.parse(JSON.stringify(TIMELINE_DATA)),
    fetchWorldBankIndicator,
    fetchUnSdgIndicator,
    fetchWhoViolenceData,
    initLiveSync
  };
})();

// Export globally for browser scripts
if (typeof window !== 'undefined') {
  window.DataService = DataService;
}
