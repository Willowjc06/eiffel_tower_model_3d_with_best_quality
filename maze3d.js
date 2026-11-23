/**
 * maze3d.js
 * Interactive 3D Night Walk & Maze Experience (Three.js)
 * Creatively inspired by "Why Zero".
 * Portrays the everyday hypervigilance, detours, and "corners women must cut" walking home after dark.
 * Features an interactive branching decision at Stage 3: Well-Lit Main Road (Detour) vs. Unlit Shortcut Alleyway.
 */

(function () {
  'use strict';

  let scene, camera, renderer;
  let mazeGroup, walkerMesh, streetLamps = [], alleyLamp = null;
  let container;
  let currentStepIndex = 0;
  let selectedBranch = 'detour'; // 'detour' or 'shortcut'
  let isMuted = true;
  let audioCtx = null;

  const JOURNEY_STEPS = [
    {
      step: 1,
      title: "9:15 PM — Departure & The Mental Checklist",
      locationName: "Campus / Office Exit",
      cameraPos: { x: -45, y: 35, z: 60 },
      targetPos: { x: -40, y: 3, z: 20 },
      stat: "81% of Women Check Personal Safety",
      description: "Before stepping out, the subconscious risk checklist starts: checking phone battery level, holding keys in hand, sharing live GPS tracking with a friend, and calculating which streets have active shops open.",
      quote: "Lillian Greenwood, UK Government: 'I listened as a group of women and girls in Liverpool shared their personal safety worries when walking, particularly alone after dark.'"
    },
    {
      step: 2,
      title: "9:24 PM — The Corner Gathering & The Detour",
      locationName: "Street Corner Junction",
      cameraPos: { x: -20, y: 30, z: 45 },
      targetPos: { x: -15, y: 3, z: 0 },
      stat: "63% Actively Change Their Route",
      description: "A group of strangers is lingering on the primary corner. Catcalling and gaze intimidation. A woman must decide: walk past and risk escalation, or cross the busy road to add extra distance? The tax of hypervigilance.",
      quote: "'You shouldn't have to map out a safe passage through your own hometown, yet every woman I know does it without thinking.'"
    },
    {
      step: 3,
      title: "9:32 PM — The Branching Decision",
      locationName: "The Fork: Main Road vs. Dark Alley",
      cameraPos: { x: -5, y: 34, z: 40 },
      targetPos: { x: -5, y: 3, z: -10 },
      stat: "The Invisible Time Tax",
      description: "You reach the crucial fork. Choose your path below: Take the well-lit main road (longer detour) or take the shortcut (unlit alleyway)?",
      quote: "UN Women UK: 71% of women of all ages have experienced sexual harassment in public spaces."
    },
    {
      step: 4,
      title: "9:45 PM — Footsteps Matching Pace",
      locationName: "The Long Straight",
      cameraPos: { x: 30, y: 28, z: 25 },
      targetPos: { x: 35, y: 3, z: -35 },
      stat: "Clenched Keys & Fake Calls",
      description: "Heavy footsteps accelerate behind. The instinctive defensive reaction: clenching house keys between knuckles as a makeshift defense, checking shadows on the pavement, or pretending to be on an urgent phone call with family.",
      quote: "'Hey, I'm just turning into our street now, can you open the front door?' — The universal phantom phone call."
    },
    {
      step: 5,
      title: "9:52 PM — The Front Door & The Deeper Reality",
      locationName: "The Front Porch",
      cameraPos: { x: 55, y: 30, z: 15 },
      targetPos: { x: 60, y: 3, z: -50 },
      stat: "1 in 3 Women Face Violence Globally",
      description: "The deadbolt locks. A deep breath of temporary relief. Yet for millions of women worldwide, domestic abuse means danger is inside the home itself. True safety requires cultural change, systemic accountability, and active allyship from everyone.",
      quote: "SDG 5 Mission: The fight for equality and safety should never lie solely upon a woman."
    }
  ];

  function initMaze() {
    container = document.getElementById('maze-canvas-container');
    if (!container || typeof THREE === 'undefined') {
      console.warn('Three.js or maze-canvas-container not found.');
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x031317);
    scene.fog = new THREE.FogExp2(0x031317, 0.015);

    // 2. Camera: Isometric Perspective
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 800);
    camera.position.set(-45, 35, 60);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Ambient & Moonlight Illumination (Teal & Moonlit Violet)
    const ambientLight = new THREE.AmbientLight(0x0d3b45, 1.4);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x2dd4bf, 1.1);
    moonLight.position.set(-60, 100, 40);
    moonLight.castShadow = true;
    scene.add(moonLight);

    mazeGroup = new THREE.Group();
    scene.add(mazeGroup);

    // 5. Build Environment (Pavement, Buildings, Street Lamps, Maze Walls)
    buildEnvironment();

    // 6. Build Walker Avatar / Luminescent Pulse
    buildWalker();

    // 7. Event Listeners
    window.addEventListener('resize', onResize, false);
    setupBranchingButtons();
    updateStepUI(0);

    animate();
  }

  function buildEnvironment() {
    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x10131d,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    mazeGroup.add(ground);

    // Primary paths
    // Leg 1: Exit to Corner
    createRoadSegment({ x: -40, z: 20 }, { x: -15, z: 0 }, 7, 0x1f2438);

    // Fork Option A: Main Road Detour (Wide, lit, meanders via -5, -20)
    createRoadSegment({ x: -15, z: 0 }, { x: -5, z: -20 }, 7, 0x1f2438);
    createRoadSegment({ x: -5, z: -20 }, { x: 15, z: -30 }, 7, 0x1f2438);
    createRoadSegment({ x: 15, z: -30 }, { x: 35, z: -35 }, 7, 0x1f2438);

    // Fork Option B: The Shortcut Alleyway (Narrow, unlit, direct from -15, 0 to 35, -35)
    createRoadSegment({ x: -15, z: 0 }, { x: 10, z: -15 }, 4.5, 0x131724);
    createRoadSegment({ x: 10, z: -15 }, { x: 35, z: -35 }, 4.5, 0x131724);

    // Leg 3: Final stretch to front door
    createRoadSegment({ x: 35, z: -35 }, { x: 60, z: -50 }, 7, 0x1f2438);

    // City Buildings & Obstacles
    const buildingData = [
      { x: -55, z: 10, w: 14, h: 28, d: 20 },
      { x: -35, z: 42, w: 18, h: 36, d: 16 },
      { x: -28, z: -15, w: 12, h: 24, d: 14 },
      { x: -5, z: 18, w: 16, h: 32, d: 14 },
      { x: -2, z: -38, w: 18, h: 42, d: 18 },
      { x: 3, z: -5, w: 10, h: 35, d: 12 }, // Alley flanking wall
      { x: 25, z: 5, w: 15, h: 30, d: 15 },
      { x: 22, z: -55, w: 20, h: 38, d: 20 },
      { x: 50, z: -15, w: 14, h: 26, d: 14 },
      { x: 75, z: -40, w: 22, h: 34, d: 22 }
    ];

    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x151928,
      roughness: 0.7,
      metalness: 0.2
    });

    buildingData.forEach(b => {
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMesh = new THREE.Mesh(bGeo, bldgMat);
      bMesh.position.set(b.x, b.h / 2, b.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      mazeGroup.add(bMesh);

      // Lit windows
      for (let w = 0; w < 3; w++) {
        const winGeo = new THREE.PlaneGeometry(1.2, 1.8);
        const winMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.4 ? 0xfef08a : 0x0284c7,
          transparent: true,
          opacity: 0.6
        });
        const winMesh = new THREE.Mesh(winGeo, winMat);
        winMesh.position.set(b.x + (w - 1) * 3, 6 + w * 4, b.z + b.d / 2 + 0.05);
        mazeGroup.add(winMesh);
      }
    });

    // Street Lamps along the walkway
    const lampPositions = [
      { x: -44, z: 22, lit: true },
      { x: -20, z: 4, lit: false },
      { x: -6, z: -22, lit: true },  // Main road lamp
      { x: 14, z: -32, lit: true },  // Main road lamp
      { x: 10, z: -14, lit: false, isAlley: true }, // The broken alley lamp
      { x: 30, z: -32, lit: false },
      { x: 56, z: -48, lit: true }
    ];

    lampPositions.forEach((l) => {
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.25, 12, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(l.x, 6, l.z);
      mazeGroup.add(pole);

      const headGeo = new THREE.BoxGeometry(1.4, 0.6, 1.4);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(l.x, 12, l.z);
      mazeGroup.add(head);

      if (l.lit) {
        const lampLight = new THREE.PointLight(0xffb74d, 1.4, 38, 2);
        lampLight.position.set(l.x, 11.5, l.z);
        mazeGroup.add(lampLight);
        streetLamps.push({ light: lampLight, baseIntensity: 1.4 });

        const bulbGeo = new THREE.SphereGeometry(0.5, 12, 12);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(l.x, 11.7, l.z);
        mazeGroup.add(bulb);
      } else {
        const bulbGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(l.x, 11.7, l.z);
        mazeGroup.add(bulb);

        if (l.isAlley) {
          alleyLamp = { bulb, pole };
        }
      }
    });
  }

  function createRoadSegment(p1, p2, width, colorHex) {
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const roadGeo = new THREE.BoxGeometry(width, 0.4, length);
    const roadMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set((p1.x + p2.x) / 2, 0.2, (p1.z + p2.z) / 2);
    road.rotation.y = angle;
    road.receiveShadow = true;
    mazeGroup.add(road);
  }

  function buildWalker() {
    walkerMesh = new THREE.Group();

    // Luminescent Core (Survivor Teal light navigating the dark)
    const coreGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 2.2;
    walkerMesh.add(core);

    // Personal halo light casting downward
    const walkLight = new THREE.PointLight(0x14b8a6, 2.2, 28, 1.5);
    walkLight.position.y = 3.5;
    walkerMesh.add(walkLight);

    // Protective aura ring
    const ringGeo = new THREE.RingGeometry(1.8, 2.8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const aura = new THREE.Mesh(ringGeo, ringMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.5;
    walkerMesh.add(aura);

    walkerMesh.position.set(-40, 0, 20);
    scene.add(walkerMesh);
  }

  function setupBranchingButtons() {
    const btnDetour = document.getElementById('btn-choice-detour');
    const btnShortcut = document.getElementById('btn-choice-shortcut');

    if (btnDetour) {
      btnDetour.addEventListener('click', () => {
        chooseBranch('detour');
      });
    }

    if (btnShortcut) {
      btnShortcut.addEventListener('click', () => {
        chooseBranch('shortcut');
      });
    }
  }

  function chooseBranch(branch) {
    selectedBranch = branch;
    const btnDetour = document.getElementById('btn-choice-detour');
    const btnShortcut = document.getElementById('btn-choice-shortcut');
    const descEl = document.getElementById('maze-step-desc');
    const statEl = document.getElementById('maze-step-stat');

    if (btnDetour && btnShortcut) {
      btnDetour.classList.toggle('active', branch === 'detour');
      btnShortcut.classList.toggle('active', branch === 'shortcut');
    }

    if (branch === 'detour') {
      const detourTarget = { x: -5, y: 3, z: -20 };
      const detourCam = { x: -5, y: 36, z: 45 };
      moveProtagonist(detourTarget, detourCam);

      if (descEl) {
        descEl.innerHTML = "<strong>You chose the Well-Lit Main Road:</strong> Adds 20 minutes to your journey, but streetlights and active storefronts provide vital safety. This time-tax is paid disproportionately by women every night.";
      }
      if (statEl) {
        statEl.textContent = "+20 Minutes Commute Time Tax";
      }
      if (window.SoundFX) window.SoundFX.playTealChime(440);
    } else {
      const shortcutTarget = { x: 10, y: 3, z: -15 };
      const shortcutCam = { x: 12, y: 22, z: 25 };
      moveProtagonist(shortcutTarget, shortcutCam);

      if (descEl) {
        descEl.innerHTML = "<strong>You chose the Shortcut Alleyway:</strong> Saves 16 minutes, but hypervigilance spikes: adrenaline surges, eyes dart between dark alcoves, keys clenched between knuckles. No one should have to gamble with their safety to get home.";
      }
      if (statEl) {
        statEl.textContent = "High Risk & Extreme Anxiety";
      }
      if (window.SoundFX) window.SoundFX.playTealChime(300);
    }
  }

  function updateStepUI(index) {
    currentStepIndex = Math.max(0, Math.min(index, JOURNEY_STEPS.length - 1));
    const step = JOURNEY_STEPS[currentStepIndex];

    const titleEl = document.getElementById('maze-step-title');
    const locEl = document.getElementById('maze-step-location');
    const statEl = document.getElementById('maze-step-stat');
    const descEl = document.getElementById('maze-step-desc');
    const quoteEl = document.getElementById('maze-step-quote');
    const badgeEl = document.getElementById('maze-step-badge');
    const branchBox = document.getElementById('maze-branching-choices');

    if (titleEl) titleEl.textContent = step.title;
    if (locEl) locEl.textContent = step.locationName;
    if (statEl) statEl.textContent = step.stat;
    if (descEl) descEl.textContent = step.description;
    if (quoteEl) quoteEl.textContent = step.quote;
    if (badgeEl) badgeEl.textContent = `Stage ${step.step} of 5`;

    // Show/hide branching choice buttons at Stage 3
    if (branchBox) {
      if (step.step === 3) {
        branchBox.style.display = 'flex';
        chooseBranch(selectedBranch);
      } else {
        branchBox.style.display = 'none';
        moveProtagonist(step.targetPos, step.cameraPos);
      }
    } else {
      moveProtagonist(step.targetPos, step.cameraPos);
    }

    if (!isMuted) {
      playFootstepSound();
    }
  }

  function moveProtagonist(targetPos, camTarget) {
    if (!walkerMesh || !camera) return;

    if (window.gsap) {
      gsap.to(walkerMesh.position, {
        x: targetPos.x,
        z: targetPos.z,
        duration: 1.2,
        ease: "power2.out"
      });
      gsap.to(camera.position, {
        x: camTarget.x,
        y: camTarget.y,
        z: camTarget.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(targetPos.x, targetPos.y + 2, targetPos.z)
      });
    } else {
      walkerMesh.position.set(targetPos.x, targetPos.y, targetPos.z);
      camera.position.set(camTarget.x, camTarget.y, camTarget.z);
      camera.lookAt(targetPos.x, targetPos.y + 2, targetPos.z);
    }
  }

  function playFootstepSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch (e) {}
  }

  function onResize() {
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.003;

    // Streetlight subtle flicker
    if (streetLamps.length > 0) {
      streetLamps[0].light.intensity = streetLamps[0].baseIntensity + Math.sin(time * 8) * 0.2;
    }

    if (walkerMesh) {
      walkerMesh.children[0].position.y = 2.2 + Math.sin(time * 3) * 0.15;
    }

    renderer.render(scene, camera);
  }

  // Public Interface
  window.Maze3D = {
    init: initMaze,
    nextStep: function () {
      updateStepUI(currentStepIndex + 1);
    },
    prevStep: function () {
      updateStepUI(currentStepIndex - 1);
    },
    setStep: function (idx) {
      updateStepUI(idx);
    },
    chooseBranch: chooseBranch,
    toggleAudio: function () {
      isMuted = !isMuted;
      if (!isMuted && !audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
      }
      return isMuted;
    }
  };
})();
