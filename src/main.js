import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import {
  companySnapshot,
  teams,
  roles,
  apps,
  businessFloors,
  visitorMissions,
  glossary,
} from './data.js'

const $ = selector => document.querySelector(selector)
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

class BusinessTower3D {
  constructor(canvas, floors, teamsData) {
    this.canvas = canvas
    this.floors = floors
    this.teams = teamsData
    this.floorHeight = 4.65
    this.floorWidth = 26
    this.floorDepth = 18
    this.floorObjects = new Map()
    this.clickables = []
    this.animated = []
    this.currentFloorId = 'welcome'
    this.targetCamera = null
    this.onFloorSelected = null

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.05 : 1.4))
    this.renderer.setSize(innerWidth, innerHeight)
    this.renderer.shadowMap.enabled = innerWidth >= 760
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x030712)
    this.scene.fog = new THREE.FogExp2(0x030712, 0.012)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 320)
    this.camera.position.set(42, 32, 58)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.07
    this.controls.rotateSpeed = 0.58
    this.controls.zoomSpeed = 1.15
    this.controls.enablePan = false
    this.controls.minDistance = 8
    this.controls.maxDistance = 92
    this.controls.maxPolarAngle = Math.PI * 0.49
    this.controls.target.set(0, 20, 0)

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.buildLighting()
    this.buildCampus()
    this.buildTower()
    this.bindEvents()
    this.animate()
  }

  buildLighting() {
    this.scene.add(new THREE.HemisphereLight(0xddeaff, 0x070b15, 2.2))
    const sun = new THREE.DirectionalLight(0xffffff, 4.1)
    sun.position.set(28, 65, 30)
    sun.castShadow = innerWidth >= 760
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -45
    sun.shadow.camera.right = 45
    sun.shadow.camera.top = 65
    sun.shadow.camera.bottom = -20
    this.scene.add(sun)

    const fill = new THREE.DirectionalLight(0x8bbcff, 1.5)
    fill.position.set(-24, 35, 18)
    this.scene.add(fill)
  }

  material(color, options = {}) {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.58,
      metalness: options.metalness ?? 0.12,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
    })
    if (options.emissive) {
      material.emissive = new THREE.Color(options.emissive)
      material.emissiveIntensity = options.emissiveIntensity ?? 0.35
    }
    return material
  }

  box(width, height, depth, color, options = {}) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      this.material(color, options),
    )
    mesh.castShadow = options.castShadow ?? true
    mesh.receiveShadow = options.receiveShadow ?? true
    return mesh
  }

  cylinder(radiusTop, radiusBottom, height, color, options = {}) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, options.segments ?? 24),
      this.material(color, options),
    )
    mesh.castShadow = options.castShadow ?? true
    mesh.receiveShadow = options.receiveShadow ?? true
    return mesh
  }

  createSprite(title, subtitle, color, options = {}) {
    const small = options.small ?? false
    const width = small ? 720 : 1024
    const height = small ? 170 : 300
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = options.background ?? 'rgba(4,8,16,.88)'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(18, 18, width - 36, height - 36, small ? 28 : 42)
    else ctx.rect(18, 18, width - 36, height - 36)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = small ? 4 : 7
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.font = small ? '800 48px Arial' : '900 80px Arial'
    ctx.fillText(title, width / 2, subtitle ? height * 0.42 : height * 0.52)
    if (subtitle) {
      ctx.fillStyle = color
      ctx.font = small ? '700 30px Arial' : '800 43px Arial'
      ctx.fillText(subtitle, width / 2, height * 0.72)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
    sprite.scale.set(small ? 1.55 : 4.3, small ? 0.36 : 1.25, 1)
    return sprite
  }

  buildCampus() {
    const ground = this.box(92, 0.45, 76, 0x07101c, { roughness: 0.92, castShadow: false })
    ground.position.y = -0.42
    this.scene.add(ground)

    const plaza = this.box(44, 0.08, 32, 0x101d2c, { roughness: 0.8, metalness: 0.16, castShadow: false })
    plaza.position.set(0, -0.12, 5)
    this.scene.add(plaza)

    const road = this.box(88, 0.04, 8, 0x111a27, { roughness: 1, castShadow: false })
    road.position.set(0, -0.15, 27)
    this.scene.add(road)

    for (let x = -38; x <= 38; x += 8) {
      const marker = this.box(3.5, 0.02, 0.12, 0x8ca3c3, { emissive: 0x263d5c, emissiveIntensity: 0.6, castShadow: false })
      marker.position.set(x, -0.1, 27)
      this.scene.add(marker)
    }

    for (const x of [-34, -28, 28, 34]) {
      for (const z of [-10, 4, 18]) this.addTree(x, z)
    }

    const title = this.createSprite('RECRUITFLOW BUSINESS TOWER', '10 niveluri • sistem operațional 3D', '#79d7ff')
    title.scale.set(8.3, 2.35, 1)
    title.position.set(0, 4.2, 19.5)
    this.scene.add(title)

    const pipeline = ['SOURCING', 'DATA', 'MATCHING', 'CALLS', 'RESULT']
    pipeline.forEach((step, index) => {
      const x = (index - 2) * 5
      const node = this.cylinder(1.2, 1.35, 0.42, 0x17314d, { metalness: 0.45, roughness: 0.32 })
      node.position.set(x, 0.23, 10.5)
      this.scene.add(node)
      const tag = this.createSprite(step, '', index % 2 ? '#a78bfa' : '#79d7ff', { small: true })
      tag.scale.set(1.85, 0.42, 1)
      tag.position.set(x, 1.2, 10.5)
      this.scene.add(tag)
      if (index < pipeline.length - 1) {
        const beam = this.box(3.2, 0.07, 0.12, 0x4c87be, { emissive: 0x4c87be, emissiveIntensity: 1.2, transparent: true, opacity: 0.7 })
        beam.position.set(x + 2.5, 0.38, 10.5)
        this.scene.add(beam)
      }
    })
  }

  addTree(x, z) {
    const trunk = this.cylinder(0.12, 0.18, 1.7, 0x6f4b31, { roughness: 0.9 })
    trunk.position.set(x, 0.75, z)
    this.scene.add(trunk)
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 14, 10),
      this.material(0x2d8a62, { roughness: 0.9 }),
    )
    crown.scale.set(0.85, 1.35, 0.85)
    crown.position.set(x, 2.1, z)
    this.scene.add(crown)
  }

  buildTower() {
    const towerBase = this.box(29, 0.8, 21, 0x0c1624, { roughness: 0.55, metalness: 0.42 })
    towerBase.position.y = -0.05
    this.scene.add(towerBase)

    const core = this.box(3.1, this.floorHeight * 10 + 2, 4.2, 0x111e2e, { roughness: 0.35, metalness: 0.55 })
    core.position.set(-10.7, (this.floorHeight * 9) / 2 + 2.2, -6.3)
    this.scene.add(core)

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x92c8ff,
      roughness: 0.1,
      metalness: 0.08,
      transmission: 0.58,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    })

    const towerHeight = this.floorHeight * 10
    for (const x of [-13.1, 13.1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, towerHeight, this.floorDepth), glassMaterial)
      side.position.set(x, towerHeight / 2 - 0.1, 0)
      this.scene.add(side)
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(this.floorWidth, towerHeight, 0.1), glassMaterial)
    back.position.set(0, towerHeight / 2 - 0.1, -9)
    this.scene.add(back)

    for (const floor of this.floors) this.buildFloor(floor)

    const roof = this.box(28, 0.5, 20, 0x101c2b, { metalness: 0.5, roughness: 0.35 })
    roof.position.y = this.floorHeight * 10 - 0.1
    this.scene.add(roof)

    const beacon = this.cylinder(0.35, 0.65, 5.4, 0x79d7ff, {
      emissive: 0x79d7ff,
      emissiveIntensity: 2.1,
      transparent: true,
      opacity: 0.85,
    })
    beacon.position.set(0, this.floorHeight * 10 + 2.55, -1)
    this.scene.add(beacon)
    this.animated.push({ object: beacon, type: 'beacon' })

    for (const x of [-12.85, 12.85]) {
      const strip = this.box(0.12, towerHeight, 0.16, 0x79d7ff, {
        emissive: 0x79d7ff,
        emissiveIntensity: 1.15,
        transparent: true,
        opacity: 0.7,
      })
      strip.position.set(x, towerHeight / 2, 8.95)
      this.scene.add(strip)
    }
  }

  buildFloor(floor) {
    const y = (floor.number - 1) * this.floorHeight
    const group = new THREE.Group()
    group.position.y = y
    group.userData.floorId = floor.id

    const slab = this.box(this.floorWidth, 0.24, this.floorDepth, 0x162437, {
      roughness: 0.72,
      metalness: 0.2,
    })
    slab.position.y = 0.05
    slab.userData.floorId = floor.id
    group.add(slab)
    this.clickables.push(slab)

    const carpet = this.box(this.floorWidth - 1, 0.035, this.floorDepth - 1, floor.color, {
      roughness: 0.96,
      metalness: 0,
      transparent: true,
      opacity: 0.14,
      castShadow: false,
    })
    carpet.position.y = 0.19
    group.add(carpet)

    const ceiling = this.box(this.floorWidth, 0.18, this.floorDepth, 0x132033, {
      roughness: 0.66,
      metalness: 0.22,
    })
    ceiling.position.y = this.floorHeight - 0.18
    group.add(ceiling)

    for (const x of [-9, -4.5, 0, 4.5, 9]) {
      const lamp = this.box(2.2, 0.045, 0.65, 0xffffff, {
        emissive: floor.color,
        emissiveIntensity: 0.4,
        roughness: 0.18,
        castShadow: false,
      })
      lamp.position.set(x, this.floorHeight - 0.32, -1.5)
      group.add(lamp)
    }

    const floorSign = this.createSprite(`F${String(floor.number).padStart(2, '0')} • ${floor.short.toUpperCase()}`, floor.subtitle, floor.color)
    floorSign.scale.set(4.2, 1.16, 1)
    floorSign.position.set(0, 3.65, -8.65)
    group.add(floorSign)

    const numberPylon = this.box(1.1, 2.5, 0.28, 0x07101a, { metalness: 0.55, roughness: 0.28 })
    numberPylon.position.set(11.75, 1.48, 8.65)
    group.add(numberPylon)
    const numberTag = this.createSprite(String(floor.number).padStart(2, '0'), '', floor.color, { small: true })
    numberTag.scale.set(1.1, 0.28, 1)
    numberTag.position.set(11.75, 1.55, 8.82)
    group.add(numberTag)

    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(this.floorWidth - 0.5, 3.8, this.floorDepth - 0.5),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    hit.position.y = 2
    hit.userData.floorId = floor.id
    group.add(hit)
    this.clickables.push(hit)

    const light = new THREE.PointLight(floor.color, 2.5, 18, 2)
    light.position.set(0, 3.8, 1)
    group.add(light)

    const content = new THREE.Group()
    content.position.y = 0.22
    group.add(content)
    this.buildFloorScene(content, floor)

    this.scene.add(group)
    this.floorObjects.set(floor.id, { group, slab, carpet, light, content, floor })
  }

  buildFloorScene(group, floor) {
    switch (floor.scene) {
      case 'reception': this.buildReception(group, floor); break
      case 'teams': this.buildTeams(group, floor); break
      case 'calls': this.buildCalls(group, floor); break
      case 'apps': this.buildApps(group, floor); break
      case 'database': this.buildDatabase(group, floor); break
      case 'jobs': this.buildJobs(group, floor); break
      case 'companies': this.buildCompanies(group, floor); break
      case 'education': this.buildEducation(group, floor); break
      case 'sourcing': this.buildSourcing(group, floor); break
      case 'management': this.buildManagement(group, floor); break
      default: this.addGenericStaff(group, floor, floor.people)
    }
    this.addMetricWall(group, floor)
  }

  createAvatar(color, scale = 1, badge = '') {
    const group = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.14 * scale, 0.36 * scale, 4, 8),
      this.material(color, { roughness: 0.62, emissive: color, emissiveIntensity: 0.08 }),
    )
    body.position.y = 0.58 * scale
    group.add(body)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.145 * scale, 10, 8),
      this.material(0xd4a27d, { roughness: 0.9 }),
    )
    head.position.y = 0.97 * scale
    group.add(head)
    for (const x of [-0.075, 0.075]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.045 * scale, 0.25 * scale, 3, 6),
        this.material(0x202a38, { roughness: 0.78 }),
      )
      leg.position.set(x * scale, 0.2 * scale, 0)
      group.add(leg)
    }
    if (badge) {
      const tag = this.createSprite(badge, '', color, { small: true })
      tag.scale.set(0.82 * scale, 0.19 * scale, 1)
      tag.position.set(0, 1.36 * scale, 0)
      group.add(tag)
    }
    return group
  }

  createDesk(color = '#79d7ff', compact = false) {
    const group = new THREE.Group()
    const width = compact ? 0.8 : 1.15
    const top = this.box(width, 0.07, compact ? 0.42 : 0.55, 0xdbe3ef, { roughness: 0.75, metalness: 0.04 })
    top.position.y = 0.65
    group.add(top)
    for (const x of [-width * 0.38, width * 0.38]) {
      const leg = this.box(0.045, 0.62, 0.045, 0x65758a, { metalness: 0.38, roughness: 0.35 })
      leg.position.set(x, 0.31, 0)
      group.add(leg)
    }
    const monitor = this.box(compact ? 0.31 : 0.42, compact ? 0.2 : 0.28, 0.03, 0x101722, {
      emissive: color,
      emissiveIntensity: 0.45,
      roughness: 0.16,
    })
    monitor.position.set(0, 0.87, -0.05)
    group.add(monitor)
    return group
  }

  createWorkstation(color, badge, compact = false) {
    const group = new THREE.Group()
    group.add(this.createDesk(color, compact))
    const avatar = this.createAvatar(color, compact ? 0.72 : 0.85, badge)
    avatar.position.set(0, 0.03, compact ? 0.31 : 0.38)
    avatar.rotation.y = Math.PI
    group.add(avatar)
    return group
  }

  addGenericStaff(group, floor, count) {
    const columns = Math.min(8, Math.ceil(Math.sqrt(count * 1.5)))
    const rows = Math.ceil(count / columns)
    const sx = 2.25
    const sz = 2.05
    const totalW = (columns - 1) * sx
    const totalD = (rows - 1) * sz
    for (let index = 0; index < count; index++) {
      const station = this.createWorkstation(floor.color, `${floor.short.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(2, '0')}`, count > 18)
      station.position.set((index % columns) * sx - totalW / 2, 0, Math.floor(index / columns) * sz - totalD / 2 + 0.8)
      group.add(station)
    }
  }

  buildReception(group, floor) {
    const desk = this.box(8.4, 1.05, 1.25, 0x132d46, { metalness: 0.36, roughness: 0.32 })
    desk.position.set(0, 0.55, 2.8)
    group.add(desk)
    const face = this.box(7.8, 0.62, 0.06, 0x79d7ff, { emissive: 0x79d7ff, emissiveIntensity: 0.75, transparent: true, opacity: 0.75 })
    face.position.set(0, 0.58, 3.44)
    group.add(face)

    for (const x of [-2.6, 0, 2.6]) {
      const avatar = this.createAvatar(floor.color, 1, x === 0 ? 'WELCOME' : `GUIDE ${x < 0 ? 'A' : 'B'}`)
      avatar.position.set(x, 0.1, 2)
      group.add(avatar)
    }

    const nodes = [
      ['WORKERS', '#52e0ba'], ['JOBS', '#ffd166'], ['CALLS', '#ff9f6e'], ['COMPANIES', '#4cc9f0'], ['CONTROL', '#a7f3d0'],
    ]
    nodes.forEach(([name, color], index) => {
      const angle = (index / nodes.length) * Math.PI * 2
      const x = Math.cos(angle) * 5.3
      const z = Math.sin(angle) * 3.1 - 1.4
      const pedestal = this.cylinder(0.75, 0.9, 0.32, color, { metalness: 0.5, roughness: 0.3, emissive: color, emissiveIntensity: 0.25 })
      pedestal.position.set(x, 0.18, z)
      group.add(pedestal)
      const tag = this.createSprite(name, '', color, { small: true })
      tag.scale.set(1.25, 0.28, 1)
      tag.position.set(x, 1.05, z)
      group.add(tag)
    })
  }

  buildTeams(group) {
    const layouts = {
      yellow: [-7.2, -3.7, 5, 1.18, 1.18],
      blue: [6.7, -3.7, 5, 1.18, 1.18],
      posting: [-5.6, 4.6, 5, 1.18, 1.18],
      classic: [4.8, 4.5, 4, 1.25, 1.25],
      red: [9.1, 4.9, 3, 1.2, 1.2],
    }
    for (const team of this.teams) {
      const [originX, originZ, columns, sx, sz] = layouts[team.id]
      const zone = new THREE.Group()
      zone.position.set(originX, 0, originZ)
      const rows = Math.ceil(team.count / columns)
      const activeColumns = Math.min(columns, team.count)
      const width = (activeColumns - 1) * sx + 1.4
      const depth = (rows - 1) * sz + 1.5
      const pad = this.box(width, 0.025, depth, team.accent, { transparent: true, opacity: 0.55, roughness: 0.98, castShadow: false })
      pad.position.y = 0.02
      zone.add(pad)
      const sign = this.createSprite(team.name.toUpperCase(), `${team.count} locuri`, team.color, { small: true })
      sign.scale.set(1.65, 0.38, 1)
      sign.position.set(0, 2.1, -depth / 2 + 0.1)
      zone.add(sign)
      const totalW = (activeColumns - 1) * sx
      const totalD = (rows - 1) * sz
      team.people.forEach((agentId, index) => {
        const avatar = this.createAvatar(team.color, 0.58, agentId)
        avatar.position.set((index % columns) * sx - totalW / 2, 0.05, Math.floor(index / columns) * sz - totalD / 2)
        zone.add(avatar)
      })
      group.add(zone)
    }
  }

  buildCalls(group, floor) {
    const colors = ['#ffd21f', '#3b82f6', '#ff4d68', '#a855f7', '#20c7aa']
    const names = ['YELLOW', 'BLUE', 'RED', 'POSTING', 'CLASSIC']
    const positions = [[-7.2, -3.2], [0, -3.2], [7.2, -3.2], [-3.6, 3.8], [3.6, 3.8]]
    positions.forEach(([x, z], index) => {
      const pod = new THREE.Group()
      pod.position.set(x, 0, z)
      const pad = this.box(5.7, 0.03, 4.2, colors[index], { transparent: true, opacity: 0.18, castShadow: false })
      pad.position.y = 0.02
      pod.add(pad)
      const wall = this.box(5.1, 1.7, 0.18, 0x0e1725, { metalness: 0.4, roughness: 0.25 })
      wall.position.set(0, 2.4, -1.75)
      pod.add(wall)
      const screen = this.box(4.6, 1.25, 0.04, 0x111827, { emissive: colors[index], emissiveIntensity: 0.32 })
      screen.position.set(0, 2.4, -1.63)
      pod.add(screen)
      const tag = this.createSprite(names[index], 'recording • transcript • summary', colors[index], { small: true })
      tag.scale.set(2.6, 0.6, 1)
      tag.position.set(0, 2.4, -1.55)
      pod.add(tag)
      for (const dx of [-1.35, 0, 1.35]) {
        const station = this.createWorkstation(colors[index], '', true)
        station.position.set(dx, 0, 0.65)
        pod.add(station)
      }
      group.add(pod)
    })

    for (let index = 0; index < 18; index++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), this.material(floor.color, { emissive: floor.color, emissiveIntensity: 1.5 }))
      dot.position.set(-8 + (index % 9) * 2, 3.6 + Math.floor(index / 9) * 0.35, -0.2)
      group.add(dot)
      this.animated.push({ object: dot, type: 'wave', seed: index })
    }
  }

  buildApps(group) {
    const items = apps.filter(app => ['blue', 'yellow', 'red', 'iza', 'jobboard'].includes(app.id))
    const positions = [[-7.5, -3.5], [0, -3.5], [7.5, -3.5], [-3.8, 4.2], [3.8, 4.2]]
    const colors = ['#3b82f6', '#ffd21f', '#ff4d68', '#b98cff', '#ffd166']
    items.forEach((app, index) => {
      const [x, z] = positions[index]
      const kiosk = new THREE.Group()
      kiosk.position.set(x, 0, z)
      const base = this.cylinder(1.45, 1.65, 0.32, colors[index], { metalness: 0.55, roughness: 0.25, emissive: colors[index], emissiveIntensity: 0.2 })
      base.position.y = 0.16
      kiosk.add(base)
      const tower = this.box(2.6, 2.15, 0.28, 0x0f1826, { metalness: 0.4, roughness: 0.22 })
      tower.position.y = 1.45
      kiosk.add(tower)
      const display = this.box(2.25, 1.72, 0.04, 0x111827, { emissive: colors[index], emissiveIntensity: 0.34 })
      display.position.set(0, 1.45, 0.17)
      kiosk.add(display)
      const tag = this.createSprite(app.name.toUpperCase(), app.description, colors[index], { small: true })
      tag.scale.set(2.25, 0.52, 1)
      tag.position.set(0, 1.45, 0.22)
      kiosk.add(tag)
      group.add(kiosk)
    })
  }

  buildDatabase(group, floor) {
    for (let row = 0; row < 2; row++) {
      for (let column = 0; column < 6; column++) {
        const rack = new THREE.Group()
        rack.position.set(-8.5 + column * 3.4, 0, -3.1 + row * 6.1)
        const frame = this.box(1.6, 2.9, 1.05, 0x111a27, { metalness: 0.65, roughness: 0.24 })
        frame.position.y = 1.45
        rack.add(frame)
        for (let slot = 0; slot < 7; slot++) {
          const unit = this.box(1.35, 0.23, 0.08, 0x1d3043, { emissive: slot % 2 ? floor.color : 0x3b82f6, emissiveIntensity: 0.42 })
          unit.position.set(0, 0.42 + slot * 0.34, 0.57)
          rack.add(unit)
        }
        group.add(rack)
      }
    }
    const pipeline = ['IMPORT', 'PHONE', 'DEDUPE', 'POSTCODE', 'TRADE', 'CURATED']
    pipeline.forEach((step, index) => {
      const x = -9 + index * 3.6
      const node = this.cylinder(0.55, 0.65, 0.22, floor.color, { emissive: floor.color, emissiveIntensity: 0.5, metalness: 0.5 })
      node.position.set(x, 0.2, 0)
      group.add(node)
      const tag = this.createSprite(step, '', floor.color, { small: true })
      tag.scale.set(1.05, 0.24, 1)
      tag.position.set(x, 0.92, 0)
      group.add(tag)
    })
  }

  buildJobs(group, floor) {
    const board = this.box(10.8, 3.0, 0.22, 0x101927, { metalness: 0.4, roughness: 0.26 })
    board.position.set(0, 2.1, -6.8)
    group.add(board)
    const lanes = ['NEW', 'MATCHING', 'CLAIMED', 'WORKER FOUND', 'FILLED']
    lanes.forEach((lane, index) => {
      const x = -4.25 + index * 2.1
      const panel = this.box(1.75, 2.45, 0.04, 0x172436, { emissive: index === 4 ? 0x52e0ba : floor.color, emissiveIntensity: 0.18 })
      panel.position.set(x, 2.1, -6.65)
      group.add(panel)
      const tag = this.createSprite(lane, '', index === 4 ? '#52e0ba' : floor.color, { small: true })
      tag.scale.set(1.25, 0.27, 1)
      tag.position.set(x, 3.05, -6.55)
      group.add(tag)
      for (let card = 0; card < 3; card++) {
        const job = this.box(1.3, 0.3, 0.035, card % 2 ? 0x2b3e56 : 0x344a64, { emissive: floor.color, emissiveIntensity: 0.08 })
        job.position.set(x, 1.2 + card * 0.55, -6.57)
        group.add(job)
      }
    })
    this.addGenericStaff(group, floor, 12)
  }

  buildCompanies(group, floor) {
    const skylineX = [-9, -6.5, -4, -1.5, 1.5, 4, 6.5, 9]
    skylineX.forEach((x, index) => {
      const height = 1.6 + (index % 4) * 0.55
      const building = this.box(1.65, height, 1.65, index % 2 ? 0x16314a : 0x1d3a55, { metalness: 0.4, roughness: 0.35, emissive: floor.color, emissiveIntensity: 0.06 })
      building.position.set(x, height / 2, -5.6)
      group.add(building)
      for (let row = 0; row < 3; row++) {
        const light = this.box(1.1, 0.1, 0.03, floor.color, { emissive: floor.color, emissiveIntensity: 0.6 })
        light.position.set(x, 0.55 + row * 0.48, -4.75)
        group.add(light)
      }
    })
    const stages = ['PROSPECT', 'FIRST CALL', 'NEED', 'JOB', 'RECOVERY']
    stages.forEach((stage, index) => {
      const x = -7.6 + index * 3.8
      const desk = this.createWorkstation(floor.color, `F-${String(index + 1).padStart(2, '0')}`)
      desk.position.set(x, 0, 3)
      group.add(desk)
      const tag = this.createSprite(stage, '', floor.color, { small: true })
      tag.scale.set(1.4, 0.31, 1)
      tag.position.set(x, 2.15, 3)
      group.add(tag)
    })
  }

  buildEducation(group, floor) {
    const screen = this.box(12, 3.1, 0.22, 0x101927, { metalness: 0.4, roughness: 0.25 })
    screen.position.set(0, 2.2, -6.6)
    group.add(screen)
    const display = this.box(11.4, 2.5, 0.04, 0x111827, { emissive: floor.color, emissiveIntensity: 0.23 })
    display.position.set(0, 2.2, -6.45)
    group.add(display)
    const tag = this.createSprite('ONBOARDING ACADEMY', 'Orientare → practică → QA → producție', floor.color)
    tag.scale.set(5.6, 1.45, 1)
    tag.position.set(0, 2.2, -6.35)
    group.add(tag)
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 6; column++) {
        const x = -6.25 + column * 2.5
        const z = -1.7 + row * 2.6
        const chair = this.box(0.75, 0.62, 0.75, 0x263a55, { roughness: 0.78 })
        chair.position.set(x, 0.35, z)
        group.add(chair)
        if (row * 6 + column < 10) {
          const avatar = this.createAvatar(floor.color, 0.72, `N-${String(row * 6 + column + 1).padStart(2, '0')}`)
          avatar.position.set(x, 0.05, z - 0.18)
          avatar.rotation.y = Math.PI
          group.add(avatar)
        }
      }
    }
  }

  buildSourcing(group, floor) {
    const map = this.cylinder(4.2, 4.2, 0.18, 0x17324a, { metalness: 0.35, roughness: 0.4 })
    map.position.set(0, 0.12, -0.5)
    group.add(map)
    const communities = [
      ['RO', -2.4, -0.5], ['PL', -0.8, -2.2], ['BG', 1.4, -1.8], ['AL', 2.6, 0.2], ['UA', 0.8, 2.1], ['AF', -1.6, 1.8],
    ]
    communities.forEach(([name, x, z], index) => {
      const node = this.cylinder(0.42, 0.5, 0.28, index % 2 ? floor.color : 0xffd166, { emissive: index % 2 ? floor.color : 0xffd166, emissiveIntensity: 0.5, metalness: 0.5 })
      node.position.set(x, 0.36, z - 0.5)
      group.add(node)
      const tag = this.createSprite(name, '', floor.color, { small: true })
      tag.scale.set(0.7, 0.16, 1)
      tag.position.set(x, 0.95, z - 0.5)
      group.add(tag)
    })
    const trades = ['LAB', 'CARP', 'DRY', 'PAINT', 'ELEC', 'PLUMB', 'BRICK', 'GROUND', 'FIRE', 'PLANT']
    trades.forEach((trade, index) => {
      const angle = (index / trades.length) * Math.PI * 2
      const x = Math.cos(angle) * 7.7
      const z = Math.sin(angle) * 6.1
      const tag = this.createSprite(trade, '', index % 2 ? '#ffd166' : floor.color, { small: true })
      tag.scale.set(0.9, 0.2, 1)
      tag.position.set(x, 1.05, z)
      group.add(tag)
      const avatar = this.createAvatar(index % 2 ? '#ffd166' : floor.color, 0.62, '')
      avatar.position.set(x, 0.05, z)
      group.add(avatar)
    })
  }

  buildManagement(group, floor) {
    const wall = this.box(20.5, 3.2, 0.22, 0x0d1724, { metalness: 0.52, roughness: 0.22 })
    wall.position.set(0, 2.35, -6.8)
    group.add(wall)
    const cards = [
      ['PEOPLE', '78'], ['DATA', '71,779'], ['JOBS', '109'], ['COMPANIES', '25'], ['OFFERS', '22'],
    ]
    cards.forEach(([name, value], index) => {
      const x = -8.4 + index * 4.2
      const panel = this.box(3.5, 2.45, 0.04, 0x142237, { emissive: index % 2 ? floor.color : 0x79d7ff, emissiveIntensity: 0.18 })
      panel.position.set(x, 2.35, -6.65)
      group.add(panel)
      const tag = this.createSprite(value, name, index % 2 ? floor.color : '#79d7ff', { small: true })
      tag.scale.set(2.15, 0.5, 1)
      tag.position.set(x, 2.35, -6.55)
      group.add(tag)
    })

    const risks = [['DUPLICATES', '#ff6b6b'], ['MISSING DATA', '#ffd166'], ['SYNC', '#79d7ff'], ['PIPELINE AI', '#b98cff']]
    risks.forEach(([name, color], index) => {
      const x = -7.2 + index * 4.8
      const tower = this.cylinder(0.8, 1, 1.3 + index * 0.28, color, { emissive: color, emissiveIntensity: 0.33, metalness: 0.45 })
      tower.position.set(x, tower.geometry.parameters.height / 2, 2.7)
      group.add(tower)
      const tag = this.createSprite(name, '', color, { small: true })
      tag.scale.set(1.35, 0.3, 1)
      tag.position.set(x, 2.3 + index * 0.28, 2.7)
      group.add(tag)
    })

    const table = this.cylinder(3.5, 3.5, 0.16, 0x1b2c40, { metalness: 0.45, roughness: 0.35 })
    table.position.set(0, 0.75, 6)
    group.add(table)
    for (let index = 0; index < 8; index++) {
      const angle = (index / 8) * Math.PI * 2
      const avatar = this.createAvatar(floor.color, 0.75, `M-${index + 1}`)
      avatar.position.set(Math.cos(angle) * 4.6, 0.03, 6 + Math.sin(angle) * 3.3)
      avatar.rotation.y = -angle + Math.PI / 2
      group.add(avatar)
    }
  }

  addMetricWall(group, floor) {
    const wall = this.box(4.25, 3.1, 0.18, 0x0b1422, { metalness: 0.42, roughness: 0.24 })
    wall.position.set(-10.7, 2.2, 5.7)
    group.add(wall)
    floor.metrics.slice(0, 4).forEach(([value, label], index) => {
      const y = 3.25 - index * 0.7
      const barWidth = 0.8 + (index + 1) * 0.62
      const bar = this.box(barWidth, 0.16, 0.04, floor.color, { emissive: floor.color, emissiveIntensity: 0.45 })
      bar.position.set(-11.4 + barWidth / 2, y, 5.82)
      group.add(bar)
      const tag = this.createSprite(`${value} • ${label}`, '', floor.color, { small: true })
      tag.scale.set(1.75, 0.4, 1)
      tag.position.set(-10.7, y + 0.26, 5.88)
      group.add(tag)
    })
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', event => {
      const rect = this.canvas.getBoundingClientRect()
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const hit = this.raycaster.intersectObjects(this.clickables, true)[0]
      if (!hit) return
      const floorId = hit.object.userData.floorId
      if (floorId && this.onFloorSelected) this.onFloorSelected(floorId)
    })

    window.addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(innerWidth, innerHeight)
    })
  }

  focusFloor(floorId, instant = false) {
    const record = this.floorObjects.get(floorId)
    if (!record) return
    this.currentFloorId = floorId
    const y = record.group.position.y
    const narrow = innerWidth < 700
    const position = new THREE.Vector3(narrow ? 30 : 25, y + (narrow ? 8 : 7), narrow ? 31 : 24)
    const target = new THREE.Vector3(0, y + 1.8, 0)
    if (instant) {
      this.camera.position.copy(position)
      this.controls.target.copy(target)
    } else {
      this.targetCamera = { position, target }
    }
    this.updateHighlight()
  }

  towerView() {
    this.targetCamera = {
      position: new THREE.Vector3(innerWidth < 700 ? 52 : 42, 32, innerWidth < 700 ? 72 : 58),
      target: new THREE.Vector3(0, 21, 0),
    }
  }

  updateHighlight() {
    this.floorObjects.forEach((record, id) => {
      const active = id === this.currentFloorId
      record.light.intensity = active ? 7.5 : 1.45
      record.carpet.material.opacity = active ? 0.54 : 0.11
      record.content.visible = active || innerWidth >= 760
      record.group.traverse(object => {
        if (object.isSprite) object.visible = active || object.position.z < -8
      })
    })
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    const time = performance.now() * 0.001
    for (const item of this.animated) {
      if (item.type === 'beacon') {
        item.object.material.emissiveIntensity = 1.6 + Math.sin(time * 2.2) * 0.7
        item.object.rotation.y += 0.004
      } else if (item.type === 'wave') {
        item.object.position.y += Math.sin(time * 3 + item.seed) * 0.0008
        item.object.material.emissiveIntensity = 0.8 + Math.sin(time * 4 + item.seed) * 0.5
      }
    }
    if (this.targetCamera) {
      this.camera.position.lerp(this.targetCamera.position, 0.075)
      this.controls.target.lerp(this.targetCamera.target, 0.075)
      if (
        this.camera.position.distanceTo(this.targetCamera.position) < 0.05 &&
        this.controls.target.distanceTo(this.targetCamera.target) < 0.05
      ) this.targetCamera = null
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}

const ui = {
  floorList: $('#floor-list'),
  floorProgress: $('#floor-progress'),
  detail: $('#floor-detail'),
  detailEyebrow: $('#detail-eyebrow'),
  detailTitle: $('#detail-title'),
  detailSubtitle: $('#detail-subtitle'),
  detailDescription: $('#detail-description'),
  detailMetrics: $('#detail-metrics'),
  workflow: $('#workflow-steps'),
  canDo: $('#what-you-can-do'),
  floorRoles: $('#floor-roles'),
  floorApps: $('#floor-apps'),
  missionList: $('#mission-list'),
  missionBar: $('#mission-progress-bar'),
  visitorLevel: $('#visitor-level'),
  visitorXp: $('#visitor-xp'),
  consoleNumber: $('#console-number'),
  consoleTitle: $('#console-title'),
  consoleStatus: $('#console-status'),
  consoleMeter: $('#console-meter-bar'),
  tourButton: $('#tour-toggle'),
  drawer: $('#drawer'),
  drawerBackdrop: $('#drawer-backdrop'),
  drawerContent: $('#drawer-content'),
  drawerEyebrow: $('#drawer-eyebrow'),
  drawerTitle: $('#drawer-title'),
}

const state = {
  currentIndex: 0,
  visited: new Set(),
  completedMissions: new Set(),
  xp: 0,
  tourTimer: null,
  tourRunning: false,
  drawerTab: 'guide',
}

const tower = new BusinessTower3D($('#world'), businessFloors, teams)
window.__RECRUITFLOW_TOWER__ = tower
window.__RECRUITFLOW_TOWER_DATA__ = { businessFloors, teams }
tower.onFloorSelected = floorId => selectFloor(floorId)

function floorById(id) {
  return businessFloors.find(floor => floor.id === id)
}

function renderFloorList() {
  ui.floorList.innerHTML = businessFloors.map(floor => `
    <button class="floor-btn" data-floor="${floor.id}" style="--floor-color:${floor.color}">
      <span class="floor-number">${String(floor.number).padStart(2, '0')}</span>
      <span class="floor-copy"><strong>${floor.short}</strong><span>${floor.subtitle}</span></span>
      <span class="floor-icon">${floor.icon}</span>
    </button>
  `).join('')
  ui.floorList.querySelectorAll('[data-floor]').forEach(button => {
    button.addEventListener('click', () => selectFloor(button.dataset.floor))
  })
  updateFloorButtons()
}

function updateFloorButtons() {
  const current = businessFloors[state.currentIndex]
  ui.floorList.querySelectorAll('[data-floor]').forEach(button => {
    button.classList.toggle('active', button.dataset.floor === current.id)
    button.classList.toggle('visited', state.visited.has(button.dataset.floor))
  })
  ui.floorProgress.textContent = `${state.visited.size}/10`
}

function renderFloorDetail(floor) {
  document.documentElement.style.setProperty('--accent', floor.color)
  ui.detailEyebrow.textContent = `FLOOR ${String(floor.number).padStart(2, '0')} • ${floor.icon}`
  ui.detailTitle.textContent = floor.title
  ui.detailSubtitle.textContent = floor.subtitle
  ui.detailDescription.textContent = floor.description
  ui.detailMetrics.innerHTML = floor.metrics.map(([value, label]) => `
    <div class="metric-card"><strong>${value}</strong><span>${label}</span></div>
  `).join('')
  ui.workflow.innerHTML = floor.workflow.map((step, index) => `
    <div class="workflow-step" data-step="${index + 1}">${step}</div>
  `).join('')
  ui.canDo.innerHTML = floor.whatYouCanDo.map(item => `<span class="chip">${item}</span>`).join('')
  ui.floorRoles.innerHTML = floor.roles.map(item => `<span class="chip">${item}</span>`).join('')
  ui.floorApps.innerHTML = floor.apps.map(item => `<span class="chip">${item}</span>`).join('')
  ui.detail.classList.add('open')
  ui.consoleNumber.textContent = String(floor.number).padStart(2, '0')
  ui.consoleTitle.textContent = floor.short
  ui.consoleStatus.textContent = floor.subtitle
  ui.consoleMeter.style.width = `${floor.number * 10}%`
}

function selectFloor(id, options = {}) {
  const index = businessFloors.findIndex(floor => floor.id === id)
  if (index < 0) return
  state.currentIndex = index
  const floor = businessFloors[index]
  const firstVisit = !state.visited.has(id)
  state.visited.add(id)
  if (firstVisit) state.xp += 100
  tower.focusFloor(id, options.instant ?? false)
  renderFloorDetail(floor)
  evaluateMissions(id)
  updateFloorButtons()
  updateProgress()
}

function evaluateMissions(currentFloorId) {
  visitorMissions.forEach(mission => {
    if (state.completedMissions.has(mission.id)) return
    const completed = mission.type === 'floors'
      ? state.visited.size >= mission.target
      : mission.type === 'floor'
        ? currentFloorId === mission.floorId
        : false
    if (completed) {
      state.completedMissions.add(mission.id)
      state.xp += 250
    }
  })
  renderMissions()
}

function completeCareerMission() {
  if (!state.completedMissions.has('career')) {
    state.completedMissions.add('career')
    state.xp += 250
    renderMissions()
    updateProgress()
  }
}

function renderMissions() {
  ui.missionList.innerHTML = visitorMissions.map(mission => {
    const done = state.completedMissions.has(mission.id)
    const progress = mission.type === 'floors' ? `${Math.min(state.visited.size, 10)}/10` : done ? '1/1' : '0/1'
    return `
      <div class="mission-item ${done ? 'done' : ''}">
        <span class="mission-check">${done ? '✓' : '•'}</span>
        <span><strong>${mission.title}</strong><span>${mission.description}</span></span>
        <span class="mission-reward">${progress}</span>
      </div>
    `
  }).join('')
  const percent = (state.completedMissions.size / visitorMissions.length) * 100
  ui.missionBar.style.width = `${percent}%`
}

function updateProgress() {
  const level = Math.floor(state.xp / 500) + 1
  ui.visitorLevel.textContent = `Vizitator • Nivel ${level}`
  ui.visitorXp.textContent = `${state.xp} XP`
}

function moveFloor(delta) {
  const nextIndex = clamp(state.currentIndex + delta, 0, businessFloors.length - 1)
  selectFloor(businessFloors[nextIndex].id)
}

function toggleTour(force) {
  const shouldRun = typeof force === 'boolean' ? force : !state.tourRunning
  if (shouldRun === state.tourRunning) return
  state.tourRunning = shouldRun
  ui.tourButton.classList.toggle('running', shouldRun)
  ui.tourButton.textContent = shouldRun ? '■ Oprește turul' : '▶ Tur automat'
  if (state.tourTimer) clearInterval(state.tourTimer)
  if (shouldRun) {
    ui.consoleStatus.textContent = 'Tur automat activ • următorul etaj în câteva secunde'
    state.tourTimer = setInterval(() => {
      const next = (state.currentIndex + 1) % businessFloors.length
      selectFloor(businessFloors[next].id)
    }, 6500)
  } else {
    state.tourTimer = null
  }
}

function guideMarkup() {
  return `
    <div class="guide-hero">
      <h3>Ce face businessul?</h3>
      <p>Compania combină recrutarea pentru construcții, sourcing-ul de muncitori, baze de date mari, potrivirea cu joburi, apelurile către muncitori și companii, analiza AI și controlul operațional.</p>
    </div>
    <div class="privacy-banner"><strong>Mod public sigur:</strong> această experiență folosește cifre agregate, roluri și ID-uri anonimizate. Nu afișează telefoane, emailuri, adrese, chei sau URL-uri private.</div>
    <div class="guide-grid">
      ${businessFloors.map(floor => `
        <article class="guide-card">
          <strong style="color:${floor.color}">F${String(floor.number).padStart(2, '0')} • ${floor.title}</strong>
          <p>${floor.description}</p>
        </article>
      `).join('')}
    </div>
  `
}

function careersMarkup() {
  return `<div class="career-grid">${roles.map(role => `
    <article class="career-card">
      <div class="career-icon">${role.icon}</div>
      <strong>${role.name}</strong>
      <p>${role.outcome}</p>
      <div class="career-skills">${role.skills.map(skill => `<span>${skill}</span>`).join('')}</div>
    </article>
  `).join('')}</div>`
}

function appsMarkup() {
  return `
    <div class="privacy-banner">Portofoliu public: descrierile explică rolul produselor, nu includ configurații, credențiale sau baze private.</div>
    <div class="app-grid">${apps.map(app => `
      <article class="app-card">
        <strong>${app.name}</strong>
        <p>${app.description}</p>
        <div class="app-meta"><span>${app.category}</span><span>${app.status}</span></div>
      </article>
    `).join('')}</div>
  `
}

function glossaryMarkup() {
  return `<div class="glossary-grid">${glossary.map(([term, definition]) => `
    <article class="glossary-card"><strong>${term}</strong><p>${definition}</p></article>
  `).join('')}</div>`
}

function openDrawer(tab = 'guide') {
  state.drawerTab = tab
  ui.drawer.classList.add('open')
  ui.drawer.setAttribute('aria-hidden', 'false')
  ui.drawerBackdrop.classList.add('open')
  document.querySelectorAll('[data-drawer-tab]').forEach(button => button.classList.toggle('active', button.dataset.drawerTab === tab))
  const tabConfig = {
    guide: ['COMPANY GUIDE', 'Cum funcționează compania', guideMarkup],
    careers: ['CAREER MAP', 'Ce poți face în companie', careersMarkup],
    apps: ['PRODUCT MAP', 'Aplicații și sisteme', appsMarkup],
    glossary: ['BUSINESS DICTIONARY', 'Termeni importanți', glossaryMarkup],
  }
  const [eyebrow, title, render] = tabConfig[tab]
  ui.drawerEyebrow.textContent = eyebrow
  ui.drawerTitle.textContent = title
  ui.drawerContent.innerHTML = render()
  if (tab === 'careers') completeCareerMission()
}

function closeDrawer() {
  ui.drawer.classList.remove('open')
  ui.drawer.setAttribute('aria-hidden', 'true')
  ui.drawerBackdrop.classList.remove('open')
}

$('#tour-toggle').addEventListener('click', () => toggleTour())
$('#previous-floor').addEventListener('click', () => moveFloor(-1))
$('#next-floor').addEventListener('click', () => moveFloor(1))
$('#tower-view').addEventListener('click', () => tower.towerView())
$('#close-detail').addEventListener('click', () => ui.detail.classList.remove('open'))
$('#open-guide').addEventListener('click', () => openDrawer('guide'))
$('#open-careers').addEventListener('click', () => openDrawer('careers'))
$('#close-drawer').addEventListener('click', closeDrawer)
ui.drawerBackdrop.addEventListener('click', closeDrawer)
document.querySelectorAll('[data-drawer-tab]').forEach(button => {
  button.addEventListener('click', () => openDrawer(button.dataset.drawerTab))
})
window.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp') moveFloor(1)
  if (event.key === 'ArrowDown') moveFloor(-1)
  if (event.key === 'Escape') {
    closeDrawer()
    ui.detail.classList.remove('open')
  }
})

renderFloorList()
renderMissions()
updateProgress()
selectFloor('welcome', { instant: true })
setTimeout(() => tower.focusFloor('welcome'), 280)
