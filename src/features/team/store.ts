import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamMember, DevTeam } from "./types";

interface TeamState {
  members: TeamMember[];
  teams: DevTeam[];
  addMember: (data: Omit<TeamMember, "id" | "createdAt" | "active">) => void;
  updateMember: (
    id: string,
    data: Partial<Omit<TeamMember, "id" | "createdAt">>,
  ) => void;
  removeMember: (id: string) => void;
  getMemberById: (id: string) => TeamMember | undefined;
  addTeam: (data: Pick<DevTeam, "name" | "module" | "description">) => void;
  updateTeam: (
    id: string,
    data: Partial<Pick<DevTeam, "name" | "module" | "description">>,
  ) => void;
  removeTeam: (id: string) => void;
  assignMemberToTeam: (memberId: string, teamId?: string) => void;
  setMembers: (members: TeamMember[]) => void;
  setTeams: (teams: DevTeam[]) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: [],
      teams: [],

      addMember: (data) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              ...data,
              id: crypto.randomUUID(),
              active: true,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      addTeam: (data) =>
        set((state) => ({
          teams: [
            ...state.teams,
            {
              id: crypto.randomUUID(),
              name: data.name,
              module: data.module,
              description: data.description,
              memberIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTeam: (id, data) =>
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === id
              ? { ...team, ...data, updatedAt: new Date().toISOString() }
              : team,
          ),
        })),

      removeTeam: (id) =>
        set((state) => ({
          teams: state.teams.filter((team) => team.id !== id),
          members: state.members.map((m) =>
            m.teamId === id ? { ...m, teamId: undefined } : m,
          ),
        })),

      updateMember: (id, data) =>
        set((state) => {
          const currentMember = state.members.find((m) => m.id === id);
          const nextTeamId = data.teamId;
          const shouldSyncTeams =
            typeof nextTeamId !== "undefined" &&
            currentMember?.teamId !== nextTeamId;

          return {
            members: state.members.map((m) =>
              m.id === id ? { ...m, ...data } : m,
            ),
            teams: shouldSyncTeams
              ? state.teams.map((team) => {
                  const hasMember = team.memberIds.includes(id);
                  if (team.id === nextTeamId && !hasMember) {
                    return {
                      ...team,
                      memberIds: [...team.memberIds, id],
                      updatedAt: new Date().toISOString(),
                    };
                  }
                  if (team.id !== nextTeamId && hasMember) {
                    return {
                      ...team,
                      memberIds: team.memberIds.filter((mId) => mId !== id),
                      updatedAt: new Date().toISOString(),
                    };
                  }
                  return team;
                })
              : state.teams,
          };
        }),

      assignMemberToTeam: (memberId, teamId) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, teamId } : m,
          ),
          teams: state.teams.map((team) => {
            const inTeam = team.memberIds.includes(memberId);
            if (team.id === teamId && !inTeam) {
              return {
                ...team,
                memberIds: [...team.memberIds, memberId],
                updatedAt: new Date().toISOString(),
              };
            }
            if (team.id !== teamId && inTeam) {
              return {
                ...team,
                memberIds: team.memberIds.filter((id) => id !== memberId),
                updatedAt: new Date().toISOString(),
              };
            }
            return team;
          }),
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          teams: state.teams.map((team) => ({
            ...team,
            memberIds: team.memberIds.filter((memberId) => memberId !== id),
            updatedAt: new Date().toISOString(),
          })),
        })),

      getMemberById: (id) => get().members.find((m) => m.id === id),
      setMembers: (members) => set({ members }),
      setTeams: (teams) => set({ teams }),
    }),
    {
      name: "team-storage",
    },
  ),
);
