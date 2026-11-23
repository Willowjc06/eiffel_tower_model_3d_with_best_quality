/**
 * phone3d.js
 * Three.js 3D Mobile Phone Showcase using 'models/phone.glb'.
 * Features a dynamic CanvasTexture phone screen displaying live Emergency Helplines,
 * interactive dialing animations, and trauma-informed crisis lifelines.
 */

const Phone3D = (function () {
  'use strict';

  let scene, camera, renderer, controls;
  let phoneGroup, phoneModel;
  let container;
  let screenCanvas, screenCtx, screenTexture;
  let animationFrameId;
  let phoneState = 'idle'; // 'idle', 'dialing', 'connected'
  let activeHelpline = {
    title: 'UK National Domestic Abuse Helpline',
    org: 'Refuge (Freephone 24/7)',
    number: '0808 2000 247',
    region: 'United Kingdom',
    desc: 'Confidential, free support available 24 hours a day, 365 days a year.'
  };

  const HELPLINES = [
    {
      id: 'uk-refuge',
      title: 'UK National Domestic Abuse Helpline',
      org: 'Refuge (Freephone 24/7)',
      number: '0808 2000 247',
      region: 'United Kingdom',
      tel: '08082000247',
      desc: 'Free, confidential, trauma-informed support for women and children.'
    },
    {
      id: 'us-rainn',
      title: 'US National Sexual Assault Hotline',
      org: 'RAINN (Free 24/7)',
      number: '1-800-656-4673',
      region: 'United States',
      tel: '18006564673',
      desc: 'Connect with a trained survivor support specialist instantly.'
    },
    {
      id: 'us-dv',
      title: 'US National Domestic Violence Hotline',
      org: 'The Hotline (24/7)',
      number: '1-800-799-7233',
      region: 'United States',
      tel: '18007997233',
      desc: 'Confidential crisis intervention, safety planning, and local shelter referrals.'
    },
    {
      id: 'global-999',
      title: 'Direct Emergency Services',
      org: 'Immediate Police / Medical Response',
      number: '999 / 911 / 112',
      region: 'Global Emergency',
      tel: '999',
      desc: 'If you or someone else is in immediate physical danger, call emergency services directly.'
    },
    {
      id: 'silent-55',
      title: 'Silent Solution Protocol',
      org: 'UK Police Silent Emergency',
      number: 'Dial 999, then press 55',
      region: 'UK Emergency Protocol',
      tel: '999',
      desc: 'If speaking puts you in danger, cough or tap the handset, then press 55 when prompted.'
    },
    {
      id: 'text-shout',
      title: 'Crisis Text Line',
      org: 'SHOUT / Crisis Text Line',
      number: 'Text SHOUT to 85258',
      region: 'UK & US (Silent Text)',
      tel: 'sms:85258',
      desc: 'Discreet 24/7 text support if you cannot speak safely aloud.'
    }
  ];

  function init() {
    container = document.getElementById('phone-canvas-container');
    if (!container || typeof THREE === 'undefined') {
      console.warn('phone-canvas-container or THREE not found.');
      return;
    }

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x031317, 0.008);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 26);

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
      controls.dampingFactor = 0.06;
      controls.enableZoom = true;
      controls.minDistance = 14;
      controls.maxDistance = 38;
      controls.enablePan = false;
      controls.autoRotate = false;
    }

    phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // 4. Setup Lighting
    setupLighting();

    // 5. Create Dynamic HTML5 Canvas for the Screen
    createScreenCanvasTexture();

    // 6. Pedestal / Ring beneath phone
    createPedestal();

    // 7. Load GLTF Phone Model
    loadPhoneModel();

    // 8. Setup UI Handlers
    setupUIHandlers();

    // 9. Start Loop
    animate();
  }

  function setupLighting() {
    const ambient = new THREE.AmbientLight(0x0d9488, 0.7);
    scene.add(ambient);

    // Key Light: Studio White/Teal
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(12, 18, 16);
    scene.add(key);

    // Rim Light: Survivor Teal Glow
    const rim = new THREE.PointLight(0x2dd4bf, 3.0, 35);
    rim.position.set(-14, 8, -12);
    scene.add(rim);

    // Soft Purple Underglow
    const under = new THREE.PointLight(0xa855f7, 2.2, 30);
    under.position.set(0, -12, 8);
    scene.add(under);
  }

  function createPedestal() {
    // Elegant illuminated glass circular pedestal beneath the phone
    const pedestalGeo = new THREE.CylinderGeometry(8.5, 9.2, 0.4, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x052e35,
      emissive: 0x0d9488,
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.8
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -8.5;
    scene.add(pedestal);

    const glowRingGeo = new THREE.RingGeometry(8.8, 9.1, 48);
    const glowRingMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(glowRingGeo, glowRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -8.28;
    scene.add(ring);
  }

  function createScreenCanvasTexture() {
    screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 1024;
    screenCtx = screenCanvas.getContext('2d');

    screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.generateMipmaps = true;
    screenTexture.minFilter = THREE.LinearMipMapLinearFilter;

    renderScreenContent();
  }

  function renderScreenContent() {
    if (!screenCtx) return;
    const ctx = screenCtx;
    const w = screenCanvas.width;
    const h = screenCanvas.height;

    // Background Gradient (Deep Obsidian Teal)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#031317');
    bgGrad.addColorStop(0.5, '#062329');
    bgGrad.addColorStop(1, '#020f12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 1. Status Bar
    ctx.fillStyle = '#f0fdfa';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:41', 36, 50);

    // Signal & Battery Icons
    ctx.textAlign = 'right';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('5G  100% 🔋', w - 36, 50);

    // 2. Teal Survivor Ribbon Icon & Emergency Banner
    ctx.beginPath();
    ctx.arc(w / 2, 130, 42, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 184, 166, 0.2)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2dd4bf';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '36px sans-serif';
    ctx.fillText('🎗️', w / 2, 142);

    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText('EMERGENCY LIFELINE SOS', w / 2, 205);

    // 3. Status Badge
    let statusText = 'LIFELINE READY';
    let statusColor = '#14b8a6';
    if (phoneState === 'dialing') {
      statusText = 'DIALING CONFIDENTIAL...';
      statusColor = '#f59e0b';
    } else if (phoneState === 'connected') {
      statusText = 'CONNECTED • 100% FREE';
      statusColor = '#10b981';
    }

    ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
    ctx.fillRect(w / 2 - 130, 225, 260, 36);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w / 2 - 130, 225, 260, 36);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, w / 2, 249);

    // 4. Helpline Name & Region
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(activeHelpline.region, w / 2, 320);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px "Outfit", sans-serif';
    wrapText(ctx, activeHelpline.title, w / 2, 365, w - 80, 36);

    // 5. Main Phone Number Display Card
    const numY = 480;
    ctx.fillStyle = 'rgba(15, 118, 110, 0.35)';
    ctx.beginPath();
    ctx.roundRect(40, numY, w - 80, 110, 20);
    ctx.fill();
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 38px "Outfit", sans-serif';
    ctx.fillText(activeHelpline.number, w / 2, numY + 68);

    // 6. Organization Tag
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(activeHelpline.org, w / 2, 630);

    // 7. Visualizer / Dialing Animation
    const time = performance.now() * 0.003;
    if (phoneState === 'dialing' || phoneState === 'connected') {
      const barCount = 18;
      const barW = 10;
      const gap = 8;
      const totalW = barCount * (barW + gap);
      const startX = (w - totalW) / 2;
      for (let i = 0; i < barCount; i++) {
        const hVal = 15 + Math.sin(time * 3 + i * 0.6) * 25;
        ctx.fillStyle = phoneState === 'connected' ? '#10b981' : '#2dd4bf';
        ctx.fillRect(startX + i * (barW + gap), 720 - hVal / 2, barW, hVal);
      }
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Tap a helpline below to dial securely', w / 2, 720);
    }

    // 8. Keypad Call Action Buttons
    // Call Button
    const callBtnY = 820;
    ctx.beginPath();
    ctx.arc(w / 2, callBtnY, 52, 0, Math.PI * 2);
    ctx.fillStyle = phoneState === 'connected' ? '#ef4444' : '#14b8a6';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '40px sans-serif';
    ctx.fillText(phoneState === 'connected' ? '✕' : '📞', w / 2, callBtnY + 14);

    // Bottom info note
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Calls are completely confidential & unbilled', w / 2, 940);

    screenTexture.needsUpdate = true;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  function loadPhoneModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.warn('THREE.GLTFLoader not available, creating procedural phone model');
      createFallbackPhone();
      return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
      'models/phone.glb',
      function (gltf) {
        phoneModel = gltf.scene;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(phoneModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        phoneModel.position.x = -center.x;
        phoneModel.position.y = -center.y;
        phoneModel.position.z = -center.z;

        // Target scale: max dimension ~16
        const maxDim = Math.max(size.x, size.y, size.z) || 60;
        const scale = 15.5 / maxDim;
        phoneGroup.scale.set(scale, scale, scale);

        // Customize Materials
        phoneModel.traverse((child) => {
          if (child.isMesh && child.material) {
            const matName = child.material.name || '';
            const meshName = child.name || '';

            // Check if this mesh is the screen (PhoneFace_Mat)
            if (matName.includes('PhoneFace') || meshName.includes('PhoneFace') || matName.includes('Face')) {
              // Apply dynamic CanvasTexture to screen
              child.material = new THREE.MeshBasicMaterial({
                map: screenTexture,
                side: THREE.FrontSide
              });
            } else if (matName.includes('PhoneCase') || meshName.includes('PhoneCase')) {
              // Luxurious titanium teal phone case
              child.material = new THREE.MeshStandardMaterial({
                color: 0x0a3f47,
                roughness: 0.28,
                metalness: 0.82,
                envMapIntensity: 1.2
              });
            } else {
              // Buttons & camera ring
              child.material = new THREE.MeshStandardMaterial({
                color: 0x14b8a6,
                roughness: 0.4,
                metalness: 0.7
              });
            }
          }
        });

        phoneGroup.add(phoneModel);

        // Tilt phone slightly upright and angled toward viewer
        phoneGroup.rotation.x = -0.15;
        phoneGroup.rotation.y = -0.3;

        const loaderStatus = document.getElementById('phone-loader-status');
        if (loaderStatus) {
          loaderStatus.style.opacity = '0';
          setTimeout(() => loaderStatus.remove(), 400);
        }
      },
      function (xhr) {
        const percent = Math.round((xhr.loaded / (xhr.total || 86184)) * 100);
        const loaderLabel = document.getElementById('phone-loader-pct');
        if (loaderLabel) loaderLabel.textContent = `${percent}%`;
      },
      function (err) {
        console.warn('Error loading phone.glb, using fallback phone model:', err);
        createFallbackPhone();
      }
    );
  }

  function createFallbackPhone() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(7.5, 15, 0.75);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0a3f47,
      roughness: 0.3,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Screen
    const screenGeo = new THREE.PlaneGeometry(6.9, 14.2);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.39;
    group.add(screen);

    phoneModel = group;
    phoneGroup.add(phoneModel);
    phoneGroup.rotation.x = -0.15;
    phoneGroup.rotation.y = -0.3;
  }

  function dialHelpline(helplineId) {
    const item = HELPLINES.find(h => h.id === helplineId) || HELPLINES[0];
    activeHelpline = item;

    // Trigger dialing animation & sound
    phoneState = 'dialing';
    renderScreenContent();

    // Sound effect: DTMF tone + phone ring
    if (window.SoundFX) {
      window.SoundFX.playPhoneDialTone('5');
      setTimeout(() => window.SoundFX.playPhoneDialTone('8'), 120);
      setTimeout(() => window.SoundFX.playPhoneRing(), 400);
    }

    // Phone tilt vibration animation using GSAP
    if (phoneGroup && typeof gsap !== 'undefined') {
      gsap.to(phoneGroup.rotation, {
        y: -0.1,
        x: -0.05,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(phoneGroup.position, {
            y: 0.3,
            duration: 0.1,
            yoyo: true,
            repeat: 3
          });
        }
      });
    }

    // Transition to connected state after 1.8s
    setTimeout(() => {
      phoneState = 'connected';
      renderScreenContent();
    }, 1800);

    // Update webpage panel info
    updateHelplineDetailCard(item);
  }

  function updateHelplineDetailCard(item) {
    const titleEl = document.getElementById('phone-active-title');
    const numEl = document.getElementById('phone-active-num');
    const orgEl = document.getElementById('phone-active-org');
    const descEl = document.getElementById('phone-active-desc');
    const callBtn = document.getElementById('btn-phone-call-action');
    const copyBtn = document.getElementById('btn-phone-copy-action');

    if (titleEl) titleEl.textContent = item.title;
    if (numEl) numEl.textContent = item.number;
    if (orgEl) orgEl.textContent = `${item.org} • ${item.region}`;
    if (descEl) descEl.textContent = item.desc;
    if (callBtn) {
      callBtn.href = `tel:${item.tel}`;
      callBtn.innerHTML = `<span class="icon">📞</span> Call ${item.number}`;
    }
  }

  function setupUIHandlers() {
    window.addEventListener('resize', onWindowResize, false);

    // Helpline Selection Buttons
    const buttons = document.querySelectorAll('.helpline-selector-pill');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        buttons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const id = e.currentTarget.getAttribute('data-helpline-id');
        dialHelpline(id);
      });
    });

    // Copy number button
    const copyBtn = document.getElementById('btn-phone-copy-action');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (navigator.clipboard && activeHelpline.number) {
          navigator.clipboard.writeText(activeHelpline.number).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="icon">✓</span> Number Copied!';
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
          });
        }
      });
    }

    // 3D Canvas Click to toggle call state
    if (container) {
      container.addEventListener('click', () => {
        if (phoneState === 'connected') {
          phoneState = 'idle';
        } else {
          dialHelpline(activeHelpline.id || 'uk-refuge');
        }
        renderScreenContent();
      });
    }

    // Initial card population
    updateHelplineDetailCard(activeHelpline);
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

    // Gentle floating breathing animation
    if (phoneGroup) {
      phoneGroup.position.y = Math.sin(time * 1.2) * 0.25;
      if (controls && controls.autoRotate) {
        phoneGroup.rotation.y += 0.005;
      }
    }

    // Re-render visualizer during call
    if (phoneState === 'dialing' || phoneState === 'connected') {
      renderScreenContent();
    }

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  return {
    init,
    dialHelpline,
    getHelplines: () => [...HELPLINES]
  };
})();

if (typeof window !== 'undefined') {
  window.Phone3D = Phone3D;
}
