import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COPPER = new THREE.Color("#e08a2e");
const WHEAT = new THREE.Color("#f2c14b");
const STEEL = new THREE.Color("#9cc4bf");
const PAPER = new THREE.Color("#fff4e3");

const R = 1.6;
const GENEVA = { lat: 46.2044, lon: 6.1432 };
/** Physical trade hubs linked to Geneva: oil, metals, grains and freight. */
const HUBS = [
  { lat: 1.3521, lon: 103.8198 }, // Singapore
  { lat: 29.7604, lon: -95.3698 }, // Houston
  { lat: 51.9244, lon: 4.4777 }, // Rotterdam
  { lat: 31.2304, lon: 121.4737 }, // Shanghai
  { lat: 25.2048, lon: 55.2708 }, // Dubai
  { lat: -23.9608, lon: -46.3336 }, // Santos
  { lat: 6.5244, lon: 3.3792 }, // Lagos
  { lat: -33.9249, lon: 18.4241 }, // Cape Town
  { lat: 40.7128, lon: -74.006 }, // New York
  { lat: -12.0464, lon: -77.0428 }, // Lima (copper)
];

function toVec(lat: number, lon: number, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function DotSphere() {
  const geometry = useMemo(() => {
    const count = 2600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const th = golden * i;
      positions.set([Math.cos(th) * radius * R, y * R, Math.sin(th) * radius * R], i * 3);
      const c = STEEL.clone().lerp(COPPER, Math.random() * 0.35);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Route({ to, index }: { to: { lat: number; lon: number }; index: number }) {
  const pulse = useRef<THREE.Mesh>(null);
  const { curve, line } = useMemo(() => {
    const a = toVec(GENEVA.lat, GENEVA.lon);
    const b = toVec(to.lat, to.lon);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const lift = 1 + a.distanceTo(b) * 0.32;
    mid.normalize().multiplyScalar(R * lift);
    const c = new THREE.QuadraticBezierCurve3(a, mid, b);
    const g = new THREE.BufferGeometry().setFromPoints(c.getPoints(64));
    const m = new THREE.LineBasicMaterial({ color: COPPER, transparent: true, opacity: 0.55 });
    return { curve: c, line: new THREE.Line(g, m) };
  }, [to]);
  const end = useMemo(() => toVec(to.lat, to.lon), [to]);
  const speed = 0.12 + (index % 4) * 0.035;

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * speed + index * 0.17) % 1;
    if (pulse.current) {
      pulse.current.position.copy(curve.getPoint(t));
      const s = Math.sin(t * Math.PI);
      pulse.current.scale.setScalar(0.5 + s * 0.7);
    }
  });

  return (
    <group>
      <primitive object={line} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.014, 10, 10]} />
        <meshBasicMaterial color={WHEAT} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={PAPER} />
      </mesh>
    </group>
  );
}

function GenevaBeacon() {
  const ring = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => toVec(GENEVA.lat, GENEVA.lon, R * 1.003), []);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()),
    [pos],
  );
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.8) % 1;
    if (ring.current) {
      ring.current.scale.setScalar(1 + t * 1.6);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t);
    }
  });
  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <circleGeometry args={[0.03, 24]} />
        <meshBasicMaterial color={WHEAT} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.04, 0.05, 40]} />
        <meshBasicMaterial color={COPPER} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Globe({ pointer, scroll }: { pointer: { x: number; y: number }; scroll: { p: number } }) {
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  // Face Geneva towards the viewer at rest.
  const baseY = useMemo(() => -((GENEVA.lon + 90) * Math.PI) / 180, []);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.06 + scroll.p * delta * 0.4;
    if (tilt.current) {
      const tx = 0.38 + pointer.y * 0.25 + scroll.p * 0.35;
      const ty = pointer.x * 0.45;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.05;
      tilt.current.rotation.z += (-ty * 0.25 - tilt.current.rotation.z) * 0.05;
      tilt.current.position.y += (-scroll.p * 0.9 - tilt.current.position.y) * 0.08;
      const s = 1 + scroll.p * 0.25;
      tilt.current.scale.setScalar(tilt.current.scale.x + (s - tilt.current.scale.x) * 0.08);
    }
  });

  return (
    <group ref={tilt}>
      <group ref={spin} rotation={[0, baseY, 0]}>
        <mesh>
          <sphereGeometry args={[R * 0.985, 64, 64]} />
          <meshBasicMaterial color="#0c1c1e" transparent opacity={0.6} />
        </mesh>
        <DotSphere />
        <GenevaBeacon />
        {HUBS.map((h, i) => (
          <Route key={i} to={h} index={i} />
        ))}
      </group>
      <mesh scale={1.14}>
        <sphereGeometry args={[R, 48, 48]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{ uColor: { value: COPPER } }}
          vertexShader={`varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`uniform vec3 uColor; varying vec3 vN; void main(){ float i = pow(max(0.0, -dot(vN, vec3(0.0,0.0,1.0))), 4.0); gl_FragColor = vec4(uColor, 1.0) * i * 0.5; }`}
        />
      </mesh>
    </group>
  );
}

/** Interactive globe of trade routes radiating from Geneva. */
export default function HeroGlobe({
  pointer,
  scroll,
  active,
}: {
  pointer: { x: number; y: number };
  scroll: { p: number };
  active: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Globe pointer={pointer} scroll={scroll} />
    </Canvas>
  );
}
