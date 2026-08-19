import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { secondiCategories, totalSecondi, globalMetrics } from './data.js'

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
scene.background = new THREE.Color(0x08111d)
scene.fog = new THREE.Fog(0x08111d, 58, 115)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 300)
camera.position.set(42, 31, 46)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.055
controls.minDistance = 14
controls.maxDistance = 95
controls.maxPolarAngle = Math.PI * 0.47
controls.target.set(0, 1.2, 0)

scene.add(new THREE.HemisphereLight(0xe6efff, 0x121923, 2.0))
const sun = new THREE.DirectionalLight(0xffffff, 4.1)
sun.position.set(22, 30, 18)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -50
sun.shadow.camera.right = 50
sun.shadow.camera.top = 50
sun.shadow.camera.bottom = -50
scene.add(sun)

function box(w, h, d, color, opts = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.58,
    metalness: opts.metalness ?? 0.1,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  })
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.castShadow = opts.castShadow ?? true
  mesh.receiveShadow = opts.receiveShadow ?? true
  return mesh
}

function textSprite(text, color = '#ffffff', small = false) {
  const c = document.createElement('canvas')
  c.width = small ? 700 : 900
  c.height = small ? 150 : 220
  const x = c.getContext('2d')
  x.clearRect(0, 0, c.width, c.height)
  x.fillStyle = small ? 'rgba(5,9,16,.74)' : 'rgba(5,9,16,.92)'
  x.roundRect(16, 16, c.width - 32, c.height - 32, small ? 22 : 34)
  x.fill()
  x.strokeStyle = color
  x.lineWidth = small ? 3 : 6
  x.stroke()
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillStyle = '#ffffff'
  x.font = small ? '700 42px Arial' : '900 70px Arial'
  x.fillText(text, c.width / 2, c.height / 2)
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(small ? 1.55 : 3.0, small ? 0.33 : 0.74, 1)
  return sprite
}

function createPerson(color) {
  const group = new THREE.Group()
  const torsoMat = new THREE.MeshStandardMaterial({ color, roughness: 0.52, emissive: new THREE.Color(color), emissiveIntensity: 0.1 })
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.68, 6, 10), torsoMat)
  torso.position.y = 0.86
  torso.castShadow = true
  group.add(torso)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd3a17c, roughness: 0.85 }))
  head.position.y = 1.58
  head.castShadow = true
  group.add(head)
  const legs = new THREE.MeshStandardMaterial({ color: 0x202a38, roughness: 0.72 })
  for (const lx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.48, 4, 8), legs)
    leg.position.set(lx, 0.28, 0)
    group.add(leg)
  }
  return group
}

function createDesk(color) {
  const desk = new THREE.Group()
  const top = box(1.45, 0.10, 0.74, 0x84705e, { roughness: 0.68, metalness: 0.04 })
  top.position.y = 0.76
  desk.add(top)
  for (const x of [-0.6, 0.6]) {
    const leg = box(0.08, 0.74, 0.08, 0x303b4b, { metalness: 0.5, roughness: 0.3 })
    leg.position.set(x, 0.38, 0)
    desk.add(leg)
  }
  const screen = box(0.6, 0.4, 0.04, color, { roughness: 0.18, metalness: 0.2 })
  screen.material.emissive = new THREE.Color(color)
  screen.material.emissiveIntensity = 0.72
  screen.position.set(0, 1.08, -0.08)
  desk.add(screen)
  return desk
}

const floor = box(66, 0.35, 32, 0x111a27, { roughness: 0.78, metalness: 0.06 })
floor.position.y = -0.18
scene.add(floor)
const carpet = box(63.6, 0.05, 29.8, 0x172334, { roughness: 0.94, metalness: 0 })
carpet.position.y = 0.025
scene.add(carpet)

const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x92c8ff, roughness: 0.12, metalness: 0.08, transmission: 0.5, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
for (const [w, h, d, x, y, z] of [[66,5.6,.08,0,2.8,-16],[66,5.6,.08,0,2.8,16],[.08,5.6,32,-33,2.8,0],[.08,5.6,32,33,2.8,0]]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat)
  wall.position.set(x, y, z)
  scene.add(wall)
}

for (let x = -28; x <= 28; x += 7) {
  for (let z = -11; z <= 11; z += 5.5) {
    const lamp = new THREE.PointLight(0xe5f0ff, 0.9, 9, 2)
    lamp.position.set(x, 5.2, z)
    scene.add(lamp)
  }
}

const categoryObjects = new Map()
const clickable = []
const zoneLayout = [-25, -12.5, 0, 12.5, 25]

function columnsFor(category) {
  if (category.id === 'red') return 3
  if (category.count >= 20) return 5
  if (category.count >= 12) return 4
  return 3
}

function addCategory(category, categoryIndex) {
  const cx = zoneLayout[categoryIndex]
  const cz = 0
  const color = new THREE.Color(category.color)
  const group = new THREE.Group()
  group.position.set(cx, 0, cz)
  group.userData.categoryId = category.id

  const columns = columnsFor(category)
  const rows = Math.ceil(category.count / columns)
  const colSpacing = 2.0
  const rowSpacing = 2.35
  const zoneW = Math.max(6.4, columns * colSpacing + 1.8)
  const zoneD = Math.max(6.8, rows * rowSpacing + 2.0)

  const zone = box(zoneW, 0.06, zoneD, color.clone().multiplyScalar(0.23), { roughness: 0.82, metalness: 0.08 })
  zone.position.y = 0.06
  zone.userData.categoryId = category.id
  group.add(zone)
  clickable.push(zone)

  const header = textSprite(`${category.name.toUpperCase()} • ${category.count} AGENTS`, category.color, false)
  header.position.set(0, 3.35, -zoneD / 2 + 0.2)
  group.add(header)

  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (i >= category.count) break
      const x = (col - (columns - 1) / 2) * colSpacing
      const z = (row - (rows - 1) / 2) * rowSpacing + 0.55
      const station = new THREE.Group()
      station.position.set(x, 0.08, z)

      const desk = createDesk(category.color)
      desk.position.set(0, 0, -0.45)
      station.add(desk)

      const person = createPerson(category.color)
      person.position.set(0, 0, 0.58)
      person.rotation.y = Math.PI
      station.add(person)

      const fallback = `${category.name} ${String(i + 1).padStart(2, '0')}`
      const personName = category.people?.[i] || fallback
      const nameTag = textSprite(personName, category.color, true)
      nameTag.position.set(0, 2.25, 0.64)
      station.add(nameTag)

      station.userData.categoryId = category.id
      station.userData.personName = personName
      group.add(station)
      i++
    }
  }

  const light = new THREE.PointLight(color, 4.0, 10, 2)
  light.position.set(0, 3.4, 0)
  group.add(light)

  scene.add(group)
  categoryObjects.set(category.id, { group, category, light })
}

secondiCategories.forEach(addCategory)

for (const [x,z] of [[-31,-14],[31,-14],[-31,14],[31,14],[-18,14],[18,14]]) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.35,.42,.55,20), new THREE.MeshStandardMaterial({color:0x6b4b35,roughness:.8}))
  pot.position.set(x,.3,z)
  scene.add(pot)
  const plant = new THREE.Mesh(new THREE.SphereGeometry(.6,14,10), new THREE.MeshStandardMaterial({color:0x2c7b50,roughness:.9}))
  plant.scale.set(.7,1.2,.7)
  plant.position.set(x,1,z)
  scene.add(plant)
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let targetCamera = null

function populateUI() {
  document.querySelector('#global-kpis').innerHTML = globalMetrics.map(([v,l]) => `<div class="kpi-card"><div class="kpi-value">${v}</div><div class="kpi-label">${l}</div></div>`).join('')
  document.querySelector('#zone-list').innerHTML = secondiCategories.map(category => `
    <button class="zone-button" data-zone="${category.id}" style="--zone-fade:${category.color}">
      <span class="zone-color" style="background:${category.color};box-shadow:0 0 18px ${category.color}88"></span>
      <span class="zone-copy"><span class="zone-name">${category.name}</span><span class="zone-meta">${category.action}</span></span>
      <span class="zone-count" style="color:${category.color}">${category.count}</span>
    </button>`).join('')
  document.querySelectorAll('[data-zone]').forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.zone, true)))
}

function selectCategory(id, focusCamera = true) {
  const category = secondiCategories.find(item => item.id === id)
  const obj = categoryObjects.get(id)
  if (!category || !obj) return
  const percent = Math.round((category.count / totalSecondi) * 100)
  document.querySelectorAll('.zone-button').forEach(el => el.classList.toggle('active', el.dataset.zone === id))
  document.querySelector('#detail-eyebrow').textContent = `${category.priority.toUpperCase()} • ${category.action.toUpperCase()}`
  document.querySelector('#detail-title').textContent = category.name
  document.querySelector('#detail-description').textContent = category.description
  document.querySelector('#detail-kpis').innerHTML = `<div class="detail-kpi"><strong>${category.count}</strong><span>agenți</span></div><div class="detail-kpi"><strong>${percent}%</strong><span>din total</span></div><div class="detail-kpi"><strong>Board</strong><span>grupare</span></div>`
  const bar = document.querySelector('#detail-bar')
  bar.style.width = `${Math.max(percent, 3)}%`
  bar.style.background = category.color
  bar.style.boxShadow = `0 0 20px ${category.color}88`
  const visibleNames = category.people.slice(0, 8).join(', ')
  document.querySelector('#detail-note').innerHTML = `<strong>Grup:</strong> ${visibleNames}${category.people.length > 8 ? '…' : ''}`
  document.querySelector('#detail-panel').classList.add('open')

  categoryObjects.forEach(({ group, light }, key) => {
    const active = key === id
    group.traverse(node => {
      if (node.material && 'opacity' in node.material) {
        node.material.transparent = true
        node.material.opacity = active ? 1 : 0.38
      }
    })
    light.intensity = active ? 7 : 1.4
  })

  if (focusCamera) {
    const pos = new THREE.Vector3()
    obj.group.getWorldPosition(pos)
    targetCamera = {
      pos: pos.clone().add(new THREE.Vector3(8.5, 9.0, 12)),
      target: pos.clone().add(new THREE.Vector3(0, 1.0, 0)),
    }
  }
}

function resetView() {
  targetCamera = { pos: new THREE.Vector3(42,31,46), target: new THREE.Vector3(0,1.2,0) }
  document.querySelector('#detail-panel').classList.remove('open')
  document.querySelectorAll('.zone-button').forEach(el => el.classList.remove('active'))
  categoryObjects.forEach(({ group, light }) => {
    group.traverse(node => { if (node.material && 'opacity' in node.material) node.material.opacity = 1 })
    light.intensity = 4.0
  })
}

renderer.domElement.addEventListener('pointermove', event => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1
  pointer.y = -(event.clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  renderer.domElement.style.cursor = raycaster.intersectObjects(clickable, false).length ? 'pointer' : 'grab'
})

renderer.domElement.addEventListener('click', event => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1
  pointer.y = -(event.clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(clickable, false)[0]
  if (hit?.object.userData.categoryId) selectCategory(hit.object.userData.categoryId, true)
})

document.querySelector('#reset-view')?.addEventListener('click', resetView)
document.querySelector('#close-detail')?.addEventListener('click', resetView)
populateUI()

function animate() {
  requestAnimationFrame(animate)
  if (targetCamera) {
    camera.position.lerp(targetCamera.pos, 0.055)
    controls.target.lerp(targetCamera.target, 0.065)
    if (camera.position.distanceTo(targetCamera.pos) < 0.06) targetCamera = null
  }
  controls.update()
  renderer.render(scene, camera)
}
animate()

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
