import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { secondiCategories, totalSecondi, globalMetrics } from './data.js'

const canvas = document.querySelector('#world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true })
renderer.setPixelRatio(Math.min(devicePixelRatio,2))
renderer.setSize(innerWidth,innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xe6edf5)
scene.fog = new THREE.Fog(0xe6edf5,42,82)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(),0.05).texture

const camera = new THREE.PerspectiveCamera(46,innerWidth/innerHeight,0.1,220)
camera.position.set(0,23,34)
const controls = new OrbitControls(camera,renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.minDistance = 9
controls.maxDistance = 62
controls.maxPolarAngle = Math.PI*0.47
controls.target.set(0,1,0)

scene.add(new THREE.HemisphereLight(0xffffff,0x69788d,2.15))
const sun = new THREE.DirectionalLight(0xffffff,2.8)
sun.position.set(12,24,10)
sun.castShadow = true
sun.shadow.mapSize.set(2048,2048)
sun.shadow.camera.left=-32; sun.shadow.camera.right=32; sun.shadow.camera.top=32; sun.shadow.camera.bottom=-32
scene.add(sun)

function box(w,h,d,color,o={}){
  const m=new THREE.MeshStandardMaterial({color,roughness:o.roughness??0.58,metalness:o.metalness??0.08,transparent:o.transparent??false,opacity:o.opacity??1})
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)
  mesh.castShadow=o.castShadow??true; mesh.receiveShadow=o.receiveShadow??true
  return mesh
}

function label(text,color,small=true){
  const c=document.createElement('canvas'); c.width=720; c.height=small?132:210
  const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height)
  x.fillStyle=small?'rgba(6,10,18,.68)':'rgba(8,13,22,.90)'; x.roundRect(16,16,c.width-32,c.height-32,22); x.fill()
  x.strokeStyle=color; x.lineWidth=small?2:5; x.stroke()
  x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#fff'; x.font=small?'700 36px Arial':'900 62px Arial'; x.fillText(text,c.width/2,c.height/2)
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}))
  s.scale.set(small?1.18:3.2,small?0.22:0.82,1)
  return s
}

function person(color){
  const g=new THREE.Group()
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.46,6,10),new THREE.MeshStandardMaterial({color,roughness:.7}))
  torso.position.y=.58; torso.castShadow=true; g.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.18,16,14),new THREE.MeshStandardMaterial({color:0xd3a17d,roughness:.9}))
  head.position.y=1.02; head.castShadow=true; g.add(head)
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.185,14,12,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:0x35251e,roughness:.95}))
  hair.position.y=1.08; g.add(hair)
  return g
}

function desk(category,name){
  const g=new THREE.Group()
  const top=box(1.35,.08,.72,0xf0f3f7,{roughness:.84,metalness:.03}); top.position.y=.76; g.add(top)
  for(const [x,z] of [[-.54,-.26],[-.54,.26],[.54,-.26],[.54,.26]]){const l=box(.06,.7,.06,0x748397,{metalness:.26}); l.position.set(x,.35,z); g.add(l)}
  const mon=box(.54,.34,.04,0x101722,{roughness:.16,metalness:.18}); mon.position.set(0,1.03,-.20); mon.material.emissive=new THREE.Color(category.color); mon.material.emissiveIntensity=.45; g.add(mon)
  const chair=box(.36,.42,.36,0x354a68,{roughness:.78}); chair.position.set(0,.48,.50); g.add(chair)
  const p=person(category.color); p.position.set(0,0,.35); g.add(p)
  const tag=label(name,category.color,true); tag.position.set(0,1.48,.38); g.add(tag)
  return g
}

const floor=box(34,.18,30,0xf1f4f8,{roughness:.96,castShadow:false}); floor.position.y=-.09; scene.add(floor)
const aisle=box(4.2,.02,29,0x29405f,{roughness:1,castShadow:false}); aisle.position.y=.011; scene.add(aisle)
const back=box(34,6,.22,0xd9e4ef,{roughness:.94}); back.position.set(0,3,-15); scene.add(back)
for(const x of [-17,17]){const glass=box(.16,5.8,29,0xa9c9ef,{transparent:true,opacity:.24,roughness:.08,metalness:.18}); glass.position.set(x,2.9,0); scene.add(glass)}
for(let x=-12;x<=12;x+=6){for(let z=-11;z<=11;z+=7){const panel=box(3.4,.05,1.1,0xffffff,{roughness:.12,castShadow:false}); panel.position.set(x,5.7,z); scene.add(panel); const l=new THREE.PointLight(0xffffff,.65,9,2); l.position.set(x,5.2,z); scene.add(l)}}

const loungeFloor=box(5.4,.03,4.2,0xdbe4ee,{roughness:.98}); loungeFloor.position.set(0,.015,0); scene.add(loungeFloor)
const loungeTable=box(1.9,.1,.9,0xb8c4d1,{metalness:.15}); loungeTable.position.set(0,.72,0); scene.add(loungeTable)
for(const [x,z,r] of [[-1.7,0,Math.PI/2],[1.7,0,Math.PI/2],[0,-1.3,0],[0,1.3,0]]){const s=box(1.3,.58,.72,0x365783,{roughness:.84}); s.position.set(x,.3,z); s.rotation.y=r; scene.add(s)}

const layout={
  yellow:{x:-8.2,z:-8.1,cols:5,face:-Math.PI/2}, blue:{x:8.2,z:-8.1,cols:5,face:Math.PI/2},
  posts:{x:-8.2,z:3.2,cols:5,face:-Math.PI/2}, classic:{x:8.2,z:3.4,cols:5,face:Math.PI/2},
  red:{x:-6.0,z:-12.2,cols:3,face:0}, iza:{x:6.0,z:-12.2,cols:1,face:0}, reserve:{x:0,z:10.1,cols:5,face:Math.PI}
}

const clickable=[]; const sections=new Map(); const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2(); let targetCamera=null

function addDepartment(category){
  const l=layout[category.id], rows=Math.ceil(category.people.length/l.cols), sx=2.05, sz=2.05
  const g=new THREE.Group(); g.position.set(l.x,0,l.z)
  const width=Math.max(3,(Math.min(l.cols,category.people.length)-1)*sx+2.2), depth=Math.max(2.5,(rows-1)*sz+2.5)
  const zone=box(width,.025,depth,category.accent,{transparent:true,opacity:.58,roughness:.98,castShadow:false}); zone.position.y=.015; g.add(zone)
  const sign=label(`${category.name.toUpperCase()} • ${category.count}`,category.color,false); sign.position.set(0,3.8,-depth/2+.15); g.add(sign)
  const actualCols=Math.min(l.cols,category.people.length), totalW=(actualCols-1)*sx, totalD=(rows-1)*sz
  category.people.forEach((name,i)=>{const col=i%l.cols,row=Math.floor(i/l.cols),st=desk(category,name); st.position.set(col*sx-totalW/2,0,row*sz-totalD/2); st.rotation.y=l.face; g.add(st)})
  const light=new THREE.PointLight(category.color,1.4,9,2); light.position.set(0,3,0); g.add(light)
  const hit=new THREE.Mesh(new THREE.BoxGeometry(width,3.5,depth),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=1.75; hit.userData.categoryId=category.id; g.add(hit); clickable.push(hit)
  scene.add(g); sections.set(category.id,{category,group:g,layout:l,light,zone})
}
secondiCategories.forEach(addDepartment)

for(const [x,z] of [[-14,-12],[14,-12],[-14,11],[14,11],[-2.7,4],[2.7,4]]){const pot=box(.42,.36,.42,0x586676); pot.position.set(x,.18,z); scene.add(pot); const trunk=box(.08,.8,.08,0x6c4d32); trunk.position.set(x,.68,z); scene.add(trunk); const leaves=new THREE.Mesh(new THREE.SphereGeometry(.46,16,14),new THREE.MeshStandardMaterial({color:0x4b996d,roughness:.95})); leaves.position.set(x,1.24,z); scene.add(leaves)}

function populateUI(){
  const k=document.querySelector('#global-kpis'); if(k) k.innerHTML=globalMetrics.map(([v,l])=>`<div class="kpi-card"><div class="kpi-value">${v}</div><div class="kpi-label">${l}</div></div>`).join('')
  const list=document.querySelector('#zone-list'); if(!list)return
  list.innerHTML=secondiCategories.map(c=>`<button class="zone-button" data-zone="${c.id}"><span class="zone-color" style="background:${c.color};box-shadow:0 0 16px ${c.color}88"></span><span class="zone-copy"><span class="zone-name">${c.name}</span><span class="zone-meta">${c.action}</span></span><span class="zone-count" style="color:${c.color}">${c.count}</span></button>`).join('')
  document.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>focusDepartment(b.dataset.zone)))
}

function focusDepartment(id){
  const s=sections.get(id); if(!s)return; const c=s.category
  document.querySelectorAll('.zone-button').forEach(b=>b.classList.toggle('active',b.dataset.zone===id))
  const t=document.querySelector('#detail-title'); if(t)t.textContent=c.name
  const d=document.querySelector('#detail-description'); if(d)d.textContent=c.description
  const e=document.querySelector('#detail-eyebrow'); if(e)e.textContent=`${c.priority.toUpperCase()} • ${c.action.toUpperCase()}`
  const k=document.querySelector('#detail-kpis'); if(k)k.innerHTML=`<div class="detail-kpi"><strong>${c.count}</strong><span>oameni</span></div><div class="detail-kpi"><strong>${Math.round(c.count/totalSecondi*100)}%</strong><span>din total</span></div><div class="detail-kpi"><strong>Open</strong><span>office</span></div>`
  const n=document.querySelector('#detail-note'); if(n)n.innerHTML=`<strong>Nume vizibile:</strong> ${c.people.slice(0,8).join(', ')}${c.people.length>8?'…':''}`
  sections.forEach(({light,zone},key)=>{light.intensity=key===id?2.8:1.0; zone.material.opacity=key===id?.94:.52})
  const pos=new THREE.Vector3(); s.group.getWorldPosition(pos)
  const offset=s.layout.x<0?new THREE.Vector3(-5,5.2,1):s.layout.x>0?new THREE.Vector3(5,5.2,1):new THREE.Vector3(0,5.4,6)
  targetCamera={position:pos.clone().add(offset),target:pos.clone().add(new THREE.Vector3(0,1,0))}
}

populateUI(); focusDepartment('yellow')

window.addEventListener('pointerdown',ev=>{const r=renderer.domElement.getBoundingClientRect(); pointer.x=((ev.clientX-r.left)/r.width)*2-1; pointer.y=-((ev.clientY-r.top)/r.height)*2+1; raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects(clickable,true); if(hits[0]?.object.userData.categoryId) focusDepartment(hits[0].object.userData.categoryId)})
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight)})

function animate(){requestAnimationFrame(animate); if(targetCamera){camera.position.lerp(targetCamera.position,.075); controls.target.lerp(targetCamera.target,.075); if(camera.position.distanceTo(targetCamera.position)<.05)targetCamera=null} controls.update(); renderer.render(scene,camera)}
animate()