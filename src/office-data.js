export const realOffices = [
  { name: 'OFFICE ALBANIA', people: ['Ioana Preda','Alex Fox','Iryna Taranenko','Amy Grant'] },
  { name: 'OFFICE BULGARIA', people: ['Vania Geo','Desi Nedeva','George Bulgaria'] },
  { name: 'OFFICE BUREBISTA', people: ['Sinziana V.','Stefan Eduard','Jasmina A','Rebeca C.','Cosmin Ghita','Theodor Iulian'] },
  { name: 'OFFICE CANADA', people: ['josh adams','Sam A','Jay Riach','Peter Jones'] },
  { name: 'OFFICE CHINA', people: ['Zayed Brown','Millo M','Oliver A','Ahmad Ali','Mark Ammar'] },
  { name: 'OFFICE CHINA MAXIM', people: ['Hamza Aantri','saad benrais','Zakaria batouri'] },
  { name: 'OFFICE CRAIOVA', people: ['Duna Cristina','Roxana Anghelescu','Millie M','Rachel C'] },
  { name: 'OFFICE DANI', people: ['Chris Wood','Bianca Ives','Felix Fritz','Nicoleta N','Miruna N'] },
  { name: 'OFFICE GABI RECRUTARE', people: ['Lorena Constantin','Roberta Andreea','Alexandra Gabriela','Rona Buzatu','Yadav A'] },
  { name: 'OFFICE GEORGIA', people: ['Alice Robin','James Moser','Mido M','Suriana Harp','Vivian Silver','Jenny A','Jane Carter','lily Robinson'] },
  { name: 'OFFICE INDIA', people: ['Evelyn J','Jake Bruno'] },
  { name: 'OFFICE MARIUS DRAGAN', people: ['Vladut Cristian'] },
  { name: 'OFFICE MAX MANGU', people: ['Adrian B','Dima Robert','Rebecca D.','Robert Cristescu','Theodor G'] },
  { name: 'OFFICE MAXIM VADIM', people: ['Maxim','Vadim','Ioana D','Stefan D','Smith John','Stefan Raviczki','Anastasia C','Anna Rogers','Ban Adrian'] },
  { name: 'OFFICE MD (BOGDAN)', people: ['Alina','Giovanni C'] },
  { name: 'OFFICE MD (DANIEL - CHISINAU)', people: ['Ana Popescu','Aurora Maros','Mary Huang','Nataly M','Emma N'] },
  { name: 'OFFICE VIZIRU', people: ['Artin Haiga','Maria Antonia','Popa Bianca','Roxana Vasile','Stan Maya'] },
  { name: 'Y - INDIVIDUALS RECRUITMENT', people: ['Anca Luca','Andrei Red','Issa','Camil Burdusel','Rebecca Mihalache','Zidaru Evelyna','Madina Musinova','Catalin Certan','Evelina C.','Miriam Idalmi','Spulber Cristian'] },
]

export const knownSecondNames = new Set([
  'Andrei Red',
  'Maxim',
  'Miriam Idalmi',
  'Lorena Constantin',
])

export const officeRosterCount = realOffices.reduce((sum, office) => sum + office.people.length, 0)
