import * as THREE from 'three'

// Runs before the tower engine. It keeps the public 3D experience smooth on phones
// and on computers with high-density screens without changing the business content.
const rendererPrototype = THREE.WebGLRenderer.prototype

if (!rendererPrototype.__recruitFlowPerformancePatch) {
  rendererPrototype.__recruitFlowPerformancePatch = true

  const nativeSetPixelRatio = rendererPrototype.setPixelRatio
  rendererPrototype.setPixelRatio = function setRecruitFlowPixelRatio(value) {
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const cap = mobile ? 1.05 : 1.4
    return nativeSetPixelRatio.call(this, Math.min(value || 1, cap))
  }

  const nativeRender = rendererPrototype.render
  rendererPrototype.render = function renderRecruitFlowLite(scene, camera) {
    const now = performance.now()
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetFps = reducedMotion ? 24 : mobile ? 30 : 45
    const frameInterval = 1000 / targetFps

    if (this.__recruitFlowLastRender && now - this.__recruitFlowLastRender < frameInterval) return
    this.__recruitFlowLastRender = now

    if (!this.__recruitFlowPrepared) {
      this.__recruitFlowPrepared = true
      this.__recruitFlowFrameCount = 0

      if (mobile) {
        this.shadowMap.enabled = false
        scene.traverse(object => {
          if (!object.isMesh) return
          object.castShadow = false
          object.receiveShadow = false
        })
      }
    }

    this.__recruitFlowFrameCount += 1
    const result = nativeRender.call(this, scene, camera)

    // The tower is largely static, so the expensive shadow map does not need
    // to be recalculated every frame on desktop.
    if (!mobile && this.__recruitFlowFrameCount === 4) {
      this.shadowMap.autoUpdate = false
      this.shadowMap.needsUpdate = false
    }

    return result
  }
}

window.__RECRUITFLOW_PERFORMANCE_MODE__ = {
  pixelRatioCap: window.matchMedia('(max-width: 760px)').matches ? 1.05 : 1.4,
  targetFps: window.matchMedia('(max-width: 760px)').matches ? 30 : 45,
}
