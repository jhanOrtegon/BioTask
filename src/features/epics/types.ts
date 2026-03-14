export interface Epic {
  id: string
  code: string // e.g. "EPIC-001"
  title: string
  description?: string
  color: string
  status: 'planning' | 'active' | 'completed'
  progress: number
  createdAt: string
  updatedAt: string
}

export interface EpicsState {
  epics: Epic[]
  setEpics: (epics: Epic[]) => void
  addEpic: (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void
  updateEpic: (id: string, updates: Partial<Omit<Epic, 'id' | 'createdAt'>>) => void
  removeEpic: (id: string) => void
  getEpicById: (id: string) => Epic | undefined
}
