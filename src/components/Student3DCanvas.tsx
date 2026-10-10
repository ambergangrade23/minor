import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export type CharacterState = 
  | 'walking'
  | 'idle'
  | 'turning_left'
  | 'turning_right'
  | 'looking_around'
  | 'react_bus'
  | 'react_alert'
  | 'react_route'
  | 'react_driver';

interface Student3DCanvasProps {
  interactionState: CharacterState;
  onAnimationTriggered?: (state: CharacterState) => void;
  className?: string;
}

export const Student3DCanvas: React.FC<Student3DCanvasProps> = ({
  interactionState,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [avatarLoaded, setAvatarLoaded] = useState<boolean>(false);

  // Offscreen canvas chroma-keying to extract character cutout with smooth transparent alpha
  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/anime_student_avatar.jpg';

    img.onload = () => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth || 768;
      canvas.height = img.naturalHeight || 1024;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Process pure white / near-white background to transparent with smooth feathering
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If the pixel is close to pure white, make it transparent
          if (r > 238 && g > 238 && b > 238) {
            const minChannel = Math.min(r, g, b);
            if (minChannel > 248) {
              data[i + 3] = 0; // Pure transparent
            } else {
              // Smooth edge feathering
              const factor = (255 - minChannel) / 17;
              data[i + 3] = Math.max(0, Math.min(255, Math.floor(factor * 255)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        if (!isCancelled) setAvatarLoaded(true);
      } catch (err) {
        // Fallback: draw directly
        ctx.drawImage(img, 0, 0);
        if (!isCancelled) setAvatarLoaded(true);
      }
    };

    return () => {
      isCancelled = true;
    };
  }, []);

  // Three.js ambient particles drifting serenely without flashing or jumping
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animationId: number;

    try {
      scene = new THREE.Scene();
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 5);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);

      const particleCount = 28;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 3.8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;

        velocities[i * 3] = (Math.random() - 0.5) * 0.0008;
        velocities[i * 3 + 1] = 0.0012 + Math.random() * 0.0015;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0008;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.035,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(geometry, particleMat);
      scene.add(particleSystem);

      const animateParticles = () => {
        animationId = requestAnimationFrame(animateParticles);

        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 1] += velocities[i * 3 + 1];
          posArray[i * 3] += velocities[i * 3];

          // Wrap smoothly vertically
          if (posArray[i * 3 + 1] > 2.0) {
            posArray[i * 3 + 1] = -1.8;
            posArray[i * 3] = (Math.random() - 0.5) * 3.8;
          }
        }
        posAttr.needsUpdate = true;

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animateParticles();

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch {
      // Graceful fallback
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none select-none flex items-center justify-center ${className}`}
    >
      {/* 3D WebGL Background Particles Layer */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* Central Student Avatar Container */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-auto">
        {/* Soft Realistic Courtyard Ground Contact Shadow with Synchronized Breathing */}
        <div
          className={`absolute -bottom-6 w-56 sm:w-72 h-10 rounded-full bg-slate-900/35 blur-xl pointer-events-none transition-all duration-700 ${
            interactionState === 'walking'
              ? 'animate-shadow-pulse'
              : 'scale-100 opacity-30'
          }`}
        />

        {/* Character Frame with Lifelike Motion Animation */}
        <div
          className={`relative group cursor-pointer transition-all duration-700 ${
            interactionState === 'walking'
              ? 'animate-character-walk'
              : interactionState === 'react_bus'
              ? 'scale-105 -translate-y-2'
              : interactionState === 'react_alert'
              ? 'scale-102 -translate-y-1'
              : interactionState === 'react_route'
              ? 'scale-105 translate-x-1'
              : interactionState === 'react_driver'
              ? 'scale-105'
              : 'animate-character-idle'
          }`}
          title="Campus Student"
        >
          {/* Feathered Cutout Canvas for the Student */}
          <canvas
            ref={canvasRef}
            className={`w-auto h-[440px] sm:h-[540px] lg:h-[620px] max-h-[80vh] object-contain drop-shadow-[0_20px_35px_rgba(15,23,42,0.35)] transition-opacity duration-300 ${
              avatarLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Initial Direct Image Fallback until Canvas Alpha Processing Completes */}
          {!avatarLoaded && (
            <img
              src="/anime_student_avatar.jpg"
              alt="Student Avatar"
              referrerPolicy="no-referrer"
              className="w-auto h-[440px] sm:h-[540px] lg:h-[620px] max-h-[80vh] object-contain mix-blend-multiply drop-shadow-[0_20px_35px_rgba(15,23,42,0.3)]"
            />
          )}
        </div>
      </div>
    </div>
  );
};
