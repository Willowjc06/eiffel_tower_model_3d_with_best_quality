/**
 * LA TOUR MYSTIQUE - Interactive 3D Eiffel Tower Website
 * Core WebGL Engine, Camera Choreography, Scroll Animations, and Heist Minigame
 */

// Global State
const state = {
  modelLoaded: false,
  modelScale: 1.0,
  targetScale: 1.0,
  isShrunk: false,
  hasOrb: false,
  isInteractiveMode: false,
  soundEnabled: false,
  currentSection: 'hero-section',
  tricolorActive: false,
  cameraTarget: new THREE.Vector3(0, 0, 0),
  baseModelHeight: 15
};

// Scene Objects
let scene, camera, renderer, controls;
let towerGroup, towerModel, auraSprite, particleSystem;
let tricolorLights = [];
let dirLightKey, dirLightFill, dirLightRim;
let audioCtx = null;

// DOM Elements
const container = document.getElementById('webgl-container');
const loaderOverlay = document.getElementById('loader-overlay');
const loaderFill = document.getElementById('loader-fill');
const loaderStatus = document.getElementById('loader-status');
const scrollProgress = document.getElementById('scroll-progress');
const mysticalGlow = document.getElementById('mystical-glow');

// Initialize WebGL Application
function initApp() {
  setupThreeScene();
  setupLighting();
  setupGoldenAura();
  setupGoldenParticles();
  setupAudio();
  loadTowerModel();
  setupScrollTriggers();
  setupEventListeners();
  animate();
}

/**
 * 1. THREE.JS SCENE SETUP
 */
function setupThreeScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050608, 0.015);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // Default Launch View (I2): Horizontal view of the tower
  camera.position.set(0, 2, 28);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // OrbitControls for Free Inspection Mode
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enabled = false; // Disabled by default, enabled in Free Mode
  controls.maxDistance = 60;
  controls.minDistance = 3;

  towerGroup = new THREE.Group();
  scene.add(towerGroup);
}

/**
 * 2. LIGHTING SETUP (Atmospheric Golden Parisian Night + French Tricolor)
 */
function setupLighting() {
  // Ambient Light with warm champagne tone
  const ambientLight = new THREE.AmbientLight(0xd4af37, 0.45);
  scene.add(ambientLight);

  // Key Directional Light (Warm Sun / Golden Spotlight)
  dirLightKey = new THREE.DirectionalLight(0xfff3d6, 1.8);
  dirLightKey.position.set(15, 25, 20);
  scene.add(dirLightKey);

  // Fill Light (Midnight Parisian Blue)
  dirLightFill = new THREE.DirectionalLight(0x2563eb, 0.8);
  dirLightFill.position.set(-15, 10, -10);
  scene.add(dirLightFill);

  // Rim Light (Brilliant Gold edge light)
  dirLightRim = new THREE.DirectionalLight(0xf59e0b, 1.5);
  dirLightRim.position.set(0, -10, -15);
  scene.add(dirLightRim);

  // French Tricolor Point Lights (Bleu, Blanc, Rouge)
  const blueLight = new THREE.PointLight(0x1d4ed8, 0, 30);
  blueLight.position.set(-8, 5, 8);
  scene.add(blueLight);

  const whiteLight = new THREE.PointLight(0xffffff, 0, 30);
  whiteLight.position.set(0, 10, 8);
  scene.add(whiteLight);

  const redLight = new THREE.PointLight(0xdc2626, 0, 30);
  redLight.position.set(8, 5, 8);
  scene.add(redLight);

  tricolorLights = [blueLight, whiteLight, redLight];
}

/**
 * 3. GOLDEN AURA (I2: "gold, glowing aura coming off the tower")
 */
function setupGoldenAura() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
  gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.45)');
  gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffd700,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  auraSprite = new THREE.Sprite(spriteMaterial);
  auraSprite.scale.set(22, 28, 1);
  auraSprite.position.set(0, 2, -1);
  towerGroup.add(auraSprite);
}

/**
 * 4. FLOATING GOLD PARTICLES (I1 & I2: "gold specs to give off a luxurious feeling")
 */
function setupGoldenParticles() {
  const particleCount = 700;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const radius = 2 + Math.random() * 14;
    const theta = Math.random() * Math.PI * 2;
    const y = -8 + Math.random() * 26;

    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;

    scales[i] = Math.random() * 1.5 + 0.5;
    speeds[i] = Math.random() * 0.015 + 0.005;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  // Shimmering particle texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 64;
  pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  pGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.9)');
  pGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.3)');
  pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 64, 64);

  const particleTexture = new THREE.CanvasTexture(pCanvas);
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.45,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0xfbbf24
  });

  particleSystem = new THREE.Points(geometry, particleMaterial);
  particleSystem.userData = { speeds: speeds };
  scene.add(particleSystem);
}

/**
 * 5. 3D EIFFEL TOWER MODEL LOADER (GLTF with fallback)
 */
function loadTowerModel() {
  const loader = new THREE.GLTFLoader();

  loaderStatus.textContent = 'Loading 3D Model: scene.gltf & scene.bin...';

  loader.load(
    'scene.gltf',
    (gltf) => {
      towerModel = gltf.scene;

      // Calculate Bounding Box to center and scale uniformly
      const box = new THREE.Box3().setFromObject(towerModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetHeight = 16.0;
      const scaleFactor = targetHeight / maxDim;

      towerModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Re-center so base sits comfortably near ground
      towerModel.position.x = -center.x * scaleFactor;
      towerModel.position.y = -center.y * scaleFactor;
      towerModel.position.z = -center.z * scaleFactor;

      // Enhance materials for luxury bronze-gold metallic finish
      towerModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            // Apply classy wrought iron metallic sheen
            child.material.metalness = 0.88;
            child.material.roughness = 0.35;
            child.material.envMapIntensity = 1.8;
            // Warm golden-iron tone
            child.material.color.setHex(0xb89758);
          }
        }
      });

      towerGroup.add(towerModel);
      state.modelLoaded = true;
      finishLoading('Model ready: 18,038 Puddle Iron Lattice Elements Loaded.');
    },
    (xhr) => {
      if (xhr.lengthComputable) {
        const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
        loaderFill.style.width = percent + '%';
        loaderStatus.textContent = `Assembling Puddle Iron Lattice: ${percent}%`;
      } else {
        loaderFill.style.width = '75%';
        loaderStatus.textContent = 'Assembling Puddle Iron Lattice...';
      }
    },
    (error) => {
      console.warn('GLTF loading error, activating high-fidelity procedural Eiffel Tower fallback:', error);
      createProceduralEiffelTower();
      finishLoading('Procedural Eiffel Tower Loaded.');
    }
  );

  // Safety fallback timer if load hangs (e.g., file protocol restrictions)
  setTimeout(() => {
    if (!state.modelLoaded) {
      console.log('Activating procedural fallback model for instant display...');
      createProceduralEiffelTower();
      finishLoading('High-Fidelity Tower Active.');
    }
  }, 4000);
}

function finishLoading(msg) {
  loaderFill.style.width = '100%';
  loaderStatus.textContent = msg;
  setTimeout(() => {
    loaderOverlay.classList.add('fade-out');
  }, 600);
}

/**
 * High-Fidelity Procedural Eiffel Tower Fallback
 * Used if GLTF file loading is delayed or blocked
 */
function createProceduralEiffelTower() {
  if (towerModel) return;

  towerModel = new THREE.Group();
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.35,
    wireframe: false
  });

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    wireframe: true,
    emissive: 0x332200
  });

  // Base 4 Arched Legs
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const legGeo = new THREE.CylinderGeometry(0.5, 1.2, 5, 6);
    const leg = new THREE.Mesh(legGeo, ironMat);
    leg.position.set(Math.cos(angle) * 3.5, -4.5, Math.sin(angle) * 3.5);
    leg.rotation.z = Math.cos(angle) * 0.3;
    leg.rotation.x = -Math.sin(angle) * 0.3;
    towerModel.add(leg);
  }

  // Arch connectors
  const torusGeo = new THREE.TorusGeometry(3.2, 0.3, 8, 24, Math.PI);
  const arch1 = new THREE.Mesh(torusGeo, ironMat);
  arch1.rotation.x = Math.PI / 2;
  arch1.position.y = -3;
  towerModel.add(arch1);

  // Level 1 Platform
  const plat1 = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 6.2), ironMat);
  plat1.position.y = -2;
  towerModel.add(plat1);

  // Middle Pillar Section (tapered)
  const midGeo = new THREE.ConeGeometry(2.6, 6, 4, 8, true);
  const midMesh = new THREE.Mesh(midGeo, wireMat);
  midMesh.position.y = 1;
  towerModel.add(midMesh);

  // Level 2 Platform
  const plat2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.3, 3.8), ironMat);
  plat2.position.y = 4;
  towerModel.add(plat2);

  // Spire Upper Tower
  const spireGeo = new THREE.ConeGeometry(1.6, 9, 4, 12, true);
  const spireMesh = new THREE.Mesh(spireGeo, wireMat);
  spireMesh.position.y = 8.5;
  towerModel.add(spireMesh);

  // Summit Viewing Platform (I4)
  const summitPlat = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 16), ironMat);
  summitPlat.position.y = 12.8;
  towerModel.add(summitPlat);

  // Lantern & Beacon Spire Tip
  const tipGeo = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
  const tip = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({
    color: 0xfff0aa,
    emissive: 0xffd700,
    emissiveIntensity: 0.8
  }));
  tip.position.y = 14;
  towerModel.add(tip);

  towerGroup.add(towerModel);
  state.modelLoaded = true;
}

/**
 * 6. GSAP SCROLL STORYTELLING CHOREOGRAPHY
 * Implements I2, I3, I4, I5, I6
 */
function setupScrollTriggers() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Section (I2: Launch View)
  // "horizontal view of the Eiffel tower, with a slow spin, with a black background and a gold, glowing aura"
  ScrollTrigger.create({
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom top',
    onEnter: () => transitionToSection('hero'),
    onEnterBack: () => transitionToSection('hero')
  });

  // 2. Feature 1: Shape (Triangular) & Repetition (I3)
  // "The object will spin in place as it glows."
  ScrollTrigger.create({
    trigger: '#feature-shape',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => transitionToSection('shape'),
    onEnterBack: () => transitionToSection('shape')
  });

  // 3. Feature 2: Height & Summit Viewing Platform (I4)
  // "it can pan to the top of the tower, as that's a popular tourist attraction within Paris is (the viewing platform)"
  ScrollTrigger.create({
    trigger: '#feature-height',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => transitionToSection('height'),
    onEnterBack: () => transitionToSection('height')
  });

  // 4. Feature 3: Material Realism & Iron Texture (I5)
  // "The zoom will include the towers texture and realism of it."
  ScrollTrigger.create({
    trigger: '#feature-material',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => transitionToSection('material'),
    onEnterBack: () => transitionToSection('material')
  });

  // 5. Heist Briefing & French Tricolor (I6)
  // "As you scroll down, the French flag colours will appear, and text about the process of buying and stealing the tower will be available."
  ScrollTrigger.create({
    trigger: '#heist-briefing',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => transitionToSection('heist-brief'),
    onEnterBack: () => transitionToSection('heist-brief')
  });

  // 6. Interactive CTA Arena (I6)
  // "The user will have to buy a special orb, to then throw at the tower, which will shrink and makes it able to be taken away"
  ScrollTrigger.create({
    trigger: '#heist-arena',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => transitionToSection('arena'),
    onEnterBack: () => transitionToSection('arena')
  });

  // 7. Finale & Re-enlargement (I6)
  // "You continue to scroll, and the tower will appear again(small) and glow with gold and will enlarge again."
  ScrollTrigger.create({
    trigger: '#finale-section',
    start: 'top center',
    end: 'bottom bottom',
    onEnter: () => transitionToSection('finale'),
    onEnterBack: () => transitionToSection('finale')
  });

  // Global Scroll Progress Bar
  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  });
}

/**
 * Dynamic Camera & Atmosphere Transitions based on PRD Sections
 */
function transitionToSection(sectionKey) {
  if (state.isInteractiveMode) return;

  const duration = 1.6;
  const ease = 'power2.inOut';

  switch (sectionKey) {
    case 'hero':
      // I2: Launch view - Horizontal view, eye level, slow spin
      gsap.to(camera.position, { x: 0, y: 1.5, z: 27, duration, ease });
      gsap.to(state.cameraTarget, { x: 0, y: 0, z: 0, duration, ease });
      setTricolorAtmosphere(false);
      break;

    case 'shape':
      // I3: Triangular geometry - spin in place as it glows
      gsap.to(camera.position, { x: 12, y: 3, z: 24, duration, ease });
      gsap.to(state.cameraTarget, { x: 0, y: 1, z: 0, duration, ease });
      setTricolorAtmosphere(false);
      break;

    case 'height':
      // I4: Pan to the top of the tower / viewing platform
      gsap.to(camera.position, { x: 4, y: 7.5, z: 10, duration, ease });
      gsap.to(state.cameraTarget, { x: 0, y: 6.8, z: 0, duration, ease });
      setTricolorAtmosphere(false);
      break;

    case 'material':
      // I5: Macro zoom on iron lattice texture & realism
      gsap.to(camera.position, { x: -2.5, y: -0.5, z: 5.5, duration, ease });
      gsap.to(state.cameraTarget, { x: -0.5, y: -0.8, z: 0, duration, ease });
      setTricolorAtmosphere(false);
      break;

    case 'heist-brief':
      // I6: French flag colors appear, full view of the tower
      gsap.to(camera.position, { x: 0, y: 3, z: 25, duration, ease });
      gsap.to(state.cameraTarget, { x: 0, y: 1, z: 0, duration, ease });
      setTricolorAtmosphere(true);
      break;

    case 'arena':
      // I6: Shrink Arena framing
      gsap.to(camera.position, { x: 0, y: 2, z: 24, duration, ease });
      gsap.to(state.cameraTarget, { x: 0, y: 1, z: 0, duration, ease });
      setTricolorAtmosphere(true);
      break;

    case 'finale':
      // I6: "tower will appear again(small) and glow with gold and will enlarge again"
      gsap.to(camera.position, { x: -8, y: 2, z: 22, duration, ease });
      gsap.to(state.cameraTarget, { x: 0, y: 0, z: 0, duration, ease });
      setTricolorAtmosphere(false);
      triggerAutoEnlargeOnScroll();
      break;
  }
}

/**
 * Toggle French Flag Colors Lighting & Background Atmosphere (I6)
 */
function setTricolorAtmosphere(active) {
  state.tricolorActive = active;
  if (active) {
    mysticalGlow.classList.add('tricolor-mode');
    tricolorLights.forEach((l) => {
      gsap.to(l, { intensity: 2.2, duration: 1.2 });
    });
  } else {
    mysticalGlow.classList.remove('tricolor-mode');
    tricolorLights.forEach((l) => {
      gsap.to(l, { intensity: 0, duration: 1.0 });
    });
  }
}

/**
 * 7. THE INTERACTIVE HEIST CTA (I6)
 * - Buying the special orb
 * - Throwing the orb at the tower
 * - Tower shrinking to pocket size
 * - Scrolling to appear small, glow with gold, and enlarging again
 */
function setupEventListeners() {
  // Modal Buttons
  const btnOpenBuy = document.getElementById('btn-open-buy');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalBackdrop = document.getElementById('buy-modal');
  const btnConfirmBuy = document.getElementById('btn-confirm-buy');

  if (btnOpenBuy) {
    btnOpenBuy.addEventListener('click', () => {
      modalBackdrop.classList.add('active');
      playTone(520, 0.15, 'sine');
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
  }

  // Click outside modal to close
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
      }
    });
  }

  // Confirm Purchase
  if (btnConfirmBuy) {
    btnConfirmBuy.addEventListener('click', () => {
      state.hasOrb = true;
      modalBackdrop.classList.remove('active');
      playTone(660, 0.25, 'triangle');
      setTimeout(() => playTone(880, 0.35, 'triangle'), 150);

      // Show the draggable / clickable orb weapon
      document.getElementById('orb-weapon-box').style.display = 'flex';
      document.getElementById('btn-open-buy').style.display = 'none';

      // Confetti burst
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#1d4ed8', '#ffffff', '#dc2626', '#fbbf24']
        });
      }
    });
  }

  // Interactive Special Orb Throw Action
  const specialOrb = document.getElementById('special-orb');
  if (specialOrb) {
    specialOrb.addEventListener('click', () => {
      launchOrbAttack();
    });

    // Drag support
    let isDragging = false;
    specialOrb.addEventListener('mousedown', () => { isDragging = true; });
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        launchOrbAttack();
      }
    });
  }

  // Manual Enlarge & Shrink Controls in Finale Section
  const btnEnlargeTower = document.getElementById('btn-enlarge-tower');
  const btnShrinkAgain = document.getElementById('btn-shrink-again');
  const scaleSlider = document.getElementById('scale-slider');

  if (btnEnlargeTower) {
    btnEnlargeTower.addEventListener('click', () => {
      enlargeTowerWithFanfare();
    });
  }

  if (btnShrinkAgain) {
    btnShrinkAgain.addEventListener('click', () => {
      shrinkTowerWithEffect();
    });
  }

  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setTowerScale(val);
    });
  }

  // Camera Level Pills in Feature 2 (I4)
  document.querySelectorAll('.btn-level').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-level').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const level = btn.getAttribute('data-level');
      flyToLevel(level);
    });
  });

  // HUD Controls
  const btnToggleInspect = document.getElementById('btn-toggle-inspect');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const btnResetView = document.getElementById('btn-reset-view');

  if (btnToggleInspect) {
    btnToggleInspect.addEventListener('click', () => {
      state.isInteractiveMode = !state.isInteractiveMode;
      controls.enabled = state.isInteractiveMode;
      container.classList.toggle('interactive', state.isInteractiveMode);
      btnToggleInspect.classList.toggle('active', state.isInteractiveMode);
      btnToggleInspect.querySelector('.hud-label').textContent = state.isInteractiveMode
        ? '3D Orbit: ON'
        : '3D Orbit: OFF';
    });
  }

  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      btnToggleSound.classList.toggle('active', state.soundEnabled);
      btnToggleSound.querySelector('.hud-label').textContent = state.soundEnabled
        ? 'Audio: ON'
        : 'Audio: OFF';
      if (state.soundEnabled) {
        initAudioContext();
        playTone(440, 0.2, 'sine');
      }
    });
  }

  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      controls.reset();
      transitionToSection('hero');
    });
  }

  // Window Resize
  window.addEventListener('resize', onWindowResize);
}

/**
 * Orb Projectile Attack Simulation (I6)
 */
function launchOrbAttack() {
  const orb = document.getElementById('special-orb');
  const instruction = document.getElementById('orb-instruction');
  const statusBanner = document.getElementById('heist-status-banner');

  if (!orb || orb.classList.contains('thrown')) return;

  orb.classList.add('thrown');
  instruction.textContent = 'Singularity trajectory engaged...';
  playWhooshSound();

  // Create a 3D Glowing Energy Orb in Three.js Scene flying towards the tower!
  const orbGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfbbf24,
    emissiveIntensity: 2.5,
    roughness: 0.1
  });
  const projectileMesh = new THREE.Mesh(orbGeo, orbMat);

  // Position at camera lens
  projectileMesh.position.copy(camera.position).add(new THREE.Vector3(0, -1, -2));
  scene.add(projectileMesh);

  // Animate projectile to hit tower center
  gsap.to(projectileMesh.position, {
    x: 0,
    y: 2,
    z: 0,
    duration: 0.7,
    ease: 'power2.in',
    onComplete: () => {
      scene.remove(projectileMesh);
      triggerTowerImpact();
    }
  });

  // Screen orb visual shrinkage
  gsap.to(orb, {
    scale: 0.1,
    opacity: 0,
    y: -200,
    duration: 0.7,
    ease: 'power2.in',
    onComplete: () => {
      orb.style.display = 'none';
    }
  });
}

/**
 * On Orb Impact: Particles, Sound, Tower Shrinks (I6)
 */
function triggerTowerImpact() {
  // Sound FX: Warp / Dive
  playShrinkSound();

  // French Flag & Gold Confetti Explosion
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#002654', '#1d4ed8', '#ffffff', '#dc2626', '#fbbf24', '#f59e0b']
    });
  }

  // Tower Shrinks down to pocket scale
  shrinkTowerWithEffect();

  // Show Success Banner
  const statusBanner = document.getElementById('heist-status-banner');
  if (statusBanner) {
    statusBanner.style.display = 'block';
    statusBanner.innerHTML = `
      <strong>HEIST ACCOMPLISHED!</strong> The Eiffel Tower has shrunk to 12cm.
      <br>Paris has not noticed. It is now safely in your pocket!
      <br><span style="color: #fbbf24; font-size: 0.85rem; font-style: italic;">Scroll down to witness its golden miniature aura & restoration!</span>
    `;
  }
}

/**
 * Tower Shrink Animation (I6: "The tower will eventually shrink and effects will happen the makes it smaller")
 */
function shrinkTowerWithEffect() {
  state.isShrunk = true;
  state.targetScale = 0.09;

  // Flash Aura with golden blast
  gsap.to(auraSprite.scale, {
    x: 35,
    y: 40,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: 'power2.out'
  });

  // Tower Vibration & Shrink
  gsap.to(towerGroup.scale, {
    x: state.targetScale,
    y: state.targetScale,
    z: state.targetScale,
    duration: 1.4,
    ease: 'elastic.out(1, 0.4)',
    onUpdate: () => {
      state.modelScale = towerGroup.scale.x;
      const slider = document.getElementById('scale-slider');
      if (slider) slider.value = state.modelScale;
    }
  });

  // Lower tower position so miniature rests elegantly
  gsap.to(towerGroup.position, {
    y: -1,
    duration: 1.2,
    ease: 'power2.out'
  });
}

/**
 * Tower Enlarge Animation (I6: "tower will appear again(small) and glow with gold and will enlarge again")
 */
function enlargeTowerWithFanfare() {
  state.isShrunk = false;
  state.targetScale = 1.0;

  playEnlargeSound();

  // Burst aura
  gsap.to(auraSprite.scale, {
    x: 40,
    y: 50,
    duration: 0.4,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut'
  });

  // Expand Tower back to monumental grandeur
  gsap.to(towerGroup.scale, {
    x: 1.0,
    y: 1.0,
    z: 1.0,
    duration: 1.8,
    ease: 'back.out(1.4)',
    onUpdate: () => {
      state.modelScale = towerGroup.scale.x;
      const slider = document.getElementById('scale-slider');
      if (slider) slider.value = state.modelScale;
    }
  });

  gsap.to(towerGroup.position, {
    y: 0,
    duration: 1.5,
    ease: 'power2.out'
  });

  // Celebration Fireworks
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#fbbf24', '#ffffff', '#1d4ed8', '#dc2626']
    });
  }
}

/**
 * Auto trigger enlarge when scrolling into finale section if currently shrunk
 */
function triggerAutoEnlargeOnScroll() {
  if (state.isShrunk) {
    setTimeout(() => {
      enlargeTowerWithFanfare();
    }, 400);
  }
}

function setTowerScale(val) {
  state.modelScale = val;
  state.targetScale = val;
  towerGroup.scale.set(val, val, val);
}

/**
 * Camera Viewpoint Fly-To for Height Levels (I4)
 */
function flyToLevel(level) {
  const duration = 1.5;
  switch (level) {
    case 'base':
      gsap.to(camera.position, { x: 0, y: -2, z: 16, duration });
      gsap.to(state.cameraTarget, { x: 0, y: -3, z: 0, duration });
      break;
    case 'floor1':
      gsap.to(camera.position, { x: 5, y: 1, z: 12, duration });
      gsap.to(state.cameraTarget, { x: 0, y: 0, z: 0, duration });
      break;
    case 'floor2':
      gsap.to(camera.position, { x: -6, y: 4.5, z: 10, duration });
      gsap.to(state.cameraTarget, { x: 0, y: 3.5, z: 0, duration });
      break;
    case 'summit': // I4: Viewing platform
      gsap.to(camera.position, { x: 2, y: 7.8, z: 7.5, duration });
      gsap.to(state.cameraTarget, { x: 0, y: 7.2, z: 0, duration });
      break;
  }
}

/**
 * 8. WEB AUDIO API SYNTHESIZER (Zero-Dependency Sound Effects)
 */
function setupAudio() {
  const onFirstInteraction = () => {
    initAudioContext();
    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
  };
  window.addEventListener('click', onFirstInteraction);
  window.addEventListener('keydown', onFirstInteraction);
}

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playTone(freq, duration, type = 'sine') {
  if (!state.soundEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playWhooshSound() {
  if (!state.soundEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.6);

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
}

function playShrinkSound() {
  if (!state.soundEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 1.2);

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.2);
}

function playEnlargeSound() {
  if (!state.soundEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  // Majestic Golden Major Chord (C - E - G - C)
  const notes = [261.63, 329.63, 392.00, 523.25];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    }, idx * 120);
  });
}

/**
 * 9. ANIMATION LOOP
 */
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // 1. Slow hypnotic spin (I2 & I3: "with a slow spin... The object will spin in place as it glows")
  if (towerGroup && !state.isInteractiveMode) {
    towerGroup.rotation.y += delta * 0.18;
  }

  // 2. Aura breathing pulse (I2: "gold, glowing aura coming off the tower")
  if (auraSprite) {
    const pulse = 1 + Math.sin(elapsed * 2) * 0.08;
    auraSprite.scale.set(22 * pulse, 28 * pulse, 1);
  }

  // 3. Shimmering floating gold particles (I1: "gold specs")
  if (particleSystem) {
    const pos = particleSystem.geometry.attributes.position.array;
    const speeds = particleSystem.userData.speeds;
    const count = pos.length / 3;

    for (let i = 0; i < count; i++) {
      // Drift upwards gently
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 20) {
        pos[i * 3 + 1] = -8;
      }
      // Gentle sine drift
      pos[i * 3] += Math.sin(elapsed + i) * 0.003;
      pos[i * 3 + 2] += Math.cos(elapsed + i) * 0.003;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y = elapsed * 0.03;
  }

  // 4. Update Controls or Camera Target
  if (state.isInteractiveMode) {
    controls.update();
  } else {
    camera.lookAt(state.cameraTarget);
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Kick off when DOM is ready
window.addEventListener('DOMContentLoaded', initApp);
