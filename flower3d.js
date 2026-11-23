/**
 * flower3d.js
 * Three.js Interactive 3D Hydrangea Flower Showcase & Ambient Hero Experience.
 * The Purple Hydrangea symbolizes survival, healing, dignity, and collective rebirth.
 * Serves as the primary artistic, sophisticated centerpiece inspired by why.zero.university.
 */

const Flower3D = (function () {
  'use strict';

  let scene, camera, renderer, controls;
  let flowerGroup, flowerModel, particleSystem;
  let container;
  let isAutoSpinning = true;
  let animationFrameId;
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let currentTheme = 'teal'; // 'teal', 'violet', 'cyan'
  let keyLight, rimLight, ambientLight;

  function init() {
    container = document.getElementById('flower-hero-canvas');
    if (!container || typeof THREE === 'undefined') {
      console.warn('flower-hero-canvas container or THREE not found.');
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 620;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x031317, 0.012);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 18);

    // 2. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding || 3001;
    renderer.toneMapping = THREE.ACESFilmicToneMapping || 4;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.minDistance = 9;
      controls.maxDistance = 28;
      controls.enablePan = false;
      controls.autoRotate = false;
    }

    flowerGroup = new THREE.Group();
    scene.add(flowerGroup);

    // 4. Studio Lighting
    setupLighting();

    // 5. Ambient Ethereal Particle Field (Luminous Spores & Starlight)
    createParticleField();

    // 6. Load GLTF Hydrangea Purple Model
    loadFlowerModel();

    // 7. Event Listeners
    setupEvents();

    // 8. Start Loop
    animate();
  }

  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x0d9488, 0.85); // Teal baseline
    scene.add(ambientLight);

    // Key Light: Survivor Teal
    keyLight = new THREE.DirectionalLight(0x2dd4bf, 2.2);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    // Rim Light: Hydrangea Violet
    rimLight = new THREE.PointLight(0xc084fc, 3.5, 40);
    rimLight.position.set(-10, -5, -8);
    scene.add(rimLight);

    // Accent Underlight
    const underLight = new THREE.PointLight(0x14b8a6, 2.0, 30);
    underLight.position.set(0, -10, 8);
    scene.add(underLight);
  }

  function createParticleField() {
    const count = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const tealColor = new THREE.Color(0x2dd4bf);
    const violetColor = new THREE.Color(0xa855f7);
    const whiteColor = new THREE.Color(0xf0fdfa);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Cylindrical distribution around the flower
      const radius = 4 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 22;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;

      // Color blending between teal and violet
      const pick = Math.random();
      const c = pick < 0.5 ? tealColor : (pick < 0.85 ? violetColor : whiteColor);
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      scales[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using procedural canvas texture
    const particleTex = createGlowTexture();
    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(45, 212, 191, 0.8)');
    grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  function loadFlowerModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.warn('THREE.GLTFLoader is not available. Please verify libs/GLTFLoader.js');
      createFallbackFlower();
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      'models/hydrangea_purple.glb',
      function (gltf) {
        flowerModel = gltf.scene;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(flowerModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Center geometry
        flowerModel.position.x = -center.x;
        flowerModel.position.y = -center.y;
        flowerModel.position.z = -center.z;

        // Scale to ideal viewing size in Three.js units (target max dimension ~9.5)
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scaleFactor = 9.5 / maxDim;
        flowerGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Enhance materials
        flowerModel.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 0.45;
            child.material.metalness = 0.12;
            if (child.material.map) {
              child.material.map.encoding = THREE.sRGBEncoding || 3001;
            }
          }
        });

        flowerGroup.add(flowerModel);

        // Initial orientation: slightly tilted forward for heroic composition
        flowerGroup.rotation.x = 0.25;
        flowerGroup.rotation.y = -0.4;

        const loaderIndicator = document.getElementById('flower-loader-status');
        if (loaderIndicator) {
          loaderIndicator.style.opacity = '0';
          setTimeout(() => loaderIndicator.remove(), 400);
        }
      },
      function (xhr) {
        // Progress
        const percent = Math.round((xhr.loaded / (xhr.total || 11641328)) * 100);
        const loaderLabel = document.getElementById('flower-loader-pct');
        if (loaderLabel) loaderLabel.textContent = `${percent}%`;
      },
      function (err) {
        console.warn('Error loading hydrangea_purple.glb, using artistic procedural bloom:', err);
        createFallbackFlower();
      }
    );
  }

  function createFallbackFlower() {
    // Beautiful procedural floret cluster if GLTF fails
    const group = new THREE.Group();
    const petalGeo = new THREE.DodecahedronGeometry(0.8, 1);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.2
    });

    for (let i = 0; i < 45; i++) {
      const mesh = new THREE.Mesh(petalGeo, petalMat);
      const phi = Math.acos(-1 + (2 * i) / 45);
      const theta = Math.sqrt(45 * Math.PI) * phi;
      mesh.position.set(
        Math.cos(theta) * Math.sin(phi) * 4.2,
        Math.sin(theta) * Math.sin(phi) * 4.2,
        Math.cos(phi) * 4.2
      );
      mesh.scale.setScalar(0.7 + Math.random() * 0.6);
      group.add(mesh);
    }
    flowerModel = group;
    flowerGroup.add(flowerModel);
  }

  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);

    // Mouse movement for delicate parallax
    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.clientX - halfW) / halfW;
      mouseY = (e.clientY - halfH) / halfH;
      targetRotationY = mouseX * 0.35;
      targetRotationX = mouseY * 0.2;
    }, { passive: true });

    // Interactive petal ripple on click
    if (container) {
      container.addEventListener('click', () => {
        triggerPetalRipple();
        if (window.SoundFX) {
          window.SoundFX.playTealChime(528);
        }
      });
    }

    // UI Buttons
    const btnSpin = document.getElementById('btn-flower-spin');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        isAutoSpinning = !isAutoSpinning;
        btnSpin.innerHTML = isAutoSpinning ? '<span class="icon">🔄</span> Auto-Orbit: ON' : '<span class="icon">⏸️</span> Auto-Orbit: PAUSED';
        btnSpin.classList.toggle('active', isAutoSpinning);
      });
    }

    const btnThemeTeal = document.getElementById('btn-flower-theme-teal');
    const btnThemeViolet = document.getElementById('btn-flower-theme-violet');
    const btnThemeCyan = document.getElementById('btn-flower-theme-cyan');

    if (btnThemeTeal) btnThemeTeal.addEventListener('click', () => setAtmosphere('teal'));
    if (btnThemeViolet) btnThemeViolet.addEventListener('click', () => setAtmosphere('violet'));
    if (btnThemeCyan) btnThemeCyan.addEventListener('click', () => setAtmosphere('cyan'));

    const btnResetView = document.getElementById('btn-flower-reset');
    if (btnResetView) {
      btnResetView.addEventListener('click', resetView);
    }
  }

  function triggerPetalRipple() {
    if (!flowerGroup) return;
    // Quick celebratory scale pulse
    if (typeof gsap !== 'undefined') {
      gsap.to(flowerGroup.scale, {
        x: flowerGroup.scale.x * 1.08,
        y: flowerGroup.scale.y * 1.08,
        z: flowerGroup.scale.z * 1.08,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }
  }

  function setAtmosphere(theme) {
    currentTheme = theme;
    document.querySelectorAll('.flower-theme-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-flower-theme-${theme}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (!keyLight || !rimLight || !ambientLight) return;

    if (theme === 'teal') {
      // Survivor Teal
      ambientLight.color.setHex(0x0d9488);
      keyLight.color.setHex(0x2dd4bf);
      rimLight.color.setHex(0xc084fc);
    } else if (theme === 'violet') {
      // Hydrangea Twilight
      ambientLight.color.setHex(0x3b0764);
      keyLight.color.setHex(0xa855f7);
      rimLight.color.setHex(0x5eead4);
    } else if (theme === 'cyan') {
      // Luminescence (Radiant Cyan)
      ambientLight.color.setHex(0x083344);
      keyLight.color.setHex(0x06b6d4);
      rimLight.color.setHex(0xe879f9);
    }
  }

  function resetView() {
    if (camera && controls) {
      if (typeof gsap !== 'undefined') {
        gsap.to(camera.position, { x: 0, y: 1.2, z: 18, duration: 1.0, ease: 'power2.out' });
        gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power2.out' });
      } else {
        camera.position.set(0, 1.2, 18);
        controls.target.set(0, 0, 0);
      }
      controls.update();
    }
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Organic floating oscillation
    if (flowerGroup) {
      flowerGroup.position.y = Math.sin(time * 0.8) * 0.35;

      if (isAutoSpinning) {
        flowerGroup.rotation.y += 0.0035;
      }

      // Parallax easing
      flowerGroup.rotation.x += (targetRotationX - flowerGroup.rotation.x) * 0.03;
      if (!isAutoSpinning) {
        flowerGroup.rotation.y += (targetRotationY - flowerGroup.rotation.y) * 0.03;
      }
    }

    // Particle drift & orbit
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.04;
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.008;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  return {
    init,
    resetView,
    setAtmosphere,
    triggerPetalRipple,
    setReducedMotion: (reduced) => {
      isAutoSpinning = !reduced;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.Flower3D = Flower3D;
}
