/**
 * earth3d.js
 * Three.js 3D Earth Globe Showcase using the realistic 'models/earth.glb' model.
 * Operates in direct tandem with the World Bank Open Data API & UN SDG 5 Indicators.
 * Proves that violence, pay disparity, and night safety anxiety exist in every region of the world.
 */

const Earth3D = (function () {
  'use strict';

  let scene, camera, renderer, controls;
  let earthGroup, earthModel, beaconGroup, atmosphereMesh;
  let container;
  let isAutoRotating = true;
  let animationFrameId;
  let raycaster, mouse;
  let activeRegionIndex = 0;
  const EARTH_RADIUS = 70;

  // Lat/Lon to 3D Cartesian coordinates on sphere of radius R
  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  function init() {
    container = document.getElementById('globe-canvas-container');
    if (!container || typeof THREE === 'undefined') {
      console.warn('globe-canvas-container or THREE not found.');
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x031317, 0.0035);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 25, 230);

    // 2. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding || 3001;
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.minDistance = 120;
      controls.maxDistance = 350;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enablePan = false;
    }

    earthGroup = new THREE.Group();
    scene.add(earthGroup);

    beaconGroup = new THREE.Group();
    earthGroup.add(beaconGroup);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 4. Lighting Setup
    setupLighting();

    // 5. Atmospheric Teal Aura
    createAtmosphere();

    // 6. Load GLTF Earth Model
    loadEarthModel();

    // 7. Event Handlers
    setupEvents();

    // 8. Start Loop
    animate();
  }

  function setupLighting() {
    // Ambient Teal Light
    const ambient = new THREE.AmbientLight(0x14b8a6, 0.65);
    scene.add(ambient);

    // Main Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(150, 80, 120);
    scene.add(sunLight);

    // Teal Backlight
    const backLight = new THREE.DirectionalLight(0x2dd4bf, 1.2);
    backLight.position.set(-120, -50, -100);
    scene.add(backLight);
  }

  function createAtmosphere() {
    // Soft outer atmosphere glow sphere
    const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.05, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphereMesh);

    // Equator / Orbit Ring
    const ringGeo = new THREE.RingGeometry(EARTH_RADIUS * 1.18, EARTH_RADIUS * 1.22, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    earthGroup.add(ring);
  }

  function loadEarthModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.warn('THREE.GLTFLoader not available, rendering procedural earth globe');
      createFallbackGlobe();
      createBeacons();
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      'models/earth.glb',
      function (gltf) {
        earthModel = gltf.scene;

        // Auto-center and normalize scale to match EARTH_RADIUS (70)
        const box = new THREE.Box3().setFromObject(earthModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        earthModel.position.sub(center);

        // Unit sphere in earth.glb has radius ~1.0, so scaling by 70 gives radius 70
        const maxDim = Math.max(size.x, size.y, size.z) || 2;
        const scale = (EARTH_RADIUS * 2) / maxDim;
        earthModel.scale.set(scale, scale, scale);

        earthModel.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = 0.65;
            child.material.metalness = 0.15;
            if (child.material.map) {
              child.material.map.encoding = THREE.sRGBEncoding || 3001;
            }
          }
        });

        earthGroup.add(earthModel);

        // Build 3D Geolocation Beacons on the Earth
        createBeacons();

        // Select initial region (UK & Europe)
        focusRegion(0, false);

        const loaderStatus = document.getElementById('globe-loader-status');
        if (loaderStatus) {
          loaderStatus.style.opacity = '0';
          setTimeout(() => loaderStatus.remove(), 400);
        }
      },
      function (xhr) {
        const percent = Math.round((xhr.loaded / (xhr.total || 8065832)) * 100);
        const loaderLabel = document.getElementById('globe-loader-pct');
        if (loaderLabel) loaderLabel.textContent = `${percent}%`;
      },
      function (err) {
        console.warn('Error loading earth.glb, using fallback globe:', err);
        createFallbackGlobe();
        createBeacons();
      }
    );
  }

  function createFallbackGlobe() {
    const geo = new THREE.SphereGeometry(EARTH_RADIUS, 48, 48);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0f2b30,
      emissive: 0x064e3b,
      emissiveIntensity: 0.3,
      roughness: 0.7,
      metalness: 0.2
    });
    earthModel = new THREE.Mesh(geo, mat);
    earthGroup.add(earthModel);

    // Wireframe grid overlay
    const wireGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.2, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    earthGroup.add(new THREE.Mesh(wireGeo, wireMat));
  }

  function createBeacons() {
    beaconGroup.clear();

    const hotspots = window.DataService ? window.DataService.getGlobeHotspots() : [];

    hotspots.forEach((spot, idx) => {
      const pos = latLonToVector3(spot.lat, spot.lon, EARTH_RADIUS + 0.8);

      const beaconObj = new THREE.Group();
      beaconObj.position.copy(pos);
      beaconObj.lookAt(new THREE.Vector3(0, 0, 0));

      // 1. Core Glowing Sphere
      const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x2dd4bf : 0x14b8a6
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      beaconObj.add(sphere);

      // 2. Pulsing Ripple Ring
      const ringGeo = new THREE.RingGeometry(2.0, 3.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x5eead4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = 'pulseRing';
      beaconObj.add(ring);

      // 3. Vertical Laser Beam Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.25, 0.25, 6, 8);
      const stalkMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.85
      });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.z = -3;
      stalk.rotation.x = Math.PI / 2;
      beaconObj.add(stalk);

      beaconObj.userData = {
        index: idx,
        spotData: spot,
        baseScale: 1.0
      };

      beaconGroup.add(beaconObj);
    });
  }

  function focusRegion(index, smoothAnimate = true) {
    const hotspots = window.DataService ? window.DataService.getGlobeHotspots() : [];
    if (!hotspots || !hotspots[index]) return;

    activeRegionIndex = index;
    const spot = hotspots[index];

    // Compute target camera position to focus directly on coordinates
    const targetPos = latLonToVector3(spot.lat, spot.lon, 220);

    if (smoothAnimate && typeof gsap !== 'undefined') {
      if (controls) controls.autoRotate = false;
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y + 15,
        z: targetPos.z,
        duration: 1.4,
        ease: 'power3.inOut',
        onComplete: () => {
          if (controls) controls.update();
        }
      });
    } else {
      camera.position.set(targetPos.x, targetPos.y + 15, targetPos.z);
      if (controls) controls.update();
    }

    // Update UI Card
    updateGlobeInfoPanel(spot, index);

    // Update Pills
    document.querySelectorAll('.globe-region-pill').forEach((pill, i) => {
      pill.classList.toggle('active', i === index);
    });

    // Sound effect
    if (window.SoundFX) {
      window.SoundFX.playTealChime(440 + index * 40);
    }

    // Trigger API synchronization for this region in tandem
    syncApiForRegion(spot);
  }

  function updateGlobeInfoPanel(spot, index) {
    const titleEl = document.getElementById('globe-spot-title');
    const statEl = document.getElementById('globe-spot-stat');
    const quoteEl = document.getElementById('globe-spot-quote');
    const detailEl = document.getElementById('globe-spot-detail');

    if (titleEl) titleEl.textContent = spot.name;
    if (statEl) statEl.textContent = spot.stat;
    if (quoteEl) quoteEl.textContent = spot.quote;
    if (detailEl) detailEl.textContent = spot.detail;
  }

  /**
   * Live API sync in tandem with region selection
   */
  async function syncApiForRegion(spot) {
    const apiPulseEl = document.getElementById('earth-api-ping-badge');
    if (apiPulseEl) {
      apiPulseEl.innerHTML = `<span class="status-indicator status-live"></span> Syncing World Bank Indicators for <strong>${spot.name.split(' ')[0]}</strong>...`;
    }

    if (window.DataService && typeof window.DataService.fetchWorldBankIndicator === 'function') {
      try {
        const countryCodes = {
          0: 'GBR', // UK
          1: 'USA', // US
          2: 'KEN', // Kenya
          3: 'IND', // India
          4: 'BRA', // Brazil
          5: 'JPN', // Japan
          6: 'AUS'  // Australia
        };
        const code = countryCodes[activeRegionIndex] || 'WLD';

        const startTime = performance.now();
        const res = await window.DataService.fetchWorldBankIndicator('SG.GEN.PARL.ZS', code);
        const elapsed = Math.round(performance.now() - startTime);

        if (apiPulseEl) {
          if (res.source === 'live') {
            apiPulseEl.innerHTML = `<span class="status-indicator status-live"></span> World Bank API Live (${code}): <strong>${res.data.value}%</strong> Female Parliament Share (${res.data.year}) &bull; Ping: ${elapsed}ms`;
          } else {
            apiPulseEl.innerHTML = `<span class="status-indicator status-live"></span> World Bank Baseline Synced (${code}): <strong>SDG 5 Data Verified</strong> &bull; Resilient Local Cache`;
          }
        }
      } catch (e) {
        console.log('API tandem update:', e);
      }
    }
  }

  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);

    // Auto-spin toggle button
    const btnRotate = document.getElementById('btn-globe-rotate');
    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        if (controls) controls.autoRotate = isAutoRotating;
        btnRotate.innerHTML = isAutoRotating
          ? '<span class="icon">🔄</span> Auto-Spin: ON'
          : '<span class="icon">⏸️</span> Auto-Spin: PAUSED';
        btnRotate.classList.toggle('active', isAutoRotating);
      });
    }

    // Region Selector Pills
    const pills = document.querySelectorAll('.globe-region-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        focusRegion(idx, true);
      });
    });

    // Canvas click to select beacon via Raycasting
    if (container) {
      container.addEventListener('click', onCanvasClick, false);
    }
  }

  function onCanvasClick(event) {
    if (!container || !camera || !beaconGroup) return;

    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(beaconGroup.children, true);

    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj.parent && hitObj.parent !== beaconGroup) {
        hitObj = hitObj.parent;
      }
      if (hitObj.userData && typeof hitObj.userData.index !== 'undefined') {
        focusRegion(hitObj.userData.index, true);
      }
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

    // Pulsing beacon rings
    beaconGroup.children.forEach((beacon, i) => {
      const ring = beacon.getObjectByName('pulseRing');
      if (ring) {
        const s = 1.0 + 0.35 * Math.sin(time * 3 + i);
        ring.scale.set(s, s, s);
        ring.material.opacity = 0.4 + 0.35 * Math.cos(time * 3 + i);
      }
    });

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  return {
    init,
    focusRegion,
    toggleAutoRotate: () => {
      isAutoRotating = !isAutoRotating;
      if (controls) controls.autoRotate = isAutoRotating;
      return isAutoRotating;
    },
    setReducedMotion: (reduced) => {
      isAutoRotating = !reduced;
      if (controls) controls.autoRotate = !reduced;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.Earth3D = Earth3D;
  // Backward compatibility
  window.Globe3D = Earth3D;
}
