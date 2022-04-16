import * as THREE from 'three'

// Adapted from https://github.com/mrdoob/three.js/blob/master/src/geometries/TorusKnotBufferGeometry.js

export class TorusKnotHelper {
  static calculatePositionOnCurve(u, p, q, radius, position) {
    const cu = Math.cos(u)
    const su = Math.sin(u)
    const quOverP = (q / p) * u
    const cs = Math.cos(quOverP)

    position.x = radius * (2 + cs) * 0.5 * cu
    position.y = radius * (2 + cs) * su * 0.5
    position.z = radius * Math.sin(quOverP) * 0.5
  }
  static generatePoints(radius = 1, tubularSegments = 64, p = 2, q = 3) {
    // Returns array of Vector3, no duplicates
    const P = new THREE.Vector3()
    const points = []
    for (let i = 0; i < tubularSegments; ++i) {
      // the radian "u" is used to calculate the position on the torus curve of the current tubular segement

      const u = (i / tubularSegments) * p * Math.PI * 2

      // now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
      // these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions

      TorusKnotHelper.calculatePositionOnCurve(u, p, q, radius, P)
      points.push(P.clone())
    }
    return points
  }
  static generateCurve(...args) {
    return new THREE.CatmullRomCurve3(TorusKnotHelper.generatePoints(...args), true)
  }
}
