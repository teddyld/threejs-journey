import React from "react";
import * as THREE from "three";

export default function CustomObject() {
  const geometryRef = React.useRef<THREE.BufferGeometry>(null!);
  React.useEffect(() => {
    geometryRef.current.computeVertexNormals();
  }, [geometryRef]);

  const count = 10 * 3;

  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, []);

  return (
    <mesh>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3, false]}
        />
      </bufferGeometry>
      <meshStandardMaterial color="red" side={THREE.DoubleSide} />
    </mesh>
  );
}
