import { subDays, startOfDay, addDays } from 'date-fns';
import type { TeamMember, TeamRole } from '@/features/team/types';
import type { Story, TrackedTask } from '@/features/stories/types';
import type { Sprint } from '@/features/sprints/types';
import type { Epic } from '@/features/epics/types';
import type { ServiceDetail } from '@/features/templates/types';

export function generateSeedData() {
  const now = new Date();
  const adjustedStartDate = subDays(startOfDay(now), 90); // 3 months ago
  
  const teamSpecs = [
    { count: 6, role: 'lead' as TeamRole, specialty: 'Technical Architect', prefix: 'LEAD-' as const },
    { count: 18, role: 'developer' as TeamRole, specialty: 'Backend Engineer', prefix: 'BE-' as const },
    { count: 18, role: 'developer' as TeamRole, specialty: 'Frontend Engineer', prefix: 'FE-' as const },
    { count: 12, role: 'qa' as TeamRole, specialty: 'QA Specialist', prefix: 'QA-' as const },
    { count: 8, role: 'designer' as TeamRole, specialty: 'UX/UI Designer', prefix: 'DS-' as const },
    { count: 5, role: 'admin' as TeamRole, specialty: 'Product Manager', prefix: 'API-' as const },
  ];

  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Elena', 'Diego', 'Laura', 'Andrés', 'Sofía', 'Ricardo', 'Isabel', 'Fernando', 'Lucía', 'Gabriel', 'Valentina', 'Mateo', 'Camila', 'Javier', 'Adriana'];
  const lastNames = ['Pérez', 'García', 'Rodríguez', 'Martínez', 'López', 'Sánchez', 'González', 'Gómez', 'Fernández', 'Díaz', 'Moreno', 'Ruiz', 'Castro', 'Morales', 'Ortega'];

  const members: TeamMember[] = [];
  let mIdx = 0;
  teamSpecs.forEach(spec => {
    for (let i = 0; i < spec.count; i++) {
      const idx = mIdx % firstNames.length;
      const lnIdx = mIdx % lastNames.length;
      const name = `${firstNames[idx]} ${lastNames[lnIdx]}`;
      members.push({
        id: crypto.randomUUID(),
        name,
        email: `${firstNames[idx].toLowerCase()}.${lastNames[lnIdx].toLowerCase()}.${String(i+1)}@biotask.ai`,
        role: spec.role,
        specialty: spec.specialty,
        active: true,
        createdAt: subDays(now, 180).toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}${String(i)}`,
      });
      mIdx++;
    }
  });

  const epics: Epic[] = [
    { id: crypto.randomUUID(), code: 'EPIC-001', title: 'Zync Infrastructure', description: 'Base layer for multi-core synchronization.', color: '#3b82f6', status: 'active', progress: 85, createdAt: subDays(now, 150).toISOString(), updatedAt: now.toISOString() },
    { id: crypto.randomUUID(), code: 'EPIC-002', title: 'Predictive UX Engine', description: 'Design system based on behavioral predictive models.', color: '#8b5cf6', status: 'active', progress: 60, createdAt: subDays(now, 120).toISOString(), updatedAt: now.toISOString() },
    { id: crypto.randomUUID(), code: 'EPIC-003', title: 'Quantum Compliance Shield', description: 'Next-gen encryption for enterprise data sensitivity.', color: '#ef4444', status: 'active', progress: 40, createdAt: subDays(now, 90).toISOString(), updatedAt: now.toISOString() }
  ];

  const sprints: Sprint[] = [];
  for (let i = 0; i < 8; i++) {
    const sStart = addDays(adjustedStartDate, i * 14);
    const sEnd = addDays(sStart, 13);
    sprints.push({
      id: crypto.randomUUID(),
      name: `Sprint ${String(i + 1)}`,
      goal: `Optimización del núcleo de sincronización v${String(i + 1)}.0`,
      startDate: sStart.toISOString(),
      endDate: sEnd.toISOString(),
      status: sEnd < now ? 'completed' : (sStart <= now ? 'active' : 'planning'),
      storyIds: [],
      createdAt: subDays(sStart, 14).toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  const stories: Story[] = [];
  const modules = ['AuthService', 'DataFlow', 'AuditMetrics', 'CoreUI', 'EngineCortex', 'CloudBridge'];
  
  for (let i = 1; i <= 60; i++) {
    const sId = crypto.randomUUID();
    const sprintIdx = Math.min(7, Math.floor((i - 1) / 8));
    const sprint = sprints[sprintIdx];
    const epic = epics[i % epics.length];
    
    const story: Story = {
      id: sId,
      code: `BIO-${String(i).padStart(3, '0')}`,
      title: `${modules[i % modules.length]} - Module Integration ${String(i)}`,
      module: modules[i % modules.length],
      description: `Refinamiento operativo del módulo de ${modules[i % modules.length]}.`,
      status: 'active',
      epicId: epic.id,
      tasks: [],
      auditLog: [],
      createdAt: subDays(new Date(sprint.startDate), 7).toISOString(),
      updatedAt: now.toISOString(),
      position: i * 1000,
    };
    
    sprint.storyIds.push(sId);

    const taskCount = 3 + Math.floor(Math.random() * 2); 
    for (let j = 1; j <= taskCount; j++) {
      const assignedTo = members[Math.floor(Math.random() * members.length)].id;
      const tId = crypto.randomUUID();
      const member = members.find(m => m.id === assignedTo);
      if (!member) continue;
      
      const techPrefix = teamSpecs.find(s => s.specialty === member.specialty)?.prefix || 'BE-';
      const isPastSprint = sprint.status === 'completed';
      const isCurrentSprint = sprint.status === 'active';
      const status: TrackedTask['status'] = isPastSprint ? 'completed' : (isCurrentSprint ? (Math.random() > 0.5 ? 'completed' : 'in_progress') : 'pending');

      const services: ServiceDetail[] = Array.from({ length: 8 }, (_, sIdx) => ({
        id: crypto.randomUUID(),
        name: `Node_${String(sIdx + 1)}_Sync`,
        method: (['GET', 'POST', 'PUT', 'DELETE'] as const)[sIdx % 4],
        url: `/api/v4/connector/${modules[i % modules.length].toLowerCase()}/node-${String(sIdx + 1)}`,
        payload: '{\n  "uuid": "0x4k...3s",\n  "op": "NODE_SYNC_V4",\n  "prio": "HIGH"\n}',
        response: '{\n  "st": "SYNCED",\n  "lat": "4ms"\n}',
        payloadType: 'JSON'
      }));

      const flow = [
        'Inicializar protocolo de enlace con el núcleo de sincronización de datos.',
        'Mapear puntos de redundancia en la capa de persistencia distribuida.',
        'Validar integridad de paquetes en el buffer circular de transmisión.',
        'Ejecutar orquestación de servicios en el clúster de Sincronización.',
        'Sincronizar el bus de eventos con el módulo de auditoría audit-v3.',
        'Verificar latencia media en los 8 nodos de procesamiento activo.',
        'Realizar el commit de arquitectura al repositorio de master-architecture.',
        'Finalizar el ciclo de QA con certificación de seguridad avanzada.'
      ];

      const task: TrackedTask = {
        id: tId,
        storyId: sId,
        code: `${story.code}-T${String(j)}`,
        title: `[${techPrefix}] Orquestación de Capa de Datos v${String(j)}`,
        type: 'feature',
        status,
        assignedTo,
        estimatedHours: 12 + Math.floor(Math.random() * 12),
        timeSpent: status === 'completed' ? 40000 : 0,
        timeLogs: [],
        createdAt: story.createdAt,
        updatedAt: now.toISOString(),
        position: j * 1000,
        techPrefix,
        data: {
          objective: 'Establecer la arquitectura de alta densidad para la sincronización de nodos distribuidos en el entorno BioTask Engine.',
          services,
          requirements: flow,
          validations: [
            'Peer Review Senior',
            'Audit Compliance ISO-2700',
            'Stress Test Passed',
            'Latency < 10ms'
          ]
        }
      };

      story.tasks.push(task);
    }
    stories.push(story);
  }

  return { members, stories, sprints, epics };
}
