import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

// A simple low-poly pine tree component
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 2, 5]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
      </mesh>
      {/* Leaves / Branches */}
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[1.5, 3, 5]} />
        <meshStandardMaterial color="#2d4a22" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[1.2, 2.5, 5]} />
        <meshStandardMaterial color="#3a5a2d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.8, 0]}>
        <coneGeometry args={[0.9, 2, 5]} />
        <meshStandardMaterial color="#4a6a38" roughness={0.8} />
      </mesh>
    </group>
  );
}


export default function ThreeDDecorations() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 5, -5]} intensity={0.5} color="#a87b51" />
        
        {/* Environment light for nicer reflections */}
        <Environment preset="city" />

        {/* Trees on the Left */}
        <group position={[-13, -4, -2]}>
          <Tree position={[0, 0, 0]} scale={1.2} />
          <Tree position={[2.5, -1, -3]} scale={0.9} />
          <Tree position={[-2, -0.5, -4]} scale={1.4} />
        </group>
      </Canvas>
    </div>
  );
}
