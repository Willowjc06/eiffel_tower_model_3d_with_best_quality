/**
 * globe3d.js
 * Three.js Interactive 3D Earth Globe for SDG 5.
 * Proves that violence and gender inequality exist in every corner of the world.
 * Inspired by the artistic, narrative trajectory of "Why Zero".
 */

(function () {
  'use strict';

  let scene, camera, renderer, controls;
  let globeGroup, particleGroup, beaconGroup;
  let isAutoRotating = true;
  let container, infoCard;
  let animationFrameId;

  // Conversion: Lat/Lon to 3D Cartesian coordinates on sphere of radius R
  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  function initGlobe() {
    container = document.getElementById('globe-canvas-container');
    if (!container || typeof THREE === 'undefined') {
      console.warn('Three.js or globe-canvas-container not found.');
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090b10, 0.0035);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 30, 260);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.minDistance = 160;
      controls.maxDistance = 380;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.enablePan = false;
    }

    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 85;

    // 4. Base Sphere (Translucent dark blue/black core)
    const baseSphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.5, 48, 48);
    const baseSphereMat = new THREE.MeshBasicMaterial({
      color: 0x0c101c,
      transparent: true,
      opacity: 0.85
    });
    const baseSphere = new THREE.Mesh(baseSphereGeo, baseSphereMat);
    globeGroup.add(baseSphere);

    // 5. Wireframe Grid Sphere
    const wireGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 28, 28);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x223254,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireSphere = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireSphere);

    // 6. Dot Matrix Globe (Fibonacci Sphere Lattice)
    const DOT_COUNT = 3200;
    const dotPositions = new Float32Array(DOT_COUNT * 3);
    const dotColors = new Float32Array(DOT_COUNT * 3);

    const colorPrimary = new THREE.Color(0x4f46e5);
    const colorAccent = new THREE.Color(0xff4b72);
    const colorDim = new THREE.Color(0x273549);

    for (let i = 0; i < DOT_COUNT; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / DOT_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      // Color variation based on latitude
      const mixRatio = Math.sin(phi);
      const c = mixRatio > 0.4 && mixRatio < 0.7 ? colorPrimary : colorDim;
      dotColors[i * 3] = c.r;
      dotColors[i * 3 + 1] = c.g;
      dotColors[i * 3 + 2] = c.b;
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const pointCloud = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(pointCloud);

    // 7. Outer Atmospheric Halo Glow
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 4, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(halo);

    // 8. Regional Beacons / Pulsing Hotspots
    beaconGroup = new THREE.Group();
    globeGroup.add(beaconGroup);

    const hotspots = (window.DataService && window.DataService.getGlobeHotspots)
      ? window.DataService.getGlobeHotspots()
      : [];

    hotspots.forEach((spot, idx) => {
      const pos = latLonToVector3(spot.lat, spot.lon, GLOBE_RADIUS);

      // Pin base anchor
      const pinGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xff4b72 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { spotData: spot, index: idx };

      // Pulsing outer ripple ring
      const ringGeo = new THREE.RingGeometry(2.5, 4.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6b8b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.02));
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      pinMesh.add(ringMesh);

      // Light beam extending out
      const lineMat = new THREE.LineBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.6 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        pos,
        pos.clone().multiplyScalar(1.15)
      ]);
      const line = new THREE.Line(lineGeo, lineMat);

      beaconGroup.add(pinMesh);
      beaconGroup.add(line);
    });

    // 9. Floating Ambient Starfield Dust
    const STAR_COUNT = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 800;
      starPos[i + 1] = (Math.random() - 0.5) * 800;
      starPos[i + 2] = (Math.random() - 0.5) * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.2, transparent: true, opacity: 0.4 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 10. Click & Hover Raycaster for Beacons
    setupRaycasting();

    // 11. Window Resize Listener
    window.addEventListener('resize', onWindowResize, false);

    // Initial Display update with UK / Greenwood highlight
    if (hotspots.length > 0) {
      displaySpotDetails(hotspots[0]);
    }

    animate();
  }

  function setupRaycasting() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('click', (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beaconGroup.children, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData.spotData && hit.parent) {
          hit = hit.parent;
        }
        if (hit && hit.userData.spotData) {
          displaySpotDetails(hit.userData.spotData);
          focusHotspot(hit.userData.spotData);
        }
      }
    });
  }

  function displaySpotDetails(spot) {
    const titleEl = document.getElementById('globe-spot-title');
    const statEl = document.getElementById('globe-spot-stat');
    const quoteEl = document.getElementById('globe-spot-quote');
    const detailEl = document.getElementById('globe-spot-detail');

    if (titleEl) titleEl.textContent = spot.name;
    if (statEl) statEl.textContent = spot.stat;
    if (quoteEl) quoteEl.textContent = spot.quote;
    if (detailEl) detailEl.textContent = spot.detail;
  }

  function focusHotspot(spot) {
    if (!controls) return;
    const targetPos = latLonToVector3(spot.lat, spot.lon, 240);

    // Temporary pause of auto-rotation to allow inspection
    controls.autoRotate = false;
    setTimeout(() => {
      if (isAutoRotating) controls.autoRotate = true;
    }, 8000);

    if (window.gsap) {
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y + 20,
        z: targetPos.z,
        duration: 1.4,
        ease: "power2.inOut",
        onUpdate: () => controls.update()
      });
    } else {
      camera.position.set(targetPos.x, targetPos.y + 20, targetPos.z);
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

  let clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Pulse beacon rings
    if (beaconGroup) {
      beaconGroup.children.forEach(child => {
        if (child.children && child.children.length > 0) {
          const ring = child.children[0];
          const scale = 1.0 + 0.35 * Math.sin(time * 3.5);
          ring.scale.set(scale, scale, 1);
        }
      });
    }

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  // Public methods
  window.Globe3D = {
    init: initGlobe,
    selectHotspotByIndex: function (idx) {
      const hotspots = window.DataService ? window.DataService.getGlobeHotspots() : [];
      if (hotspots[idx]) {
        displaySpotDetails(hotspots[idx]);
        focusHotspot(hotspots[idx]);
      }
    },
    toggleRotation: function () {
      isAutoRotating = !isAutoRotating;
      if (controls) controls.autoRotate = isAutoRotating;
      return isAutoRotating;
    }
  };
})();
