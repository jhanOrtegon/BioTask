export type TaskType = 'feature' | 'bug' | 'chore' | 'refactor';

export interface ServiceDetail {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: string;
  payload?: string;
  payloadType?: 'JSON' | 'FormData' | 'Text' | 'None';
  response?: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  
  // Estructura fija del molde
  hasObjective: boolean;
  hasServices: boolean;
  hasFunctionalRequirements: boolean;
  hasValidations: boolean;

  // Campos obligatorios (Pro)
  requiredObjective: boolean;
  requiredServices: boolean;
  requiredRequirements: boolean;
  requiredValidations: boolean;
  
  // Metadata Pro previa (opcional mantener o refactorizar)
  serviceInfo?: string;
  featureName?: string;
  screenPath?: string;
  
  createdAt: string;
}
