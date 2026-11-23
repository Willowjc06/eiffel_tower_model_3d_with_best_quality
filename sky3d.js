/**
 * Sky3D - Dynamic Atmosphere Engine (Day, Night, Rain, Rainbow)
 * Built with Three.js (libs/three.min.js)
 * Supports 4 complete themes with stars, moon, lightning, rain, rainbow & clouds
 */

const Sky3D = (function () {
  let canvas, scene, camera, renderer;
  let sunGroup, sunMesh, sunGlowMesh, moonMesh;
  let rainbowMesh = null;
  let cloudGroup = null;
  let rainSystem = null;
  let rainPositions, rainVelocities, rainGeo, rainMat;
  let starsMesh = null;
  let lightningLight = null;
  let lightningTimer = 0;
  let currentTheme = 'day';
  let isRunning = false;
  let clock;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const THEME_CONFIGS = {
    'day': {
      skyTop: 0x38bdf8,
      skyMid: 0x7dd3fc,
      skyBottom: 0xfff3b0,
      sunVisible: true,
      sunColor: 0xffea00,
      sunGlow: 0xffd166,
      moonVisible: false,
      starsVisible: false,
      cloudsColor: 0xffffff,
      cloudsOpacity: 0.9,
      rainOpacity: 0.15,
      rainSpeed: 1.2,
      rainbowVisible: false,
      fogColor: 0x7dd3fc,
      fogDensity: 0.001
    },
    'night': {
      skyTop: 0x050814,
      skyMid: 0x0f172a,
      skyBottom: 0x1e1b4b,
      sunVisible: false,
      moonVisible: true,
      starsVisible: true,
      cloudsColor: 0x1e293b,
      cloudsOpacity: 0.6,
      rainOpacity: 0.2,
      rainSpeed: 0.9,
      rainbowVisible: false,
      fogColor: 0x0f172a,
      fogDensity: 0.0014
    },
    'rain': {
      skyTop: 0x1e293b,
      skyMid: 0x334155,
      skyBottom: 0x475569,
      sunVisible: false,
      moonVisible: false,
      starsVisible: false,
      cloudsColor: 0x475569,
      cloudsOpacity: 0.95,
      rainOpacity: 0.75,
      rainSpeed: 2.2,
      rainbowVisible: false,
      fogColor: 0x334155,
      fogDensity: 0.0022
    },
    'rainbow': {
      skyTop: 0x8b5cf6,
      skyMid: 0x38bdf8,
      skyBottom: 0xfef08a,
      sunVisible: true,
      sunColor: 0xfff066,
      sunGlow: 0xffa500,
      moonVisible: false,
      starsVisible: true,
      cloudsColor: 0xffffff,
      cloudsOpacity: 0.85,
      rainOpacity: 0.25,
      rainSpeed: 1.0,
      rainbowVisible: true,
      fogColor: 0x38bdf8,
      fogDensity: 0.0008
    }
  };

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas || !window.THREE) {
      console.warn('Sky3D: Canvas or THREE.js missing');
      return;
    }

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.001);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 15, 60);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Global ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Lightning light for rain theme
    lightningLight = new THREE.PointLight(0xa5f3fc, 0, 300);
    lightningLight.position.set(0, 50, -20);
    scene.add(lightningLight);

    // Build elements
    buildSunAndMoon();
    buildStars();
    buildClouds();
    buildRain();
    buildRainbow();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    isRunning = true;
    setTheme('day');
    animate();
  }

  // 1. Sun & Moon
  function buildSunAndMoon() {
    sunGroup = new THREE.Group();
    sunGroup.position.set(45, 38, -60);

    // Sun core
    const sunGeo = new THREE.SphereGeometry(7, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Corona
    const glowGeo = new THREE.RingGeometry(7.2, 22, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    sunGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    sunGroup.add(sunGlowMesh);

    // Moon mesh
    const moonGeo = new THREE.SphereGeometry(6, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.4
    });
    moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(-45, 36, -55);
    scene.add(moonMesh);

    scene.add(sunGroup);
  }

  // 2. Twinkling Stars (for Night & Rainbow themes)
  function buildStars() {
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 400;
      starPositions[i * 3 + 1] = Math.random() * 150 + 10;
      starPositions[i * 3 + 2] = -100 - Math.random() * 200;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.85
    });

    starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(starsMesh);
  }

  // 3. Volumetric Clouds
  function buildClouds() {
    cloudGroup = new THREE.Group();

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85
    });

    for (let c = 0; c < 8; c++) {
      const cluster = new THREE.Group();
      const numPuffs = 5 + Math.floor(Math.random() * 5);

      for (let p = 0; p < numPuffs; p++) {
        const radius = 3.5 + Math.random() * 5;
        const puffGeo = new THREE.SphereGeometry(radius, 12, 12);
        const puff = new THREE.Mesh(puffGeo, cloudMat.clone());

        puff.position.set(
          (p - numPuffs / 2) * 5 + (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4
        );
        puff.scale.set(1.4, 0.7, 1);
        cluster.add(puff);
      }

      cluster.position.set(
        -90 + c * 25 + (Math.random() - 0.5) * 10,
        18 + (Math.random() - 0.5) * 12,
        -25 - c * 7 + (Math.random() - 0.5) * 10
      );

      cluster.userData = {
        speed: 0.035 + Math.random() * 0.03
      };

      cloudGroup.add(cluster);
    }

    scene.add(cloudGroup);
  }

  // 4. Rain System
  function buildRain() {
    const rainCount = 1400;
    rainPositions = new Float32Array(rainCount * 3);
    rainVelocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 160;
      rainPositions[i * 3 + 1] = Math.random() * 90 - 20;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;

      rainVelocities[i] = 1.3 + Math.random() * 1.6;
    }

    rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);
  }

  // 5. Pastel Rainbow Arc
  function buildRainbow() {
    const rainbowGroup = new THREE.Group();
    rainbowGroup.position.set(0, -10, -75);
    rainbowGroup.rotation.z = -0.1;

    const colors = [0xff70a6, 0xff9770, 0xffd670, 0x99e2b4, 0x70d6ff, 0x8338ec];
    colors.forEach((col, idx) => {
      const radius = 50 + idx * 1.1;
      const arcGeo = new THREE.RingGeometry(radius, radius + 1.0, 48, 1, 0, Math.PI);
      const arcMat = new THREE.MeshBasicMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45 - idx * 0.03,
        depthWrite: false
      });
      const arcMesh = new THREE.Mesh(arcGeo, arcMat);
      rainbowGroup.add(arcMesh);
    });

    rainbowMesh = rainbowGroup;
    scene.add(rainbowMesh);
  }

  // Animation Loop
  function animate() {
    if (!isRunning) return;
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Mouse parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x = mouse.x * 5;
    camera.position.y = 15 + mouse.y * 3;
    camera.lookAt(0, 10, 0);

    // Sun & Moon animation
    if (sunGlowMesh && sunGroup.visible) {
      const pulse = 1 + Math.sin(elapsed * 1.6) * 0.08;
      sunGlowMesh.scale.set(pulse, pulse, 1);
      sunGlowMesh.rotation.z += 0.003;
    }

    if (moonMesh && moonMesh.visible) {
      moonMesh.rotation.y += 0.002;
    }

    // Clouds drifting
    if (cloudGroup) {
      cloudGroup.children.forEach(cluster => {
        cluster.position.x += cluster.userData.speed;
        if (cluster.position.x > 95) {
          cluster.position.x = -95;
        }
      });
    }

    // Rain particles
    if (rainSystem && rainPositions) {
      const pos = rainPositions;
      const count = pos.length / 3;
      const speedMult = currentTheme === 'rain' ? 2.0 : 1.0;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= rainVelocities[i] * speedMult;
        pos[i * 3] += 0.15 * speedMult;

        if (pos[i * 3 + 1] < -25) {
          pos[i * 3 + 1] = 70;
          pos[i * 3] = (Math.random() - 0.5) * 160;
        }
      }

      rainGeo.attributes.position.needsUpdate = true;
    }

    // Random gentle lightning flash in rain theme
    if (currentTheme === 'rain') {
      lightningTimer += delta;
      if (lightningTimer > 4.5 && Math.random() < 0.03) {
        lightningLight.intensity = 2.5;
        setTimeout(() => { lightningLight.intensity = 0; }, 80);
        setTimeout(() => { lightningLight.intensity = 1.8; }, 130);
        setTimeout(() => { lightningLight.intensity = 0; }, 220);
        lightningTimer = 0;
      }
    } else {
      lightningLight.intensity = 0;
    }

    // Rainbow wave
    if (rainbowMesh && rainbowMesh.visible) {
      rainbowMesh.rotation.z = -0.1 + Math.sin(elapsed * 0.4) * 0.02;
    }

    renderer.render(scene, camera);
  }

  /**
   * Set theme: 'day' | 'night' | 'rain' | 'rainbow'
   */
  function setTheme(themeKey) {
    currentTheme = themeKey;
    const cfg = THEME_CONFIGS[themeKey] || THEME_CONFIGS['day'];

    if (scene.fog) {
      scene.fog.color.setHex(cfg.fogColor);
      scene.fog.density = cfg.fogDensity;
    }

    // Sun / Moon / Stars
    if (sunGroup) sunGroup.visible = cfg.sunVisible;
    if (moonMesh) moonMesh.visible = cfg.moonVisible;
    if (starsMesh) starsMesh.visible = cfg.starsVisible;

    // Rain
    if (rainMat) {
      rainMat.opacity = cfg.rainOpacity;
      if (themeKey === 'rain') {
        rainMat.color.setHex(0xe0f2fe);
      } else if (themeKey === 'night') {
        rainMat.color.setHex(0x38bdf8);
      } else {
        rainMat.color.setHex(0xbae6fd);
      }
    }

    // Rainbow
    if (rainbowMesh) {
      rainbowMesh.visible = cfg.rainbowVisible;
    }

    // Clouds
    if (cloudGroup) {
      cloudGroup.children.forEach(cluster => {
        cluster.children.forEach(puff => {
          puff.material.color.setHex(cfg.cloudsColor);
          puff.material.opacity = cfg.cloudsOpacity;
        });
      });
    }
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  return {
    init,
    setTheme,
    getCurrentTheme: () => currentTheme
  };
})();

if (typeof window !== 'undefined') {
  window.Sky3D = Sky3D;
}
