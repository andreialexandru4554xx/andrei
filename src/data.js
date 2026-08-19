// Current 78-person roster transcribed from the allocation screenshots supplied on 2026-08-19.
export const secondiCategories = [
  {
    id: 'yellow',
    name: 'Yellow',
    count: 25,
    color: '#ffd21f',
    accent: '#fff0a6',
    description: 'Yellow App — 25 agents in the current team allocation.',
    priority: 'Core',
    action: 'Recruitment & calling',
    people: ['Alex Fox','Iryna Taranenko','Amy Grant','Duna Cristina','Roxana Anghelescu','Millie M','Rachel C','Vladut Cristian','Sinziana V.','Jasmina A','Rebeca C.','Cosmin Ghita','Theodor Iulian','Felix Fritz','Nicoleta N','Miruna N','Chris Wood','Robert Cristescu','Theodor G','Anastasia C','Anna Rogers','Ban Adrian','Roberta Andreea','Rona Buzatu','Yadav A'],
  },
  {
    id: 'blue',
    name: 'Blue',
    count: 23,
    color: '#2f7df6',
    accent: '#9dc2ff',
    description: 'Blue App — 23 agents in the current team allocation.',
    priority: 'Core',
    action: 'Recruitment & calling',
    people: ['Vania Geo','Desi Nedeva','George Bulgaria','Josh adams','Sam A','Jay Riach','Peter Jones','Zayed Brown','Millo M','Oliver A','Ahmad Ali','Mark Ammar','Hamza Aantri','saad benrais','Zakaria batouri','Alice Robin','James Moser','Mido M','Surlana Harp','Vivian Silver','Jenny A','Jane Carter','Illy Robinson'],
  },
  {
    id: 'red',
    name: 'RED',
    count: 3,
    color: '#ff4d68',
    accent: '#ffadba',
    description: 'RED App — focused team of 3 agents.',
    priority: 'Focused',
    action: 'Fast worker search',
    people: ['Andrei Red','Miriam Idalmi','Maxim'],
  },
  {
    id: 'posts',
    name: 'Posting',
    count: 15,
    color: '#8b5cf6',
    accent: '#e4d8ff',
    description: 'Posting — 15 agents dedicated to distribution and lead generation.',
    priority: 'Growth',
    action: 'Posting & lead generation',
    people: ['Adrian B','Dima Robert','Rebecca D.','Vadim','Stefan D','Stefan Raviczki','Popa Blanca','Roxana Vasile','Stan Maya','Catalin Certan','Evelina C.','Spulber Cristian','Lorena Constantin','Blanca Ives','Alexandra Gabriela'],
  },
  {
    id: 'classic',
    name: 'Classic',
    count: 12,
    color: '#20bfa9',
    accent: '#c9f5ee',
    description: 'Classic — 12 agents on the classic workflow.',
    priority: 'Stable',
    action: 'Classic workflow',
    people: ['Evelyn J','Jake Bruno','Ana Popescu','Aurora Maros','Mary Huang','Nataly M','Emma N','Artin Halga','Maria Antonia','Anca Luca','Issa','Ioana Preda'],
  },
]

export const allPeople = secondiCategories.flatMap(team =>
  team.people.map(name => ({
    name,
    teamId: team.id,
    teamName: team.name,
    color: team.color,
  }))
)

export const roleGroups = [
  {
    id: 'first',
    name: 'First',
    color: '#ffb547',
    description: 'Zonă pregătită pentru oamenii First. Lista exactă va fi completată din pozele următoare.',
    status: 'De completat',
    people: [],
  },
  {
    id: 'second',
    name: 'Second',
    color: '#52d6ff',
    description: 'Încadrare provizorie: toți cei 78 de oameni actuali sunt afișați momentan aici.',
    status: 'Provizoriu',
    people: allPeople,
  },
  {
    id: 'both',
    name: 'Ambele',
    color: '#9b7bff',
    description: 'Zonă pregătită pentru oamenii care lucrează atât First, cât și Second.',
    status: 'De completat',
    people: [],
  },
]

export const callCenters = secondiCategories.map(team => ({
  id: team.id,
  name: team.name,
  color: team.color,
  agents: team.count,
  callsToday: 0,
  completed: 0,
  connected: false,
  status: 'Pregătit pentru date live',
  source: 'Sursă neconectată încă',
}))

export const totalSecondi = allPeople.length
export const reserveSecondi = 0
export const allocatedSecondi = totalSecondi
export const allocationRate = 100

export const globalMetrics = [
  [String(totalSecondi), 'Oameni total'],
  [String(allocatedSecondi), 'Alocați'],
  ['5', 'Echipe'],
  ['100%', 'Alocare'],
]
