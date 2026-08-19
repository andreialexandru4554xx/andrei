export const secondiCategories = [
  {
    id: 'yellow', name: 'Yellow', count: 20, color: '#ffd21f', accent: '#fff0a6',
    angle: 15, description: 'Echipa principală alocată aplicației Yellow.',
    priority: 'Core', action: 'Recruitment & calling',
  },
  {
    id: 'blue', name: 'Blue', count: 20, color: '#2f7df6', accent: '#9dc2ff',
    angle: 70, description: 'Echipa principală alocată aplicației Blue.',
    priority: 'Core', action: 'Recruitment & calling',
  },
  {
    id: 'posts', name: 'Postări', count: 15, color: '#ff8a34', accent: '#ffd0ad',
    angle: 132, description: 'Secondi dedicați postărilor, distribuției și generării de leaduri.',
    priority: 'Growth', action: 'Posting & lead generation',
  },
  {
    id: 'classic', name: 'Clasic', count: 10, color: '#27d4b5', accent: '#a8f4e6',
    angle: 190, description: 'Echipa care rămâne pe fluxul clasic de lucru.',
    priority: 'Stable', action: 'Classic workflow',
  },
  {
    id: 'red', name: 'RED', count: 3, color: '#ff4d68', accent: '#ffadba',
    angle: 242, description: 'Echipă mică și concentrată pentru aplicația RED.',
    priority: 'Focused', action: 'Fast worker search',
  },
  {
    id: 'iza', name: 'IZA', count: 1, color: '#a56cff', accent: '#dcc5ff',
    angle: 292, description: 'Un second dedicat aplicației IZA.',
    priority: 'Dedicated', action: 'IZA operations',
  },
  {
    id: 'reserve', name: 'Rezervă', count: 15, color: '#aab4c6', accent: '#eef2f8',
    angle: 338, description: 'Buffer operațional nealocat, gata să fie mutat rapid unde apare presiune.',
    priority: 'Flexible', action: 'Overflow & backup',
  },
]

export const totalSecondi = secondiCategories.reduce((sum, item) => sum + item.count, 0)
export const reserveSecondi = secondiCategories.find(item => item.id === 'reserve').count
export const allocatedSecondi = totalSecondi - reserveSecondi
export const allocationRate = Math.round((allocatedSecondi / totalSecondi) * 100)

export const globalMetrics = [
  [String(totalSecondi), 'Secondi total'],
  [String(allocatedSecondi), 'Alocați'],
  [String(reserveSecondi), 'Rezervă'],
  [`${allocationRate}%`, 'Alocare'],
]
