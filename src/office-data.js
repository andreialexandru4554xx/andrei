export const realOffices = [
  { name: 'OFFICE ALBANIA', people: [
    {name:'Ioana Preda',role:'SECOND'}, {name:'Alex Fox',role:'SECOND'}, {name:'Iryna Taranenko',role:'SECOND'}, {name:'Amy Grant',role:'FIRST + SECOND'}
  ]},
  { name: 'OFFICE BULGARIA', people: [
    {name:'Vania Geo',role:'SECOND'}, {name:'Desi Nedeva',role:'SECOND'}, {name:'George Bulgaria',role:'SECOND'}
  ]},
  { name: 'OFFICE BUREBISTA', people: [
    {name:'Sinziana V.',role:'SECOND'}, {name:'Stefan Eduard',role:'SECOND'}, {name:'Jasmina A',role:'SECOND'}, {name:'Rebeca C.',role:'SECOND'}, {name:'Cosmin Ghita',role:'SECOND'}, {name:'Theodor Iulian',role:'SECOND'}
  ]},
  { name: 'OFFICE CANADA', people: [
    {name:'josh adams',role:'SECOND'}, {name:'Sam A',role:'SECOND'}, {name:'Jay Riach',role:'SECOND'}, {name:'Peter Jones',role:'SECOND'}
  ]},
  { name: 'OFFICE CHINA', people: [
    {name:'Zayed Brown',role:'SECOND'}, {name:'Millo M',role:'SECOND'}, {name:'Oliver A',role:'FIRST + SECOND'}, {name:'Ahmad Ali',role:'FIRST'}, {name:'Mark Ammar',role:'FIRST'}
  ]},
  { name: 'OFFICE CHINA MAXIM', people: [
    {name:'Hamza Aantri',role:'FIRST + SECOND'}, {name:'saad benrais',role:'FIRST + SECOND'}, {name:'Zakaria batouri',role:'SECOND'}
  ]},
  { name: 'OFFICE CRAIOVA', people: [
    {name:'Duna Cristina',role:'SECOND'}, {name:'Roxana Anghelescu',role:'SECOND'}, {name:'Millie M',role:'SECOND'}, {name:'Rachel C',role:'SECOND'}
  ]},
  { name: 'OFFICE DANI', people: [
    {name:'Chris Wood',role:'SECOND'}, {name:'Bianca Ives',role:'SECOND'}, {name:'Felix Fritz',role:'SECOND'}, {name:'Nicoleta N',role:'SECOND'}, {name:'Miruna N',role:'SECOND'}
  ]},
  { name: 'OFFICE GABI RECRUTARE', people: [
    {name:'Lorena Constantin',role:'SECOND'}, {name:'Roberta Andreea',role:'SECOND'}, {name:'Alexandra Gabriela',role:'SECOND'}, {name:'Rona Buzatu',role:'SECOND'}, {name:'Yadav A',role:'SECOND'}
  ]},
  { name: 'OFFICE GEORGIA', people: [
    {name:'Alice Robin',role:'SECOND'}, {name:'James Moser',role:'SECOND'}, {name:'Mido M',role:'SECOND'}, {name:'Suriana Harp',role:'FIRST + SECOND'}, {name:'Vivian Silver',role:'SECOND'}, {name:'Jenny A',role:'UNKNOWN'}, {name:'Jane Carter',role:'SECOND'}, {name:'lily Robinson',role:'SECOND'}
  ]},
  { name: 'OFFICE INDIA', people: [
    {name:'Evelyn J',role:'SECOND'}, {name:'Jake Bruno',role:'SECOND'}
  ]},
  { name: 'OFFICE MARIUS DRAGAN', people: [
    {name:'Vladut Cristian',role:'SECOND'}
  ]},
  { name: 'OFFICE MAX MANGU', people: [
    {name:'Adrian B',role:'SECOND'}, {name:'Dima Robert',role:'SECOND'}, {name:'Rebecca D.',role:'SECOND'}, {name:'Robert Cristescu',role:'FIRST + SECOND'}, {name:'Theodor G',role:'SECOND'}
  ]},
  { name: 'OFFICE MAXIM VADIM', people: [
    {name:'Maxim',role:'FIRST + SECOND'}, {name:'Vadim',role:'SECOND'}, {name:'Ioana D',role:'SECOND'}, {name:'Stefan D',role:'SECOND'}, {name:'Smith John',role:'SECOND'}, {name:'Stefan Raviczki',role:'SECOND'}, {name:'Anastasia C',role:'SECOND'}, {name:'Anna Rogers',role:'SECOND'}, {name:'Ban Adrian',role:'SECOND'}
  ]},
  { name: 'OFFICE MD (BOGDAN)', people: [
    {name:'Alina',role:'SECOND'}, {name:'Giovanni C',role:'SECOND'}
  ]},
  { name: 'OFFICE MD (DANIEL - CHISINAU)', people: [
    {name:'Ana Popescu',role:'SECOND'}, {name:'Aurora Maros',role:'SECOND'}, {name:'Mary Huang',role:'SECOND'}, {name:'Nataly M',role:'SECOND'}, {name:'Emma N',role:'UNKNOWN'}
  ]},
  { name: 'OFFICE VIZIRU', people: [
    {name:'Artin Haiga',role:'FIRST + SECOND'}, {name:'Maria Antonia',role:'SECOND'}, {name:'Popa Bianca',role:'SECOND'}, {name:'Roxana Vasile',role:'SECOND'}, {name:'Stan Maya',role:'SECOND'}
  ]},
  { name: 'Y - INDIVIDUALS RECRUITMENT', people: [
    {name:'Anca Luca',role:'SECOND'}, {name:'Andrei Red',role:'SECOND'}, {name:'Issa',role:'FIRST + SECOND'}, {name:'Camil Burdusel',role:'FIRST + SECOND'}, {name:'Rebecca Mihalache',role:'SECOND'}, {name:'Zidaru Evelyna',role:'SECOND'}, {name:'Madina Musinova',role:'SECOND'}, {name:'Catalin Certan',role:'SECOND'}, {name:'Evelina C.',role:'SECOND'}, {name:'Miriam Idalmi',role:'SECOND'}, {name:'Spulber Cristian',role:'SECOND'}
  ]},
]

export const officeRosterCount = realOffices.reduce((sum, office) => sum + office.people.length, 0)
export const roleTotals = realOffices.flatMap(o=>o.people).reduce((acc,p)=>{acc[p.role]=(acc[p.role]||0)+1;return acc},{})
