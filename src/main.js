import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { zones, globalMetrics, businessSystems } from './data.js'
import { loadBusinessSnapshot } from './supabase-adapter.js'

const canvas = document.querySelector('#world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x070a11, 0.022)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 160)
camera.position.set(16, 14, 20)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.055
controls.minDistance = 9
controls.maxDistance = 40
controls.maxPolarAngle = Math.PI * 0.48
controls.target.set(0, 0.7, 0)

scene.add(new THREE.HemisphereLight(0xc5d8ff, 0x121620, 1.65))
const sun = new THREE.DirectionalLight(0xffffff, 4.2)
sun.position.set(9, 17, 11)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -18; sun.shadow.camera.right = 18; sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18
scene.add(sun)

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(15.7, 96),
  new THREE.MeshStandardMaterial({ color: 0x0e1521, roughness: 0.82, metalness: 0.12 })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

const ring = new THREE.Mesh(
  new THREE.RingGeometry(15.72, 15.94, 96),
  new THREE.MeshBasicMaterial({ color: 0x668cff, transparent: true, opacity: 0.38, side: THREE.DoubleSide })
)
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.012; scene.add(ring)

const grid = new THREE.GridHelper(26, 26, 0x405070, 0x1e2939)
grid.position.y = 0.016; grid.material.transparent = true; grid.material.opacity = 0.17; scene.add(grid)

function box(w,h,d,color, opts={}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? .52, metalness: opts.metalness ?? .18, transparent: opts.transparent ?? false, opacity: opts.opacity ?? 1 })
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat)
  mesh.castShadow = opts.castShadow ?? true
  mesh.receiveShadow = opts.receiveShadow ?? true
  return mesh
}

function labelTexture(text, color='#ffffff') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256
  const x = c.getContext('2d')
  x.clearRect(0,0,c.width,c.height)
  x.font = '800 92px Inter, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillStyle = color; x.shadowColor = color; x.shadowBlur = 24; x.fillText(text,512,128)
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function addWallLabel(group, zone, z) {
  const mat = new THREE.MeshBasicMaterial({ map: labelTexture(zone.name.toUpperCase(), zone.color), transparent: true, toneMapped: false })
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.35,.58), mat)
  plane.position.set(0,2.35,z)
  group.add(plane)
}

function addDesk(group, x, z, rot, zoneColor, occupied=true) {
  const g = new THREE.Group(); g.position.set(x,0,z); g.rotation.y = rot
  const top = box(1.15,.09,.56,0x667085,{roughness:.35,metalness:.55}); top.position.y=.76; g.add(top)
  for (const lx of [-.46,.46]) { const leg=box(.07,.72,.07,0x303a49,{metalness:.7}); leg.position.set(lx,.37,0); g.add(leg) }
  const monitor = box(.46,.30,.04,0x0b1018,{roughness:.2,metalness:.6}); monitor.position.set(0,1.04,-.07); g.add(monitor)
  const screen = box(.40,.24,.012,new THREE.Color(zoneColor),{roughness:.18,metalness:.05}); screen.material.emissive = new THREE.Color(zoneColor); screen.material.emissiveIntensity=1.2; screen.position.set(0,1.04,-.094); g.add(screen)
  const chair = box(.40,.52,.42,0x202735,{roughness:.55}); chair.position.set(0,.48,.58); g.add(chair)
  if (occupied) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.16,.48,6,10),new THREE.MeshStandardMaterial({color:0x243248,roughness:.75})); body.position.set(0,.89,.54); g.add(body)
    const head = new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),new THREE.MeshStandardMaterial({color:0xc9926d,roughness:.8})); head.position.set(0,1.30,.52); g.add(head)
  }
  group.add(g)
}

function addServerRack(group, x, z, color) {
  const rack = box(.62,2.0,.72,0x111824,{roughness:.28,metalness:.72}); rack.position.set(x,1.0,z); group.add(rack)
  for (let i=0;i<6;i++) {
    const light = box(.48,.055,.015,color,{roughness:.15,metalness:.05}); light.material.emissive=new THREE.Color(color); light.material.emissiveIntensity=1.5; light.position.set(x,.38+i*.27,z+.368); group.add(light)
  }
}

const clickable=[]
const roomMeshes=new Map()

function addOffice(zone) {
  const group = new THREE.Group(); group.position.set(...zone.position); group.userData.zoneId=zone.id
  const [w,h,d]=zone.size

  const base = box(w,.13,d,0x151d2a,{roughness:.72,metalness:.08}); base.position.y=.065; group.add(base)
  const rug = box(w*.82,.025,d*.76,new THREE.Color(zone.color),{roughness:.8,metalness:.02}); rug.material.transparent=true; rug.material.opacity=.18; rug.position.y=.145; group.add(rug)

  const wallMat = new THREE.MeshPhysicalMaterial({color:0xaec3df,roughness:.25,metalness:.08,transmission:.38,transparent:true,opacity:.32,thickness:.15})
  const back = new THREE.Mesh(new THREE.BoxGeometry(w,h,.08),wallMat); back.position.set(0,h/2,-d/2); back.castShadow=true; group.add(back)
  const left = new THREE.Mesh(new THREE.BoxGeometry(.08,h,d),wallMat); left.position.set(-w/2,h/2,0); left.castShadow=true; group.add(left)
  const right = left.clone(); right.position.x=w/2; group.add(right)
  const header = box(w,.18,.12,new THREE.Color(zone.color),{roughness:.25,metalness:.45}); header.position.set(0,h-.10,d/2); header.material.emissive=new THREE.Color(zone.color); header.material.emissiveIntensity=.26; group.add(header)
  const p1=box(.09,h,.09,0x8292aa,{metalness:.8}); p1.position.set(-w/2,h/2,d/2); group.add(p1)
  const p2=p1.clone(); p2.position.x=w/2; group.add(p2)

  const hit = new THREE.Mesh(new THREE.BoxGeometry(w,1.8,d), new THREE.MeshBasicMaterial({visible:false}))
  hit.position.y=.9; hit.userData.zoneId=zone.id; group.add(hit); clickable.push(hit)

  addWallLabel(group,zone,d/2+.02)

  const rows=Math.ceil(zone.desks/2)
  let deskIndex=0
  for(let r=0;r<rows;r++){
    for(const side of [-1,1]){
      if(deskIndex>=zone.desks) break
      addDesk(group, side*1.05, -1.0+r*1.05, side<0?Math.PI/2:-Math.PI/2, zone.color, deskIndex%3!==2)
      deskIndex++
    }
  }

  if(zone.id==='control') {
    const screen=box(2.7,1.15,.08,0x101622,{roughness:.22,metalness:.6}); screen.position.set(0,1.9,-d/2+.09); group.add(screen)
    const glow=box(2.5,.95,.018,0x9c7cff,{roughness:.15}); glow.material.emissive=new THREE.Color(zone.color); glow.material.emissiveIntensity=1.45; glow.position.set(0,1.9,-d/2+.045); group.add(glow)
  }

  const light = new THREE.PointLight(new THREE.Color(zone.color),5.4,6.8,2); light.position.set(0,2.4,0); group.add(light)
  scene.add(group)
  roomMeshes.set(zone.id,{group,light})
}

zones.forEach(addOffice)

const atrium = new THREE.Group()
const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.7,.25,48),new THREE.MeshStandardMaterial({color:0x182335,roughness:.34,metalness:.55})); platform.position.y=.12; platform.castShadow=true; atrium.add(platform)
const core = new THREE.Mesh(new THREE.CylinderGeometry(.72,.92,3.5,28),new THREE.MeshPhysicalMaterial({color:0x9fbcff,emissive:0x24385f,emissiveIntensity:1.3,metalness:.22,roughness:.16,transmission:.34,transparent:true,opacity:.84})); core.position.y=1.95; core.castShadow=true; atrium.add(core)
for(let i=0;i<4;i++){ const t=new THREE.Mesh(new THREE.TorusGeometry(1.22+i*.16,.025,10,72),new THREE.MeshBasicMaterial({color:i%2?0x9c7cff:0x5e8cff,transparent:true,opacity:.8})); t.rotation.x=Math.PI/2; t.position.y=.72+i*.74; t.userData.spin=.002+i*.0006; atrium.add(t)}
for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; const p=box(.05,2.9,.05,0x8ca2bf,{metalness:.85}); p.position.set(Math.cos(a)*2.12,1.65,Math.sin(a)*2.12); atrium.add(p)}
scene.add(atrium)

for(const zone of zones){ const [x,,z]=zone.position; const len=Math.sqrt(x*x+z*z)-2.0; const walkway=box(1.15,.055,Math.max(1,len),0x263246,{roughness:.62,metalness:.1}); walkway.position.set(x*.48,.04,z*.48); walkway.rotation.y=Math.atan2(x,z); scene.add(walkway) }

const infra = new THREE.Group(); infra.position.set(-10.6,0,5.8); addServerRack(infra,-.7,0,'#55df91'); addServerRack(infra,0,0,'#3478f6'); addServerRack(infra,.7,0,'#f4c542'); scene.add(infra)
const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,2.4,12),new THREE.MeshStandardMaterial({color:0x77859a,metalness:.8,roughness:.25})); antenna.position.set(10.8,1.2,5.6); scene.add(antenna)
for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.35+i*.18,.015,8,48),new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:.5})); r.rotation.x=Math.PI/2; r.position.set(10.8,2.5+i*.28,5.6); r.userData.pulse=i; scene.add(r)}

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2()
let hovered=null, selectedZone=null, targetCamera=null

function populateUI() {
  document.querySelector('#global-kpis').innerHTML=globalMetrics.map(([v,l])=>`<div class="kpi-card"><div class="kpi-value">${v}</div><div class="kpi-label">${l}</div></div>`).join('')
  const list=document.querySelector('#zone-list')
  list.innerHTML=zones.map(z=>`<button class="zone-button" data-zone="${z.id}"><span class="zone-color" style="background:${z.color};box-shadow:0 0 18px ${z.color}55"></span><span><span class="zone-name">${z.name}</span><span class="zone-meta">${z.subtitle}</span></span></button>`).join('')
  list.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>selectZone(b.dataset.zone,true)))
  document.querySelector('#systems-list').innerHTML=businessSystems.map(s=>`<div class="system-row"><strong>${s.label}</strong><span>${s.status}</span></div>`).join('')
}

function selectZone(id,focusCamera=true){
  const zone=zones.find(z=>z.id===id); if(!zone)return; selectedZone=zone
  document.querySelectorAll('.zone-button').forEach(el=>el.classList.toggle('active',el.dataset.zone===id))
  document.querySelector('#detail-eyebrow').textContent=zone.subtitle.toUpperCase(); document.querySelector('#detail-title').textContent=zone.name; document.querySelector('#detail-description').textContent=zone.description
  document.querySelector('#detail-kpis').innerHTML=zone.metrics.map(([v,l])=>`<div class="detail-kpi"><strong>${v}</strong><span>${l}</span></div>`).join('')
  document.querySelector('#activity-list').innerHTML=zone.activity.map(([t,d])=>`<div class="activity-item" style="border-color:${zone.color}"><strong>${t}</strong><span>${d}</span></div>`).join('')
  document.querySelector('#detail-panel').classList.add('open')
  roomMeshes.forEach(({group,light},roomId)=>{ group.scale.setScalar(roomId===id?1.035:1); light.intensity=roomId===id?8.5:5.4 })
  if(focusCamera){ const [x,,z]=zone.position; const dir=new THREE.Vector3(x,0,z).normalize(); targetCamera={position:new THREE.Vector3(x+dir.x*6,6.2,z+dir.z*6),target:new THREE.Vector3(x,1.1,z)} }
}

function resetView(){ selectedZone=null; document.querySelectorAll('.zone-button').forEach(el=>el.classList.remove('active')); document.querySelector('#detail-panel').classList.remove('open'); roomMeshes.forEach(({group,light})=>{group.scale.setScalar(1);light.intensity=5.4}); targetCamera={position:new THREE.Vector3(16,14,20),target:new THREE.Vector3(0,.7,0)} }

document.querySelector('#close-detail').addEventListener('click',()=>document.querySelector('#detail-panel').classList.remove('open'))
document.querySelector('#reset-view').addEventListener('click',resetView)

function setPointer(e){pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera)}
renderer.domElement.addEventListener('pointermove',e=>{setPointer(e);const hit=raycaster.intersectObjects(clickable,false)[0]?.object??null;hovered=hit;renderer.domElement.style.cursor=hit?'pointer':'grab'})
renderer.domElement.addEventListener('click',e=>{setPointer(e);const hit=raycaster.intersectObjects(clickable,false)[0];if(hit)selectZone(hit.object.userData.zoneId,false)})

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))})

populateUI()
loadBusinessSnapshot().then(snapshot=>{if(snapshot)document.querySelector('#data-status').textContent='Live data'}).catch(()=>{})

const clock=new THREE.Clock()
function animate(){
  requestAnimationFrame(animate); const elapsed=clock.getElapsedTime(); core.rotation.y+=.0025; core.position.y=1.95+Math.sin(elapsed*1.15)*.05
  atrium.children.forEach(o=>{if(o.userData.spin)o.rotation.z+=o.userData.spin*8})
  scene.children.forEach(o=>{if(o.userData.pulse!==undefined){const s=1+Math.sin(elapsed*2.2+o.userData.pulse)*.12;o.scale.setScalar(s)}})
  if(targetCamera){camera.position.lerp(targetCamera.position,.055);controls.target.lerp(targetCamera.target,.065);if(camera.position.distanceTo(targetCamera.position)<.05&&controls.target.distanceTo(targetCamera.target)<.05)targetCamera=null}
  controls.update(); renderer.render(scene,camera)
}
animate()
