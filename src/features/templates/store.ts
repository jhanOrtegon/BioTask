import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Template } from './types';

interface TemplatesState {
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, template: Partial<Omit<Template, 'id' | 'createdAt'>>) => void;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Frontend Feature (React/TS)',
    description: 'Molde completo para nuevas funcionalidades de UI.',
    taskType: 'feature',
    hasObjective: true,
    hasServices: true,
    hasFunctionalRequirements: true,
    hasValidations: true,
    featureName: 'Nueva Funcionalidad',
    screenPath: '/dashboard',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Fix Bug API',
    description: 'Molde para corrección de errores en endpoints.',
    taskType: 'bug',
    hasObjective: true,
    hasServices: true,
    hasFunctionalRequirements: false,
    hasValidations: true,
    createdAt: new Date().toISOString(),
  }
];

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: DEFAULT_TEMPLATES,
      addTemplate: (templateData) => set((state) => ({
        templates: [
          ...state.templates,
          {
            ...templateData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      removeTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
      })),
      updateTemplate: (id, templateData) => set((state) => ({
        templates: state.templates.map(t => 
          t.id === id ? { ...t, ...templateData } : t
        )
      })),
    }),
    {
      name: 'templates-storage',
    }
  )
);
