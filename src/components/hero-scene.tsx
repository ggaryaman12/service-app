"use client";

import { Float, Line, PerspectiveCamera, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

type HeroSceneProps = {
  reducedMotion: boolean;
  active: boolean;
};

type ServicePodProps = {
  label: string;
  position: [number, number, number];
  color: string;
  delay: number;
  reducedMotion: boolean;
  active: boolean;
};

function ServicePod({ label, position, color, delay, reducedMotion, active }: ServicePodProps) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!ref.current) return;

    const intro = active ? Math.min(1, Math.max(0, state.clock.elapsedTime * 0.9 - delay)) : 0;
    const ease = 1 - Math.pow(1 - intro, 3);
    ref.current.position.set(
      position[0] * ease,
      position[1] * ease + (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime + delay) * 0.035),
      position[2]
    );
    ref.current.scale.setScalar(0.72 + ease * 0.28);
    ref.current.rotation.y = reducedMotion ? 0 : state.clock.elapsedTime * 0.18 + delay;
  });

  return (
    <group ref={ref} position={[0, 0, position[2]]} scale={0.72}>
      <Float speed={reducedMotion ? 0 : 1.1} floatIntensity={0.18} rotationIntensity={0.08}>
        <mesh>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.36} metalness={0.12} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.58, 16]} />
          <meshStandardMaterial color="#f7f8f5" roughness={0.6} />
        </mesh>
        <Text
          position={[0, -0.72, 0]}
          fontSize={0.115}
          color="#f7f8f5"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
        >
          {label}
        </Text>
      </Float>
    </group>
  );
}

function ServiceCity({ reducedMotion, active }: HeroSceneProps) {
  const groupRef = useRef<Group>(null);
  const routePoints = useMemo(
    () =>
      [
        [-3.15, -1.25, -0.12],
        [-1.9, -0.18, 0.06],
        [-0.8, -0.82, -0.18],
        [0.22, 0.06, 0.08],
        [1.24, -0.48, -0.04],
        [2.7, 0.46, 0.02]
      ] as [number, number, number][],
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += reducedMotion ? 0 : delta * 0.055;
    groupRef.current.rotation.z = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.26) * 0.025;
  });

  return (
    <group ref={groupRef} position={[0.68, -0.1, 0]} rotation={[0.42, -0.34, -0.12]}>
      <mesh position={[0, -1.22, -0.24]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.75, 96]} />
        <meshStandardMaterial color="#17351f" roughness={0.72} metalness={0.02} />
      </mesh>

      <Line points={routePoints} color="#f7f8f5" lineWidth={2.4} transparent opacity={0.58} />
      <Line points={routePoints} color="#145c37" lineWidth={8} transparent opacity={0.26} />

      <Float speed={reducedMotion ? 0 : 0.8} floatIntensity={0.12} rotationIntensity={0.04}>
        <group position={[0, -0.58, 0.18]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.15, 0.72, 0.88]} />
            <meshStandardMaterial color="#f7f8f5" roughness={0.42} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.9, 0.9, 0.82]} />
            <meshStandardMaterial color="#dce8d6" roughness={0.48} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0.14, 0.46]}>
            <boxGeometry args={[0.28, 0.34, 0.05]} />
            <meshStandardMaterial color="#145c37" roughness={0.3} />
          </mesh>
          <mesh position={[0.28, 0.32, 0.46]}>
            <boxGeometry args={[0.18, 0.18, 0.055]} />
            <meshStandardMaterial color="#3154b7" roughness={0.34} />
          </mesh>
          <mesh position={[-0.28, 0.32, 0.46]}>
            <boxGeometry args={[0.18, 0.18, 0.055]} />
            <meshStandardMaterial color="#3154b7" roughness={0.34} />
          </mesh>
        </group>
      </Float>

      {routePoints.map((point, index) => (
        <mesh key={point.join(":")} position={point}>
          <sphereGeometry args={[index === 3 ? 0.11 : 0.075, 24, 24]} />
          <meshStandardMaterial
            color={index === 3 ? "#f7f8f5" : "#78c59b"}
            emissive={index === 3 ? "#145c37" : "#0f4a2c"}
            emissiveIntensity={0.16}
            roughness={0.3}
          />
        </mesh>
      ))}

      <ServicePod
        label="cleaning"
        position={[-2.55, 0.82, 0.32]}
        color="#78c59b"
        delay={0.08}
        active={active}
        reducedMotion={reducedMotion}
      />
      <ServicePod
        label="repairs"
        position={[2.2, 1.06, 0.2]}
        color="#f7f8f5"
        delay={0.22}
        active={active}
        reducedMotion={reducedMotion}
      />
      <ServicePod
        label="beauty"
        position={[1.92, -1.18, 0.38]}
        color="#8fa5e7"
        delay={0.34}
        active={active}
        reducedMotion={reducedMotion}
      />
      <ServicePod
        label="appliances"
        position={[-2.05, -1.42, 0.32]}
        color="#dce8d6"
        delay={0.48}
        active={active}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}

export function HeroScene({ reducedMotion, active }: HeroSceneProps) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <PerspectiveCamera makeDefault position={[0, 0.25, 6.6]} fov={40} />
      <color attach="background" args={["#101510"]} />
      <fog attach="fog" args={["#101510", 5.6, 10.8]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[3.2, 5.2, 4]} intensity={1.4} color="#f7f8f5" />
      <pointLight position={[-3.6, -1.7, 3.6]} intensity={1.3} color="#78c59b" />
      <pointLight position={[2.8, 2.2, 2.8]} intensity={0.9} color="#8fa5e7" />
      <ServiceCity reducedMotion={reducedMotion} active={active} />
    </Canvas>
  );
}
