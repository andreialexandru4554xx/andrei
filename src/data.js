export const zones = [
  {
    id: 'blue', name: 'Blue', subtitle: 'Recruitment Operations', color: '#3478f6',
    position: [-5.2, 0, -1.9], size: [4.3, 3.2, 4.0], desks: 6,
    description: 'Worker search, agent calling workflow and recruitment activity for the Blue operation.',
    metrics: [['18,420','Workers'],['311','Calls'],['23','Active today']],
    activity: [['Worker search','42 searches in the latest demo window'],['Calling flow','Dialpad entry point ready for integration'],['Data source','Mock adapter — Supabase connector comes next']],
  },
  {
    id: 'yellow', name: 'Yellow', subtitle: 'Recruitment Operations', color: '#f4c542',
    position: [0, 0, 4.7], size: [4.3, 3.2, 4.0], desks: 5,
    description: 'A dedicated recruiting zone for worker discovery, calls and daily agent performance.',
    metrics: [['17,950','Workers'],['128','Calls'],['17','Active today']],
    activity: [['Daily cap','1 worker / 24h rule represented in the data layer'],['Search mix','Room prepared for randomized worker results'],['Health','Demo status: operational']],
  },
  {
    id: 'red', name: 'Red', subtitle: 'Fast Worker Search', color: '#ef4f5f',
    position: [5.2, 0, -1.9], size: [4.3, 3.2, 4.0], desks: 6,
    description: 'Fast, simple worker search with emphasis on new recruitment leads and quick access.',
    metrics: [['21,380','Workers'],['542','New leads'],['61','Recent']],
    activity: [['New leads','Recent-ad marker prepared in UI model'],['List mode','All workers can be exposed as a searchable list'],['Source','Ready to replace mock values with Supabase']],
  },
  {
    id: 'control', name: 'Control Room', subtitle: 'Executive Overview', color: '#9c7cff',
    position: [0, 0, -5.4], size: [5.0, 3.2, 4.0], desks: 3,
    description: 'Executive command center for company-level KPIs, alerts, projects and operational health.',
    metrics: [['57,750','Total workers'],['981','Calls'],['93%','Data health']],
    activity: [['Operations','4 zones connected to the 3D navigation model'],['Alerts','Placeholder for sync / pipeline issues'],['Next','Connect live Supabase KPI queries']],
  },
]

export const globalMetrics = [['57.7K','Workers'],['981','Calls'],['40','Active'],['93%','Health']]

export const businessSystems = [
  { label: 'Supabase', status: 'Ready to connect' },
  { label: 'Dialpad', status: 'Integration layer' },
  { label: 'Google Sheets', status: 'Migration source' },
  { label: 'AI Analysis', status: 'Control room feed' },
]
