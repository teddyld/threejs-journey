import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import Experience from "./Experience";
import * as THREE from "three";

function App() {
  return (
    <>
      <Leva collapsed />
      <Canvas
        shadows
        dpr={[1, 2]} // Default
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ fov: 45, near: 0.1, far: 200, position: [3, 2, 6] }}
      >
        <color args={["ivory"]} attach="background" />
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
