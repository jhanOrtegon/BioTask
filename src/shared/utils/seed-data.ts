import { subDays, startOfDay, addDays, isWeekend, setHours, setMinutes } from 'date-fns';
import type { TeamMember, TeamRole } from '@/features/team/types';
import type { Story, TrackedTask } from '@/features/stories/types';
import type { Sprint } from '@/features/sprints/types';

export function generateSeedData() {
  const now = new Date();
  const startDate = subDays(startOfDay(now), 56); // 8 weeks / 4 sprints ago
  
  // 1. Generate 20 members grouped by role
  const teamSpecs = [
    { count: 3, role: 'lead' as TeamRole, specialty: 'Technical Lead' },
    { count: 6, role: 'developer' as TeamRole, specialty: 'Backend Engineer' },
    { count: 6, role: 'developer' as TeamRole, specialty: 'Frontend Engineer' },
    { count: 3, role: 'qa' as TeamRole, specialty: 'QA Automation' },
    { count: 2, role: 'designer' as TeamRole, specialty: 'Product Designer' },
  ];

  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Diego', 'Laura', 'Andrés', 'Sofía', 'Ricardo', 'Isabel', 'Fernando', 'Lucía', 'Gabriel', 'Valentina', 'Mateo', 'Camila', 'Javier', 'Adriana'];
  const lastNames = ['Pérez', 'García', 'Rodríguez', 'Martínez', 'López', 'Sánchez', 'González', 'Gómez', 'Fernández', 'Díaz', 'Moreno', 'Ruiz', 'Castro', 'Morales', 'Ortega', 'Silva', 'Núñez', 'Vera', 'Quintero', 'Reyes'];

  const members: TeamMember[] = [];
  let nameIdx = 0;
  teamSpecs.forEach(spec => {
    for (let i = 0; i < spec.count; i++) {
      const name = `${firstNames[nameIdx]} ${lastNames[nameIdx]}`;
      members.push({
        id: crypto.randomUUID(),
        name,
        email: `${firstNames[nameIdx].toLowerCase()}.${lastNames[nameIdx].toLowerCase()}@biotask.ai`,
        role: spec.role,
        specialty: spec.specialty,
        active: true,
        createdAt: subDays(now, 90).toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      });
      nameIdx++;
    }
  });

  // 2. Generate 4 Sprints (14 days each)
  const sprints: Sprint[] = [];
  const sprintNames = ['Phase 1: Foundation', 'Phase 2: Authentication', 'Phase 3: Core Engine', 'Phase 4: Analytics Pro'];
  
  for (let i = 0; i < 4; i++) {
    const sStart = addDays(startDate, i * 14);
    const sEnd = addDays(sStart, 13);
    const isPast = sEnd < now;
    const isActive = sStart <= now && sEnd >= now;

    sprints.push({
      id: crypto.randomUUID(),
      name: `Sprint ${String(i + 1)} - ${sprintNames[i]}`,
      goal: `Hito clave para ${sprintNames[i]}`,
      startDate: sStart.toISOString(),
      endDate: sEnd.toISOString(),
      status: isPast ? 'completed' : (isActive ? 'active' : 'planning'),
      storyIds: [],
      createdAt: subDays(sStart, 5).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  // 3. Generate Stories
  const stories: Story[] = [];
  const storyModules = ['Engine', 'UI', 'Security', 'Database', 'Cloud', 'Analytics'];
  
  for (let i = 1; i <= 20; i++) {
    const sId = crypto.randomUUID();
    const sprintIdx = Math.min(3, Math.floor((i - 1) / 5)); // 5 stories per sprint
    const sprint = sprints[sprintIdx];
    
    const story: Story = {
      id: sId,
      code: `BIO-${String(i).padStart(3, '0')}`,
      title: `Epic Story ${String(i)}: ${storyModules[i % storyModules.length]} Optimization`,
      module: storyModules[i % storyModules.length],
      description: `Implementación crítica para mejorar el rendimiento del módulo ${storyModules[i % storyModules.length]}.`,
      status: 'active',
      tasks: [],
      auditLog: [],
      createdAt: subDays(new Date(sprint.startDate), 2).toISOString(),
      updatedAt: now.toISOString(),
      position: i * 1000,
    };
    
    sprint.storyIds.push(sId);

    // 4. Generate Tasks for each Story
    const taskCount = 4 + Math.floor(Math.random() * 5); // 4-8 tasks
    for (let j = 1; j <= taskCount; j++) {
      const assignedTo = members[Math.floor(Math.random() * members.length)].id;
      const tId = crypto.randomUUID();
      const member = members.find(m => m.id === assignedTo);
      const rolePrefix = member?.specialty?.split(' ')[0].toLowerCase() || 'dev';
      
      // Map specialties to TaskTypes
      let type: 'feature' | 'bug' | 'chore' | 'refactor' = 'feature';
      if (rolePrefix === 'backend') type = 'chore';
      if (rolePrefix === 'qa') type = 'bug';
      if (j % 5 === 0) type = 'refactor';

      const estHours = 2 + Math.floor(Math.random() * 8);
      
      const task: TrackedTask = {
        id: tId,
        storyId: sId,
        code: `${story.code}-T${String(j)}`,
        title: `[${rolePrefix.toUpperCase()}] Task ${String(j)}: ${['Review Docs', 'API Dev', 'Unit Test', 'UI Integration', 'Fix Bugs'][j % 5]}`,
        type: type,
        status: sprint.status === 'completed' ? 'completed' : (Math.random() > 0.4 ? 'completed' : (Math.random() > 0.5 ? 'in_progress' : 'pending')),
        assignedTo,
        estimatedHours: estHours,
        timeSpent: 0,
        timeLogs: [],
        createdAt: story.createdAt,
        updatedAt: now.toISOString(),
        position: j * 1000,
        data: {
          objective: 'Desarrollar componentes robustos siguiendo las mejores prácticas técnicas.',
          services: [],
          requirements: ['Requirement Alpha', 'Requirement Beta'],
          validations: ['Test Passage', 'Code Review Success']
        }
      };

      // 5. Generate Time Logs
      const sprintStart = new Date(sprint.startDate);
      const sprintEnd = new Date(sprint.endDate);
      
      if (task.status !== 'pending') {
        let currentDay = sprintStart;
        const workUntil = task.status === 'completed' ? sprintEnd : now;
        
        while (currentDay <= workUntil && currentDay <= sprintEnd) {
          if (!isWeekend(currentDay)) {
            if (Math.random() > 0.5) { 
              const workHours = 1 + Math.floor(Math.random() * 3); 
              const logStart = setMinutes(setHours(new Date(currentDay), 9 + Math.floor(Math.random() * 4)), Math.floor(Math.random() * 60));
              const logEnd = new Date(logStart);
              logEnd.setHours(logStart.getHours() + workHours);
              
              const elapsed = Math.floor((logEnd.getTime() - logStart.getTime()) / 1000);
              
              task.timeLogs = task.timeLogs || [];
              task.timeLogs.push({
                startedAt: logStart.toISOString(),
                endedAt: logEnd.toISOString()
              });
              task.timeSpent = (task.timeSpent || 0) + elapsed;
            }
          }
          currentDay = addDays(currentDay, 1);
        }
      }

      story.tasks.push(task);
    }
    
    stories.push(story);
  }

  return { members, stories, sprints };
}
