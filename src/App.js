import React, { forwardRef, Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useUpdate } from 'react-three-fiber'
import { OrbitControls, Environment, useGLTF, CurveModifier } from '@react-three/drei'
import { ResizeObserver } from '@juggle/resize-observer'
import { TorusKnotHelper } from './Util'

/* 
Model by Alex Sanches:  https://skfb.ly/6VoNE

Inspirations:
https://www.reddit.com/r/blender/comments/j87ivi/endless_possibilities/
https://www.reddit.com/r/blender/comments/kgryl9/here_is_a_little_looping_animation_i_did_pretty/
*/

export default function App() {
  const style = { background: 'radial-gradient(gold, orange)' }
  const camera = { position: [10, 0, 0], fov: 30 }
  return (
    <Canvas concurrent style={style} camera={camera} resize={{ polyfill: ResizeObserver }}>
      <Scene />
    </Canvas>
  )
}

function Scene() {
  return (
    <Suspense fallback={null}>
      <OrbitControls autoRotate autoRotateSpeed={(-60 * 0.15) / 2} />
      <Environment preset="warehouse" />
      <CurvyPencil p={3} q={4} speed={0.15} />
    </Suspense>
  )
}

function CurvyPencil({ radius = 1, tubularSegments = 64, p = 2, q = 3, debug = false, speed = 0.2, ...props }) {
  const { curve, points } = useMemo(() => {
    const curve = TorusKnotHelper.generateCurve(radius, tubularSegments, p, q)
    const points = curve.getPoints(300)
    return { curve, points }
  }, [radius, tubularSegments, p, q])
  const flowRef = useRef()
  useFrame((_, delta) => {
    flowRef.current && flowRef.current.moveAlongCurve(delta * speed)
  })
  return (
    <group {...props}>
      <CurveModifier ref={flowRef} curve={curve}>
        <Pencil />
      </CurveModifier>
      {debug && <LineLoop points={points} color="red" />}
    </group>
  )
}

// CurveModifier needs to pass a ref, so we forwardRef
const Pencil = forwardRef((props, ref) => {
  const { nodes } = useGLTF('pencil.glb')
  const { material, geometry } = nodes.mesh
  useLayoutEffect(() => {
    geometry.scale(7, 7, 7)
  }, [geometry])
  return <mesh ref={ref} args={[geometry, material]} {...props} />
})

function LineLoop({ color = 'white', points = [], ...props }) {
  const ref = useUpdate((geom) => geom.setFromPoints(points), [points])
  return (
    <lineLoop {...props}>
      <bufferGeometry ref={ref} />
      <lineBasicMaterial color={color} />
    </lineLoop>
  )
}
