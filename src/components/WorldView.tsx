import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const WorldView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    
    // Add mystic fog for depth
    scene.fog = new THREE.FogExp2(0x0f0514, 0.005);
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x2a153b, 1.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffaa33, 2.0);
    dirLight.position.set(50, 100, -50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x3366ff, 2.5);
    rimLight.position.set(-50, -20, 50);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xff0055, 3, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // 3. Create the Procedural Temple Landscape
    const templeGroup = new THREE.Group();
    scene.add(templeGroup);

    // Procedural Grid Texture
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = 512;
    gridCanvas.height = 512;
    const gridCtx = gridCanvas.getContext('2d');
    if (gridCtx) {
      gridCtx.fillStyle = '#111';
      gridCtx.fillRect(0, 0, 512, 512);
      gridCtx.strokeStyle = '#fff';
      gridCtx.lineWidth = 2;
      for (let i = 0; i <= 512; i+=64) {
        gridCtx.beginPath();
        gridCtx.moveTo(i, 0);
        gridCtx.lineTo(i, 512);
        gridCtx.stroke();
        gridCtx.beginPath();
        gridCtx.moveTo(0, i);
        gridCtx.lineTo(512, i);
        gridCtx.stroke();
      }
    }
    const gridTex = new THREE.CanvasTexture(gridCanvas);
    gridTex.wrapS = THREE.RepeatWrapping;
    gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(20, 20);

    // Dark reflecting pool / base
    const floorGeometry = new THREE.CylinderGeometry(100, 100, 1, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0a0515,
      roughness: 0.1,
      metalness: 0.8,
      roughnessMap: gridTex
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -10;
    floor.receiveShadow = true;
    templeGroup.add(floor);

    // Monolithic Sacred Pillars
    const pillarGeom = new THREE.BoxGeometry(5, 50, 5);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1a1525,
      roughness: 0.8,
      metalness: 0.3
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
    const glowGeom = new THREE.BoxGeometry(5.2, 1.5, 5.2);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, 15, z);
      pillar.lookAt(0, 15, 0);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      templeGroup.add(pillar);

      // Glowing rune bands on pillars
      const band = new THREE.Mesh(glowGeom, glowMat);
      band.position.set(x, 5 + Math.sin(i) * 5, z);
      band.lookAt(0, band.position.y, 0);
      templeGroup.add(band);
    }

    // Central Floating Artifact / Heart of the Temple
    const coreGroup = new THREE.Group();
    coreGroup.position.y = 10;
    templeGroup.add(coreGroup);

    const coreGeom = new THREE.OctahedronGeometry(6, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff3300,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 1.0,
      wireframe: true
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.castShadow = true;
    coreGroup.add(core);

    const innerCoreGeom = new THREE.IcosahedronGeometry(4, 1);
    const innerCoreMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xffd700,
      emissive: 0xff8800,
      emissiveIntensity: 0.5,
      transmission: 0.9,
      opacity: 1,
      metalness: 0,
      roughness: 0,
      ior: 1.5,
      thickness: 2
    });
    const innerCore = new THREE.Mesh(innerCoreGeom, innerCoreMat);
    innerCore.castShadow = true;
    coreGroup.add(innerCore);

    // Procedural Bloom/Glow Sprite
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const glowCtx = glowCanvas.getContext('2d');
    if (glowCtx) {
      const grad = glowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 170, 0, 1)');
      grad.addColorStop(0.3, 'rgba(255, 50, 0, 0.4)');
      grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      glowCtx.fillStyle = grad;
      glowCtx.fillRect(0, 0, 128, 128);
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const spriteMat = new THREE.SpriteMaterial({ 
      map: glowTex, 
      color: 0xffaa00, 
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const coreGlow = new THREE.Sprite(spriteMat);
    coreGlow.scale.set(40, 40, 1);
    coreGroup.add(coreGlow);

    // Floating Ruin Debris
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);
    const debrisGeom = new THREE.DodecahedronGeometry(1.5, 0);
    const debrisMat = new THREE.MeshStandardMaterial({
      color: 0x221a30,
      roughness: 0.9,
      metalness: 0.1
    });

    const debrisList: { mesh: THREE.Mesh, speed: number, dist: number, angle: number, yOffset: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(debrisGeom, debrisMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 60;
      const yOffset = -5 + Math.random() * 40;
      
      mesh.position.set(Math.cos(angle) * dist, yOffset, Math.sin(angle) * dist);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      const scale = 0.5 + Math.random() * 1.5;
      mesh.scale.setScalar(scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      debrisGroup.add(mesh);
      debrisList.push({ mesh, speed: 0.2 + Math.random() * 0.5, dist, angle, yOffset });
    }

    // Floating Ember Particles
    const particleCount = 300;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 150;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffaa00';
      ctx.fill();
    }
    const particleTex = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 1.0,
      map: particleTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffaa44
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Initial Camera
    camera.position.set(0, 15, 70);
    camera.lookAt(0, 10, 0);

    // Mouse Parallax Setup
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 4. Animation Loop
    let animationId: number;
    let time = 0;
    
    let targetCamX = 0;
    let targetCamY = 20;

    const animate = () => {
      time += 0.005;
      
      // Global temple rotation
      templeGroup.rotation.y = time * 0.3;

      // Animate core
      core.rotation.x = time * 1.5;
      core.rotation.y = time * 2.2;
      innerCore.rotation.y = -time * 3.0;
      innerCore.rotation.z = time * 1.0;
      
      coreGroup.position.y = 10 + Math.sin(time * 3) * 3;
      pointLight.position.y = coreGroup.position.y;
      pointLight.intensity = 3 + Math.sin(time * 10) * 1;

      // Animate Debris
      debrisList.forEach((d, i) => {
        d.angle += d.speed * 0.01;
        d.mesh.position.x = Math.cos(d.angle) * d.dist;
        d.mesh.position.z = Math.sin(d.angle) * d.dist;
        d.mesh.position.y = d.yOffset + Math.sin(time * 2 + i) * 2;
        d.mesh.rotation.x += 0.01 * d.speed;
        d.mesh.rotation.y += 0.015 * d.speed;
      });

      // Animate particles
      particles.rotation.y = -time * 0.1;
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.1; 
        if (positions[i] > 60) positions[i] = -20;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Smooth cinematic camera movement with mouse parallax
      const baseCamX = Math.sin(time * 0.4) * 65;
      const baseCamZ = Math.cos(time * 0.4) * 65;
      const baseCamY = 20 + Math.sin(time * 0.6) * 10;
      
      targetCamX = baseCamX + (mouseX * 15);
      targetCamY = baseCamY + (mouseY * 15);

      // Interpolate for smooth parallax
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.position.z = baseCamZ; // Z stays mostly the same for the orbit
      
      camera.lookAt(0, 10, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    
    animate();

    // 5. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Memory cleanup
      floorGeometry.dispose();
      floorMaterial.dispose();
      gridTex.dispose();
      glowTex.dispose();
      spriteMat.dispose();
      pillarGeom.dispose();
      pillarMat.dispose();
      glowGeom.dispose();
      glowMat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      innerCoreGeom.dispose();
      innerCoreMat.dispose();
      debrisGeom.dispose();
      debrisMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      particleTex.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#05010a]"
    />
  );
};
