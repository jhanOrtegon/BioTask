import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamMember } from './types';

interface TeamState {
  members: TeamMember[];
  addMember: (data: Omit<TeamMember, 'id' | 'createdAt' | 'active'>) => void;
  updateMember: (id: string, data: Partial<Omit<TeamMember, 'id' | 'createdAt'>>) => void;
  removeMember: (id: string) => void;
  getMemberById: (id: string) => TeamMember | undefined;
  setMembers: (members: TeamMember[]) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: [],

      addMember: (data) => set((state) => ({
        members: [
          ...state.members,
          {
            ...data,
            id: crypto.randomUUID(),
            active: true,
            createdAt: new Date().toISOString(),
          }
        ]
      })),

      updateMember: (id, data) => set((state) => ({
        members: state.members.map(m => m.id === id ? { ...m, ...data } : m)
      })),

      removeMember: (id) => set((state) => ({
        members: state.members.filter(m => m.id !== id)
      })),

      getMemberById: (id) => get().members.find(m => m.id === id),
      setMembers: (members) => set({ members }),
    }),
    {
      name: 'team-storage',
    }
  )
);
