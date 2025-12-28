import React from "react";
import * as THREE from "three";
import {
  Float,
  Html,
  OrbitControls,
  TransformControls,
  PivotControls,
  Text,
  MeshReflectorMaterial,
  useHelper,
  SoftShadows,
  Sky,
} from "@react-three/drei";
import { useControls, button } from "leva";
import { Perf } from "r3f-perf";
import { ToneMappingMode } from "postprocessing";
import {
  Bloom,
  EffectComposer,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";

export default function Experience() {
  const cubeRef = React.useRef<THREE.Mesh>(null!);
  const sphereRef = React.useRef<THREE.Mesh>(null!);
  const directionalLightRef = React.useRef<THREE.DirectionalLight>(null!);

  useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1);

  const { perfVisible } = useControls({
    perfVisible: true,
  });

  const { position, color, visible } = useControls("sphere", {
    position: {
      value: { x: -2, y: 0 },
      step: 0.01,
      joystick: "invertY",
    },
    color: "#ff0000",
    visible: true,
    clickMe: button(() => {
      console.log("ok");
    }),
    choice: { options: ["a", "b", "c"] },
  });

  const { scale } = useControls("cube", {
    scale: { value: 1.5, step: 0.01, min: 0, max: 5 },
  });

  return (
    <>
      {perfVisible && <Perf position="top-left" />}

      <OrbitControls makeDefault />

      <EffectComposer>
        <Bloom />
        <Vignette />

        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>

      <SoftShadows size={25} samples={10} focus={0} />

      <directionalLight
        ref={directionalLightRef}
        position={[1, 2, 3]}
        intensity={4.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={10}
        shadow-camera-top={5}
        shadow-camera-right={5}
        shadow-camera-bottom={-5}
        shadow-camera-left={-5}
      />
      <ambientLight intensity={0.5} />

      <Sky />

      <group>
        <PivotControls
          anchor={[0, 0, 0]}
          depthTest={false}
          scale={100}
          fixed={true}
        >
          <mesh
            castShadow
            position={[position.x, position.y, 0]}
            ref={sphereRef}
          >
            <sphereGeometry />
            <meshStandardMaterial color={color} visible={visible} />
            <Html
              className="text-2xl text-nowrap text-black bg-amber-300 p-4 rounded-3xl"
              position={[1, 1, 0]}
              distanceFactor={6}
              occlude={[sphereRef, cubeRef]}
            >
              That's a sphere
            </Html>
          </mesh>
        </PivotControls>
        <mesh castShadow position-x={2} scale={scale} ref={cubeRef}>
          <boxGeometry />
          <meshStandardMaterial color="mediumpurple" />
        </mesh>
        <TransformControls object={cubeRef} />
      </group>
      <mesh
        receiveShadow
        position-y={-1}
        scale={10}
        rotation-x={-Math.PI * 0.5}
      >
        <planeGeometry />
        <MeshReflectorMaterial
          resolution={512}
          blur={[1000, 1000]}
          mixBlur={1}
          mirror={0.75}
        />
      </mesh>
      <Float speed={2}>
        <Text color="salmon" position={[2, 2, -4]} maxWidth={2}>
          I LOVE R3F
        </Text>
      </Float>
    </>
  );
}
