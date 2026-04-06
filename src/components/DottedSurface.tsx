import { useRef, useEffect } from "react";
import * as THREE from "three";

const GRID = 50;
const SEP = 100;
const HOVER_RADIUS = 500;
const HOVER_STRENGTH = 120;
const PULSE_SPEED = 1800;
const PULSE_WIDTH = 600;
const PULSE_DECAY = 1.8;
const MAX_PULSES = 8;

interface Pulse {
  origin: THREE.Vector2;
  time: number;
  strength: number;
}

const vertexShader = `
  attribute float size;
  varying float vHeight;
  void main() {
    vHeight = position.y;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (600.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vHeight;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float edge = smoothstep(0.5, 0.25, dist);
    float hf = clamp(vHeight / 120.0, 0.0, 1.0);
    vec3 neutral = vec3(0.55, 0.58, 0.68);
    vec3 blue = vec3(0.35, 0.55, 1.0);
    vec3 color = mix(neutral, blue, hf);
    float alpha = mix(0.5, 1.0, hf) * edge;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface DottedSurfaceProps {
  interactive?: boolean;
}

const DottedSurface = ({ interactive = false }: DottedSurfaceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x09090b, 0.00025);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      1,
      15000
    );
    camera.position.set(0, 500, 1200);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Geometry
    const count = GRID * GRID;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const half = ((GRID - 1) * SEP) / 2;

    for (let ix = 0; ix < GRID; ix++) {
      for (let iy = 0; iy < GRID; iy++) {
        const idx = ix * GRID + iy;
        positions[idx * 3] = ix * SEP - half;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = iy * SEP - half;
        sizes[idx] = 8;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Interaction state
    const mouseWorld = new THREE.Vector2(Infinity, Infinity);
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    let hasMousePos = false;
    const pulses: Pulse[] = [];

    // Listen on window so events aren't blocked by page content above
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);
      if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        mouseWorld.set(intersectPoint.x, intersectPoint.z);
        hasMousePos = true;
      }
    };

    const onMouseLeave = () => {
      hasMousePos = false;
    };

    const onClick = (e: MouseEvent) => {
      if (!interactive) return;
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);
      if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        if (pulses.length >= MAX_PULSES) pulses.shift();
        pulses.push({
          origin: new THREE.Vector2(intersectPoint.x, intersectPoint.z),
          time: performance.now() / 1000,
          strength: 150,
        });
      }
    };

    if (interactive) {
      window.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseleave", onMouseLeave);
      window.addEventListener("click", onClick);
    }

    // Animation
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const now = performance.now() / 1000;
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;

      for (let p = pulses.length - 1; p >= 0; p--) {
        if (now - pulses[p].time > 4) pulses.splice(p, 1);
      }

      for (let ix = 0; ix < GRID; ix++) {
        for (let iy = 0; iy < GRID; iy++) {
          const idx = ix * GRID + iy;
          const px = positions[idx * 3];
          const pz = positions[idx * 3 + 2];

          // Base wave
          let y =
            Math.sin((ix + elapsed * 1.5) * 0.3) * 30 +
            Math.sin((iy + elapsed * 2) * 0.4) * 25;
          let s = 8;

          // Mouse hover
          if (interactive && hasMousePos) {
            const dx = px - mouseWorld.x;
            const dz = pz - mouseWorld.y;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < HOVER_RADIUS) {
              const factor = 1 - dist / HOVER_RADIUS;
              const smooth = factor * factor * (3 - 2 * factor);
              y += smooth * HOVER_STRENGTH;
              s += smooth * 8;
            }
          }

          // Pulse waves
          for (let p = 0; p < pulses.length; p++) {
            const pulse = pulses[p];
            const age = now - pulse.time;
            const waveFront = age * PULSE_SPEED;
            const dx = px - pulse.origin.x;
            const dz = pz - pulse.origin.y;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const distFromWave = Math.abs(dist - waveFront);
            if (distFromWave < PULSE_WIDTH) {
              const wave =
                (1 - distFromWave / PULSE_WIDTH) *
                pulse.strength *
                Math.exp(-age * PULSE_DECAY);
              y += wave;
              s += (wave / pulse.strength) * 5;
            }
          }

          pos.setY(idx, y);
          sizeAttr.setX(idx, s);
        }
      }

      pos.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseleave", onMouseLeave);
        window.removeEventListener("click", onClick);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
};

export default DottedSurface;
