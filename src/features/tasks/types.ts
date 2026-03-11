import type { TaskType, ServiceDetail } from '../templates/types';

export interface SectionData {
  objective: string;
  services: ServiceDetail[];
  requirements: string[];
  validations: string[];
}

export interface TaskDraft {
  templateId?: string;
  storyId?: string;
  code?: string;
  title: string;
  type: TaskType;
  
  // Data estructurada recolectada en el "Molde"
  data: SectionData;
  
  // Metadata Pro heredada
  screenPath?: string;
  featureName?: string;
  
  status: 'draft' | 'completed';
  estimatedHours?: number;
  jiraContent?: string;
  createdAt: string;
}
