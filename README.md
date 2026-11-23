# Beyond the Shadows: Global Gender Equality & Everyday Safety 🌍💜
> **United Nations Sustainable Development Goal 5 (SDG 5) Interactive Web Platform**  
> Dedicated to eradicating gender-based violence, bridging the global pay gap, and fostering everyday allyship.

---

## 🌟 Vision & Ethos
> *"The fight for equality should never lie solely upon a woman."*

**Beyond the Shadows** is an interactive, educational, and action-oriented digital platform created to address United Nations Sustainable Development Goal 5: **Gender Equality**. 

The platform merges two complementary creative paradigms:
1. **The Artistic & Narrative Immersion of *Why Zero*:** Through interactive 3D WebGL scenes in **Three.js**, the site communicates the emotional reality of everyday street safety, hypervigilance, and systemic barriers.
2. **The Empirical Authority of *Our World in Data*:** Through **Chart.js** and live REST APIs (**World Bank Open Data**, **UN SDG Indicators**, and the **World Health Organisation**), the site demonstrates that gender discrimination is an undeniable, global crisis requiring immediate collective action.

---

## 🎯 Key Features & Capabilities

### 1. Dual Three.js 3D Visualisations (Why Zero Inspired)
- **Interactive 3D Global Earth (Hero Anchor)**:
  - A realistic 3D Earth globe with topological beacons, glowing atmospheric shaders, and pulsing coordinate beacons.
  - Interactive hotspots for the UK & Europe, North America, Sub-Saharan Africa, South Asia, Latin America, East Asia, and Oceania.
  - Smooth camera orbit transitions, localized hotline info, and regional statistics.
- **The Everyday Maze & Night Walk (Micro-Narrative)**:
  - An isometric, low-poly 3D urban pathway depicting the constant risk calculations, detours, and "corners women must cut" when walking home after dark.
  - **Interactive Branching Decision at Stage 3**: Choose between **Option A: The Well-Lit Main Road (+20 min detour)** and **Option B: The Shortcut (Unlit Alleyway)**, demonstrating the invisible time tax women pay to stay safe.
  - Features Lillian Greenwood’s parliamentary address on the personal safety worries of women and girls in Liverpool.
  - Procedural footstep audio synthesis via the **Web Audio API** (toggleable, zero external dependencies).
- **3D Hydrangea Purple Flower Centerpiece**:
  - The enduring purple hydrangea—a symbol of resilience, survivor solidarity, and healing.
- **3D Mobile Phone Hotline Interface**:
  - Interactive 3D smartphone simulator with real-time screen canvas updates to test crisis dialing protocols.

### 2. Live API Telemetry & Empirical Visualizations (Our World in Data Inspired)
- **Live World Bank Open Data & UN SDG Indicators API**:
  - Connects to World Bank indicator feeds (`SG.GEN.PARL.ZS`, `SL.TLF.CACT.FE.ZS`, `SG.VAW.1549.ZS`, `SG.LAW.INDX`) and UN SDG Targets (`5.1.1`, `5.2.1`, `5.5.1`).
  - **Resilient Cache-First / Fallback Strategy**: 24-hour `localStorage` caching combined with bundled offline snapshot JSON files in `data/`, ensuring 100% operational reliability even offline or under API rate limits.
- **5 Autoritative Chart.js Visualizations**:
  - **The 1 in 3 Crisis:** Stacked bar chart breaking down lifetime physical/sexual intimate partner violence vs. non-partner sexual violence.
  - **Economic Parity & Leadership Disparity:** Comparative analysis of wage gaps vs. female labor force participation vs. parliamentary seats.
  - **Night Safety Perception Divide:** Graphic contrast between how safe men vs. women feel walking alone after dark in their communities.
  - **Safety & Justice Index:** World Bank Women, Business & the Law Score (0-100) vs. Female Night Safety Perceptions.
  - **20-Year Longitudinal Time Slider (2004–2024):** Interactive range slider and line trend chart visualizing whether indicators have improved, stagnated, or regressed over two decades.
  - **Interactive Country Explorer:** Benchmarking scorecard across 14+ benchmark nations.

### 3. Education & Changing Behaviour ("Rethinking Stereotypes")
- **3D Flippable Myth vs. Reality Cards:**
  - Interactive cards that debunk societal myths surrounding domestic abuse, wage gaps, catcalling, and allyship responsibilities.
- **Interactive Allyship Assessment Prompt Tool:**
  - Non-judgmental interactive scenario prompt tool covering group chat dynamics, nighttime walking etiquette, workplace idea attribution, and public transit harassment.
  - Provides instant constructive advice and active bystander intervention education (**The 5 Ds: Direct, Distract, Delegate, Delay, Document**).
- **Everyday Allyship Commitment Checklist:**
  - Actionable commitments for men and community members with dynamic percentage bar and celebration feedback.

### 4. Verified Charities & Emergency Hotlines
- Filterable directory connecting users directly to verified organizations:
  - **UN Women** — Global intergovernmental policy & monitoring.
  - **Refuge (UK)** — Emergency accommodation & 24/7 Helpline.
  - **Women’s Aid** — Grassroots survivor support & education.
  - **White Ribbon UK & Global** — Engaging men and boys to end violence.
  - **Equality Now** — International legal advocacy.
  - **RAINN** — Anti-sexual violence support.
  - **Malala Fund** — Girls' education and youth advocacy.
  - **Global Fund for Women** — Direct funding for feminist grassroots movements.
  - **Womankind Worldwide** — Defending survivors & lobbying against discrimination.
  - **MenEngage Alliance** — Mobilizing men and boys for gender justice.
- 24/7 emergency hotline directory for UK, US, and international services.

### 5. Trauma-Informed Safety, Ethics & Accessibility
- **Instant Quick Exit Button & [ESC] Shortcut:**
  - Persistent, high-visibility button that instantly clears session history and replaces the tab with BBC Weather.
- **Mindful Content Warning (Trigger Warning):**
  - Respectful, subtle banner giving visitors agency over sensitive content with immediate lifeline links.
- **WCAG 2.1 AA Compliance & Reduced-Motion Accessibility:**
  - High-contrast, colorblind-friendly color palettes (vibrant coral `#FF4B4B`, deep violet `#a855f7`, survivor teal `#14b8a6`, stark white `#ffffff`).
  - Supports `prefers-reduced-motion` and includes a dedicated header toggle to pause 3D rotations and animations.

---

## 🚀 How to Run the Website

### Option 1: Direct Browser Launch
Simply double-click or open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).

### Option 2: Local Static Server
If you wish to serve the site locally via HTTP:
```powershell
# In PowerShell:
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Or double-click **`start-server.bat`**, then open `http://localhost:8080` in your web browser.

---

## 📁 Project File Structure
```
├── index.html                   # Main semantic HTML5 webpage structure
├── style.css                    # Modern dark editorial CSS with responsive layouts & animations
├── app.js                       # Master application controller, quick exit, and UI orchestration
├── data-service.js              # Live API client (World Bank & UN SDG) with offline caching
├── charts-app.js                # Chart.js analytics engine & 20-year time slider
├── allyship-assessment.js       # Interactive scenario prompt tool & 5 Ds bystander guide
├── earth3d.js                   # Interactive 3D Earth Globe built with Three.js
├── maze3d.js                    # Interactive 3D Night Walk / Labyrinth with branching choices
├── flower3d.js                  # 3D Purple Hydrangea symbol of healing & survivor resilience
├── phone3d.js                   # 3D Mobile Phone with dynamic helpline dialing simulation
├── sound-fx.js                  # Procedural Web Audio API sound generator
├── serve.ps1                    # Static local PowerShell HTTP server
├── start-server.bat             # Windows batch launch script
├── data/                        # Bundled offline snapshot JSON datasets
│   ├── worldbank_gender_snapshot.json
│   ├── un_sdg5_snapshot.json
│   ├── who_violence_snapshot.json
│   └── timeline_sdg5.json
└── libs/
    ├── three.min.js             # Three.js 3D library
    ├── OrbitControls.js         # Three.js camera controls
    ├── GLTFLoader.js            # Three.js GLTF/GLB loader
    ├── gsap.min.js              # GSAP animation library
    ├── chart.umd.min.js         # Chart.js library
    └── canvas-confetti.min.js   # Confetti particle engine
```

---

## 📜 Academic & Data Citations
1. **United Nations (2023–2024):** *Sustainable Development Goal 5: Achieve gender equality and empower all women and girls.* UN Statistics Division (`https://unstats.un.org/SDGAPI/v1/sdg/Goal/5/Target/Data`).
2. **World Health Organization (2023):** *Violence against women prevalence estimates, 2018.* Global Health Observatory (`https://ghoapi.azureedge.net/api/VIOLENCE_IPV_LIFETIME`).
3. **UK Government & Lillian Greenwood (2023):** *Ministerial address on women and girls' safety and transport mobility in Liverpool.*
4. **The World Bank (2024):** *Women, Business and the Law & Gender Data Portal* (`SG.GEN.PARL.ZS`, `SL.TLF.CACT.FE.ZS`, `SG.VAW.1549.ZS`, `SG.LAW.INDX`).
5. **Gallup World Poll & UK Office for National Statistics (ONS):** *Perceptions of personal safety walking alone after dark.*
