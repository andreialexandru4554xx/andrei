// Correct roster transcribed from the allocation screenshots supplied on 2026-08-19.
export const secondiCategories = [
  { id:'yellow', name:'Yellow', count:25, color:'#ffd21f', accent:'#fff0a6', description:'Yellow App — 25 agents.', priority:'Core', action:'Recruitment & calling', people:['Alex Fox','Iryna Taranenko','Amy Grant','Duna Cristina','Roxana Anghelescu','Millie M','Rachel C','Vladut Cristian','Sinziana V.','Jasmina A','Rebeca C.','Cosmin Ghita','Theodor Iulian','Felix Fritz','Nicoleta N','Miruna N','Chris Wood','Robert Cristescu','Theodor G','Anastasia C','Anna Rogers','Ban Adrian','Roberta Andreea','Rona Buzatu','Yadav A'] },
  { id:'blue', name:'Blue', count:23, color:'#2f7df6', accent:'#9dc2ff', description:'Blue App — 23 agents.', priority:'Core', action:'Recruitment & calling', people:['Vania Geo','Desi Nedeva','George Bulgaria','Josh adams','Sam A','Jay Riach','Peter Jones','Zayed Brown','Millo M','Oliver A','Ahmad Ali','Mark Ammar','Hamza Aantri','saad benrais','Zakaria batouri','Alice Robin','James Moser','Mido M','Surlana Harp','Vivian Silver','Jenny A','Jane Carter','Illy Robinson'] },
  { id:'red', name:'RED', count:3, color:'#ff4d68', accent:'#ffadba', description:'RED App — 3 agents.', priority:'Focused', action:'Fast worker search', people:['Andrei Red','Miriam Idalmi','Maxim'] },
  { id:'posts', name:'Posting', count:15, color:'#8b5cf6', accent:'#e4d8ff', description:'Posting — 15 agents.', priority:'Growth', action:'Posting & lead generation', people:['Adrian B','Dima Robert','Rebecca D.','Vadim','Stefan D','Stefan Raviczki','Popa Blanca','Roxana Vasile','Stan Maya','Catalin Certan','Evelina C.','Spulber Cristian','Lorena Constantin','Blanca Ives','Alexandra Gabriela'] },
  { id:'classic', name:'Classic', count:12, color:'#20bfa9', accent:'#c9f5ee', description:'Classic — 12 agents.', priority:'Stable', action:'Classic workflow', people:['Evelyn J','Jake Bruno','Ana Popescu','Aurora Maros','Mary Huang','Nataly M','Emma N','Artin Halga','Maria Antonia','Anca Luca','Issa','Ioana Preda'] },
]

export const totalSecondi = secondiCategories.reduce((sum,item)=>sum+item.count,0)
export const reserveSecondi = 0
export const allocatedSecondi = totalSecondi
export const allocationRate = 100
export const globalMetrics = [[String(totalSecondi),'Oameni total'],[String(allocatedSecondi),'Alocați'],['0','Rezervă'],['100%','Alocare']]
