export type TeamRole = 'admin' | 'developer' | 'lead' | 'qa' | 'designer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarUrl?: string;
  specialty?: string; // e.g., "Frontend", "Backend", "Fullstack"
  active: boolean;
  createdAt: string;
}
