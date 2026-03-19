import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaskDraft } from './types';
import type { Template } from '../templates/types';

interface TasksState {
 currentTask: TaskDraft | null;
 startNewTask: (template?: Template, storyId?: string) => void;
 setCurrentTask: (task: TaskDraft) => void;
 updateTaskData: (data: Partial<TaskDraft['data']>) => void;
 updateTaskInfo: (info: Partial<Omit<TaskDraft, 'data' | 'jiraContent'>>) => void;
 setJiraContent: (content: string) => void;
 resetTask: () => void;
}

export const useTasksStore = create<TasksState>()(
 persist(
 (set) => ({
 currentTask: null,
 
 setCurrentTask: (task) => set({ currentTask: task }),

 startNewTask: (template, storyId) => set({
 currentTask: {
 id: undefined,
 templateId: template?.id || undefined,
 storyId: storyId || undefined,
 code: '',
 techPrefix: (template?.title.toLowerCase().includes('backend') || template?.title.toLowerCase().includes('api')) ? 'BE-' : 'FE-',
 title: template ? `Nueva tarea: ${template.title}` : 'Nueva tarea',
 type: template?.taskType || 'feature',
 featureName: template?.featureName || '',
 screenPath: template?.screenPath || '',
 data: {
 objective: '',
 services: [],
 requirements: [],
 validations: [],
 },
 status: 'draft',
 estimatedHours: 0,
 priority: 'medium',
 checklists: [],
 createdAt: new Date().toISOString(),
 }
 }),

 updateTaskData: (newData) => set((state) => ({
 currentTask: state.currentTask 
 ? { ...state.currentTask, data: { ...state.currentTask.data, ...newData } }
 : null
 })),

 updateTaskInfo: (info) => set((state) => ({
 currentTask: state.currentTask ? { ...state.currentTask, ...info } : null
 })),

 setJiraContent: (content) => set((state) => ({
 currentTask: state.currentTask ? { ...state.currentTask, jiraContent: content } : null
 })),

 resetTask: () => set({ currentTask: null }),
 }),
 {
 name: 'tasks-storage',
 }
 )
);
