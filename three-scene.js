/**
 * AMAN KUMAR SINGH — 3D WEBGL SCENE CONTROLLER
 * Powered by Three.js & GSAP
 * Implements interactive 3D Data Hologram, Particle Constellation,
 * scroll-linked camera choreography, and mode switching.
 */

(function () {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js library is not loaded.');
    document.documentElement.classList.add('webgl-fallback');
    return;
  }

  // Core Variables
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  let scene, camera, renderer;
  let coreGroup, ringsGroup, dataCubesGroup, particlesMesh;
  let pipelineGroup;
  let currentModeIndex = 0;
  const MODES = ['Cyber Constellation', 'Pipeline Matrix'];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowerPowerDevice = window.matchMedia('(max-width: 820px)').matches
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const maxPixelRatio = isLowerPowerDevice ? 1 : 1.5;
  let animationFrameId = null;
  let animationRunning = false;

  // Mouse & Scroll State
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let manualRotation = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let autoRotateSpeed = 0.005;
  // Applied to the scroll-driven camera target, so scene-mode camera transitions
  // are not overwritten by the animation loop on the next frame.
  const cameraModeOffset = { x: 0, y: 0, z: -0.5 };

  function showWebGLFallback() {
    document.documentElement.classList.add('webgl-fallback');
    if (canvas) canvas.style.display = 'none';
  }

  function tweenOrSet(target, properties) {
    const { duration, ease, ...values } = properties;
    if (prefersReducedMotion) {
      gsap.set(target, values);
    } else {
      gsap.to(target, properties);
    }
  }

  // Initialize Scene
  function init() {
    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080e, 0.045);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    // 3. Renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isLowerPowerDevice,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      console.warn('WebGL background is unavailable.', error);
      showWebGLFallback();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLightGold = new THREE.PointLight(0xf59e0b, 3, 20);
    pointLightGold.position.set(5, 5, 5);
    scene.add(pointLightGold);

    const pointLightCyan = new THREE.PointLight(0x38bdf8, 3, 20);
    pointLightCyan.position.set(-5, -5, 5);
    scene.add(pointLightCyan);

    // 5. Build 3D Objects
    createHologramCore();
    createDataPipelineHighway();
    createStarConstellation();
    window.set3DSceneMode(0);
    document.documentElement.classList.add('webgl-ready');

    // 6. Events
    setupEventListeners();

    // 7. Start Animation Loop
    if (prefersReducedMotion) {
      renderScene();
    } else {
      startAnimation();
    }
  }

  // Create Holographic Core
  function createHologramCore() {
    coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Geodesic Wireframe Sphere
    const geoSphere = new THREE.IcosahedronGeometry(1.8, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const innerMesh = new THREE.Mesh(geoSphere, wireMat);
    coreGroup.add(innerMesh);

    // Glowing Vertices (Point Cloud)
    const pointsMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const vertexPoints = new THREE.Points(geoSphere, pointsMat);
    coreGroup.add(vertexPoints);

    // Inner Nucleus
    const innerNucleusGeo = new THREE.DodecahedronGeometry(0.8, 1);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const nucleus = new THREE.Mesh(innerNucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // Gimbal Rings Group
    ringsGroup = new THREE.Group();
    coreGroup.add(ringsGroup);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.02, 16, 100), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.02, 16, 100), ringMat2);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.02, 16, 100), ringMat1);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    ring3.rotation.x = -Math.PI / 6;

    ringsGroup.add(ring1);
    ringsGroup.add(ring2);
    ringsGroup.add(ring3);

    // Orbiting Data Cubes (representing Data Packets)
    dataCubesGroup = new THREE.Group();
    coreGroup.add(dataCubesGroup);

    const cubeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const cubeMatGold = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true
    });
    const cubeMatCyan = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true
    });

    const cubeCount = 12;
    for (let i = 0; i < cubeCount; i++) {
      const isCyan = i % 2 === 0;
      const cube = new THREE.Mesh(cubeGeo, isCyan ? cubeMatCyan : cubeMatGold);
      const angle = (i / cubeCount) * Math.PI * 2;
      const radius = 2.6 + Math.sin(i * 1.5) * 0.5;
      cube.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.8,
        Math.sin(angle) * radius
      );
      cube.userData = {
        baseAngle: angle,
        radius: radius,
        speed: 0.015 + (i % 3) * 0.005,
        rotSpeed: 0.03
      };
      dataCubesGroup.add(cube);
    }
  }

  // Create Data Pipeline Highway Mode
  function createDataPipelineHighway() {
    pipelineGroup = new THREE.Group();
    pipelineGroup.visible = false;
    scene.add(pipelineGroup);

    // Glowing Tunnel Rings
    const ringCount = 25;
    for (let i = 0; i < ringCount; i++) {
      const r = 2.5 + Math.sin(i * 0.4) * 0.3;
      const ringGeo = new THREE.RingGeometry(r - 0.04, r, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -i * 2 + 5;
      pipelineGroup.add(ring);
    }

    // Pipeline Data Streams
    const lineCount = 8;
    for (let j = 0; j < lineCount; j++) {
      const angle = (j / lineCount) * Math.PI * 2;
      const points = [];
      for (let z = 10; z >= -50; z -= 2) {
        points.push(new THREE.Vector3(
          Math.cos(angle) * 2.5 + Math.sin(z * 0.2) * 0.4,
          Math.sin(angle) * 2.5 + Math.cos(z * 0.2) * 0.4,
          z
        ));
      }
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: j % 2 === 0 ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: 0.5
      });
      const streamLine = new THREE.Line(curveGeo, lineMat);
      pipelineGroup.add(streamLine);
    }
  }

  // Create Starfield & Constellation Particles
  function createStarConstellation() {
    const particleCount = isLowerPowerDevice ? 500 : 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xf59e0b);
    const cyanColor = new THREE.Color(0x38bdf8);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 45;
      positions[i3 + 1] = (Math.random() - 0.5) * 45;
      positions[i3 + 2] = (Math.random() - 0.5) * 45;

      const mix = Math.random();
      let c;
      if (mix < 0.45) c = goldColor;
      else if (mix < 0.85) c = cyanColor;
      else c = whiteColor;

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  // Set 3D Mode
  window.set3DSceneMode = function (modeIndex) {
    currentModeIndex = modeIndex % MODES.length;
    const modeName = MODES[currentModeIndex];
    const modeLabel = document.getElementById('currentSceneMode');
    if (modeLabel) modeLabel.textContent = modeName;

    // Every mode explicitly restores the values it changes. This prevents the
    // constellation mode's smaller core and larger particles leaking into later modes.
    const isConstellationMode = currentModeIndex === 0;
    gsap.killTweensOf(coreGroup.scale);
    gsap.killTweensOf(particlesMesh.material);
    tweenOrSet(coreGroup.scale, {
      x: isConstellationMode ? 0.6 : 1,
      y: isConstellationMode ? 0.6 : 1,
      z: isConstellationMode ? 0.6 : 1,
      duration: 1,
      ease: 'power2.out'
    });
    tweenOrSet(particlesMesh.material, {
      size: isConstellationMode ? 0.18 : 0.1,
      duration: 1,
      ease: 'power2.out'
    });

    if (currentModeIndex === 0) {
      // Cyber Constellation
      coreGroup.visible = true;
      pipelineGroup.visible = false;
      particlesMesh.visible = true;
      tweenOrSet(cameraModeOffset, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.out' });
    } else if (currentModeIndex === 1) {
      // Pipeline Matrix
      coreGroup.visible = false;
      pipelineGroup.visible = true;
      particlesMesh.visible = true;
      tweenOrSet(cameraModeOffset, { x: 0, y: 0, z: -2.5, duration: 1.2, ease: 'power2.out' });
    }

    if (prefersReducedMotion) renderScene();
  };

  // Event Listeners
  function setupEventListeners() {
    // Window Resize
    window.addEventListener('resize', onWindowResize);

    document.addEventListener('visibilitychange', () => {
      if (prefersReducedMotion) return;
      if (document.hidden) stopAnimation();
      else startAnimation();
    });

    // Mode Toggle Button
    const sceneModeBtn = document.getElementById('sceneModeBtn');
    if (sceneModeBtn) {
      sceneModeBtn.addEventListener('click', () => {
        window.set3DSceneMode(currentModeIndex + 1);
        if (window.playSfx) window.playSfx('mode');
      });
    }

    if (prefersReducedMotion) return;

    // Mouse Move Parallax
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Scroll Progress Tracking for 3D Camera Choreography
    window.addEventListener('scroll', onScroll, { passive: true });

    // Canvas Dragging for Direct Rotation
    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'CANVAS' || e.target.id === 'canvas-container') {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        manualRotation.targetY += deltaX * 0.008;
        manualRotation.targetX += deltaY * 0.008;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Touch support for mobile devices
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;
        manualRotation.targetY += deltaX * 0.006;
        manualRotation.targetX += deltaY * 0.006;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    if (prefersReducedMotion) renderScene();
  }

  function onScroll() {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      scrollProgress = window.scrollY / totalScroll;
    }
  }

  // Camera & Core Scroll Choreography Matrix
  function updateCameraScrollChoreography() {
    // Journey position down through the sections
    const journeyY = -Math.min(scrollProgress * 20, 7);
    // Weave gently between right and left to frame section contents
    const waveX = Math.sin(scrollProgress * Math.PI * 3) * 1.2 + 0.25;

    if (coreGroup) {
      coreGroup.position.x += (waveX - coreGroup.position.x) * 0.05;
      coreGroup.position.y += (journeyY - coreGroup.position.y) * 0.05;
      coreGroup.position.z += (-scrollProgress * 2 - coreGroup.position.z) * 0.05;
    }

    const targetCameraY = journeyY;
    const targetCameraZ = 8.5 - Math.sin(scrollProgress * Math.PI) * 1.5;
    const targetCameraX = mouse.x * 1.2 + cameraModeOffset.x;

    camera.position.x += (targetCameraX - camera.position.x) * 0.05;
    camera.position.y += (targetCameraY + mouse.y * 0.6 + cameraModeOffset.y - camera.position.y) * 0.05;
    camera.position.z += (targetCameraZ + cameraModeOffset.z - camera.position.z) * 0.05;

    camera.lookAt(coreGroup ? coreGroup.position.x * 0.3 : 0, targetCameraY, 0);
  }

  function renderScene() {
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function startAnimation() {
    if (animationRunning) return;
    animationRunning = true;
    animate();
  }

  function stopAnimation() {
    animationRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Animation Loop
  function animate() {
    if (!animationRunning) return;
    animationFrameId = requestAnimationFrame(animate);

    // Mouse Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    // Manual Rotation Lerp
    manualRotation.x += (manualRotation.targetX - manualRotation.x) * 0.08;
    manualRotation.y += (manualRotation.targetY - manualRotation.y) * 0.08;

    // Rotate Core Group
    if (coreGroup && coreGroup.visible) {
      coreGroup.rotation.y += autoRotateSpeed;
      coreGroup.rotation.x = manualRotation.x + mouse.y * 0.3;
      coreGroup.rotation.y += (manualRotation.y + mouse.x * 0.3 - coreGroup.rotation.y) * 0.05;

      // Animate Orbiting Rings
      if (ringsGroup) {
        ringsGroup.children[0].rotation.x += 0.008;
        ringsGroup.children[1].rotation.y += 0.012;
        ringsGroup.children[2].rotation.z += 0.006;
      }

      // Animate Orbiting Data Cubes
      if (dataCubesGroup) {
        dataCubesGroup.children.forEach((cube) => {
          const ud = cube.userData;
          ud.baseAngle += ud.speed;
          cube.position.x = Math.cos(ud.baseAngle) * ud.radius;
          cube.position.z = Math.sin(ud.baseAngle) * ud.radius;
          cube.position.y = Math.sin(ud.baseAngle * 3) * 0.6;
          cube.rotation.x += ud.rotSpeed;
          cube.rotation.y += ud.rotSpeed;
        });
      }
    }

    // Animate Pipeline Highway Mode
    if (pipelineGroup && pipelineGroup.visible) {
      pipelineGroup.children.forEach((obj, idx) => {
        if (obj.isMesh) {
          obj.position.z += 0.08;
          if (obj.position.z > 8) {
            obj.position.z = -42;
          }
          obj.rotation.z += 0.005;
        }
      });
    }

    // Animate Background Constellation Drift
    if (particlesMesh) {
      particlesMesh.rotation.y += 0.0008;
      particlesMesh.rotation.x = mouse.y * 0.05;
    }

    // Camera Choreography
    updateCameraScrollChoreography();

    // Render Frame
    renderScene();
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
