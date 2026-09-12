"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef?.current) {
      meshRef.current.rotation.y += delta * 0.07;
    }
  });

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Pale moonlight ocean base
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#EAF0F4');
      grad.addColorStop(1, '#D6E0E8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Green Dome continents (stylized)
      const drawContinent = (x: number, y: number, w: number, h: number) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      ctx.fillStyle = 'rgba(11, 110, 79, 0.85)';
      drawContinent(250, 200, 80, 60);
      drawContinent(300, 280, 40, 50);
      drawContinent(500, 200, 60, 40);
      drawContinent(520, 300, 50, 60);
      drawContinent(700, 220, 100, 50);
      drawContinent(800, 300, 40, 30);
      drawContinent(150, 250, 30, 40);

      // Lighter green highlights
      ctx.fillStyle = 'rgba(20, 146, 107, 0.55)';
      drawContinent(260, 190, 45, 30);
      drawContinent(710, 210, 55, 25);
      drawContinent(510, 300, 25, 30);

      // Gold graticule lines (Dome of the Rock gold)
      ctx.strokeStyle = 'rgba(166, 124, 0, 0.18)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 1024; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }
      for (let i = 0; i < 512; i += 64) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          // Silvery moonlight glow with a faint green tint
          gl_FragColor = vec4(0.72, 0.82, 0.80, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
  }, []);

  return (
    <group position={[0, -2.8, 0]}>
      {/* Main globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          map={earthTexture}
          color="#FFFFFF"
          emissive="#0B6E4F"
          emissiveIntensity={0.04}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.72, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
      {/* Gold ring at equator (Dome of the Rock gold) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.55, 0.022, 16, 120]} />
        <meshStandardMaterial color="#C9A227" emissive="#C9A227" emissiveIntensity={0.55} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function HalfGlobe() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[60vh] pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 6, 5]} intensity={1.1} color="#FFFFFF" />
        <pointLight position={[0, -2, 4]} intensity={1.0} color="#EAF0F4" distance={12} />
        <pointLight position={[-4, 2, 3]} intensity={0.5} color="#C9A227" distance={12} />
        <Globe />
      </Canvas>
    </div>
  );
}
