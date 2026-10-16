import React, { useRef, useEffect, useState, useMemo } from 'react';
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
  | 'react_driver'
  | 'cheer'
  | 'wave';

interface Student3DCanvasProps {
  interactionState: CharacterState;
  onAnimationTriggered?: (state: CharacterState) => void;
  className?: string;
  onCharacterClick?: () => void;
}

export const Student3DCanvas: React.FC<Student3DCanvasProps> = ({
  interactionState,
  onAnimationTriggered,
  className = '',
  onCharacterClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeSpeech, setActiveSpeech] = useState<{ text: string; icon: string } | null>(null);
  const [clickBounce, setClickBounce] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // 3D Mouse Parallax Depth Effect
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update target coordinates from mouse/pointer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized -1 to +1 coordinate relative to window center
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setTargetPos({ x: nx, y: ny });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const nx = (t.clientX / window.innerWidth) * 2 - 1;
        const ny = (t.clientY / window.innerHeight) * 2 - 1;
        setTargetPos({ x: nx, y: ny });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Smooth lerp interpolation for buttery 60fps 3D parallax tilt
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      setMousePos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.07,
        y: prev.y + (targetPos.y - prev.y) * 0.07,
      }));
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  // Update expressive dialogue badge whenever interactionState changes
  useEffect(() => {
    switch (interactionState) {
      case 'react_bus':
        setActiveSpeech({ text: 'Tracking your bus in real-time!', icon: '🚌' });
        break;
      case 'react_alert':
        setActiveSpeech({ text: 'Checking live route updates & alerts!', icon: '🔔' });
        break;
      case 'react_route':
        setActiveSpeech({ text: 'Scanning nearby alternative stops...', icon: '📍' });
        break;
      case 'react_driver':
        setActiveSpeech({ text: 'Fetching driver info & verified contact!', icon: '👨‍✈️' });
        break;
      case 'cheer':
        setActiveSpeech({ text: 'Boarding confirmed! Have a safe trip!', icon: '🎉' });
        break;
      case 'wave':
        setActiveSpeech({ text: 'Welcome to AITR Campus Transit!', icon: '👋' });
        break;
      case 'looking_around':
        setActiveSpeech({ text: 'Checking bus schedules for today...', icon: '👀' });
        break;
      case 'walking':
      default:
        setActiveSpeech(null);
        break;
    }
  }, [interactionState]);

  // Direct click interaction triggers student transit dialogue tips and micro-bounce
  const handleStudentClick = () => {
    setClickBounce(true);
    setTimeout(() => setClickBounce(false), 320);

    const randomTips = [
      { text: "Tracking Bus G-15 on real-time satellite corridor!", icon: "🚌" },
      { text: "Tip: Mangliya Depot stop is usually fastest for Shift 1!", icon: "⚡" },
      { text: "Tap 'Interactive Map' anytime to view live route telemetry!", icon: "🗺️" },
      { text: "Driver contacts are verified for today's routes!", icon: "📞" },
      { text: "Have your Acropolis student RFID card ready for boarding!", icon: "🎓" },
      { text: "Weather is clear across Indore-Ujjain-Dewas highways!", icon: "☀️" },
      { text: "Need route changes? Check 'Find My Bus' for alternates!", icon: "🎒" },
    ];
    const picked = randomTips[Math.floor(Math.random() * randomTips.length)];
    setActiveSpeech(picked);

    if (onCharacterClick) {
      onCharacterClick();
    }
  };

  // Three.js ambient glowing depth particles in 3D WebGL space
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
        positions[i * 3] = (Math.random() - 0.5) * 4.2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3.4;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;

        velocities[i * 3] = (Math.random() - 0.5) * 0.0006;
        velocities[i * 3 + 1] = 0.0010 + Math.random() * 0.0016;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.0006;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.038,
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
          if (posArray[i * 3 + 1] > 2.2) {
            posArray[i * 3 + 1] = -2.0;
            posArray[i * 3] = (Math.random() - 0.5) * 4.2;
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

  // Compute 3D transformation values based on mouse position
  const tilt3DStyle = useMemo(() => {
    const rotateY = mousePos.x * 12; // -12deg to +12deg turn
    const rotateX = -mousePos.y * 8; // -8deg to +8deg pitch
    const translateZ = Math.abs(mousePos.x) * 10;

    return {
      perspective: '1000px',
      transform: `perspective(1000px) rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg) translateZ(${translateZ.toFixed(1)}px)`,
      transformStyle: 'preserve-3d' as const,
      transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };
  }, [mousePos]);

  // Dynamic ground shadow follows 3D perspective shift and stride cycle
  const shadowStyle = useMemo(() => {
    const shiftX = -mousePos.x * 14;
    return {
      transform: `translateX(${shiftX.toFixed(1)}px)`,
      transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };
  }, [mousePos]);

  // Determine active action animation class
  const getActionClass = () => {
    if (clickBounce) return 'scale-105 -translate-y-2';
    switch (interactionState) {
      case 'react_bus':
        return 'animate-character-react-bus';
      case 'react_alert':
        return 'animate-character-react-alert';
      case 'react_route':
        return 'animate-character-react-route';
      case 'react_driver':
        return 'animate-character-react-driver';
      case 'cheer':
        return 'animate-character-cheer';
      case 'wave':
        return 'animate-character-wave';
      case 'idle':
        return 'animate-character-idle';
      case 'walking':
      default:
        // Slow realistic 3D walking animation
        return 'animate-character-walk-slow';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none select-none flex items-center justify-center ${className}`}
    >
      {/* 3D WebGL Background Particles Layer */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* Central Interactive Walking Boy Avatar Container */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center pointer-events-auto"
        style={tilt3DStyle}
      >
        {/* Realistic Synchronized Courtyard Ground Contact Shadow */}
        <div
          style={shadowStyle}
          className="absolute -bottom-6 w-56 sm:w-72 md:w-80 h-10 rounded-full bg-slate-950/50 blur-xl pointer-events-none animate-shadow-walk-slow"
        />

        {/* Character Frame with Lifelike Walking 3D Effect & Reaction States */}
        <div
          onClick={handleStudentClick}
          className={`relative group cursor-pointer transition-all duration-300 ${getActionClass()}`}
          title="Acropolis Campus Student — Click to interact!"
        >
          {/* Reactive Speech Balloon when feature is clicked */}
          {activeSpeech && (
            <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-speech-bubble">
              <div className="glass-panel px-4 py-2.5 rounded-2xl shadow-2xl border border-white/90 flex items-center gap-2.5 whitespace-nowrap bg-white/95 backdrop-blur-xl">
                <span className="text-base select-none">{activeSpeech.icon}</span>
                <span className="text-xs font-black text-[#0f172a] tracking-tight">
                  {activeSpeech.text}
                </span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white/95 rotate-45 border-r border-b border-white/90" />
              </div>
            </div>
          )}

          {/* Clean Transparent Boy Avatar Image with 3D Depth & Slow Walking Cadence */}
          <div className="relative overflow-visible flex items-center justify-center">
            <img
              src={imageError ? '/student_avatar.jpg' : '/anime_student_avatar.png'}
              onError={() => setImageError(true)}
              alt="AITR Student Walking on Campus"
              draggable={false}
              className="w-auto h-[380px] sm:h-[500px] lg:h-[610px] max-h-[75vh] max-w-[85vw] object-contain drop-shadow-[0_25px_35px_rgba(15,23,42,0.42)] drop-shadow-[0_0_20px_rgba(56,189,248,0.14)] pointer-events-auto cursor-pointer transition-transform duration-200 select-none group-hover:scale-[1.01]"
              style={{
                filter: 'brightness(1.02) contrast(1.03)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
