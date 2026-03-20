export type TeamRole = 'admin' | 'developer' | 'lead' | 'qa' | 'designer';

export interface DevTeam {
  id: string;
  name: string;
  module: string;
  description?: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarUrl?: string;
  specialty?: string; // e.g., "Frontend", "Backend", "Fullstack"
  teamId?: string;
  active: boolean;
  createdAt: string;
}
