import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { businessFloors, teams, companySnapshot } from './data.js'

const $ = selector => document.querySelector(selector)
const mobile = window.matchMedia('(max-width: 760px)').matches
const lowMemory = Number(navigator.deviceMemory || 8) <= 4
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const state = {
  floorIndex: 0,
  autoTour: null,
  tweenFrame: 0,
  renderQueued: false,
  textOnly: new URLSearchParams(location.search).get('view') === 'text',
}

const ui = {
  canvas: $('#world'),
  fallback: $('#fallback'),
  floorList: $('#floor-list'),
  floorChips: $('#floor-chips'),
  floorNumber: $('#floor-number'),
  title: $('#floor-title'),
  subtitle: $('#floor-subtitle'),
  description: $('#floor-description'),
  metrics: $('#metrics'),
  workflow: $('#workflow'),
  actions: $('#actions'),
  roles: $('#roles'),
  apps: $('#apps'),
  roster: $('#roster'),
  status: $('#scene-status'),
  enter: $('#enter-floor'),
  previous: $('#previous-floor'),
  next: $('#next-floor'),
  overview: $('#tower-view'),
  tour: $('#auto-tour'),
  textToggle: $('#toggle-text'),
  infoToggle: $('#toggle-info'),
  infoPanel: $('#info-panel'),
  loading: $('#loading'),
  labelLayer: $('#world-labels'),
}

const renderer = new THREE.WebGLRenderer({
  canvas: ui.canvas,
  antialias: !mobile && !lowMemory,
  alpha: false,
  depth: true,
  stencil: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
})
renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25))
renderer.setSize(innerWidth, innerHeight, false)
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x07111d)
scene.add(new THREE.HemisphereLight(0xcce7ff, 0x111827, 1.55))
const keyLight = new THREE.DirectionalLight(0xffffff, 1.75)
keyLight.position.set(12, 28, 18)
scene.add(keyLight)

const floorHeight = 2.08
const towerWidth = 11.8
const towerDepth = 7.4
const towerHeight = (businessFloors.length - 1) * floorHeight

const camera = new THREE.PerspectiveCamera(mobile ? 48 : 42, innerWidth / innerHeight, 0.1, 180)
camera.position.set(22, towerHeight * 0.68 + 5, 28)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = false
controls.enablePan = false
controls.rotateSpeed = mobile ? 0.48 : 0.62
controls.zoomSpeed = 1.15
controls.minDistance = 9
controls.maxDistance = 66
controls.maxPolarAngle = Math.PI * 0.48
controls.target.set(0, towerHeight * 0.48, 0)
controls.addEventListener('change', requestRender)

const tower = new THREE.Group()
scene.add(tower)

const slabGeometry = new THREE.BoxGeometry(towerWidth, 0.3, towerDepth)
const floorMeshes = []
const floorLabels = []
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function colorValue(value) {
  try { return new THREE.Color(value) } catch { return new THREE.Color('#79d7ff') }
}

function buildTower() {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(towerWidth + 2.4, 0.6, towerDepth + 2.4),
    new THREE.MeshLambertMaterial({ color: 0x132238 }),
  )
  base.position.y = -0.46
  tower.add(base)

  const core = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, towerHeight + 3.6, 2.15),
    new THREE.MeshLambertMaterial({ color: 0x203954 }),
  )
  core.position.y = towerHeight / 2
  tower.add(core)

  businessFloors.forEach((floor, index) => {
    const color = colorValue(floor.color)
    const material = new THREE.MeshLambertMaterial({
      color: color.clone().multiplyScalar(0.58),
      emissive: color.clone().multiplyScalar(0.08),
      emissiveIntensity: 0.35,
    })
    const slab = new THREE.Mesh(slabGeometry, material)
    slab.position.y = index * floorHeight
    slab.userData.floorIndex = index
    tower.add(slab)
    floorMeshes.push(slab)

    const rail = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(towerWidth + 0.12, 1.65, towerDepth + 0.12)),
      new THREE.LineBasicMaterial({ color: color.clone().multiplyScalar(0.72), transparent: true, opacity: 0.52 }),
    )
    rail.position.y = index * floorHeight + 0.92
    tower.add(rail)

    const label = document.createElement('button')
    label.className = 'world-floor-label'
    label.dataset.floor = floor.id
    label.innerHTML = `<strong>${String(floor.number).padStart(2, '0')}</strong><span>${floor.short}</span>`
    label.addEventListener('click', () => selectFloor(index, true))
    ui.labelLayer.appendChild(label)
    floorLabels.push({ element: label, point: new THREE.Vector3(-towerWidth / 2 - 0.35, index * floorHeight + 0.55, 0) })
  })

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(towerWidth + 0.7, 0.25, towerDepth + 0.7),
    new THREE.MeshLambertMaterial({ color: 0x2c4c6b }),
  )
  roof.position.y = towerHeight + 1.75
  tower.add(roof)
}

const activeContent = new THREE.Group()
scene.add(activeContent)

const deskGeometry = new THREE.BoxGeometry(0.56, 0.06, 0.36)
const bodyGeometry = new THREE.CylinderGeometry(0.07, 0.1, 0.38, 5)
const headGeometry = new THREE.SphereGeometry(0.09, 5, 4)
const screenGeometry = new THREE.BoxGeometry(0.22, 0.15, 0.025)
const propGeometry = new THREE.BoxGeometry(0.55, 0.85, 0.35)
const bodyMaterial = new THREE.MeshLambertMaterial({ vertexColors: true })
const deskMaterial = new THREE.MeshLambertMaterial({ color: 0xb4c1d1 })
const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd2a17d })
const screenMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })

function clearContent() {
  while (activeContent.children.length) {
    const child = activeContent.children.pop()
    if (child.parent) child.parent.remove(child)
    if (child.geometry && ![deskGeometry, bodyGeometry, headGeometry, screenGeometry, propGeometry].includes(child.geometry)) child.geometry.dispose()
    if (child.material && ![bodyMaterial, deskMaterial, headMaterial, screenMaterial].includes(child.material)) {
      if (Array.isArray(child.material)) child.material.forEach(material => material.dispose())
      else child.material.dispose()
    }
  }
}

function personColorsForFloor(floor, count) {
  if (floor.id !== 'teams') return Array.from({ length: count }, () => colorValue(floor.color))
  const colors = []
  teams.forEach(team => {
    for (let index = 0; index < team.count; index += 1) colors.push(colorValue(team.color))
  })
  return colors.slice(0, count)
}

function addPeopleGrid(floor, count) {
  const columns = Math.min(floor.id === 'teams' ? 13 : 7, Math.max(1, Math.ceil(Math.sqrt(count * 1.55))))
  const rows = Math.ceil(count / columns)
  const spacingX = Math.min(0.82, (towerWidth - 1.4) / Math.max(columns, 1))
  const spacingZ = Math.min(0.93, (towerDepth - 1.3) / Math.max(rows, 1))
  const colors = personColorsForFloor(floor, count)

  const desks = new THREE.InstancedMesh(deskGeometry, deskMaterial, count)
  const bodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, count)
  const heads = new THREE.InstancedMesh(headGeometry, headMaterial, count)
  const screens = new THREE.InstancedMesh(screenGeometry, screenMaterial, count)
  const dummy = new THREE.Object3D()

  for (let index = 0; index < count; index += 1) {
    const col = index % columns
    const row = Math.floor(index / columns)
    const x = (col - (columns - 1) / 2) * spacingX
    const z = (row - (rows - 1) / 2) * spacingZ
    const color = colors[index] || colorValue(floor.color)

    dummy.position.set(x, 0.28, z)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    desks.setMatrixAt(index, dummy.matrix)

    dummy.position.set(x, 0.57, z + 0.2)
    dummy.updateMatrix()
    bodies.setMatrixAt(index, dummy.matrix)
    bodies.setColorAt(index, color)

    dummy.position.set(x, 0.84, z + 0.2)
    dummy.updateMatrix()
    heads.setMatrixAt(index, dummy.matrix)

    dummy.position.set(x, 0.52, z - 0.12)
    dummy.updateMatrix()
    screens.setMatrixAt(index, dummy.matrix)
    screens.setColorAt(index, color)
  }

  desks.instanceMatrix.needsUpdate = true
  bodies.instanceMatrix.needsUpdate = true
  heads.instanceMatrix.needsUpdate = true
  screens.instanceMatrix.needsUpdate = true
  if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true
  if (screens.instanceColor) screens.instanceColor.needsUpdate = true

  activeContent.add(desks, bodies, heads, screens)
}

function addSceneProps(floor) {
  const sceneType = floor.scene || floor.id
  let count = 4
  if (sceneType === 'database') count = 8
  if (sceneType === 'calls') count = 5
  if (sceneType === 'apps') count = 6
  if (sceneType === 'control') count = 7

  const material = new THREE.MeshLambertMaterial({ color: colorValue(floor.color).multiplyScalar(0.7) })
  const props = new THREE.InstancedMesh(propGeometry, material, count)
  const dummy = new THREE.Object3D()

  for (let index = 0; index < count; index += 1) {
    const x = ((index % 4) - 1.5) * 1.45
    const z = Math.floor(index / 4) * 1.35 - 2.2
    dummy.position.set(x, 0.56, z)
    dummy.scale.set(sceneType === 'database' ? 0.85 : 1, sceneType === 'calls' ? 0.7 : 1, 1)
    dummy.updateMatrix()
    props.setMatrixAt(index, dummy.matrix)
  }
  props.instanceMatrix.needsUpdate = true
  activeContent.add(props)
}

function rebuildFloorContent(floor) {
  clearContent()
  activeContent.position.y = (floor.number - 1) * floorHeight + 0.15
  const visiblePeople = Math.max(1, Number(floor.people || 8))
  addPeopleGrid(floor, visiblePeople)
  addSceneProps(floor)
}

function renderFloorButtons() {
  const markup = businessFloors.map((floor, index) => `
    <button class="floor-button" data-index="${index}" style="--floor:${floor.color}">
      <span>${String(floor.number).padStart(2, '0')}</span>
      <div><strong>${floor.short}</strong><small>${floor.subtitle}</small></div>
    </button>
  `).join('')
  ui.floorList.innerHTML = markup
  ui.floorChips.innerHTML = businessFloors.map((floor, index) => `
    <button data-index="${index}" title="${floor.title}">${String(floor.number).padStart(2, '0')}</button>
  `).join('')

  document.querySelectorAll('[data-index]').forEach(button => {
    button.addEventListener('click', () => selectFloor(Number(button.dataset.index), true))
  })
}

function chips(items = []) {
  return items.map(item => `<span>${item}</span>`).join('')
}

function updateInfo(floor) {
  ui.floorNumber.textContent = String(floor.number).padStart(2, '0')
  ui.title.textContent = floor.title
  ui.subtitle.textContent = floor.subtitle
  ui.description.textContent = floor.description
  ui.metrics.innerHTML = (floor.metrics || []).map(([value, label]) => `
    <div><strong>${value}</strong><span>${label}</span></div>
  `).join('')
  ui.workflow.innerHTML = (floor.workflow || []).map((step, index) => `
    <li><span>${index + 1}</span>${step}</li>
  `).join('')
  ui.actions.innerHTML = chips(floor.whatYouCanDo)
  ui.roles.innerHTML = chips(floor.roles)
  ui.apps.innerHTML = chips(floor.apps)

  if (floor.id === 'teams') {
    ui.roster.innerHTML = teams.map(team => `
      <section style="--team:${team.color}">
        <header><strong>${team.name}</strong><span>${team.count}</span></header>
        <p>${team.purpose}</p>
        <div>${team.people.map(person => `<b>${person}</b>`).join('')}</div>
      </section>
    `).join('')
  } else {
    ui.roster.innerHTML = `
      <section style="--team:${floor.color}">
        <header><strong>Ce înțelege vizitatorul</strong><span>${floor.people || 0}</span></header>
        <p>${floor.description}</p>
        <div>${(floor.roles || []).map(role => `<b>${role}</b>`).join('')}</div>
      </section>
    `
  }

  document.querySelectorAll('.floor-button').forEach((button, index) => button.classList.toggle('active', index === state.floorIndex))
  document.querySelectorAll('#floor-chips button').forEach((button, index) => button.classList.toggle('active', index === state.floorIndex))
}

function highlightFloor(index) {
  floorMeshes.forEach((mesh, meshIndex) => {
    const floor = businessFloors[meshIndex]
    const color = colorValue(floor.color)
    const active = meshIndex === index
    mesh.material.color.copy(color.clone().multiplyScalar(active ? 0.92 : 0.48))
    mesh.material.emissive.copy(color.clone().multiplyScalar(active ? 0.32 : 0.04))
    mesh.material.emissiveIntensity = active ? 0.85 : 0.25
    mesh.scale.set(active ? 1.045 : 1, active ? 1.12 : 1, active ? 1.045 : 1)
  })
}

function selectFloor(index, focus = false) {
  state.floorIndex = Math.max(0, Math.min(businessFloors.length - 1, index))
  const floor = businessFloors[state.floorIndex]
  updateInfo(floor)
  highlightFloor(state.floorIndex)
  rebuildFloorContent(floor)
  ui.status.textContent = `Etaj ${String(floor.number).padStart(2, '0')} activ • ${floor.people || 0} poziții reprezentate`
  if (focus && !state.textOnly) enterFloor()
  requestRender()
}

function easeInOut(value) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2
}

function tweenCamera(toPosition, toTarget, duration = reducedMotion ? 1 : 430) {
  cancelAnimationFrame(state.tweenFrame)
  const fromPosition = camera.position.clone()
  const fromTarget = controls.target.clone()
  const start = performance.now()
  controls.enabled = false

  function frame(now) {
    const progress = Math.min(1, (now - start) / Math.max(duration, 1))
    const eased = easeInOut(progress)
    camera.position.lerpVectors(fromPosition, toPosition, eased)
    controls.target.lerpVectors(fromTarget, toTarget, eased)
    controls.update()
    renderNow()
    if (progress < 1) state.tweenFrame = requestAnimationFrame(frame)
    else controls.enabled = true
  }
  state.tweenFrame = requestAnimationFrame(frame)
}

function enterFloor() {
  const y = state.floorIndex * floorHeight + 0.78
  const distance = mobile ? 14.5 : 13
  tweenCamera(new THREE.Vector3(distance, y + 4.3, distance), new THREE.Vector3(0, y, 0))
  if (mobile) ui.infoPanel.classList.add('compact')
}

function towerView() {
  tweenCamera(
    new THREE.Vector3(mobile ? 28 : 23, towerHeight * 0.67 + 5, mobile ? 34 : 29),
    new THREE.Vector3(0, towerHeight * 0.47, 0),
  )
}

function updateWorldLabels() {
  const width = innerWidth
  const height = innerHeight
  floorLabels.forEach(({ element, point }, index) => {
    const projected = point.clone().project(camera)
    const visible = projected.z > -1 && projected.z < 1 && !state.textOnly
    element.hidden = !visible
    if (!visible) return
    element.style.transform = `translate3d(${Math.round((projected.x * 0.5 + 0.5) * width)}px,${Math.round((-projected.y * 0.5 + 0.5) * height)}px,0) translate(-50%,-50%)`
    element.classList.toggle('active', index === state.floorIndex)
  })
}

function renderNow() {
  if (state.textOnly) return
  renderer.render(scene, camera)
  updateWorldLabels()
}

function requestRender() {
  if (state.renderQueued || state.textOnly) return
  state.renderQueued = true
  requestAnimationFrame(() => {
    state.renderQueued = false
    renderNow()
  })
}

function setTextOnly(enabled) {
  state.textOnly = enabled
  document.body.classList.toggle('text-only', enabled)
  ui.textToggle.textContent = enabled ? 'Pornește 3D' : 'Fără 3D'
  ui.status.textContent = enabled ? 'Mod instant fără 3D' : 'Mod 3D ultra-ușor'
  if (!enabled) {
    renderer.setSize(innerWidth, innerHeight, false)
    requestRender()
  }
}

function autoTour() {
  if (state.autoTour) {
    clearInterval(state.autoTour)
    state.autoTour = null
    ui.tour.textContent = 'Tur automat'
    return
  }
  ui.tour.textContent = 'Oprește turul'
  selectFloor(0, true)
  state.autoTour = setInterval(() => {
    const next = (state.floorIndex + 1) % businessFloors.length
    selectFloor(next, true)
  }, 4300)
}

function bindEvents() {
  ui.previous.addEventListener('click', () => selectFloor(state.floorIndex - 1, true))
  ui.next.addEventListener('click', () => selectFloor(state.floorIndex + 1, true))
  ui.enter.addEventListener('click', enterFloor)
  ui.overview.addEventListener('click', towerView)
  ui.tour.addEventListener('click', autoTour)
  ui.textToggle.addEventListener('click', () => setTextOnly(!state.textOnly))
  ui.infoToggle.addEventListener('click', () => ui.infoPanel.classList.toggle('compact'))

  renderer.domElement.addEventListener('pointerdown', event => {
    if (state.textOnly) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(floorMeshes, false)[0]
    if (hit) selectFloor(hit.object.userData.floorIndex, true)
  })

  window.addEventListener('keydown', event => {
    const tag = event.target?.tagName?.toLowerCase()
    if (['input', 'textarea', 'select'].includes(tag)) return
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') selectFloor(state.floorIndex + 1, true)
    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') selectFloor(state.floorIndex - 1, true)
    if (event.key === 'Enter' || event.code === 'Space') enterFloor()
    if (event.key.toLowerCase() === 'h') towerView()
  })

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25))
    renderer.setSize(innerWidth, innerHeight, false)
    requestRender()
  })
}

function populateSnapshot() {
  $('#snapshot').innerHTML = `
    <span><b>${companySnapshot.peopleModelled}</b> oameni</span>
    <span><b>${companySnapshot.verifiedPhoneRecords.toLocaleString('ro-RO')}</b> telefoane</span>
    <span><b>${companySnapshot.jobPostings}</b> joburi</span>
    <span><b>${companySnapshot.confirmedCompanies}</b> companii</span>
  `
}

buildTower()
renderFloorButtons()
populateSnapshot()
bindEvents()
selectFloor(0, false)
setTextOnly(state.textOnly)
towerView()

requestAnimationFrame(() => {
  ui.loading.classList.add('done')
  setTimeout(() => ui.loading.remove(), 260)
})
