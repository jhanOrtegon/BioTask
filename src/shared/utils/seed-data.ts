import { subDays, startOfDay, addDays, isWeekend, setHours, setMinutes, isSameDay } from 'date-fns';
import type { TeamMember, TeamRole } from '@/features/team/types';
import type { Story, TrackedTask } from '@/features/stories/types';
import type { Sprint } from '@/features/sprints/types';
import type { Epic } from '@/features/epics/types';

export function generateSeedData() {
  const now = new Date();
  const adjustedStartDate = subDays(startOfDay(now), 45); 
  
  const teamSpecs = [
    { count: 3, role: 'lead' as TeamRole, specialty: 'Technical Lead', prefix: 'LEAD-' },
    { count: 6, role: 'developer' as TeamRole, specialty: 'Backend Engineer', prefix: 'BE-' },
    { count: 6, role: 'developer' as TeamRole, specialty: 'Frontend Engineer', prefix: 'FE-' },
    { count: 3, role: 'qa' as TeamRole, specialty: 'QA Automation', prefix: 'QA-' },
    { count: 2, role: 'designer' as TeamRole, specialty: 'Product Designer', prefix: 'DS-' },
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

  const epics: Epic[] = [
    {
      id: crypto.randomUUID(),
      code: 'EPIC-001',
      title: 'Infraestructura BioEngine 2.0',
      description: 'Migración del núcleo de procesamiento a servicios distribuidos.',
      color: '#3b82f6',
      status: 'active',
      progress: 65,
      createdAt: subDays(now, 60).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: 'EPIC-002',
      title: 'Portal de Analytics en Tiempo Real',
      description: 'Dashboard avanzado para visualización de experimentos.',
      color: '#8b5cf6',
      status: 'active',
      progress: 40,
      createdAt: subDays(now, 45).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: 'EPIC-003',
      title: 'Sistema de Seguridad Biométrico',
      description: 'Implementación de capas de seguridad avanzadas.',
      color: '#ef4444',
      status: 'planning',
      progress: 10,
      createdAt: subDays(now, 30).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      code: 'EPIC-004',
      title: 'API Gateway & Integraciones',
      description: 'Exposición de servicios para partners externos.',
      color: '#10b981',
      status: 'completed',
      progress: 100,
      createdAt: subDays(now, 90).toISOString(),
      updatedAt: subDays(now, 10).toISOString(),
    }
  ];

  const sprints: Sprint[] = [];
  const sprintNames = ['Foundation', 'Authentication', 'Core Engine', 'Analytics Pro'];
  
  for (let i = 0; i < 4; i++) {
    const sStart = addDays(adjustedStartDate, i * 14);
    const sEnd = addDays(sStart, 13);
    const isPast = sEnd < now;
    const isActive = sStart <= now && sEnd >= now;

    sprints.push({
      id: crypto.randomUUID(),
      name: `Sprint ${String(i + 1)}: ${sprintNames[i]}`,
      goal: `Optimizar el rendimiento en ${sprintNames[i]}`,
      startDate: sStart.toISOString(),
      endDate: sEnd.toISOString(),
      status: isPast ? 'completed' : (isActive ? 'active' : 'planning'),
      storyIds: [],
      createdAt: subDays(sStart, 5).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  const stories: Story[] = [];
  const storyModules = ['Engine Core', 'Smart UI', 'Identity', 'Data Layer', 'Cloud Ops', 'Analytics Hub'];
  
  for (let i = 1; i <= 24; i++) {
    const sId = crypto.randomUUID();
    const sprintIdx = Math.min(3, Math.floor((i - 1) / 6));
    const sprint = sprints[sprintIdx];
    const epic = epics[i % epics.length];
    
    const story: Story = {
      id: sId,
      code: `BIO-${String(i).padStart(3, '0')}`,
      title: `${storyModules[i % storyModules.length]}: Feature Optimization ${String(i)}`,
      module: storyModules[i % storyModules.length],
      description: `Implementación crítica para mejorar el rendimiento y escalabilidad del módulo ${storyModules[i % storyModules.length]}.`,
      status: 'active',
      epicId: epic.id,
      tasks: [],
      auditLog: [],
      createdAt: subDays(new Date(sprint.startDate), 2).toISOString(),
      updatedAt: now.toISOString(),
      position: i * 1000,
    };
    
    sprint.storyIds.push(sId);

    const taskCount = 4 + Math.floor(Math.random() * 4); 
    for (let j = 1; j <= taskCount; j++) {
      const assignedTo = members[Math.floor(Math.random() * members.length)].id;
      const tId = crypto.randomUUID();
      const member = members.find(m => m.id === assignedTo);
      const techPrefix = teamSpecs.find(s => s.specialty === member?.specialty)?.prefix || 'BE-';
      
      let type: 'feature' | 'bug' | 'chore' | 'refactor' = 'feature';
      if (techPrefix === 'BE-') type = 'chore';
      if (techPrefix === 'QA-') type = 'bug';
      if (j % 5 === 0) type = 'refactor';

      const estHours = 4 + Math.floor(Math.random() * 8); // 4-12 hours
      
      const task: TrackedTask = {
        id: tId,
        storyId: sId,
        code: `${story.code}-T${String(j)}`,
        title: `[${techPrefix.replace('-', '')}] ${['Refactoring', 'API Integration', 'Unit Testing', 'UI Components', 'Data Migration'][j % 5]} - Task ${String(j)}`,
        type: type,
        status: sprint.status === 'completed' ? 'completed' : (Math.random() > 0.4 ? 'completed' : (Math.random() > 0.5 ? 'in_progress' : 'pending')),
        assignedTo,
        estimatedHours: estHours,
        timeSpent: 0,
        timeLogs: [],
        createdAt: story.createdAt,
        updatedAt: now.toISOString(),
        position: j * 1000,
        techPrefix: techPrefix as any,
        data: {
          objective: 'Asegurar la máxima eficiencia y claridad técnica en la implementación del componente.',
          services: [],
          requirements: ['Requirement Spec 1.0', 'Compliance Check'],
          validations: ['Automated Tests', 'Peer Review']
        }
      } as any;

      const sprintStart = new Date(sprint.startDate);
      const sprintEnd = new Date(sprint.endDate);
      
      if (task.status !== 'pending') {
        let currentDay = sprintStart;
        const workUntil = task.status === 'completed' ? sprintEnd : now;
        
        while (currentDay <= workUntil && currentDay <= sprintEnd) {
          if (!isWeekend(currentDay)) {
            const isToday = isSameDay(currentDay, now);
            const workProbability = isToday ? 0.95 : 0.6; // High probability today

            if (Math.random() < workProbability) { 
              // Vary work hours to create deviation
              const factor = 0.8 + Math.random() * 0.5; // 0.8 to 1.3
              const workHours = (estHours / taskCount) * factor; 
              
              const logStart = setMinutes(setHours(new Date(currentDay), 9 + Math.floor(Math.random() * 2)), Math.floor(Math.random() * 60));
              const logEnd = new Date(logStart.getTime() + (workHours * 3600 * 1000));
              
              const elapsed = Math.floor((logEnd.getTime() - logStart.getTime()) / 1000);
              
              task.timeLogs = task.timeLogs || [];
              task.timeLogs.push({
                startedAt: logStart.toISOString(),
                endedAt: logEnd.toISOString(),
                memberId: assignedTo
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

  return { members, stories, sprints, epics };
}

