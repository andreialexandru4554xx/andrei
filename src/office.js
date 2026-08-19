import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { realOffices, officeRosterCount, roleTotals } from './office-data.js'

const canvas = document.querySelector('#office-world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a1522)
scene.fog = new THREE.Fog(0x0a1522, 45, 110)

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 260)
camera.position.set(35, 30, 42)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)
controls.minDistance = 12
controls.maxDistance = 85
controls.maxPolarAngle = Math.PI * .48

scene.add(new THREE.HemisphereLight(0xdcecff, 0x111827, 2.0))
const sun = new THREE.DirectionalLight(0xffffff, 3.0)
sun.position.set(18, 28, 12)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
scene.add(sun)

function box(w,h,d,color,opts={}){
  const m=new THREE.MeshStandardMaterial({color,roughness:opts.roughness??.62,metalness:opts.metalness??.08,transparent:opts.transparent??false,opacity:opts.opacity??1})
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)
  mesh.castShadow=opts.castShadow??true
  mesh.receiveShadow=opts.receiveShadow??true
  return mesh
}

function label(text,color='#8fb8ff',small=false){
  const c=document.createElement('canvas'); c.width=760; c.height=small?150:220
  const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height)
  x.fillStyle='rgba(7,12,20,.9)'; x.roundRect(14,14,c.width-28,c.height-28,26); x.fill()
  x.strokeStyle=color; x.lineWidth=small?3:5; x.stroke()
  x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#fff'; x.font=small?'800 36px Arial':'900 50px Arial'; x.fillText(text,c.width/2,c.height/2)
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false})); s.scale.set(small?1.65:3.3,small?.34:.86,1); return s
}

function roleColor(role){
  if(role==='FIRST') return '#ffb13c'
  if(role==='SECOND') return '#44a0ff'
  if(role==='FIRST + SECOND') return '#a66cff'
  return '#9ba6b6'
}
function roleHex(role){
  if(role==='FIRST') return 0xffb13c
  if(role==='SECOND') return 0x44a0ff
  if(role==='FIRST + SECOND') return 0xa66cff
  return 0x65758a
}

function person(role){
  const g=new THREE.Group(); const color=roleHex(role)
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.4,5,10),new THREE.MeshStandardMaterial({color,roughness:.68})); body.position.y=.56; g.add(body)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.165,16,12),new THREE.MeshStandardMaterial({color:0xd4a17b,roughness:.9})); head.position.y=.94; g.add(head)
  return g
}

function station(personRecord){
  const {name,role}=personRecord; const color=roleColor(role); const g=new THREE.Group()
  const desk=box(1.18,.08,.66,0xe8eef6,{roughness:.84}); desk.position.y=.7; g.add(desk)
  const screen=box(.45,.28,.04,roleHex(role),{roughness:.2}); screen.position.set(0,.98,-.16); screen.material.emissive=new THREE.Color(roleHex(role)); screen.material.emissiveIntensity=.32; g.add(screen)
  const p=person(role); p.position.set(0,0,.34); g.add(p)
  const n=label(name,color,true); n.position.set(0,1.58,.28); g.add(n)
  const b=label(role==='UNKNOWN'?'NECLAR':role,color,true); b.scale.set(role==='FIRST + SECOND'?1.18:.86,.18,1); b.position.set(0,1.31,.28); g.add(b)
  return g
}

const cols=4
const cellW=12.5, cellD=10.2
const rows=Math.ceil(realOffices.length/cols)
const totalW=cols*cellW+6, totalD=rows*cellD+6
const floor=box(totalW,.25,totalD,0x142235,{roughness:.9}); floor.position.y=-.12; scene.add(floor)

const clickable=[]
const officeMap=new Map()
const palette=['#53a9ff','#ffb13c','#8c74ff','#40c99a','#ff6b7a','#66c7ff','#e59dff','#82d56d']

realOffices.forEach((office,index)=>{
  const row=Math.floor(index/cols), col=index%cols
  const x=(col-(cols-1)/2)*cellW
  const z=(row-(rows-1)/2)*cellD
  const color=palette[index%palette.length]
  const g=new THREE.Group(); g.position.set(x,0,z)
  const slab=box(cellW-1,.05,cellD-1,color,{roughness:.88,transparent:true,opacity:.22}); slab.position.y=.03; g.add(slab)
  const firstCount=office.people.filter(p=>p.role==='FIRST').length
  const secondCount=office.people.filter(p=>p.role==='SECOND').length
  const bothCount=office.people.filter(p=>p.role==='FIRST + SECOND').length
  const sign=label(`${office.name} • ${office.people.length}`,color,false); sign.position.set(0,3.6,-cellD/2+.75); g.add(sign)
  const roleSummary=label(`F ${firstCount} • S ${secondCount} • F+S ${bothCount}`,'#d7e5ff',true); roleSummary.position.set(0,3.05,-cellD/2+.75); roleSummary.scale.set(2.2,.28,1); g.add(roleSummary)

  const pcols=Math.min(4,Math.max(1,office.people.length))
  const prows=Math.ceil(office.people.length/pcols)
  office.people.forEach((personRecord,i)=>{
    const c=i%pcols, r=Math.floor(i/pcols)
    const sx=(c-(pcols-1)/2)*2.25
    const sz=(r-(prows-1)/2)*1.9+.4
    const s=station(personRecord); s.position.set(sx,.08,sz); g.add(s)
  })

  const hit=new THREE.Mesh(new THREE.BoxGeometry(cellW-1,3.8,cellD-1),new THREE.MeshBasicMaterial({visible:false}))
  hit.position.y=1.9; hit.userData.officeIndex=index; g.add(hit); clickable.push(hit)
  const light=new THREE.PointLight(new THREE.Color(color),2.1,10,2); light.position.set(0,3.2,0); g.add(light)
  scene.add(g); officeMap.set(index,{office,g,light,x,z,color})
})

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(); let target=null

function badgeClass(role){
  if(role==='FIRST') return 'first'
  if(role==='SECOND') return 'second'
  if(role==='FIRST + SECOND') return 'both'
  return 'unknown'
}

function selectOffice(index,focus=true){
  const rec=officeMap.get(index); if(!rec)return
  const {office,x,z}=rec
  document.querySelector('#panel-eyebrow').textContent='OFFICE REAL'
  document.querySelector('#panel-title').textContent=office.name
  const firstCount=office.people.filter(p=>p.role==='FIRST').length
  const secondCount=office.people.filter(p=>p.role==='SECOND').length
  const bothCount=office.people.filter(p=>p.role==='FIRST + SECOND').length
  document.querySelector('#panel-copy').textContent=`${office.people.length} persoane • FIRST ${firstCount} • SECOND ${secondCount} • FIRST+SECOND ${bothCount}`
  document.querySelector('#people-list').innerHTML=office.people.map(p=>`<div class="person-row"><strong>${p.name}</strong><span class="role-badge ${badgeClass(p.role)}">${p.role==='UNKNOWN'?'NECLAR':p.role}</span></div>`).join('')
  officeMap.forEach((item,key)=>item.light.intensity=key===index?5.8:1.4)
  if(focus) target={pos:new THREE.Vector3(x+7,6.5,z+8),look:new THREE.Vector3(x,1,z)}
}

renderer.domElement.addEventListener('pointerdown',e=>{
  const r=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-r.left)/r.width)*2-1; pointer.y=-((e.clientY-r.top)/r.height)*2+1
  raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects(clickable,true)[0]; if(hit)selectOffice(hit.object.userData.officeIndex,true)
})

document.querySelector('#overview').addEventListener('click',()=>{target={pos:new THREE.Vector3(35,30,42),look:new THREE.Vector3(0,1,0)}})
const title=document.querySelector('.top-title'); if(title) title.textContent=`Office Room • ${realOffices.length} office-uri • ${officeRosterCount} persoane • F ${roleTotals['FIRST']||0} • S ${roleTotals['SECOND']||0} • F+S ${roleTotals['FIRST + SECOND']||0}`
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})

function animate(){requestAnimationFrame(animate);if(target){camera.position.lerp(target.pos,.07);controls.target.lerp(target.look,.07);if(camera.position.distanceTo(target.pos)<.06)target=null}controls.update();renderer.render(scene,camera)}
animate(); selectOffice(0,false)
