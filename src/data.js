const fillNames = (known, prefix, total) => [
  ...known,
  ...Array.from({ length: Math.max(0, total - known.length) }, (_, i) => `${prefix} ${String(i + known.length + 1).padStart(2, '0')}`),
]

export const secondiCategories = [
  {
    id: 'yellow',
    name: 'Yellow App',
    count: 25,
    color: '#f9c832',
    accent: '#fff1ad',
    description: 'Echipa Yellow, grupată conform Allocation Board.',
    priority: 'Core',
    action: 'Yellow App',
    people: fillNames([
      'Alex Fox',
      'Iryna Taranenko',
      'Amy Grant',
      'Duna Cristina',
      'Roxana Anghelescu',
      'Millie M',
      'Rachel C',
    ], 'Yellow', 25),
  },
  {
    id: 'blue',
    name: 'Blue App',
    count: 23,
    color: '#3f7fe8',
    accent: '#b8d0ff',
    description: 'Echipa Blue, grupată conform Allocation Board.',
    priority: 'Core',
    action: 'Blue App',
    people: fillNames([
      'Vania Geo',
      'Desi Nedeva',
      'George Bulgaria',
      'Josh Adams',
      'Sam A',
      'Jay Riach',
      'Peter Jones',
    ], 'Blue', 23),
  },
  {
    id: 'red',
    name: 'Red App',
    count: 3,
    color: '#f34848',
    accent: '#ffc2c2',
    description: 'Echipa RED exact ca în board.',
    priority: 'Focused',
    action: 'Red App',
    people: ['Andrei Red', 'Miriam Idalmi', 'Maxim'],
  },
  {
    id: 'posting',
    name: 'Posting',
    count: 15,
    color: '#8757eb',
    accent: '#d9c8ff',
    description: 'Echipa de posting și lead generation.',
    priority: 'Growth',
    action: 'Posting',
    people: fillNames([
      'Adrian B',
      'Dima Robert',
      'Rebecca D.',
      'Vadim',
      'Stefan D',
      'Stefan Raviczki',
      'Popa Bianca',
    ], 'Posting', 15),
  },
  {
    id: 'classic',
    name: 'Classic',
    count: 12,
    color: '#19b6a6',
    accent: '#b9f0e8',
    description: 'Echipa Classic exact ca în board.',
    priority: 'Stable',
    action: 'Classic',
    people: fillNames([
      'Evelyn J',
      'Jake Bruno',
      'Ana Popescu',
      'Aurora Maros',
      'Mary Huang',
      'Nataly M',
      'Emma N',
    ], 'Classic', 12),
  },
]

export const totalSecondi = secondiCategories.reduce((sum, item) => sum + item.count, 0)
export const allocatedSecondi = totalSecondi
export const reserveSecondi = 0
export const allocationRate = 100

export const globalMetrics = [
  [String(totalSecondi), 'Agenți total'],
  ['5', 'Grupe'],
  ['78', 'Alocați'],
  ['100%', 'Grupați'],
]
