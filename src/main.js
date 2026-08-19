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
renderer.toneMappingExposure = 1.22

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x07101a)
scene.fog = new THREE.Fog(0x07101a, 35, 68)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 180)
camera.position.set(25, 24, 29)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.055
controls.minDistance = 11
controls.maxDistance = 55
controls.maxPolarAngle = Math.PI * 0.47
controls.target.set(0, 1.1, 0)

scene.add(new THREE.HemisphereLight(0xdbe9ff, 0x131923, 2.15))
const sun = new THREE.DirectionalLight(0xffffff, 4.3)
sun.position.set(14, 24, 12)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -30
sun.shadow.camera.right = 30
sun.shadow.camera.top = 30
sun.shadow.camera.bottom = -30
scene.add(sun)

function box(w, h, d, color, opts = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.58,
    metalness: opts.metalness ?? 0.12,
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
  c.width = 512
  c.height = small ? 128 : 180
  const x = c.getContext('2d')
  x.clearRect(0, 0, c.width, c.height)
  x.fillStyle = small ? 'rgba(4,8,13,.78)' : 'rgba(4,8,13,.9)'
  x.roundRect(12, 12, 488, c.height - 24, small ? 22 : 28)
  x.fill()
  x.strokeStyle = color
  x.lineWidth = small ? 2 : 4
  x.stroke()
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillStyle = '#fff'
  x.font = small ? '700 40px Arial' : '800 56px Arial'
  x.fillText(text, 256, c.height / 2)
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(small ? 1.35 : 2.35, small ? 0.34 : 0.72, 1)
  return sprite
}

const floor = box(36, 0.35, 27, 0x111a27, { roughness: 0.75, metalness: 0.08 })
floor.position.y = -0.18
scene.add(floor)
const carpet = box(33.8, 0.05, 24.8, 0x172334, { roughness: 0.92, metalness: 0 })
carpet.position.y = 0.025
scene.add(carpet)

const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x92c8ff, roughness: 0.12, metalness: 0.08, transmission: 0.5, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
for (const [w, h, d, x, y, z] of [[36,5.4,.08,0,2.7,-13.5],[36,5.4,.08,0,2.7,13.5],[.08,5.4,27,-18,2.7,0],[.08,5.4,27,18,2.7,0]]) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat)
  wall.position.set(x, y, z)
  scene.add(wall)
}

for (let x = -15; x <= 15; x += 5) {
  const beam = box(0.12, 0.12, 25, 0x24344b, { metalness: 0.5, roughness: 0.35 })
  beam.position.set(x, 5.35, 0)
  scene.add(beam)
  for (let z = -10; z <= 10; z += 5) {
    const lamp = new THREE.PointLight(0xd7e7ff, 1.35, 7.5, 2)
    lamp.position.set(x, 5.05, z)
    scene.add(lamp)
  }
}

function createPerson(color) {
  const person = new THREE.Group()
  const bodyColor = new THREE.Color(color)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.68, 6, 10), new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5, emissive: bodyColor, emissiveIntensity: 0.12 }))
  torso.position.y = 0.86
  torso.castShadow = true
  person.add(torso)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd3a17c, roughness: 0.85 }))
  head.position.y = 1.58
  head.castShadow = true
  person.add(head)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x202a38, roughness: 0.72 })
  for (const lx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.48, 4, 8), legMat)
    leg.position.set(lx, 0.28, 0)
    person.add(leg)
  }
  return person
}

function createDesk(color) {
  const desk = new THREE.Group()
  const top = box(1.25, 0.10, 0.62, 0x7f6854, { roughness: 0.68, metalness: 0.04 })
  top.position.y = 0.76
  desk.add(top)
  for (const x of [-0.52, 0.52]) {
    const leg = box(0.08, 0.74, 0.08, 0x303b4b, { metalness: 0.5, roughness: 0.3 })
    leg.position.set(x, 0.38, 0)
    desk.add(leg)
  }
  const screen = box(0.54, 0.36, 0.035, color, { roughness: 0.18, metalness: 0.2 })
  screen.material.emissive = new THREE.Color(color)
  screen.material.emissiveIntensity = 0.7
  screen.position.set(0, 1.07, -0.05)
  desk.add(screen)
  return desk
}

const categoryObjects = new Map()
const clickable = []
const zoneLayout = [[-11.5,-7.5],[-3.7,-7.5],[4.1,-7.5],[11.6,-7.5],[-9.5,5.4],[0,5.4],[10.6,5.4]]

function addCategory(category, categoryIndex) {
  const [cx, cz] = zoneLayout[categoryIndex]
  const color = new THREE.Color(category.color)
  const group = new THREE.Group()
  group.position.set(cx, 0, cz)
  group.userData.categoryId = category.id
  const count = category.count
  const columns = count >= 18 ? 5 : count >= 10 ? 5 : count >= 5 ? 3 : Math.max(1, count)
  const rows = Math.ceil(count / columns)
  const zoneW = Math.max(4.4, columns * 1.35 + 0.9)
  const zoneD = Math.max(3.3, rows * 1.95 + 1.25)

  const zone = box(zoneW, 0.055, zoneD, color.clone().multiplyScalar(0.22), { roughness: 0.78, metalness: 0.12 })
  zone.position.y = 0.06
  zone.userData.categoryId = category.id
  group.add(zone)
  clickable.push(zone)

  const title = textSprite(`${category.name.toUpperCase()} • ${count}`, category.color, false)
  title.position.set(0, 2.95, -zoneD / 2 + 0.15)
  group.add(title)

  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (i >= count) break
      const x = (col - (columns - 1) / 2) * 1.32
      const z = (row - (rows - 1) / 2) * 1.9 + 0.35
      const station = new THREE.Group()
      station.position.set(x, 0.08, z)
      const desk = createDesk(category.color)
      desk.position.set(0, 0, -0.38)
      station.add(desk)
      const person = createPerson(category.color)
      person.position.set(0, 0, 0.48)
      person.rotation.y = Math.PI
      station.add(person)
      const fallback = `${category.name} ${String(i + 1).padStart(2, '0')}`
      const personName = category.people?.[i] || fallback
      const nameTag = textSprite(personName, category.color, true)
      nameTag.position.set(0, 2.05, 0.48)
      station.add(nameTag)
      station.userData.categoryId = category.id
      station.userData.personName = personName
      group.add(station)
      i++
    }
  }

  const light = new THREE.PointLight(color, 5.5, 7, 2)
  light.position.set(0, 3.1, 0)
  group.add(light)
  scene.add(group)
  categoryObjects.set(category.id, { group, category, light })
}

secondiCategories.forEach(addCategory)

const lounge = new THREE.Group()
const rug = box(6.6, 0.035, 4.2, 0x253247, { roughness: 0.95, metalness: 0 })
rug.position.y = 0.07
lounge.add(rug)
const table = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 48), new THREE.MeshStandardMaterial({ color: 0x9a7a58, roughness: 0.55 }))
table.position.y = 0.68
lounge.add(table)
for (let a = 0; a < 6; a++) {
  const chair = box(0.55, 0.55, 0.55, 0x35445a, { roughness: 0.7 })
  const angle = (a / 6) * Math.PI * 2
  chair.position.set(Math.cos(angle) * 1.65, 0.3, Math.sin(angle) * 1.65)
  lounge.add(chair)
}
scene.add(lounge)

for (const [x,z] of [[-16,-11],[16,-11],[-16,11],[16,11],[-16,0],[16,0]]) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.35,.42,.55,20), new THREE.MeshStandardMaterial({color:0x6b4b35,roughness:.8}))
  pot.position.set(x,.3,z); scene.add(pot)
  const plant = new THREE.Mesh(new THREE.SphereGeometry(.6,14,10), new THREE.MeshStandardMaterial({color:0x2c7b50,roughness:.9}))
  plant.scale.set(.7,1.2,.7); plant.position.set(x,1,z); scene.add(plant)
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
  document.querySelector('#detail-kpis').innerHTML = `<div class="detail-kpi"><strong>${category.count}</strong><span>oameni</span></div><div class="detail-kpi"><strong>${percent}%</strong><span>din total</span></div><div class="detail-kpi"><strong>Open</strong><span>spațiu comun</span></div>`
  const bar = document.querySelector('#detail-bar')
  bar.style.width = `${Math.max(percent, 3)}%`; bar.style.background = category.color; bar.style.boxShadow = `0 0 20px ${category.color}88`
  document.querySelector('#detail-note').innerHTML = `<strong>Vizibilitate:</strong> toți cei ${category.count} oameni sunt în aceeași hală open-space; etichetele mici de deasupra sunt pregătite pentru numele reale.`
  document.querySelector('#detail-panel').classList.add('open')
  categoryObjects.forEach(({ group, light }, key) => {
    const active = key === id
    group.traverse(node => { if (node.material && 'opacity' in node.material) { node.material.transparent = true; node.material.opacity = active ? 1 : .42 } })
    light.intensity = active ? 8 : 2.2
  })
  if (focusCamera) {
    const pos = new THREE.Vector3(); obj.group.getWorldPosition(pos)
    targetCamera = { pos: pos.clone().add(new THREE.Vector3(8.5,8.2,9.4)), target: pos.clone().add(new THREE.Vector3(0,.9,0)) }
  }
}

function resetView() {
  targetCamera = { pos: new THREE.Vector3(25,24,29), target: new THREE.Vector3(0,1.1,0) }
  document.querySelector('#detail-panel').classList.remove('open')
  document.querySelectorAll('.zone-button').forEach(el => el.classList.remove('active'))
  categoryObjects.forEach(({ group, light }) => {
    group.traverse(node => { if (node.material && 'opacity' in node.material) node.material.opacity = 1 })
    light.intensity = 5.5
  })
}

renderer.domElement.addEventListener('pointermove', event => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1; pointer.y = -(event.clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  renderer.domElement.style.cursor = raycaster.intersectObjects(clickable, false).length ? 'pointer' : 'grab'
})
renderer.domElement.addEventListener('click', event => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1; pointer.y = -(event.clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(clickable, false)[0]
  if (hit?.object.userData.categoryId) selectCategory(hit.object.userData.categoryId, true)
})
document.querySelector('#reset-view').addEventListener('click', resetView)
document.querySelector('#close-detail').addEventListener('click', resetView)
populateUI()

function animate() {
  requestAnimationFrame(animate)
  if (targetCamera) {
    camera.position.lerp(targetCamera.pos, .055); controls.target.lerp(targetCamera.target, .065)
    if (camera.position.distanceTo(targetCamera.pos) < .06) targetCamera = null
  }
  controls.update(); renderer.render(scene, camera)
}
animate()
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight) })
