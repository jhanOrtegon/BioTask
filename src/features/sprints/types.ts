export type SprintStatus = 'planning' | 'active' | 'completed';

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string; // ISO date wrapper
  endDate: string; // ISO date wrapper
  status: SprintStatus;
  storyIds: string[]; // Many-to-Many relation with stories or just array
  createdAt: string;
  updatedAt: string;
}

export interface SprintsState {
  sprints: Sprint[];
  
  // CRUD
  addSprint: (data: Pick<Sprint, 'name' | 'goal' | 'startDate' | 'endDate'>) => Sprint;
  updateSprint: (id: string, data: Partial<Pick<Sprint, 'name' | 'goal' | 'startDate' | 'endDate' | 'status'>>) => void;
  deleteSprint: (id: string) => void;
  
  // Re-assignments
  addStoryToSprint: (sprintId: string, storyId: string) => void;
  removeStoryFromSprint: (sprintId: string, storyId: string) => void;
  setSprintStories: (sprintId: string, storyIds: string[]) => void;
}
