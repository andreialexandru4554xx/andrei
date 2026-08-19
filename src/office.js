import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { secondiCategories } from './data.js'

const canvas = document.querySelector('#office-world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a1522)
scene.fog = new THREE.Fog(0x0a1522, 35, 75)

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 200)
camera.position.set(24, 19, 28)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)
controls.minDistance = 10
controls.maxDistance = 55
controls.maxPolarAngle = Math.PI * .48

scene.add(new THREE.HemisphereLight(0xdcecff, 0x111827, 2.0))
const sun = new THREE.DirectionalLight(0xffffff, 3.1)
sun.position.set(12, 22, 10)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
scene.add(sun)

function box(w,h,d,color,opts={}){
  const m = new THREE.MeshStandardMaterial({color,roughness:opts.roughness??.6,metalness:opts.metalness??.08,transparent:opts.transparent??false,opacity:opts.opacity??1})
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)
  mesh.castShadow = opts.castShadow ?? true
  mesh.receiveShadow = opts.receiveShadow ?? true
  return mesh
}

function spriteLabel(text,color,small=false){
  const c=document.createElement('canvas'); c.width=600; c.height=small?150:220
  const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height)
  x.fillStyle='rgba(7,12,20,.86)'; x.roundRect(14,14,c.width-28,c.height-28,26); x.fill()
  x.strokeStyle=color; x.lineWidth=small?3:5; x.stroke()
  x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#fff'; x.font=small?'800 40px Arial':'900 58px Arial'; x.fillText(text,c.width/2,c.height/2)
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false})); s.scale.set(small?1.45:2.65,small?.36:.82,1); return s
}

const floor=box(38,.25,30,0x152235,{roughness:.88}); floor.position.y=-.12; scene.add(floor)
const aisle=box(4,.03,28,0x203d64,{roughness:.95}); aisle.position.y=.02; scene.add(aisle)

for(const x of [-19,19]){const wall=box(.12,6,30,0x8ab8e8,{transparent:true,opacity:.16,roughness:.08}); wall.position.set(x,3,0); scene.add(wall)}
const back=box(38,6,.16,0x21344f,{roughness:.8}); back.position.set(0,3,-15); scene.add(back)

const offices=[
  {id:'yellow',x:-11,z:-8,w:10,d:8},
  {id:'blue',x:11,z:-8,w:10,d:8},
  {id:'posts',x:-11,z:3,w:10,d:7},
  {id:'classic',x:11,z:3,w:10,d:7},
  {id:'red',x:-7,z:11,w:6,d:5},
  {id:'iza',x:0,z:11,w:5,d:5},
  {id:'reserve',x:8,z:11,w:8,d:5},
]

const clickable=[]
const officeMap=new Map()

function person(color){
  const g=new THREE.Group()
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.42,5,10),new THREE.MeshStandardMaterial({color,roughness:.65})); body.position.y=.58; g.add(body)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.17,16,12),new THREE.MeshStandardMaterial({color:0xd4a17b,roughness:.9})); head.position.y=.96; g.add(head)
  return g
}

function station(name,category,role='SECOND'){
  const g=new THREE.Group()
  const desk=box(1.25,.08,.7,0xe7edf6,{roughness:.84}); desk.position.y=.72; g.add(desk)
  const screen=box(.48,.30,.04,role==='FIRST'?0xffb13c:category.color,{roughness:.2}); screen.position.set(0,1,-.18); screen.material.emissive=new THREE.Color(role==='FIRST'?0xffb13c:category.color); screen.material.emissiveIntensity=.35; g.add(screen)
  const p=person(role==='FIRST'?0xffb13c:category.color); p.position.set(0,0,.35); g.add(p)
  const n=spriteLabel(name,role==='FIRST'?'#ffb13c':category.color,true); n.position.set(0,1.62,.3); g.add(n)
  const badge=spriteLabel(role,role==='FIRST'?'#ffb13c':'#44a0ff',true); badge.scale.set(.72,.19,1); badge.position.set(0,1.34,.3); g.add(badge)
  return g
}

function addOffice(layout){
  const category=secondiCategories.find(x=>x.id===layout.id)
  if(!category)return
  const g=new THREE.Group(); g.position.set(layout.x,0,layout.z)
  const slab=box(layout.w,.05,layout.d,new THREE.Color(category.color).multiplyScalar(.3),{roughness:.86}); slab.position.y=.03; g.add(slab)
  const sign=spriteLabel(`${category.name.toUpperCase()} OFFICE`,category.color,false); sign.position.set(0,3.6,-layout.d/2+.3); g.add(sign)
  const roleStrip=box(layout.w-.8,.05,.7,0x44a0ff,{roughness:.4}); roleStrip.position.set(0,.07,layout.d/2-.55); roleStrip.material.emissive=new THREE.Color(0x144a84); roleStrip.material.emissiveIntensity=.6; g.add(roleStrip)
  const secondTitle=spriteLabel('SECOND', '#44a0ff', true); secondTitle.position.set(-layout.w/2+1.1,2.75,layout.d/2-.55); g.add(secondTitle)
  const firstTitle=spriteLabel('FIRST', '#ffb13c', true); firstTitle.position.set(layout.w/2-1.1,2.75,layout.d/2-.55); g.add(firstTitle)

  const people=category.people||[]
  const cols=Math.max(1,Math.min(4,people.length))
  const rows=Math.ceil(people.length/cols)
  people.forEach((name,i)=>{
    const col=i%cols,row=Math.floor(i/cols)
    const sx=(col-(cols-1)/2)*1.7
    const sz=(row-(rows-1)/2)*1.75-0.5
    const s=station(name,category,'SECOND'); s.position.set(sx,.08,sz); g.add(s)
  })

  const firstPlaceholder=spriteLabel('FIRST • așteaptă nume','#ffb13c',true); firstPlaceholder.position.set(0,2.1,layout.d/2-1.1); firstPlaceholder.scale.set(1.9,.38,1); g.add(firstPlaceholder)

  const hit=new THREE.Mesh(new THREE.BoxGeometry(layout.w,3.5,layout.d),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=1.7; hit.userData.officeId=layout.id; g.add(hit); clickable.push(hit)
  const light=new THREE.PointLight(new THREE.Color(category.color),2.2,9,2); light.position.set(0,3,0); g.add(light)
  scene.add(g); officeMap.set(layout.id,{group:g,category,layout,light})
}

offices.forEach(addOffice)

const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2(); let target=null

function selectOffice(id,focus=true){
  const rec=officeMap.get(id); if(!rec)return
  const {category,layout}=rec
  document.querySelector('#panel-eyebrow').textContent=`${category.name.toUpperCase()} OFFICE`
  document.querySelector('#panel-title').textContent=category.name
  document.querySelector('#panel-copy').textContent=`${category.people?.length||0} persoane cunoscute în acest office.`
  const rows=(category.people||[]).map(name=>`<div class="person-row"><strong>${name}</strong><span class="role-badge second">SECOND</span></div>`).join('')
  document.querySelector('#people-list').innerHTML=rows+`<div class="empty-first"><b>FIRST</b><br>Numele FIRST pentru acest office nu sunt încă introduse.</div>`
  officeMap.forEach(({light},key)=>light.intensity=key===id?5.5:1.6)
  if(focus){target={pos:new THREE.Vector3(layout.x+6,6,layout.z+7),look:new THREE.Vector3(layout.x,1,layout.z)}}
}

renderer.domElement.addEventListener('pointerdown',e=>{
  const r=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-r.left)/r.width)*2-1; pointer.y=-((e.clientY-r.top)/r.height)*2+1
  raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects(clickable,true)[0]; if(hit?.object.userData.officeId)selectOffice(hit.object.userData.officeId,true)
})

document.querySelector('#overview').addEventListener('click',()=>{target={pos:new THREE.Vector3(24,19,28),look:new THREE.Vector3(0,1,0)}})
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})

function animate(){requestAnimationFrame(animate); if(target){camera.position.lerp(target.pos,.07);controls.target.lerp(target.look,.07);if(camera.position.distanceTo(target.pos)<.06)target=null}controls.update();renderer.render(scene,camera)}
animate()
selectOffice('red',false)
