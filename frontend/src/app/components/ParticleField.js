'use client';

import { useRef, useEffect } from 'react';

export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    let renderer, scene, camera, particles, geometry, material;
    let mouseX = 0, mouseY = 0;
    let threeModule;

    const init = async () => {
      const THREE = await import('three');
      threeModule = THREE;

      const canvas = canvasRef.current;
      if (!canvas) return;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Create particle system
      const count = 2000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const color1 = new THREE.Color('#6366f1');
      const color2 = new THREE.Color('#8b5cf6');
      const color3 = new THREE.Color('#a855f7');

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

        const c = [color1, color2, color3][Math.floor(Math.random() * 3)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Create a dot texture
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = 32;
      textureCanvas.height = 32;
      const ctx = textureCanvas.getContext('2d');
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      const dotTexture = new THREE.CanvasTexture(textureCanvas);

      material = new THREE.PointsMaterial({
        size: 0.4,
        map: dotTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true,
        opacity: 0.8,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Store original positions for floating animation
      const origPositions = new Float32Array(positions.slice());

      // Mouse tracking
      const handleMouse = (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', handleMouse);

      const handleResize = () => {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      // Animation
      const clock = new THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        if (particles) {
          particles.rotation.x = elapsed * 0.02 + mouseY * 0.05;
          particles.rotation.y = elapsed * 0.03 + mouseX * 0.05;

          // Gentle floating motion on selected particles
          const posAttr = geometry.attributes.position;
          const posArray = posAttr.array;
          for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            posArray[i3 + 1] = origPositions[i3 + 1] + Math.sin(elapsed * 0.3 + i * 0.01) * 2;
            posArray[i3] = origPositions[i3] + Math.cos(elapsed * 0.2 + i * 0.01) * 2;
          }
          posAttr.needsUpdate = true;
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();

      // Store event listeners for cleanup
      init.handleMouse = handleMouse;
      init.handleResize = handleResize;
    };

    init();

    return () => {
      if (animId) cancelAnimationFrame(animId);

      // Remove event listeners
      if (typeof init.handleMouse === 'function') window.removeEventListener('mousemove', init.handleMouse);
      if (typeof init.handleResize === 'function') window.removeEventListener('resize', init.handleResize);

      // Dispose Three.js resources
      if (geometry) geometry.dispose();
      if (material) {
        if (material.map) material.map.dispose();
        material.dispose();
      }
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();
      }
      if (scene) {
        scene.remove(...scene.children);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}
