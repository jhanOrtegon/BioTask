import type { TaskType, ServiceDetail } from '../templates/types';
import type { ChecklistItem } from '../stories/types';

export interface SectionData {
  objective: string;
  services: ServiceDetail[];
  requirements: string[];
  validations: string[];
}

export interface TaskDraft {
  id?: string;
  templateId?: string;
  storyId?: string;
  code?: string;
  techPrefix?: 'BE-' | 'FE-';
  title: string;
  type: TaskType;
  
  // Data estructurada recolectada en el "Molde"
  data: SectionData;
  
  // Metadata Pro heredada
  screenPath?: string;
  featureName?: string;
  
  status: 'draft' | 'completed' | 'pending' | 'in_progress' | 'archived';
  estimatedHours?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  checklists?: ChecklistItem[];
  assignedTo?: string;
  jiraContent?: string;
  createdAt: string;
}
