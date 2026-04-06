import { useRef, useEffect } from "react";
import * as THREE from "three";

const ROWS = 40;
const COLS = 60;
const SEP = 150;

const DottedSurface = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x09090b, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      20000
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const count = ROWS * COLS;
    const positions = new Float32Array(count * 3);
    const halfW = ((COLS - 1) * SEP) / 2;
    const halfH = ((ROWS - 1) * SEP) / 2;

    for (let ix = 0; ix < COLS; ix++) {
      for (let iy = 0; iy < ROWS; iy++) {
        const idx = (ix * ROWS + iy) * 3;
        positions[idx] = ix * SEP - halfW;
        positions[idx + 1] = 0;
        positions[idx + 2] = iy * SEP - halfH;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 8,
      color: new THREE.Color(200 / 255, 200 / 255, 200 / 255),
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frame = 0;
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame += 0.02;
      const pos = geometry.attributes.position as THREE.BufferAttribute;

      for (let ix = 0; ix < COLS; ix++) {
        for (let iy = 0; iy < ROWS; iy++) {
          const idx = ix * ROWS + iy;
          const y =
            Math.sin((ix + frame) * 0.3) * 50 +
            Math.sin((iy + frame) * 0.5) * 50;
          pos.setY(idx, y);
        }
      }

      pos.needsUpdate = true;
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
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
};

export default DottedSurface;
