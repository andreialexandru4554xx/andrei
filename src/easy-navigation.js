const $ = selector => document.querySelector(selector)
const canvas = $('#world')
const floorPanel = $('.floor-panel')
const detailPanel = $('#floor-detail')
const missionPanel = $('.mission-panel')

function getFloorButtons() {
  return [...document.querySelectorAll('.floor-btn[data-floor]')]
}

function getActiveFloorButton() {
  return document.querySelector('.floor-btn[data-floor].active') || getFloorButtons()[0]
}

function clickControl(selector) {
  const control = $(selector)
  if (control) control.click()
}

function moveFloor(direction) {
  clickControl(direction > 0 ? '#next-floor' : '#previous-floor')
}

function enterCurrentFloor() {
  const active = getActiveFloorButton()
  if (active) active.click()
}

function towerView() {
  clickControl('#tower-view')
}

function orbitHorizontal(direction) {
  const tower = window.__RECRUITFLOW_TOWER__
  if (!tower?.camera || !tower?.controls) return

  const offset = tower.camera.position.clone().sub(tower.controls.target)
  offset.applyAxisAngle(new tower.camera.up.constructor(0, 1, 0), direction * 0.24)
  tower.camera.position.copy(tower.controls.target.clone().add(offset))
  tower.controls.update()
}

function zoomCamera(factor) {
  const tower = window.__RECRUITFLOW_TOWER__
  if (tower?.camera && tower?.controls) {
    const offset = tower.camera.position.clone().sub(tower.controls.target)
    const nextLength = Math.max(7, Math.min(88, offset.length() * factor))
    offset.setLength(nextLength)
    tower.camera.position.copy(tower.controls.target.clone().add(offset))
    tower.controls.update()
    return
  }

  if (canvas) {
    canvas.dispatchEvent(new WheelEvent('wheel', {
      deltaY: factor < 1 ? -260 : 260,
      bubbles: true,
      cancelable: true,
      clientX: innerWidth / 2,
      clientY: innerHeight / 2,
    }))
  }
}

function setEasyMode(enabled) {
  document.body.classList.toggle('easy-mode', enabled)
  localStorage.setItem('recruitflow-easy-mode', enabled ? 'on' : 'off')
  const button = $('[data-easy-action="mode"]')
  if (button) button.textContent = enabled ? '✓ Mod simplu' : 'Mod complet'
}

function toggleMap() {
  document.body.classList.toggle('floor-map-hidden')
}

function toggleDetails() {
  const hidden = document.body.classList.toggle('details-hidden')
  if (!hidden && detailPanel) detailPanel.classList.add('open')
}

function renderNavigation() {
  const existing = $('#easy-navigation')
  if (existing) existing.remove()

  const nav = document.createElement('section')
  nav.id = 'easy-navigation'
  nav.className = 'easy-navigation glass'
  nav.setAttribute('aria-label', 'Navigare simplă prin turn')
  nav.innerHTML = `
    <div class="easy-nav-head">
      <div>
        <strong>Explorare simplă</strong>
        <span id="easy-floor-name">Alege un etaj</span>
      </div>
      <button class="easy-mini" data-easy-action="mode">✓ Mod simplu</button>
    </div>

    <div class="easy-floor-jump" id="easy-floor-jump"></div>

    <div class="easy-main-controls">
      <button class="easy-control" data-easy-action="previous"><span>↓</span>Etaj jos</button>
      <button class="easy-control easy-primary" data-easy-action="enter"><span>◎</span>Intră</button>
      <button class="easy-control" data-easy-action="next"><span>↑</span>Etaj sus</button>
    </div>

    <div class="easy-secondary-controls">
      <button data-easy-action="left" title="Rotire stânga">↶</button>
      <button data-easy-action="zoom-in" title="Apropie">＋</button>
      <button data-easy-action="tower" title="Vedere turn">🏢</button>
      <button data-easy-action="zoom-out" title="Depărtează">−</button>
      <button data-easy-action="right" title="Rotire dreapta">↷</button>
    </div>

    <div class="easy-panel-controls">
      <button data-easy-action="map">☰ Etaje</button>
      <button data-easy-action="details">▤ Detalii</button>
      <button data-easy-action="tour">▶ Tur</button>
    </div>
  `
  document.body.appendChild(nav)

  const floorJump = $('#easy-floor-jump')
  getFloorButtons().forEach((button, index) => {
    const shortcut = document.createElement('button')
    shortcut.className = 'easy-floor-chip'
    shortcut.dataset.floorTarget = button.dataset.floor
    shortcut.textContent = String(index + 1).padStart(2, '0')
    shortcut.title = button.querySelector('.floor-copy strong')?.textContent || `Etaj ${index + 1}`
    shortcut.addEventListener('click', () => button.click())
    floorJump.appendChild(shortcut)
  })

  nav.addEventListener('click', event => {
    const button = event.target.closest('[data-easy-action]')
    if (!button) return
    const action = button.dataset.easyAction
    if (action === 'previous') moveFloor(-1)
    if (action === 'next') moveFloor(1)
    if (action === 'enter') enterCurrentFloor()
    if (action === 'tower') towerView()
    if (action === 'left') orbitHorizontal(-1)
    if (action === 'right') orbitHorizontal(1)
    if (action === 'zoom-in') zoomCamera(0.82)
    if (action === 'zoom-out') zoomCamera(1.22)
    if (action === 'map') toggleMap()
    if (action === 'details') toggleDetails()
    if (action === 'tour') clickControl('#tour-toggle')
    if (action === 'mode') setEasyMode(!document.body.classList.contains('easy-mode'))
  })
}

function updateNavigationState() {
  const active = getActiveFloorButton()
  if (!active) return

  const floorId = active.dataset.floor
  const number = getFloorButtons().findIndex(button => button === active) + 1
  const name = active.querySelector('.floor-copy strong')?.textContent || 'Etaj'
  const status = $('#easy-floor-name')
  if (status) status.textContent = `Etaj ${String(number).padStart(2, '0')} • ${name}`

  document.querySelectorAll('.easy-floor-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.floorTarget === floorId)
  })
}

function showWelcomeHint() {
  if (sessionStorage.getItem('recruitflow-easy-navigation-seen')) return
  sessionStorage.setItem('recruitflow-easy-navigation-seen', 'yes')

  const hint = document.createElement('div')
  hint.className = 'easy-welcome glass'
  hint.innerHTML = `
    <button aria-label="Închide">×</button>
    <strong>Acum se explorează mult mai ușor 👋</strong>
    <span>1. Alege 01–10. 2. Apasă <b>Intră</b>. 3. Folosește +/− sau trage scena pentru a privi în jur.</span>
  `
  document.body.appendChild(hint)
  const close = () => hint.remove()
  hint.querySelector('button').addEventListener('click', close)
  setTimeout(close, 9000)
}

function bindKeyboard() {
  window.addEventListener('keydown', event => {
    const tag = event.target?.tagName?.toLowerCase()
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return

    const key = event.key.toLowerCase()
    if (key === 'w' || event.key === 'PageUp') {
      event.preventDefault()
      moveFloor(1)
    }
    if (key === 's' || event.key === 'PageDown') {
      event.preventDefault()
      moveFloor(-1)
    }
    if (key === 'a') orbitHorizontal(-1)
    if (key === 'd') orbitHorizontal(1)
    if (key === '+' || key === '=') zoomCamera(0.82)
    if (key === '-' || key === '_') zoomCamera(1.22)
    if (key === 'h' || event.key === 'Home') towerView()
    if (event.code === 'Space') {
      event.preventDefault()
      enterCurrentFloor()
    }
    if (key === 'm') toggleMap()
  })
}

function bindSwipe() {
  if (!canvas) return
  let start = null

  canvas.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }, { passive: true })

  canvas.addEventListener('touchend', event => {
    if (!start || event.changedTouches.length !== 1) return
    const end = event.changedTouches[0]
    const dx = end.clientX - start.x
    const dy = end.clientY - start.y
    start = null

    if (Math.abs(dy) > 95 && Math.abs(dy) > Math.abs(dx) * 1.6) {
      moveFloor(dy < 0 ? 1 : -1)
    }
  }, { passive: true })
}

renderNavigation()
setEasyMode(localStorage.getItem('recruitflow-easy-mode') !== 'off')
if (innerWidth <= 680) document.body.classList.add('floor-map-hidden')
bindKeyboard()
bindSwipe()
showWelcomeHint()
updateNavigationState()

const floorObserver = new MutationObserver(updateNavigationState)
getFloorButtons().forEach(button => floorObserver.observe(button, { attributes: true, attributeFilter: ['class'] }))

// The original presentation opens with the distant tower view. In easy mode,
// return the visitor to the first selected floor so the first interaction is obvious.
setTimeout(() => {
  if (document.body.classList.contains('easy-mode')) enterCurrentFloor()
}, 1450)
