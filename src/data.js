// Open-office roster configuration
const buildNames = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix} ${String(i + 1).padStart(2, '0')}`)

export const secondiCategories = [
  { id:'yellow', name:'Yellow', count:20, color:'#ffd21f', accent:'#fff0a6', description:'Echipa principală alocată aplicației Yellow.', priority:'Core', action:'Recruitment & calling', people:buildNames('Yellow',20) },
  { id:'blue', name:'Blue', count:20, color:'#2f7df6', accent:'#9dc2ff', description:'Echipa principală alocată aplicației Blue.', priority:'Core', action:'Recruitment & calling', people:buildNames('Blue',20) },
  { id:'posts', name:'Postări', count:15, color:'#ff8a34', accent:'#ffd0ad', description:'Echipa pentru postări, distribuție și generare de leaduri.', priority:'Growth', action:'Posting & lead generation', people:buildNames('Postări',15) },
  { id:'classic', name:'Clasic', count:10, color:'#27d4b5', accent:'#a8f4e6', description:'Echipa care rămâne pe fluxul clasic de lucru.', priority:'Stable', action:'Classic workflow', people:buildNames('Clasic',10) },
  { id:'red', name:'RED', count:3, color:'#ff4d68', accent:'#ffadba', description:'Echipă concentrată pentru aplicația RED.', priority:'Focused', action:'Fast worker search', people:['Andrei Red','Miriam','RED 03'] },
  { id:'iza', name:'IZA', count:1, color:'#a56cff', accent:'#dcc5ff', description:'Biroul dedicat aplicației IZA.', priority:'Dedicated', action:'IZA operations', people:['Maxim'] },
  { id:'reserve', name:'Rezervă', count:15, color:'#aab4c6', accent:'#eef2f8', description:'Oamenii disponibili pentru realocare rapidă.', priority:'Flexible', action:'Overflow & backup', people:buildNames('Rezervă',15) },
]

export const totalSecondi = secondiCategories.reduce((sum,item)=>sum+item.count,0)
export const reserveSecondi = secondiCategories.find(item=>item.id==='reserve').count
export const allocatedSecondi = totalSecondi-reserveSecondi
export const allocationRate = Math.round((allocatedSecondi/totalSecondi)*100)
export const globalMetrics = [[String(totalSecondi),'Oameni total'],[String(allocatedSecondi),'Alocați'],[String(reserveSecondi),'Rezervă'],[`${allocationRate}%`,'Alocare']]
