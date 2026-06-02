import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Text, Float, Stars, Torus, Html, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';

const STAGE_DEPTH = 60;
const STAGES = [
  { id: 'intro', z: 0, title: 'Intro', text: 'Every great journey begins with a single spark.' },
  { id: 'story', z: -STAGE_DEPTH * 1, title: 'Our Services', text: 'Immersive digital capabilities built by True Twist.' },
  { id: 'skills', z: -STAGE_DEPTH * 2, title: 'Core Capabilities', text: 'The forces that drive creation.' },
  { id: 'projects', z: -STAGE_DEPTH * 3, title: 'Our Projects', text: 'Portals to newly forged realities.' },
  { id: 'experience', z: -STAGE_DEPTH * 4, title: 'Our Journey', text: 'Milestones of a growing legacy.' },
  { id: 'achievements', z: -STAGE_DEPTH * 5, title: 'Insights', text: 'Articles, news and guides on emerging tech.' },
  { id: 'contact', z: -STAGE_DEPTH * 6, title: 'Singularity', text: 'We build the future of immersive digital products.' },
];

function CameraController({ targetCameraZ, isTransitioning, onArrive, setPopupVisible, currentStageIndex }) {
  const { camera } = useThree();
  const prevZ = useRef(10);

  useEffect(() => {
    prevZ.current = camera.position.z;
  }, []);

  useFrame((state) => {
    const currentZ = camera.position.z;
    const diff = currentZ - prevZ.current;
    prevZ.current = currentZ;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ.current, 0.08);

    // Dynamic camera zero-g float
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.6;
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.4) * 0.6;

    // Sway visual target slightly to simulate camera inertia
    const swayX = Math.sin(state.clock.elapsedTime * 0.25) * 0.25;
    const swayY = Math.cos(state.clock.elapsedTime * 0.25) * 0.25;

    // Pitch (tilt up/down) slightly based on travel speed/acceleration
    const pitchOffset = diff * 0.12;

    camera.lookAt(swayX, swayY - pitchOffset, camera.position.z - 20);

    // Apply zero-g camera roll (Z sway) + dynamic banking rotation when moving
    const rollSway = Math.sin(state.clock.elapsedTime * 0.35) * 0.04;
    const rollMove = diff * 0.06;
    camera.rotation.z += rollSway + rollMove;

    // Keep FOV constant for continuous zoom feel without warping
    camera.fov = 60;
    camera.updateProjectionMatrix();

    // Dynamic arrival check for all stages in both directions
    if (isTransitioning) {
      STAGES.forEach((stage, idx) => {
        if (idx !== currentStageIndex) {
          const destZ = stage.z + 10;
          if (Math.abs(camera.position.z - destZ) < 1.5) {
            onArrive(idx);
          }
        }
      });
    } else {
      const currentDestZ = STAGES[currentStageIndex].z + 10;
      if (Math.abs(camera.position.z - currentDestZ) < 1.5) {
        setPopupVisible(true);
      } else {
        setPopupVisible(false);
      }
    }
  });
  return null;
}

// Helper to generate a soft glowing circular star sprite programmatically
const starTexture = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.25, 'rgba(230, 240, 255, 0.85)');
  gradient.addColorStop(0.6, 'rgba(100, 140, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
})();

import { useLoader } from '@react-three/fiber';
import galaxyTextureUrl from './galaxy.png';

// UniverseEffects: A completely procedural, high-end 3D deep space environment
function UniverseEffects() {
  const groupRef = useRef();
  const galaxyTexture = useLoader(THREE.TextureLoader, galaxyTextureUrl);
  const nebula1Ref = useRef();
  const nebula2Ref = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Slowly rotate the entire universe for a dynamic cosmic feel
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.0003;
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.00015;
    }
    if (nebula1Ref.current) {
      nebula1Ref.current.rotation.z = state.clock.elapsedTime * 0.005;
    }
    if (nebula2Ref.current) {
      nebula2Ref.current.rotation.z = -state.clock.elapsedTime * 0.003;
    }
  });

  return (
    // Center the entire universe in the middle of the scrolling journey (z = -180)
    <group position={[0, 0, -180]} ref={groupRef}>
      
      {/* MASSIVE Procedural Stars to fly through */}
      <Stars radius={150} depth={500} count={15000} factor={8} saturation={0} fade speed={1} />

      {/* Galactic Dust Clusters (Simulating glowing star clusters flying past) */}
      <Sparkles count={2000} scale={[200, 200, 600]} size={3} color="#ffffff" speed={0.5} opacity={0.6} />
      <Sparkles count={2000} scale={[200, 200, 600]} size={2} color="#fffdd0" speed={0.4} opacity={0.6} />
      <Sparkles count={1000} scale={[200, 200, 600]} size={4} color="#f5f5dc" speed={0.6} opacity={0.4} />

      {/* GIANT 3D GLOWING COLORFUL GALAXY LAYERS */}
      {/* Layer 1: Cyan/Blue Core Nebula */}
      <mesh ref={nebula1Ref} position={[0, 0, -50]} scale={[300, 300, 1]}>
        <planeGeometry />
        <meshBasicMaterial 
          map={galaxyTexture} 
          transparent 
          opacity={0.6} 
          color="#00f0ff" 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>

      {/* Layer 2: Pink/Magenta Outer Nebula */}
      <mesh ref={nebula2Ref} position={[0, 0, -70]} scale={[420, 420, 1]}>
        <planeGeometry />
        <meshBasicMaterial 
          map={galaxyTexture} 
          transparent 
          opacity={0.45} 
          color="#d946ef" 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>

      {/* Layer 3: Warm Orange Golden Dust Backplate */}
      <mesh position={[0, 0, -90]} scale={[550, 550, 1]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry />
        <meshBasicMaterial 
          map={galaxyTexture} 
          transparent 
          opacity={0.3} 
          color="#ff7700" 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>

    </group>
  );
}
// Stage 0: Intro
function IntroStage({ z }) {
  const ref = useRef();
  const groupRef = useRef();
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 6);
  const isMobile = window.innerWidth <= 768;

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
      if (ref.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        ref.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, z]} scale={[scale, scale, scale]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ff3366" />
      </mesh>
      <pointLight color="#ff3366" intensity={5} distance={10} />
      <Sparkles count={100} scale={5} size={2} color="#ff3366" speed={2} />
      <Text position={[0, 2, 0]} fontSize={0.6} maxWidth={isMobile ? 6 : 30} textAlign="center" color="white" anchorX="center" anchorY="middle">
        Every great journey begins with a single spark.
      </Text>
      
      {/* 3D Floating Welcome Text */}
      <Text position={[0, -2, 0]} fontSize={0.3} color="#00ffff" anchorX="center" anchorY="middle" letterSpacing={0.2}>
        WELCOME TO TRUE TWIST
      </Text>
      
      {/* 3D Floating Scroll Down Text */}
      <Text position={[0, -2.6, 0]} fontSize={0.15} color="#aaaaaa" anchorX="center" anchorY="middle" letterSpacing={0.1}>
        SCROLL DOWN v
      </Text>
    </group>
  );
}

// Stage 1: Story (Immersive Constellation Timeline)
function StoryStage({ z }) {
  const groupRef = useRef();
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 14);

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
      let t = Math.max(0, 1 - Math.abs(relativeZ) / 40);
      groupRef.current.position.y = -1.2 - (1 - t) * 5;
    }
  });

  const points = [
    new THREE.Vector3(-6.0, 0.8, 0), // Node 1
    new THREE.Vector3(-5.0, 1.4, 0),
    new THREE.Vector3(-4.0, 1.8, 0), // Peak 1
    new THREE.Vector3(-3.0, 1.7, 0),
    new THREE.Vector3(-2.0, 1.6, 0),  // Node 2
    new THREE.Vector3(-1.0, 1.3, 0),
    new THREE.Vector3(0, 1.1, 0),    // Valley
    new THREE.Vector3(1.0, 1.3, 0),
    new THREE.Vector3(2.0, 1.6, 0),   // Node 3
    new THREE.Vector3(3.0, 1.7, 0),
    new THREE.Vector3(4.0, 1.8, 0),   // Peak 2
    new THREE.Vector3(5.0, 1.4, 0),
    new THREE.Vector3(6.0, 0.8, 0)  // Node 4
  ];

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={groupRef} position={[0, 0, z]} scale={[scale, scale, scale]}>
      {/* Constellation Wave Line */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#00ffff" opacity={0.65} transparent linewidth={1.5} />
      </line>

      {/* Stars on the Constellation Nodes */}
      {points.map((p, idx) => (
        <group key={idx} position={p}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {(idx === 0 || idx === 3 || idx === 6 || idx === 9 || idx === 12) && (
            <mesh>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.4} wireframe />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}


// Stage 2: Skills (Flies in from Left)
function SkillsStage({ z }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const htmlRefs = useRef([]);
  const sphereRefs = useRef([]);
  const ringRefs = useRef([]);
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 8);
  const isMobile = window.innerWidth <= 768;

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
      htmlRefs.current.forEach(el => { if (el) el.style.opacity = '0'; });
    } else {
      groupRef.current.visible = true;
      let t = Math.max(0, 1 - Math.abs(relativeZ) / 40);

      // Fly from left
      groupRef.current.position.x = -(1 - t) * 30;

      if (innerRef.current) {
        innerRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        innerRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      }

      // Unique independent animations for each planet
      sphereRefs.current.forEach((sphere, i) => {
        if (sphere) {
          const time = state.clock.elapsedTime + i * 10;
          // Pulsing heartbeat effect
          const pulse = 1 + Math.sin(time * 3) * 0.15;
          sphere.scale.set(pulse, pulse, pulse);
        }
      });

      ringRefs.current.forEach((ring, i) => {
        if (ring) {
          if (i === 0 || i === 3) {
            // Full 360 continuous spin (slowed down)
            ring.rotation.x = state.clock.elapsedTime * (0.4 + i * 0.1);
            ring.rotation.y = state.clock.elapsedTime * (0.5 + i * 0.1);
          } else if (i === 1 || i === 4) {
            // 180 degree back-and-forth swing (slowed down)
            ring.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * Math.PI;
            ring.rotation.y = Math.cos(state.clock.elapsedTime * 0.6) * Math.PI;
          } else {
            // Horizontal spin (Right to Left)
            ring.rotation.x = Math.PI / (2 + i * 0.5); // Static tilt
            ring.rotation.y = -state.clock.elapsedTime * (0.3 + i * 0.1); // Spin right to left
          }
        }
      });

      htmlRefs.current.forEach(el => { if (el) el.style.opacity = t.toString(); });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, z]} scale={[scale, scale, scale]}>
      <Text 
        position={[0, isMobile ? 3.5 : 4, 0]} 
        fontSize={1.2} 
        maxWidth={isMobile ? 6 : 30}
        textAlign="center"
        color="#ffaa00" 
        anchorX="center" 
        anchorY="middle"
        fontStyle="italic"
        fontWeight="bold"
        outlineWidth={0.03}
        outlineColor="#ff0055"
      >
        Core Capabilities
      </Text>
      <group ref={innerRef} position={[0, isMobile ? -2.5 : -0.5, 0]}>
        {['React', 'Three.js', 'Node.js', 'WebGL', 'GSAP', 'Python'].map((skill, i) => (
          <group key={i} position={[Math.sin((i / 6) * Math.PI * 2) * 2.2, Math.cos((i / 6) * Math.PI * 2) * 2.2, 0]}>
            
            {/* The main liquid planet */}
            <mesh ref={el => sphereRefs.current[i] = el}>
              <sphereGeometry args={[0.45, 32, 32]} />
              <MeshDistortMaterial color={i % 2 === 0 ? "#ff0055" : "#ffaa00"} distort={0.7} speed={5} />
            </mesh>

            {/* Glowing orbital ring (like Saturn/Atom) */}
            <mesh ref={el => ringRefs.current[i] = el}>
              <torusGeometry args={[0.7, 0.02, 16, 64]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#00ffff" : "#ff0055"} transparent opacity={0.7} wireframe />
            </mesh>

            <Html position={[0, -1.2, 0]} center>
              <div ref={el => htmlRefs.current[i] = el} style={{ 
                color: 'white', 
                fontWeight: '900', 
                fontFamily: "'Orbitron', sans-serif",
                textShadow: `0 0 15px ${i % 2 === 0 ? "#ff0055" : "#ffaa00"}`, 
                fontSize: '1rem',
                letterSpacing: '2px',
                background: 'rgba(0,0,0,0.5)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: `1px solid ${i % 2 === 0 ? "#ff0055" : "#ffaa00"}80`,
                transition: 'opacity 0.1s'
              }}>
                {skill}
              </div>
            </Html>
          </group>
        ))}
      </group>
      <pointLight color="#ffaa00" intensity={3} distance={10} />
    </group>
  );
}

// Stage 3: Projects (Drops from Top)
function ProjectsStage({ z, activeProject }) {
  const groupRef = useRef();
  const projectRefs = useRef([]);
  const ring1Refs = useRef([]);
  const ring2Refs = useRef([]);
  const htmlRefs = useRef([]);
  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 10);

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;
    const isMobile = window.innerWidth <= 768;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
      htmlRefs.current.forEach(el => {
        if (el) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
      });
    } else {
      groupRef.current.visible = true;
      htmlRefs.current.forEach((el, idx) => {
        if (el) {
          if (isMobile) {
            const currentOpacity = parseFloat(el.style.opacity || '0');
            const targetOpacity = idx === activeProject ? 1 : 0;
            el.style.opacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.15).toString();
            el.style.pointerEvents = idx === activeProject ? 'auto' : 'none';
          } else {
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
          }
        }
      });
      let t = Math.max(0, 1 - Math.abs(relativeZ) / 40);
      groupRef.current.position.y = (1 - t) * 30;
    }

    // Lerp positions of individual projects
    projectRefs.current.forEach((ref, idx) => {
      if (ref) {
        if (isMobile) {
          const targetX = (idx - activeProject) * 6.5;
          const targetY = 0;
          const targetZ = idx === activeProject ? 1.5 : -3;
          ref.position.x = THREE.MathUtils.lerp(ref.position.x, targetX, 0.08);
          ref.position.y = THREE.MathUtils.lerp(ref.position.y, targetY, 0.08);
          ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.08);
        } else {
          const [tx, ty, tz] = projects[idx].desktopPos;
          ref.position.x = THREE.MathUtils.lerp(ref.position.x, tx, 0.08);
          ref.position.y = THREE.MathUtils.lerp(ref.position.y, ty, 0.08);
          ref.position.z = THREE.MathUtils.lerp(ref.position.z, tz, 0.08);
        }
      }
    });

    // Rotate concentric rings
    ring1Refs.current.forEach((ref, idx) => {
      if (ref) {
        ref.rotation.y = state.clock.elapsedTime * 0.8 * (idx % 2 === 0 ? 1 : -1);
        ref.rotation.x = state.clock.elapsedTime * 0.3;
      }
    });
    ring2Refs.current.forEach((ref, idx) => {
      if (ref) {
        ref.rotation.z = state.clock.elapsedTime * 0.6 * (idx % 2 === 0 ? -1 : 1);
        ref.rotation.y = state.clock.elapsedTime * 0.2;
      }
    });
  });

  const projects = [
    { 
      title: "E-Commerce", 
      desc: "High-performance digital storefront", 
      color: "#00ffff", 
      desktopPos: [-4.5, 4, -2],
      geo: 'icosahedron'
    },
    { 
      title: "AI Dashboard", 
      desc: "Neural network analytics suite", 
      color: "#d946ef", 
      desktopPos: [0, 0, 3],
      geo: 'torusknot'
    },
    { 
      title: "Web3 Platform", 
      desc: "Decentralized wallet portal", 
      color: "#00ffcc", 
      desktopPos: [4.5, -4, -2],
      geo: 'octahedron'
    }
  ];

  return (
    <group ref={groupRef} position={[0, 0, z]} scale={[scale, scale, scale]}>
      <group>
        {projects.map((proj, i) => (
          <group key={i} ref={el => projectRefs.current[i] = el} position={proj.desktopPos}>
            <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
              <group scale={proj.title === "E-Commerce" ? [0.65, 0.65, 0.65] : [1, 1, 1]}>
                {/* Unique Wireframe Geometric Shape */}
                <mesh ref={el => ring1Refs.current[i] = el}>
                  {proj.geo === 'icosahedron' && <icosahedronGeometry args={[1.5, 0]} />}
                  {proj.geo === 'torusknot' && <torusKnotGeometry args={[1, 0.3, 100, 16]} />}
                  {proj.geo === 'octahedron' && <octahedronGeometry args={[1.5, 0]} />}
                  <meshBasicMaterial color={proj.color} transparent opacity={0.6} wireframe={true} />
                </mesh>

                {/* Inner Floating Core Shape */}
                <mesh ref={el => ring2Refs.current[i] = el} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                  {proj.geo === 'icosahedron' && <icosahedronGeometry args={[0.8, 1]} />}
                  {proj.geo === 'torusknot' && <sphereGeometry args={[0.7, 32, 32]} />}
                  {proj.geo === 'octahedron' && <octahedronGeometry args={[0.8, 1]} />}
                  <meshPhysicalMaterial
                    color={proj.color}
                    transmission={0.9}
                    opacity={0.4}
                    transparent
                    roughness={0.1}
                    clearcoat={1.0}
                  />
                </mesh>

                {/* Core Glow Particle Effect */}
                <Sparkles count={50} scale={2.5} size={3} color={proj.color} speed={1.5} />
              </group>

              {/* True 3D Holographic UI (No Cards!) */}
              <Html position={[0, -2.5, 0]} center zIndexRange={[100, 0]}>
                <div ref={el => htmlRefs.current[i] = el} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  width: '320px',
                  animation: 'fadeInUp 1s ease',
                  transition: 'opacity 0.4s ease',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center'
                }}>
                  <h3 style={{
                    color: proj.color,
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '1.6rem',
                    fontWeight: '900',
                    margin: '0 0 8px 0',
                    textShadow: `0 0 15px ${proj.color}, 0 0 30px ${proj.color}`,
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    textAlign: 'center'
                  }}>
                    {proj.title}
                  </h3>
                  
                  <p style={{
                    color: '#e2e8f0',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.95rem',
                    margin: '0 0 20px 0',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {proj.desc}
                  </p>

                  <button style={{
                    pointerEvents: 'auto',
                    background: `linear-gradient(90deg, transparent, ${proj.color}30, transparent)`,
                    border: `1px solid ${proj.color}`,
                    color: proj.color,
                    padding: '10px 35px',
                    borderRadius: '30px',
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease-in-out'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = proj.color;
                      e.currentTarget.style.color = '#000';
                      e.currentTarget.style.boxShadow = `0 0 25px ${proj.color}`;
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(90deg, transparent, ${proj.color}30, transparent)`;
                      e.currentTarget.style.color = proj.color;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={() => {
                      window.open('/coming-soon.html', '_blank');
                    }}
                  >
                    ENTER
                  </button>
                </div>
              </Html>
            </Float>
          </group>
        ))}
      </group>
      <pointLight color="#ffffff" intensity={2} distance={20} />
    </group>
  );
}

// MilestoneNode for elegant 3D experience stage background animation
function MilestoneNode({ color, index, isActive }) {
  const nodeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  // Position in a circle (radius 9)
  const angle = (index / 6) * Math.PI * 2;
  const radius = 9;
  const xPos = Math.sin(angle) * radius;
  const zPos = Math.cos(angle) * radius;

  useFrame((state) => {
    if (!nodeRef.current) return;
    const time = state.clock.getElapsedTime();
    const speed = isActive ? 1.5 : 0.4;
    
    // Complex, elegant rotation
    ring1Ref.current.rotation.x = time * speed;
    ring1Ref.current.rotation.y = time * speed * 0.5;
    
    ring2Ref.current.rotation.y = time * speed * 0.8;
    ring2Ref.current.rotation.z = time * speed * 0.4;
    
    ring3Ref.current.rotation.x = time * speed * 0.6;
    ring3Ref.current.rotation.z = time * speed * 0.9;

    // Smooth floating and scaling (subtle size differences)
    if (isActive) {
      const scaleVal = 0.75 + Math.sin(time * 4) * 0.02;
      nodeRef.current.scale.set(scaleVal, scaleVal, scaleVal);
      nodeRef.current.position.y = Math.sin(time * 2) * 0.3;
    } else {
      nodeRef.current.scale.set(0.6, 0.6, 0.6); // Keep similar size
      nodeRef.current.position.y = Math.sin(time + index) * 0.4;
    }
  });

  return (
    <group ref={nodeRef} position={[xPos, 0, zPos]}>
      {/* Outer abstract gyroscope rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[isActive ? 2.5 : 2.0, 0.015, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.8 : 0.2} />
      </mesh>
      
      <mesh ref={ring2Ref}>
        <torusGeometry args={[isActive ? 2.3 : 1.8, 0.015, 16, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={isActive ? 0.6 : 0.15} />
      </mesh>
      
      <mesh ref={ring3Ref}>
        <torusGeometry args={[isActive ? 2.1 : 1.6, 0.015, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.8 : 0.2} />
      </mesh>

      {/* Central energy core */}
      <mesh>
        <sphereGeometry args={[isActive ? 0.4 : 0.2, 32, 32]} />
        <meshBasicMaterial color={isActive ? "#ffffff" : color} transparent opacity={0.9} />
      </mesh>

      {/* Ambient particles surrounding the node */}
      <Sparkles count={isActive ? 60 : 15} scale={isActive ? 5 : 3} size={isActive ? 3 : 1.5} color={color} speed={isActive ? 1.5 : 0.5} />
    </group>
  );
}

// Stage 4: Experience (Rises from Bottom & Rotates)
function ExperienceStage({ z, activeMilestone }) {
  const groupRef = useRef();
  const carouselRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
      let t = Math.max(0, 1 - Math.abs(relativeZ) / 40);
      groupRef.current.position.y = -(1 - t) * 30;
      
      // Responsive scaling to fit mobile screens perfectly
      const aspect = window.innerWidth / window.innerHeight;
      const baseScale = aspect < 1 ? aspect * 0.8 : 1; 
      groupRef.current.scale.set(baseScale, baseScale, baseScale);
    }

    // Smoothly rotate the entire carousel continuously
    if (carouselRef.current) {
      // Continuous slow orbit (no snapping)
      carouselRef.current.rotation.y += 0.003;
      
      // Add a very slow continuous idle spin for 3D depth
      carouselRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
      carouselRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  const milestoneColors = [
    "#ff7700", // 2020
    "#00f0ff", // 2021
    "#d946ef", // 2022
    "#00ffcc", // 2023
    "#3b82f6", // 2024
    "#f59e0b"  // 2025
  ];

  return (
    <group ref={groupRef} position={[0, -2, z - 5]}>
      
      {/* The rotating carousel group */}
      <group ref={carouselRef}>
        
        {/* Central Holographic Core */}
        <mesh>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color="#d946ef" wireframe transparent opacity={0.2} />
        </mesh>

        {/* The Orbit Track */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[9, 0.02, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </mesh>

        {/* Abstract Floating Gyroscopes (Planetary Nodes) */}
        {milestoneColors.map((color, i) => (
          <MilestoneNode key={i} color={color} index={i} isActive={activeMilestone === i} />
        ))}
      </group>

      {/* Ambient Pathway Sparkles */}
      <Sparkles count={150} scale={[25, 10, 25]} position={[0, 0, 0]} size={2} color="#00ffcc" speed={0.4} />
    </group>
  );
}

const BLOG_POSTS = [
  {
    title: "AI & SAAS EVOLUTION",
    excerpt: "Integrating neural networks and LLMs into daily software workflows.",
    content: "Artificial Intelligence is no longer just a buzzword; it is the core engine driving the next generation of Software as a Service (SaaS). From predictive analytics to automated customer experiences, SaaS platforms are evolving into self-learning ecosystems that optimize user workflows in real-time. In this article, we dive deep into how modern IT architectures are incorporating neural pipelines and large language models (LLMs) to construct next-gen, context-aware tools.",
    date: "MAY 28, 2026",
    author: "Dr. Elena Rostova",
    readTime: "5 min read",
    color: "#ffffff"
  },
  {
    title: "CYBERSECURITY & DEVSECOPS",
    excerpt: "Hardening production environments and automated vulnerability scanning.",
    content: "As cyber threats grow increasingly sophisticated, security can no longer be a final checkbox before deployment. DevSecOps integrates security audits directly into continuous integration and delivery (CI/CD) pipelines. By automating dependency scanning, static code analysis, and secrets detection, software engineering teams can guarantee that every deployed build is structurally hardened against potential exploits from day one.",
    date: "MAY 15, 2026",
    author: "Marcus Vance",
    readTime: "7 min read",
    color: "#00ffff"
  },
  {
    title: "WEBGL & 3D INTERACTIVE WEB",
    excerpt: "Breaking the boundaries of flat 2D layouts using WebGL and shaders.",
    content: "The web is transitioning from static documents to interactive 3D spaces. Technologies like WebGL, Three.js, and React Three Fiber allow developers to construct hardware-accelerated, immersive universes directly inside the browser. This article explores how to balance rendering performance with visual fidelity, utilizing custom fragment shaders and post-processing bloom layers to create stunning user interfaces.",
    date: "APR 30, 2026",
    author: "Renis K.",
    readTime: "6 min read",
    color: "#d946ef"
  },
  {
    title: "SCALABLE CLOUD DEVOPS",
    excerpt: "Accelerating continuous delivery and containerized microservices.",
    content: "Deploying microservices at scale requires robust cloud orchestrations. By combining Kubernetes with GitOps pipelines, engineering departments can achieve self-healing, auto-scaling applications that respond dynamically to traffic spikes. Learn how to optimize configuration variables, manage network overlays, and streamline service meshes to build highly available SaaS platforms.",
    date: "APR 12, 2026",
    author: "Sarah Jenkins",
    readTime: "8 min read",
    color: "#00ffcc"
  },
  {
    title: "SPATIAL COMPUTING & AR",
    excerpt: "Designing next-generation interfaces for spatial and augmented realities.",
    content: "Spatial computing is redefining our relationship with digital content. Moving beyond flat screens, augmented and virtual reality interfaces demand new UX paradigms. This post analyzes how spatial anchors, hand-gesture mapping, and responsive 3D typography allow users to manipulate digital systems in physical space, paving the way for seamless AR utility applications.",
    date: "MAR 25, 2026",
    author: "Alex Rivera",
    readTime: "5 min read",
    color: "#3b82f6"
  },
  {
    title: "WEB3 & PROTOCOL DESIGN",
    excerpt: "Reengineering decentralized data layers and smart contracts.",
    content: "Web3 protocols enable trustless transaction networks and verifiable digital ownership. By utilizing secure smart contracts on decentralized ledger systems, companies can build transparent registries, audit trails, and automated royalty models. We look at modern solidity best practices, gas optimization techniques, and multi-signature wallet integrations.",
    date: "MAR 10, 2026",
    author: "Zayn Malhotra",
    readTime: "6 min read",
    color: "#f59e0b"
  }
];

const SERVICES_DATA = [
  {
    title: "3D ANIMATED WEBSITE",
    desc: "High-fidelity WebGL experiences, interactive 3D platforms, and custom real-time environments.",
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" stroke="#00f0ff" strokeWidth="2" fill="none">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    logs: [
      "> INIT THREE.JS RENDERER...",
      "> COMPILED GLSL SHADER PIPELINE...",
      "> WEBGL STATE: 60 FPS // ACTIVE"
    ]
  },
  {
    title: "MARKETING AUTOMATION",
    desc: "Streamlining business pipelines, automated user flows, and optimizing conversions with intelligent SaaS architecture.",
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" stroke="#00f0ff" strokeWidth="2" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="#00f0ff" />
      </svg>
    ),
    logs: [
      "> SYNCING INTEGRATION WEBHOOKS...",
      "> DEPLOYING USER BEHAVIOR TRIGGERS...",
      "> PIPELINES READY // COMPLETED"
    ]
  },
  {
    title: "AI SHORT FILM",
    desc: "Next-gen cinematic AI productions, high-end motion graphics, and storytelling powered by generative models.",
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" stroke="#00f0ff" strokeWidth="2" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
    logs: [
      "> TENSOR CORE ALLOCATION COMPLETED...",
      "> DIFFUSION ITERATIONS RUNNING...",
      "> GENERATIVE VIDEO PREVIEW // ACTIVE"
    ]
  },
  {
    title: "WEBSITE & POSTER DESIGNING",
    desc: "Premium visual designs, branding collaterals, and custom marketing posters with glassmorphic aesthetics.",
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" stroke="#00f0ff" strokeWidth="2" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.34784 19.4893 5.48508 20.218 5.17647 20.8353C4.85747 21.4733 4.1017 21.7391 3.47355 21.4011C2.55153 20.9048 2 20.0886 2 19.1673C2 17.9702 2.97025 17 4 17H5C6.10457 17 7 16.1046 7 15C7 13.8954 7.89543 13 9 13H15C16.1046 13 17 12.1046 17 11C17 9.89543 17.8954 9 19 9H20" />
        <circle cx="7.5" cy="10.5" r="1.5" fill="#00f0ff" />
        <circle cx="11.5" cy="7.5" r="1.5" fill="#00f0ff" />
        <circle cx="16.5" cy="9.5" r="1.5" fill="#00f0ff" />
      </svg>
    ),
    logs: [
      "> EXPORTING SVG BLUEPRINTS...",
      "> BUILDING GLASSMORPHIC CSS COMPACTS...",
      "> DESIGN SYSTEM STYLES // VALIDATED"
    ]
  },
  {
    title: "VIDEO STORY MARKETING",
    desc: "Designing cinematic videos and narratives that drive brand engagement across modern web portals.",
    icon: (
      <svg viewBox="0 0 24 24" width="36" height="36" stroke="#00f0ff" strokeWidth="2" fill="none">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    logs: [
      "> SYNCING TIMELINE AUDIO CHANNELS...",
      "> RENDERING SCENIC FRAMES...",
      "> STORYBOARD RENDERLOOP // EXECUTED"
    ]
  }
];

// Stage 5: Achievements (Scales up)
function AchievementsStage({ z, onSelectBlog }) {
  const groupRef = useRef();
  const [hoveredStar, setHoveredStar] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
      let t = Math.max(0, 1 - Math.abs(relativeZ) / 40);
      
      const aspect = window.innerWidth / window.innerHeight;
      // On narrow screens (portrait), scale down the whole group proportionally to aspect ratio
      const baseScale = aspect < 1 ? aspect * 1.3 : 1;

      // Scales up
      const dynamicScale = t * baseScale;
      groupRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);
    }
  });

  const p0 = new THREE.Vector3(0, 0.5, 0);
  const p1 = new THREE.Vector3(-3.5, 1.5, 0);
  const p2 = new THREE.Vector3(-1.8, -1.2, 0);
  const p3 = new THREE.Vector3(1.8, -1.2, 0);
  const p4 = new THREE.Vector3(3.5, 1.5, 0);
  const p5 = new THREE.Vector3(0, 2.5, 0);

  const starPositions = [p0, p1, p2, p3, p4, p5];
  const starColors = BLOG_POSTS.map(p => p.color);
  const starLabels = BLOG_POSTS.map(p => p.title);

  // Generate lines
  const connections = [
    [p1, p2], [p2, p3], [p3, p4], [p4, p5], [p5, p1],
    [p0, p1], [p0, p2], [p0, p3], [p0, p4], [p0, p5]
  ];

  return (
    <group ref={groupRef} position={[0, 0, z]} onPointerDown={() => setHoveredStar(null)}>
      <Text position={[0, 3.8, 0]} fontSize={0.7} maxWidth={6} textAlign="center" color="#00ffff" anchorX="center" anchorY="middle">
        TECH INSIGHTS
      </Text>
      {connections.map((pts, i) => {
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={i} geometry={lineGeom}>
            <lineBasicMaterial color="#00ffff" opacity={0.5} transparent linewidth={1.5} />
          </line>
        );
      })}

      {starPositions.map((pos, idx) => (
        <group
          key={idx}
          position={pos}
          onClick={(e) => {
            e.stopPropagation();
            const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
            if (isTouch) {
              if (hoveredStar === idx) {
                onSelectBlog(idx);
              } else {
                setHoveredStar(idx);
              }
            } else {
              onSelectBlog(idx);
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
            if (!isTouch) {
              setHoveredStar(idx);
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
            if (!isTouch) {
              setHoveredStar(null);
              document.body.style.cursor = 'default';
            }
          }}
        >
          {/* Invisible stable hit target for reliable hover */}
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Pulsing glow mesh */}
          <Float speed={3} rotationIntensity={0.5} floatIntensity={0.3}>
            <mesh>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color={starColors[idx]} />
            </mesh>
            <mesh scale={[2.5, 2.5, 2.5]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color={starColors[idx]} transparent opacity={0.25} wireframe />
            </mesh>
          </Float>
          <Sparkles count={8} scale={1.5} size={2} color={starColors[idx]} speed={1} />

          {/* Floating Tooltip Label */}
          {hoveredStar === idx && (
            <Html position={[0, 0.6, 0]} center>
              <div style={{
                background: 'rgba(5, 12, 22, 0.95)',
                border: `1.5px solid ${starColors[idx]}`,
                padding: '6px 14px',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 'bold',
                letterSpacing: '1px',
                pointerEvents: 'none',
                boxShadow: `0 0 15px ${starColors[idx]}70`
              }}>
                {starLabels[idx]}
              </div>
            </Html>
          )}
        </group>
      ))}
      <pointLight color="#00ffff" intensity={4} distance={15} />
    </group>
  );
}

// Stage 6: Contact (Swirls in)
function ContactStage({ z, onContactClick, isFormOpen }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const htmlRef = useRef();
  const isMobile = window.innerWidth <= 768;

  useFrame((state) => {
    if (!groupRef.current) return;
    const relativeZ = state.camera.position.z - z - 10;

    if (Math.abs(relativeZ) > 35) {
      groupRef.current.visible = false;
      if (htmlRef.current) htmlRef.current.style.opacity = '0';
    } else {
      groupRef.current.visible = true;
      let t = Math.max(0, 1 - Math.abs(relativeZ) / 40);

      // Swirls in
      groupRef.current.rotation.z = (1 - t) * Math.PI * 2;
      
      const aspect = window.innerWidth / window.innerHeight;
      const baseScale = aspect < 1 ? aspect * 1.5 : 1; 
      const dynamicScale = t * baseScale;
      groupRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);

      if (innerRef.current) innerRef.current.rotation.z = state.clock.elapsedTime * 0.5;

      if (htmlRef.current) htmlRef.current.style.opacity = t.toString();
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, z]}>
      <Text position={[0, isMobile ? 3.5 : 3, 0]} fontSize={isMobile ? 0.7 : 1} maxWidth={isMobile ? 5 : 8} textAlign="center" color="#ffffff" anchorX="center" anchorY="middle">
        The journey does not end here.
      </Text>

      <group ref={innerRef} position={[0, isMobile ? -1 : 0, -5]}>
        <mesh>
          <ringGeometry args={[1.5, 2, 64]} />
          <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
        <mesh>
          <ringGeometry args={[2.2, 2.3, 64]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <Sparkles count={60} scale={4} size={2.5} color="#00ffff" speed={1.5} />
      </group>

      {!isFormOpen && (
        <Html position={[0, isMobile ? -1 : 0, -4]} center transform distanceFactor={isMobile ? 12 : 10}>
          <div ref={htmlRef} style={{ transition: 'opacity 0.1s' }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                onContactClick();
              }}
              style={{
                textDecoration: 'none',
                color: '#00ffff',
                background: 'rgba(0, 255, 255, 0.1)',
                border: '2px solid #00ffff',
                padding: '15px 35px',
                borderRadius: '30px',
                backdropFilter: 'blur(5px)',
                fontSize: '22px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: "'Orbitron', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '2px',
                boxShadow: '0 0 20px rgba(0,255,255,0.4)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#00ffff';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                e.currentTarget.style.color = '#00ffff';
              }}
            >
              Contact Us
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [popupVisible, setPopupVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [activeAchievement, setActiveAchievement] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showAchievementsHint, setShowAchievementsHint] = useState(false);
  const [activeProject, setActiveProject] = useState(1);
  const [selectedBlogIdx, setSelectedBlogIdx] = useState(null);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const targetCameraZ = useRef(10);

  const projectsContainerRef = useRef(null);
  const storyContainerRef = useRef(null);
  const autoScrollIndexRef = useRef(0);

  const currentStageRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      const unmountTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(unmountTimer);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    currentStageRef.current = currentStage;
  }, [currentStage]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    if (currentStage === 5) {
      setShowAchievementsHint(true);
      const timer = setTimeout(() => {
        setShowAchievementsHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowAchievementsHint(false);
    }
  }, [currentStage]);

  useEffect(() => {
    if (currentStage !== 4) return;
    const interval = setInterval(() => {
      setActiveMilestone((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentStage]);

  useEffect(() => {
    if (currentStage !== 1) return;
    const interval = setInterval(() => {
      setActiveServiceIdx((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentStage]);

  // Auto-scroll project cards on mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile || currentStage !== 3) return;

    autoScrollIndexRef.current = 0; // reset on stage enter

    const interval = setInterval(() => {
      const container = projectsContainerRef.current;
      if (container && container.children.length > 0) {
        const numCards = 3;
        autoScrollIndexRef.current = (autoScrollIndexRef.current + 1) % numCards;
        
        const targetCard = container.children[autoScrollIndexRef.current];
        if (targetCard) {
          const cardLeft = targetCard.offsetLeft;
          const containerWidth = container.offsetWidth;
          const cardWidth = targetCard.offsetWidth;
          const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
          
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentStage]);

  // Setup scroll listener to run at all times, auto-transitioning and hiding popup on scroll
  useEffect(() => {
    const handleWheel = (e) => {
      // Ignore scroll inputs during an active transition to lock focus on the current section
      if (isTransitioningRef.current) return;

      if (Math.abs(e.deltaY) < 12) return; // filter scroll wheel noise

      if (e.deltaY > 0) {
        // Scroll down -> transition forward to the next stage
        if (currentStageRef.current < STAGES.length - 1) {
          const nextStage = currentStageRef.current + 1;
          setPopupVisible(false);
          setIsTransitioning(true);
          targetCameraZ.current = STAGES[nextStage].z + 10;
        }
      } else {
        // Scroll up -> transition backward to the previous stage
        if (currentStageRef.current > 0) {
          const prevStage = currentStageRef.current - 1;
          setPopupVisible(false);
          setIsTransitioning(true);
          targetCameraZ.current = STAGES[prevStage].z + 10;
        }
      }
    };

    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (isTransitioningRef.current) return;

      const deltaY = startY - e.touches[0].clientY;
      if (Math.abs(deltaY) < 20) return; // filter swipe noise
      startY = e.touches[0].clientY;

      if (deltaY > 0) {
        // Swipe up -> transition forward
        if (currentStageRef.current < STAGES.length - 1) {
          const nextStage = currentStageRef.current + 1;
          setPopupVisible(false);
          setIsTransitioning(true);
          targetCameraZ.current = STAGES[nextStage].z + 10;
        }
      } else {
        // Swipe down -> transition backward
        if (currentStageRef.current > 0) {
          const prevStage = currentStageRef.current - 1;
          setPopupVisible(false);
          setIsTransitioning(true);
          targetCameraZ.current = STAGES[prevStage].z + 10;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleYes = () => {
    if (currentStage < STAGES.length - 1) {
      setPopupVisible(false);
      setIsTransitioning(true);
      // Nudge target forward to start the transition
      targetCameraZ.current = targetCameraZ.current - 4;
    }
  };

  const handleNo = () => {
    setPopupVisible(false);
    setIsTransitioning(false);
  };

  const handleStart = () => {
    setPopupVisible(false);
    setIsTransitioning(false);
    setCurrentStage(1);
    targetCameraZ.current = STAGES[1].z + 10;
  };

  const handleArrive = (targetStageIdx) => {
    setIsTransitioning(false);
    const resolvedStage = targetStageIdx !== undefined ? targetStageIdx : currentStage + 1;
    setCurrentStage(resolvedStage);
    targetCameraZ.current = STAGES[resolvedStage].z + 10;
    setPopupVisible(true);
  };

  return (
    <>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#020617',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Orbitron', sans-serif",
          color: '#ffffff',
          overflow: 'hidden',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: fadeOut ? 'none' : 'auto'
        }}>
          {/* Outer glowing frame */}
          <div style={{
            position: 'absolute',
            top: '20px', left: '20px', right: '20px', bottom: '20px',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Cyber corners */}
          <div style={{ position: 'absolute', top: '30px', left: '30px', width: '20px', height: '20px', borderTop: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff', pointerEvents: 'none', zIndex: 2 }} />
          <div style={{ position: 'absolute', top: '30px', right: '30px', width: '20px', height: '20px', borderTop: '3px solid #00f0ff', borderRight: '3px solid #00f0ff', pointerEvents: 'none', zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: '30px', left: '30px', width: '20px', height: '20px', borderBottom: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff', pointerEvents: 'none', zIndex: 2 }} />
          <div style={{ position: 'absolute', bottom: '30px', right: '30px', width: '20px', height: '20px', borderBottom: '3px solid #00f0ff', borderRight: '3px solid #00f0ff', pointerEvents: 'none', zIndex: 2 }} />

          {/* Glowing cosmic ring spinner */}
          <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '35px', zIndex: 2 }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              border: '2.5px solid transparent',
              borderTopColor: '#00f0ff',
              borderBottomColor: '#00f0ff',
              borderRadius: '50%',
              animation: 'spinLoader 1.8s linear infinite',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
            }} />
            <div style={{
              position: 'absolute',
              top: '15px', left: '15px', right: '15px', bottom: '15px',
              border: '2px solid transparent',
              borderLeftColor: '#d946ef',
              borderRightColor: '#d946ef',
              borderRadius: '50%',
              animation: 'spinLoaderReverse 1.2s linear infinite',
              boxShadow: '0 0 15px rgba(217, 70, 239, 0.2)'
            }} />
            <div style={{
              position: 'absolute',
              top: '42px', left: '42px', right: '42px', bottom: '42px',
              background: 'radial-gradient(circle, #00f0ff 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulseGlowLoader 2s ease-in-out infinite'
            }} />
          </div>

          {/* Brand Text */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 900,
            letterSpacing: '10px',
            color: '#ffffff',
            textShadow: '0 0 25px rgba(0, 255, 255, 0.8), 0 0 50px rgba(0, 255, 255, 0.3)',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            zIndex: 2,
            textAlign: 'center'
          }}>
            TRUE TWIST
          </h1>
          
          {/* Subtitle / status */}
          <div style={{
            fontSize: '11px',
            color: '#00f0ff',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            opacity: 0.8,
            animation: 'pulseTextLoader 1.5s infinite',
            zIndex: 2,
            textAlign: 'center'
          }}>
            INITIALIZING SYSTEM PORTAL...
          </div>

          {/* Global Keyframe CSS */}
          <style>{`
            @keyframes spinLoader {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes spinLoaderReverse {
              0% { transform: rotate(360deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes pulseGlowLoader {
              0%, 100% { transform: scale(0.9); opacity: 0.4; }
              50% { transform: scale(1.15); opacity: 0.95; }
            }
            @keyframes pulseTextLoader {
              0%, 100% { opacity: 0.45; text-shadow: 0 0 5px rgba(0,240,255,0.2); }
              50% { opacity: 1; text-shadow: 0 0 15px rgba(0,240,255,0.7); }
            }
          `}</style>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 15, 60]} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={2.0} />
          <ChromaticAberration offset={[0.001, 0.001]} />
        </EffectComposer>

        <UniverseEffects />

        <CameraController
          targetCameraZ={targetCameraZ}
          isTransitioning={isTransitioning}
          onArrive={handleArrive}
          setPopupVisible={setPopupVisible}
          currentStageIndex={currentStage}
        />

        <IntroStage z={STAGES[0].z} />
        <StoryStage z={STAGES[1].z} />
        <SkillsStage z={STAGES[2].z} />
        <ProjectsStage z={STAGES[3].z} activeProject={activeProject} />
        <ExperienceStage z={STAGES[4].z} activeMilestone={activeMilestone} />
        <AchievementsStage z={STAGES[5].z} onSelectBlog={setSelectedBlogIdx} />
        <ContactStage z={STAGES[6].z} onContactClick={() => setIsContactOpen(true)} isFormOpen={isContactOpen} />
      </Canvas>


      {/* Pop up UI - Only visible at Stage 0 for START JOURNEY (Removed) */}
      

      {/* Story Stage 2D HTML absolute overlay (flat design with laser guide styling) */}
      <style>{`
        .overlay-2d {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          color: white;
          padding: 20px;
          box-sizing: border-box;
          background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .overlay-2d { justify-content: center; }
        }
      `}</style>
      {!isTransitioning && popupVisible && currentStage === 1 && (
        <div className="story-overlay-2d overlay-2d" style={isMobile ? {
          justifyContent: 'center',
          overflowY: 'auto',
          paddingTop: '40px',
          paddingBottom: '40px',
          pointerEvents: 'auto'
        } : {}}>
          <style>{`
            @keyframes scan {
              0% { top: -10%; }
              100% { top: 110%; }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: isMobile ? '20px' : '40px',
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.8s ease'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
              margin: '0 0 8px 0',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              color: '#00ffff',
              textTransform: 'uppercase',
              letterSpacing: '6px',
              textShadow: '0 0 25px rgba(0, 255, 255, 0.7)'
            }}>Our Services</h2>
            <p style={{
              fontSize: 'clamp(0.85rem, 3.5vw, 1.25rem)',
              color: '#cbd5e1',
              fontWeight: 300,
              lineHeight: '1.5',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>Crafting futuristic, high-performance web experiences and creative marketing solutions.</p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '40px',
            width: '100%',
            maxWidth: '1100px',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            padding: isMobile ? '10px' : '20px',
            boxSizing: 'border-box'
          }}>
            {/* Left Panel: Selector List */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              gap: isMobile ? '8px' : '12px',
              width: '100%',
              maxWidth: isMobile ? '100%' : '380px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {SERVICES_DATA.map((item, idx) => {
                const isActive = activeServiceIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveServiceIdx(idx)}
                    onMouseEnter={() => !isMobile && setActiveServiceIdx(idx)}
                    style={isMobile ? {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(6, 15, 30, 0.5)',
                      border: isActive ? '2px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                      borderRadius: '8px',
                      color: isActive ? '#00f0ff' : '#cbd5e1',
                      cursor: 'pointer',
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 'bold',
                      fontSize: '14px',
                      boxShadow: isActive ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    } : {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      padding: '14px 18px',
                      background: isActive ? 'rgba(0, 240, 255, 0.08)' : 'rgba(6, 15, 30, 0.4)',
                      border: isActive ? '1.5px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.15)',
                      borderLeft: isActive ? '5px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.15)',
                      borderRadius: '8px',
                      color: isActive ? '#00f0ff' : '#cbd5e1',
                      cursor: 'pointer',
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 'bold',
                      fontSize: '13px',
                      letterSpacing: '1px',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 15px rgba(0, 240, 255, 0.2)' : 'none',
                      transform: isActive ? 'translateX(8px)' : 'translateX(0)'
                    }}
                  >
                    {isMobile ? `0${idx + 1}` : (
                      <>
                        <span style={{ color: isActive ? '#00f0ff' : 'rgba(0, 240, 255, 0.5)', fontSize: '11px' }}>
                          [ 0{idx + 1} ]
                        </span>
                        <span style={{ flex: 1, textAlign: 'left' }}>{item.title}</span>
                        {isActive && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            background: '#00f0ff',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px #00f0ff'
                          }} />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Panel: Detail Preview Wrapper */}
            <div style={{
              flex: isMobile ? 'none' : '1.2',
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2
            }}>
              {/* Active Service Title Above Card */}
              <h3 style={{
                margin: isMobile ? '0 0 12px 0' : '0 0 16px 0',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 'bold',
                textShadow: '0 0 15px rgba(0,240,255,0.6)',
                color: '#00f0ff',
                letterSpacing: '1.5px',
                textAlign: 'center',
                textTransform: 'uppercase'
              }}>
                {SERVICES_DATA[activeServiceIdx].title}
              </h3>

              {/* Right Panel: Detail Preview Card */}
              <div style={{
                background: 'rgba(6, 15, 30, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '16px',
                padding: isMobile ? '20px 16px' : '30px 24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
                minHeight: isMobile ? 'auto' : '340px',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 0 25px rgba(0, 240, 255, 0.05)',
                boxSizing: 'border-box'
              }}>
                {/* Tech grid background */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                  borderRadius: '16px',
                  zIndex: 0
                }} />

                {/* Cyber corners */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '3px solid #00f0ff', borderRight: '3px solid #00f0ff' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '3px solid #00f0ff', borderRight: '3px solid #00f0ff' }} />

                {/* Glowing circular icon */}
                <div className="tech-icon" style={{
                  width: isMobile ? '54px' : '74px',
                  height: isMobile ? '54px' : '74px',
                  borderRadius: '50%',
                  background: 'rgba(4, 10, 18, 0.95)',
                  border: '2.5px solid #00f0ff',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: isMobile ? '12px' : '20px',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  {SERVICES_DATA[activeServiceIdx].icon}
                </div>

                <span style={{ fontSize: '9px', color: '#00f0ff', fontFamily: "'Orbitron', sans-serif", letterSpacing: '2px', fontWeight: 'bold', marginBottom: '8px', zIndex: 2 }}>
                  SYS_MODULE // SERVICE_0{activeServiceIdx + 1}
                </span>

                <p style={{
                  margin: isMobile ? '0 0 12px 0' : '0 0 20px 0',
                  fontSize: isMobile ? '0.85rem' : '0.92rem',
                  color: '#cbd5e1',
                  lineHeight: '1.6',
                  fontFamily: "'Inter', sans-serif",
                  zIndex: 2,
                  maxWidth: '420px'
                }}>
                  {SERVICES_DATA[activeServiceIdx].desc}
                </p>

                {/* Typewriter terminal console logs */}
                <div style={{
                  width: '100%',
                  maxWidth: '420px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  border: '1px dashed rgba(0, 240, 255, 0.3)',
                  borderRadius: '6px',
                  padding: isMobile ? '8px 12px' : '10px 14px',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: isMobile ? '10px' : '11px',
                  color: '#39ff14',
                  textAlign: 'left',
                  marginBottom: isMobile ? '14px' : '20px',
                  boxSizing: 'border-box',
                  zIndex: 2,
                  textShadow: '0 0 5px rgba(57, 255, 20, 0.5)'
                }}>
                  <div style={{ color: '#00f0ff', marginBottom: '4px', fontWeight: 'bold' }}>TERMINAL // STATUS_OK</div>
                  {SERVICES_DATA[activeServiceIdx].logs.map((logLine, idx) => (
                    <div key={idx} style={{ opacity: 0.85, margin: '2px 0' }}>
                      {logLine}
                    </div>
                  ))}
                  <div style={{ display: 'inline-block', width: '6px', height: '11px', background: '#39ff14', marginLeft: '2px', animation: 'pulseGlow 1s infinite' }} />
                </div>

                <button style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '2px solid #00ffff',
                  color: '#00ffff',
                  padding: '8px 24px',
                  borderRadius: '30px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 'bold',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 0 15px rgba(0,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  zIndex: 2
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00ffff';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 25px #00ffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#00ffff';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,255,0.2)';
                  }}
                  onClick={() => {
                    setIsContactOpen(true);
                  }}
                >
                  REQUEST SERVICE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Stage 2D HTML absolute overlay (visible only at stage 3) */}
      {!isTransitioning && popupVisible && currentStage === 3 && (
        <div className="projects-overlay-2d overlay-2d" style={{
          justifyContent: 'flex-start',
          paddingTop: '10vh'
        }}>
          <style>{`
            @keyframes scan {
              0% { top: -10%; }
              100% { top: 110%; }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes floatingCard {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0px); }
            }
            @keyframes spinBorder {
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes iconFloat {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
              100% { transform: translateY(0px); }
            }
            @keyframes shine {
              0% { left: -100%; opacity: 0; }
              20% { left: 200%; opacity: 0.6; }
              100% { left: 200%; opacity: 0; }
            }
            .project-title-gradient {
              background: linear-gradient(90deg, #fff, #00ffff, #fff);
              background-size: 200% auto;
              color: transparent;
              -webkit-background-clip: text;
              background-clip: text;
              animation: gradientText 3s linear infinite;
            }
            @keyframes gradientText {
              to { background-position: 200% center; }
            }
          `}</style>

          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.8s ease'
          }}>
            <h2 className="project-title-gradient" style={{
              fontSize: 'clamp(2rem, 8vw, 3.2rem)',
              margin: '0 0 10px 0',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '6px',
              textShadow: '0 0 25px rgba(0, 255, 255, 0.3)'
            }}>Project Universes</h2>
            <p style={{
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              color: '#cbd5e1',
              fontWeight: 300,
              lineHeight: '1.5',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.6)'
            }}>Portals to newly forged interactive digital realities.</p>
          </div>

          {/* Mobile Carousel Navigation Controls */}
          {window.innerWidth <= 768 && (
            <div style={{
              position: 'absolute',
              bottom: '5vh',
              left: 0, right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              pointerEvents: 'auto',
              zIndex: 10,
              animation: 'fadeInUp 0.8s ease'
            }}>
              <button
                onClick={() => setActiveProject((prev) => Math.max(0, prev - 1))}
                disabled={activeProject === 0}
                style={{
                  background: 'rgba(8, 14, 27, 0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: '#00ffff',
                  width: '42px', height: '42px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: activeProject === 0 ? 0.35 : 1,
                  boxShadow: activeProject === 0 ? 'none' : '0 0 15px rgba(0, 255, 255, 0.25)',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              >
                &larr;
              </button>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {[
                  { color: "#00ffff" },
                  { color: "#d946ef" },
                  { color: "#00ffcc" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveProject(idx)}
                    style={{
                      width: activeProject === idx ? '12px' : '8px',
                      height: activeProject === idx ? '12px' : '8px',
                      borderRadius: '50%',
                      background: activeProject === idx ? item.color : 'rgba(255, 255, 255, 0.25)',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: activeProject === idx ? `0 0 12px ${item.color}` : 'none',
                      transition: 'all 0.3s',
                      transform: activeProject === idx ? 'scale(1.2)' : 'scale(1)',
                      outline: 'none'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveProject((prev) => Math.min(2, prev + 1))}
                disabled={activeProject === 2}
                style={{
                  background: 'rgba(8, 14, 27, 0.75)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: '#00ffff',
                  width: '42px', height: '42px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: activeProject === 2 ? 0.35 : 1,
                  boxShadow: activeProject === 2 ? 'none' : '0 0 15px rgba(0, 255, 255, 0.25)',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              >
                &rarr;
              </button>
            </div>
          )}

        </div>
      )}

      {/* Experience Stage 2D HTML absolute overlay (visible only at stage 4) */}
      {!isTransitioning && popupVisible && currentStage === 4 && (
        <div className="experience-overlay-2d" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 100,
          fontFamily: "'Orbitron', sans-serif",
          color: 'white',
          background: `
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(6, 12, 24, 0.2) 0%, rgba(0,0,0,0.95) 100%)
          `,
          backgroundSize: '100px 100px, 100px 100px, 100% 100%',
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes marqueeText {
              from { transform: translateX(0%); }
              to { transform: translateX(-100vw); }
            }
            @keyframes hudScan {
              0% { top: 0%; }
              50% { opacity: 0.8; }
              100% { top: 100%; }
            }
            @keyframes glitch {
              0% { clip-path: inset(40% 0 61% 0); }
              20% { clip-path: inset(92% 0 1% 0); }
              40% { clip-path: inset(25% 0 58% 0); }
              60% { clip-path: inset(80% 0 5% 0); }
              80% { clip-path: inset(11% 0 80% 0); }
              100% { clip-path: inset(40% 0 61% 0); }
            }
            @keyframes pulseGlow {
              0% { opacity: 0.3; }
              50% { opacity: 0.7; }
              100% { opacity: 0.3; }
            }
            @keyframes spinSlowHUD {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes progressFill {
              from { width: 0%; }
              to { width: 100%; }
            }
            .hud-header-title {
              white-space: nowrap !important;
            }
            .hud-btn:hover {
              background: rgba(0, 255, 255, 0.15) !important;
              text-shadow: 0 0 15px #00ffff !important;
              box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
            }
            @media (max-width: 768px) {
              .hud-top-left { top: 20px !important; left: 20px !important; width: calc(100% - 40px) !important; background: none !important; border: none !important; padding: 0 !important; box-shadow: none !important; backdrop-filter: none !important; }
              .hud-top-right { top: 90px !important; right: 20px !important; left: auto !important; width: auto !important; justify-content: flex-end !important; flex-wrap: nowrap !important; gap: 8px !important; background: none !important; border: none !important; padding: 0 !important; box-shadow: none !important; backdrop-filter: none !important; }
              .milestone-content { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; display: block !important; padding: 0 !important; }
              .hud-bottom-left { position: absolute !important; top: 135px !important; bottom: auto !important; right: 20px !important; left: auto !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; pointer-events: auto !important; padding: 12px 16px !important; border-radius: 8px !important; border-left: none !important; border-right: 4px solid !important; border-right-color: inherit !important; }
              .hud-bottom-right { position: absolute !important; bottom: 20px !important; right: 20px !important; left: 20px !important; width: calc(100vw - 40px) !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; text-align: right !important; pointer-events: auto !important; padding: 16px !important; border-radius: 8px !important; box-sizing: border-box !important; }
              
              .hud-btn { width: 30px !important; height: 30px !important; font-size: 10px !important; }
              .hud-header-title { font-size: 1.2rem !important; white-space: nowrap !important; }
              .hud-system-module { font-size: 8px !important; }
              .hud-chrono { display: none !important; }
              
              .hud-giant-year { font-size: clamp(3rem, 10vw, 4.5rem) !important; }
              
              .hud-reticle-outer { width: 280px !important; height: 280px !important; }
              .hud-reticle-inner { width: 250px !important; height: 250px !important; }
              
              .hud-title-text { font-size: 1.3rem !important; margin: 0 0 10px 0 !important; }
              .hud-desc-text { font-size: 0.85rem !important; }
            }
          `}</style>

          {/* Tactical Center Reticles */}
          <div className="hud-reticle-outer" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '420px', height: '420px', border: '1px dashed rgba(0,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'spinSlowHUD 40s linear infinite' }} />
          <div className="hud-reticle-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '380px', height: '380px', border: '1px solid rgba(0,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: 'spinSlowHUD 25s linear infinite reverse' }} />
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: 'rgba(0,255,255,0.08)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '0', bottom: '0', left: '50%', width: '1px', background: 'rgba(0,255,255,0.08)', pointerEvents: 'none', zIndex: 0 }} />
          
          {/* HUD Scanning Laser */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: '10vh', background: 'linear-gradient(to bottom, transparent, rgba(0,255,255,0.05), transparent)', borderBottom: '1px solid rgba(0,255,255,0.2)', animation: 'hudScan 6s linear infinite', zIndex: 0, pointerEvents: 'none' }} />

          {/* TOP-LEFT: Header Bar (with Glitch) */}
          <div className="hud-top-left" style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            pointerEvents: 'auto',
            zIndex: 10,
            background: 'rgba(8, 14, 27, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 255, 255, 0.15)',
            borderLeft: '4px solid #00ffff',
            padding: '16px 28px',
            borderRadius: '12px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease'
          }}>
            <span className="hud-system-module" style={{ fontSize: '10px', color: '#00ffff', letterSpacing: '2px', opacity: 0.6, animation: 'pulseGlow 2s infinite' }}>SYSTEM MODULE: STAGE_04</span>
            <div style={{ position: 'relative' }}>
              <h2 className="hud-header-title" style={{ fontSize: '2rem', margin: '5px 0 0 0', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>OUR JOURNEY</h2>
              <h2 className="hud-header-title" style={{ position: 'absolute', top: 0, left: '2px', fontSize: '2rem', margin: '5px 0 0 0', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#ff00ff', animation: 'glitch 3s infinite', mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.5 }}>OUR JOURNEY</h2>
              <h2 className="hud-header-title" style={{ position: 'absolute', top: 0, left: '-2px', fontSize: '2rem', margin: '5px 0 0 0', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#00ffff', animation: 'glitch 2s infinite reverse', mixBlendMode: 'screen', pointerEvents: 'none', opacity: 0.5 }}>OUR JOURNEY</h2>
            </div>
          </div>

          {/* TOP-RIGHT: Timeline Selector */}
          <div className="hud-top-right" style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            pointerEvents: 'auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            zIndex: 10,
            background: 'rgba(8, 14, 27, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 255, 255, 0.15)',
            padding: '10px 20px',
            borderRadius: '30px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease'
          }}>
            <span className="hud-chrono" style={{ fontSize: '10px', color: '#cbd5e1', opacity: 0.5, letterSpacing: '2px', marginRight: '10px' }}>CHRONO_INDEX</span>
            {[
              { year: "2020", color: "#ff7700" },
              { year: "2021", color: "#00f0ff" },
              { year: "2022", color: "#d946ef" },
              { year: "2023", color: "#00ffcc" },
              { year: "2024", color: "#3b82f6" },
              { year: "2025", color: "#f59e0b" }
            ].map((item, idx) => {
              const isActive = activeMilestone === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveMilestone(idx)}
                  className="hud-btn"
                  style={{
                    width: '35px', height: '35px', borderRadius: '4px',
                    background: isActive ? item.color : 'rgba(15, 23, 42, 0.5)',
                    border: `1px solid ${isActive ? item.color : 'rgba(0, 255, 255, 0.2)'}`,
                    color: isActive ? '#0d1527' : 'rgba(255, 255, 255, 0.7)',
                    fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: '900',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 0 20px ${item.color}` : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s'
                  }}
                >
                  {item.year.slice(2)}
                </button>
              );
            })}
          </div>

          {/* Main Info Display HUD (Avant-Garde Edge Layout) */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none'
          }}>

            {[
              {
                year: "2020",
                title: "THE GENESIS OF TRUE TWIST",
                desc: "True Twist was founded. Launched our first set of interactive web apps and started building customized client portals.",
                color: "#ff7700",
                hash: "0x88FF77"
              },
              {
                year: "2021",
                title: "ENTERPRISE SCALING",
                desc: "Scaled operations to enterprise SaaS design. Built robust APIs and custom design systems for automated business workflows.",
                color: "#00f0ff",
                hash: "0x00F0FF"
              },
              {
                year: "2022",
                title: "3D GRAPHICS PORTAL",
                desc: "Pioneered WebGL solutions. Integrated high-performance Three.js scenes, custom GLSL shaders, and interactive interfaces.",
                color: "#d946ef",
                hash: "0xD946EF"
              },
              {
                year: "2023",
                title: "SPATIAL INTERACTIVE SAAS",
                desc: "Successfully deployed spatial interactive portals, advanced web animation modules, and immersive product configurations.",
                color: "#00ffcc",
                hash: "0x00FFCC"
              },
              {
                year: "2024",
                title: "ENTERPRISE TECH ECOSYSTEMS",
                desc: "Designed next-generation enterprise dashboards. Merged analytics with post-processing visual effects and real-time data sync.",
                color: "#3b82f6",
                hash: "0x3B82F6"
              },
              {
                year: "2025",
                title: "GLOBAL EXPANSION",
                desc: "Established a global footprint in spatial computing. Powering interactive 3D web configurations for clients worldwide.",
                color: "#f59e0b",
                hash: "0xF59E0B"
              }
            ].map((item, idx) => {
              if (activeMilestone !== idx) return null;
              return (
                <div key={idx} className="milestone-content" style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>

                  {/* BOTTOM-LEFT: Giant Year & System Hash */}
                  <div className="hud-bottom-left" style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    pointerEvents: 'auto',
                    background: 'rgba(8, 14, 27, 0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${item.color}25`,
                    borderLeft: `4px solid ${item.color}`,
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.65), inset 0 0 20px ${item.color}08`,
                    transition: 'all 0.4s ease'
                  }}>
                    {/* Tech corners */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '8px', height: '8px', borderTop: `2px solid ${item.color}`, borderLeft: `2px solid ${item.color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderTop: `2px solid ${item.color}`, borderRight: `2px solid ${item.color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '8px', height: '8px', borderBottom: `2px solid ${item.color}`, borderLeft: `2px solid ${item.color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '8px', height: '8px', borderBottom: `2px solid ${item.color}`, borderRight: `2px solid ${item.color}`, opacity: 0.6 }} />

                    <span style={{ fontSize: '9px', color: item.color, opacity: 0.6, letterSpacing: '2px', marginBottom: '8px', fontWeight: 'bold' }}>CHRONO_INDEX // RECORD_YEAR</span>
                    <div className="hud-giant-year" style={{
                      fontSize: 'clamp(6rem, 12vw, 9rem)', 
                      fontWeight: 900, 
                      lineHeight: 0.8, 
                      color: 'transparent',
                      WebkitTextStroke: `2px ${item.color}60`, 
                      textShadow: `0 0 30px ${item.color}30`,
                      fontFamily: "'Orbitron', sans-serif",
                      userSelect: 'none',
                      position: 'relative'
                    }}>
                      {item.year}
                      {/* Glitch Overlay for Year */}
                      <div style={{ position: 'absolute', top: 0, left: '2px', color: item.color, opacity: 0.3, animation: 'glitch 4s infinite', pointerEvents: 'none' }}>{item.year}</div>
                      <div style={{ position: 'absolute', top: 0, left: '-2px', color: '#ffffff', opacity: 0.2, animation: 'glitch 3s infinite reverse', pointerEvents: 'none' }}>{item.year}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                      <span className="hud-system-module" style={{ fontSize: '12px', background: `${item.color}20`, border: `1px solid ${item.color}50`, padding: '4px 12px', color: item.color, fontWeight: 700, letterSpacing: '2px', boxShadow: `0 0 10px ${item.color}40` }}>{item.hash}</span>
                      <span className="hud-system-module" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>SYS: VALIDATED</span>
                    </div>
                  </div>

                  {/* BOTTOM-RIGHT: Title & Description */}
                  <div className="hud-bottom-right" style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    width: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    textAlign: 'right',
                    pointerEvents: 'auto',
                    background: 'rgba(8, 14, 27, 0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${item.color}25`,
                    borderRight: `4px solid ${item.color}`,
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: `0 20px 40px rgba(0,0,0,0.65), inset 0 0 20px ${item.color}08`,
                    transition: 'all 0.4s ease'
                  }}>
                    {/* Tech corners */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '8px', height: '8px', borderTop: `2px solid ${item.color}`, borderLeft: `2px solid ${item.color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderTop: `2px solid ${item.color}`, borderRight: `2px solid ${item.color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '8px', height: '8px', borderBottom: `2px solid ${item.color}`, borderLeft: `2px solid ${item.color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '8px', height: '8px', borderBottom: `2px solid ${item.color}`, borderRight: `2px solid ${item.color}`, opacity: 0.6 }} />

                    <span style={{ fontSize: '9px', color: item.color, opacity: 0.6, letterSpacing: '2px', marginBottom: '8px', fontWeight: 'bold' }}>DATA_STREAM // ARCHIVE_DESC</span>
                    <h3 className="hud-title-text" style={{ fontSize: '1.8rem', margin: '0 0 12px 0', fontWeight: 900, color: '#fff', letterSpacing: '2px', textShadow: `0 0 15px ${item.color}80`, fontFamily: "'Orbitron', sans-serif" }}>
                      {item.title}
                    </h3>
                    <p className="hud-desc-text" style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.6', fontWeight: 300, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                      {item.desc}
                    </p>
                    
                    {/* Animated Progress Line */}
                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', marginTop: '20px', position: 'relative', overflow: 'hidden', borderRadius: '1px' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: item.color, boxShadow: `0 0 12px ${item.color}`, animation: 'progressFill 1.5s linear infinite' }} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements Stage 2D HTML absolute overlay (visible only at stage 5) */}
      {!isTransitioning && popupVisible && currentStage === 5 && (
        <div style={{
          position: 'absolute',
          bottom: '25px', left: '20px', right: '20px',
          zIndex: 100,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          opacity: showAchievementsHint ? 1 : 0,
          transform: showAchievementsHint ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'fadeInUp 0.6s ease'
        }}>
          <div style={{
            background: 'rgba(8, 14, 27, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            padding: '10px 18px',
            borderRadius: '20px',
            color: '#00ffff',
            fontSize: '9.5px',
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 'bold',
            letterSpacing: '1px',
            textAlign: 'center',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.15)',
            textTransform: 'uppercase'
          }}>
            ONE CLICK TO VIEW TITLE, DOUBLE CLICK TO READ BLOG
          </div>
        </div>
      )}

      {/* Blog Article Reader Modal */}
      {selectedBlogIdx !== null && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 999,
          background: 'rgba(3, 7, 18, 0.9)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: "'Orbitron', sans-serif"
        }}>
          <div style={{
            background: 'rgba(6, 12, 24, 0.95)',
            border: `2px solid ${BLOG_POSTS[selectedBlogIdx].color}`,
            boxShadow: `0 0 35px ${BLOG_POSTS[selectedBlogIdx].color}25, inset 0 0 20px ${BLOG_POSTS[selectedBlogIdx].color}05`,
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            padding: '35px 30px',
            position: 'relative',
            boxSizing: 'border-box',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Cyberpunk corner bracket ticks */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}`, borderLeft: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}` }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}`, borderRight: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}` }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}`, borderLeft: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}` }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}`, borderRight: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${BLOG_POSTS[selectedBlogIdx].color}40`, paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: BLOG_POSTS[selectedBlogIdx].color, letterSpacing: '1px', textShadow: `0 0 10px ${BLOG_POSTS[selectedBlogIdx].color}50` }}>
                {BLOG_POSTS[selectedBlogIdx].title}
              </h3>
              <button
                onClick={() => setSelectedBlogIdx(null)}
                style={{ background: 'transparent', border: 'none', color: '#ff3366', fontSize: '1.8rem', cursor: 'pointer', outline: 'none' }}
              >&times;</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }} className="blog-scroll">
              <style>{`
                .blog-scroll::-webkit-scrollbar {
                  width: 6px;
                }
                .blog-scroll::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.02);
                  border-radius: 3px;
                }
                .blog-scroll::-webkit-scrollbar-thumb {
                  background: ${BLOG_POSTS[selectedBlogIdx].color}40;
                  border-radius: 3px;
                }
              `}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '15px', letterSpacing: '1px' }}>
                <span>BY {BLOG_POSTS[selectedBlogIdx].author}</span>
                <span>{BLOG_POSTS[selectedBlogIdx].date} // {BLOG_POSTS[selectedBlogIdx].readTime}</span>
              </div>
              <p style={{
                fontSize: '15px',
                color: BLOG_POSTS[selectedBlogIdx].color,
                fontStyle: 'italic',
                lineHeight: '1.6',
                marginBottom: '20px',
                background: `${BLOG_POSTS[selectedBlogIdx].color}10`,
                padding: '12px',
                borderLeft: `3px solid ${BLOG_POSTS[selectedBlogIdx].color}`,
                fontFamily: "'Inter', sans-serif",
                borderRadius: '0 6px 6px 0'
              }}>
                {BLOG_POSTS[selectedBlogIdx].excerpt}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#e2e8f0',
                lineHeight: '1.8',
                fontFamily: "'Inter', sans-serif",
                margin: 0
              }}>
                {BLOG_POSTS[selectedBlogIdx].content}
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedBlogIdx(null)} style={{
                padding: '10px 24px',
                background: BLOG_POSTS[selectedBlogIdx].color,
                color: '#030712',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: 'pointer',
                fontFamily: "'Orbitron', sans-serif",
                boxShadow: `0 0 15px ${BLOG_POSTS[selectedBlogIdx].color}40`,
                transition: 'all 0.2s'
              }}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Cyberpunk Contact Form Modal */}
      {isContactOpen && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 999,
          background: 'rgba(3, 7, 18, 0.9)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: "'Orbitron', sans-serif"
        }}>
          <div style={{
            background: 'rgba(6, 12, 24, 0.95)',
            border: '2px solid #00ffff',
            boxShadow: '0 0 35px rgba(0, 255, 255, 0.25), inset 0 0 20px rgba(0, 255, 255, 0.05)',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            padding: '35px 30px',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            {/* Cyberpunk corner bracket ticks */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '3px solid #00ffff', borderLeft: '3px solid #00ffff' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '3px solid #00ffff', borderRight: '3px solid #00ffff' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '3px solid #00ffff', borderLeft: '3px solid #00ffff' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '3px solid #00ffff', borderRight: '3px solid #00ffff' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#00ffff', letterSpacing: '1px', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>ESTABLISH CONTACT</h3>
              <button
                onClick={() => setIsContactOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ff3366', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
              >&times;</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const firstName = e.target.firstName.value;
              const lastName = e.target.lastName.value;
              const email = e.target.email.value;
              const countryCode = e.target.countryCode.value;
              const phone = e.target.phone.value;
              const message = e.target.message.value;

              const formData = {
                name: `${firstName} ${lastName}`,
                email: email,
                phone: `${countryCode} ${phone}`,
                message: message
              };

              setIsContactOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="contact-name-row" style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>FIRST_NAME</label>
                  <input required name="firstName" type="text" style={{ background: 'rgba(3, 7, 18, 0.8)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '6px', padding: '10px', color: 'white', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>LAST_NAME</label>
                  <input required name="lastName" type="text" style={{ background: 'rgba(3, 7, 18, 0.8)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '6px', padding: '10px', color: 'white', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>COM_ROUTE (EMAIL)</label>
                <input required name="email" type="email" style={{ background: 'rgba(3, 7, 18, 0.8)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '6px', padding: '10px', color: 'white', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>CONTACT_NO</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select name="countryCode" defaultValue="+91" style={{ width: '100px', background: 'rgba(3, 7, 18, 0.8)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '6px', padding: '10px', color: '#00ffff', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                    {[
                      { code: "+91", label: "IN +91" },
                      { code: "+1", label: "US +1" },
                      { code: "+44", label: "UK +44" },
                      { code: "+1", label: "CA +1" },
                      { code: "+61", label: "AU +61" },
                      { code: "+49", label: "DE +49" },
                      { code: "+33", label: "FR +33" },
                      { code: "+81", label: "JP +81" },
                      { code: "+86", label: "CN +86" },
                      { code: "+7", label: "RU +7" },
                      { code: "+55", label: "BR +55" },
                      { code: "+27", label: "ZA +27" },
                      { code: "+971", label: "AE +971" },
                      { code: "+65", label: "SG +65" },
                      { code: "+64", label: "NZ (+64)" },
                      { code: "+52", label: "MX (+52)" },
                      { code: "+34", label: "ES (+34)" },
                      { code: "+39", label: "IT (+39)" },
                      { code: "+31", label: "NL (+31)" },
                      { code: "+41", label: "CH (+41)" },
                      { code: "+46", label: "SE (+46)" },
                      { code: "+47", label: "NO (+47)" },
                      { code: "+45", label: "DK (+45)" },
                      { code: "+358", label: "FI (+358)" },
                      { code: "+48", label: "PL (+48)" },
                      { code: "+90", label: "TR (+90)" },
                      { code: "+82", label: "KR (+82)" },
                      { code: "+852", label: "HK (+852)" },
                      { code: "+886", label: "TW (+886)" },
                      { code: "+966", label: "SA (+966)" },
                      { code: "+60", label: "MY (+60)" },
                      { code: "+62", label: "ID (+62)" },
                      { code: "+66", label: "TH (+66)" },
                      { code: "+63", label: "PH (+63)" },
                      { code: "+84", label: "VN (+84)" },
                      { code: "+92", label: "PK (+92)" },
                      { code: "+880", label: "BD (+880)" },
                      { code: "+94", label: "LK (+94)" },
                      { code: "+977", label: "NP (+977)" },
                      { code: "+54", label: "AR (+54)" },
                      { code: "+57", label: "CO (+57)" },
                      { code: "+51", label: "PE (+51)" },
                      { code: "+58", label: "VE (+58)" },
                      { code: "+56", label: "CL (+56)" },
                      { code: "+20", label: "EG (+20)" },
                      { code: "+234", label: "NG (+234)" },
                      { code: "+254", label: "KE (+254)" },
                      { code: "+380", label: "UA (+380)" },
                      { code: "+40", label: "RO (+40)" },
                      { code: "+30", label: "GR (+30)" },
                      { code: "+32", label: "BE (+32)" },
                      { code: "+43", label: "AT (+43)" },
                      { code: "+353", label: "IE (+353)" },
                      { code: "+351", label: "PT (+351)" }
                    ].map((c, i) => (
                      <option key={i} style={{ background: '#060c18', color: 'white' }} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input required name="phone" type="tel" pattern="[0-9]{10}" maxLength="10" placeholder="10-digit number" style={{ flex: 1, background: 'rgba(3, 7, 18, 0.8)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '6px', padding: '10px', color: 'white', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box', minWidth: '0' }} onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>TRANSMISSION_DATA (MESSAGE)</label>
                <textarea required name="message" rows="3" style={{ background: 'rgba(3, 7, 18, 0.8)', border: '1px solid rgba(0,255,255,0.4)', borderRadius: '6px', padding: '10px', color: 'white', fontFamily: "'Inter', sans-serif", fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', width: '100%' }} />
              </div>

              <button type="submit" style={{
                marginTop: '5px',
                padding: '14px',
                background: '#00ffff',
                color: '#030712',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                cursor: 'pointer',
                fontFamily: "'Orbitron', sans-serif",
                boxShadow: '0 0 15px rgba(0,255,255,0.4)',
                transition: 'all 0.2s'
              }}>SUBMIT</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
