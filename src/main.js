import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { secondiCategories, totalSecondi, allocatedSecondi, reserveSecondi, allocationRate, globalMetrics } from './data.js'

const canvas = document.querySelector('#world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x050810, 0.024)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 180)
camera.position.set(18, 16, 21)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.055
controls.minDistance = 9
controls.maxDistance = 42
controls.maxPolarAngle = Math.PI * 0.48
controls.target.set(0, 1.2, 0)

scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x0b1019, 1.85))
const sun = new THREE.DirectionalLight(0xffffff, 4.4)
sun.position.set(10, 18, 12)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -22
sun.shadow.camera.right = 22
sun.shadow.camera.top = 22
sun.shadow.camera.bottom = -22
scene.add(sun)

function box(w, h, d, color, opts = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.5,
    metalness: opts.metalness ?? 0.18,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  })
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  mesh.castShadow = opts.castShadow ?? true
  mesh.receiveShadow = opts.receiveShadow ?? true
  return mesh
}

function makeLabel(text, sub, color) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 360
  const x = c.getContext('2d')
  x.clearRect(0, 0, c.width, c.height)
  x.fillStyle = 'rgba(5,9,16,.78)'
  x.roundRect(42, 40, 940, 280, 42)
  x.fill()
  x.strokeStyle = color
  x.lineWidth = 5
  x.stroke()
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillStyle = '#ffffff'
  x.font = '900 94px Inter, Arial'
  x.fillText(text, 512, 145)
  x.fillStyle = color
  x.font = '900 72px Inter, Arial'
  x.fillText(sub, 512, 245)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(3.1, 1.1, 1)
  return sprite
}

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(17.3, 128),
  new THREE.MeshStandardMaterial({ color: 0x0a111d, roughness: 0.78, metalness: 0.18 })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

for (const radius of [4.3, 8.4, 13.0, 16.9]) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.035, radius + 0.035, 128),
    new THREE.MeshBasicMaterial({ color: 0x6a87bd, transparent: true, opacity: radius === 16.9 ? 0.36 : 0.14, side: THREE.DoubleSide })
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.02
  scene.add(ring)
}

const grid = new THREE.GridHelper(30, 30, 0x3b5074, 0x17243a)
grid.position.y = 0.018
grid.material.transparent = true
grid.material.opacity = 0.13
scene.add(grid)

const hub = new THREE.Group()
const hubBase = new THREE.Mesh(
  new THREE.CylinderGeometry(3.1, 3.5, 0.36, 72),
  new THREE.MeshStandardMaterial({ color: 0x18263a, roughness: 0.28, metalness: 0.72 })
)
hubBase.position.y = 0.18
hubBase.castShadow = true
hub.add(hubBase)

const core = new THREE.Mesh(
  new THREE.CylinderGeometry(1.02, 1.25, 5.2, 36),
  new THREE.MeshPhysicalMaterial({ color: 0xb8ccff, emissive: 0x36589c, emissiveIntensity: 1.65, metalness: 0.18, roughness: 0.12, transmission: 0.42, transparent: true, opacity: 0.9 })
)
core.position.y = 2.8
core.castShadow = true
hub.add(core)

for (let i = 0; i < 5; i++) {
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.5 + i * 0.17, 0.025, 10, 84),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0x8eaaff : 0x54d6ff, transparent: true, opacity: 0.72 })
  )
  orbit.rotation.x = Math.PI / 2
  orbit.position.y = 0.85 + i * 0.84
  orbit.userData.spin = 0.002 + i * 0.00045
  hub.add(orbit)
}

const totalLabel = makeLabel('84', 'SECONDI', '#8fb0ff')
totalLabel.position.set(0, 6.2, 0)
totalLabel.scale.set(2.6, 0.95, 1)
hub.add(totalLabel)
scene.add(hub)

const clickable = []
const categoryObjects = new Map()

function createPerson(color, scale = 1) {
  const person = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.08, emissive: new THREE.Color(color), emissiveIntensity: 0.12 })
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11 * scale, 0.30 * scale, 5, 8), bodyMat)
  body.position.y = 0.35 * scale
  body.castShadow = true
  person.add(body)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105 * scale, 12, 10), new THREE.MeshStandardMaterial({ color: 0xd6a47c, roughness: 0.8 }))
  head.position.y = 0.69 * scale
  head.castShadow = true
  person.add(head)
  return person
}

function addBeam(fromX, fromZ, toX, toZ, color) {
  const a = new THREE.Vector3(fromX, 0.07, fromZ)
  const b = new THREE.Vector3(toX, 0.07, toZ)
  const len = a.distanceTo(b)
  const beam = box(0.10, 0.025, len, color, { roughness: 0.2, metalness: 0.15 })
  beam.material.emissive = new THREE.Color(color)
  beam.material.emissiveIntensity = 1.35
  beam.material.transparent = true
  beam.material.opacity = 0.6
  beam.position.copy(a.clone().add(b).multiplyScalar(0.5))
  beam.rotation.y = Math.atan2(b.x - a.x, b.z - a.z)
  scene.add(beam)
}

function addCategory(category) {
  const angle = THREE.MathUtils.degToRad(category.angle)
  const radius = 10.6
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const color = new THREE.Color(category.color)
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  group.userData.categoryId = category.id

  addBeam(0, 0, x * 0.82, z * 0.82, category.color)

  const padRadius = category.count >= 15 ? 2.35 : category.count >= 8 ? 2.05 : 1.72
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(padRadius, padRadius + 0.16, 0.23, 48),
    new THREE.MeshStandardMaterial({ color: color.clone().multiplyScalar(0.26), roughness: 0.52, metalness: 0.52 })
  )
  pad.position.y = 0.115
  pad.castShadow = true
  pad.receiveShadow = true
  group.add(pad)

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(padRadius + 0.12, padRadius + 0.20, 64),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  )
  halo.rotation.x = -Math.PI / 2
  halo.position.y = 0.245
  halo.userData.pulse = category.id
  group.add(halo)

  const towerHeight = 1.0 + category.count * 0.16
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.78, towerHeight, 24),
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.23, metalness: 0.42, transmission: 0.18, transparent: true, opacity: 0.86, emissive: color, emissiveIntensity: 0.34 })
  )
  tower.position.y = 0.23 + towerHeight / 2
  tower.castShadow = true
  tower.userData.categoryId = category.id
  group.add(tower)
  clickable.push(tower)

  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.035, 8, 52),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
  )
  crown.rotation.x = Math.PI / 2
  crown.position.y = towerHeight + 0.28
  crown.userData.spin = 0.004
  group.add(crown)

  const label = makeLabel(category.name.toUpperCase(), `${category.count} OAMENI`, category.color)
  label.position.set(0, towerHeight + 1.35, 0)
  label.userData.categoryId = category.id
  group.add(label)

  const columns = category.count >= 15 ? 5 : category.count >= 8 ? 4 : 3
  const spacing = 0.46
  const rows = Math.ceil(category.count / columns)
  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (i >= category.count) break
      const person = createPerson(category.color, 0.92)
      const px = (col - (columns - 1) / 2) * spacing
      const pz = 0.85 + row * 0.48
      person.position.set(px, 0.24, pz)
      person.rotation.y = Math.atan2(-px, -pz)
      person.userData.floatSeed = i * 0.71 + category.angle
      group.add(person)
      i++
    }
  }

  const light = new THREE.PointLight(color, 6.0 + category.count * 0.15, 7.0, 2)
  light.position.set(0, 3.2, 0)
  group.add(light)

  const hit = new THREE.Mesh(new THREE.CylinderGeometry(padRadius, padRadius, 3.8, 32), new THREE.MeshBasicMaterial({ visible: false }))
  hit.position.y = 1.9
  hit.userData.categoryId = category.id
  group.add(hit)
  clickable.push(hit)

  scene.add(group)
  categoryObjects.set(category.id, { group, light, tower, halo, category })
}

secondiCategories.forEach(addCategory)

for (let i = 0; i < 24; i++) {
  const a = (i / 24) * Math.PI * 2
  const r = 15.5
  const p = box(0.035, 1.1 + (i % 4) * 0.25, 0.035, 0x6d8ac4, { roughness: 0.2, metalness: 0.7 })
  p.position.set(Math.cos(a) * r, p.geometry.parameters.height / 2, Math.sin(a) * r)
  p.material.emissive = new THREE.Color(0x314f88)
  p.material.emissiveIntensity = 0.55
  scene.add(p)
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let selected = null
let targetCamera = null

function populateUI() {
  document.querySelector('#global-kpis').innerHTML = globalMetrics
    .map(([v, l]) => `<div class="kpi-card"><div class="kpi-value">${v}</div><div class="kpi-label">${l}</div></div>`)
    .join('')

  document.querySelector('#zone-list').innerHTML = secondiCategories
    .map(category => `
      <button class="zone-button" data-zone="${category.id}" style="--zone-fade:${category.color}">
        <span class="zone-color" style="background:${category.color};box-shadow:0 0 18px ${category.color}88"></span>
        <span class="zone-copy"><span class="zone-name">${category.name}</span><span class="zone-meta">${category.action}</span></span>
        <span class="zone-count" style="color:${category.color}">${category.count}</span>
      </button>`)
    .join('')

  document.querySelectorAll('[data-zone]').forEach(button => {
    button.addEventListener('click', () => selectCategory(button.dataset.zone, true))
  })
}

function selectCategory(id, focusCamera = true) {
  const category = secondiCategories.find(item => item.id === id)
  if (!category) return
  selected = category
  const percent = Math.round((category.count / totalSecondi) * 100)
  document.querySelectorAll('.zone-button').forEach(el => el.classList.toggle('active', el.dataset.zone === id))
  document.querySelector('#detail-eyebrow').textContent = `${category.priority.toUpperCase()} • ${category.action.toUpperCase()}`
  document.querySelector('#detail-title').textContent = category.name
  document.querySelector('#detail-description').textContent = category.description
  document.querySelector('#detail-kpis').innerHTML = `
    <div class="detail-kpi"><strong>${category.count}</strong><span>secondi</span></div>
    <div class="detail-kpi"><strong>${percent}%</strong><span>din total</span></div>
    <div class="detail-kpi"><strong>${category.id === 'reserve' ? 'Buffer' : 'Activ'}</strong><span>status</span></div>`
  const bar = document.querySelector('#detail-bar')
  bar.style.width = `${Math.max(percent, 3)}%`
  bar.style.background = category.color
  bar.style.boxShadow = `0 0 20px ${category.color}88`
  document.querySelector('#detail-note').innerHTML = category.id === 'reserve'
    ? `<strong>Rol recomandat:</strong> păstrăm acești ${category.count} oameni ca rezervă flexibilă. Îi mutăm numai unde apare presiune reală.`
    : `<strong>Structură:</strong> ${category.count} din ${totalSecondi} secondi sunt dedicați acestei categorii. În modelul 3D, fiecare om este reprezentat individual.`
  document.querySelector('#detail-panel').classList.add('open')

  categoryObjects.forEach(({ group, light }, key) => {
    const active = key === id
    group.scale.setScalar(active ? 1.08 : 1)
    light.intensity = active ? 12 : 6.0 + categoryObjects.get(key).category.count * 0.15
  })

  if (focusCamera) {
    const obj = categoryObjects.get(id).group
    const pos = obj.position.clone()
    const outward = pos.clone().normalize()
    targetCamera = {
      position: pos.clone().add(outward.multiplyScalar(6.8)).add(new THREE.Vector3(0, 5.8, 0)),
      target: pos.clone().add(new THREE.Vector3(0, 1.4, 0)),
    }
  }
}

function resetView() {
  selected = null
  document.querySelectorAll('.zone-button').forEach(el => el.classList.remove('active'))
  document.querySelector('#detail-panel').classList.remove('open')
  categoryObjects.forEach(({ group, light, category }) => {
    group.scale.setScalar(1)
    light.intensity = 6.0 + category.count * 0.15
  })
  targetCamera = { position: new THREE.Vector3(18, 16, 21), target: new THREE.Vector3(0, 1.2, 0) }
}

document.querySelector('#close-detail').addEventListener('click', () => document.querySelector('#detail-panel').classList.remove('open'))
document.querySelector('#reset-view').addEventListener('click', resetView)

function setPointer(event) {
  pointer.x = (event.clientX / innerWidth) * 2 - 1
  pointer.y = -(event.clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
}

renderer.domElement.addEventListener('pointermove', event => {
  setPointer(event)
  const hit = raycaster.intersectObjects(clickable, false)[0]
  renderer.domElement.style.cursor = hit ? 'pointer' : 'grab'
})

renderer.domElement.addEventListener('click', event => {
  setPointer(event)
  const hit = raycaster.intersectObjects(clickable, false)[0]
  if (hit) selectCategory(hit.object.userData.categoryId, false)
})

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
})

populateUI()

const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()
  core.rotation.y += 0.003
  core.position.y = 2.8 + Math.sin(elapsed * 1.1) * 0.06

  hub.children.forEach(object => {
    if (object.userData.spin) object.rotation.z += object.userData.spin * 6
  })

  categoryObjects.forEach(({ group, tower, halo }) => {
    group.children.forEach(object => {
      if (object.userData.spin) object.rotation.z += object.userData.spin
      if (object.userData.floatSeed !== undefined) object.position.y = 0.24 + Math.sin(elapsed * 1.8 + object.userData.floatSeed) * 0.025
    })
    halo.material.opacity = 0.62 + Math.sin(elapsed * 2.0 + group.position.x) * 0.18
    tower.material.emissiveIntensity = 0.28 + Math.sin(elapsed * 1.4 + group.position.z) * 0.08
  })

  if (targetCamera) {
    camera.position.lerp(targetCamera.position, 0.055)
    controls.target.lerp(targetCamera.target, 0.065)
    if (camera.position.distanceTo(targetCamera.position) < 0.05 && controls.target.distanceTo(targetCamera.target) < 0.05) targetCamera = null
  }

  controls.update()
  renderer.render(scene, camera)
}
animate()
