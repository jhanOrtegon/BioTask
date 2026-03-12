import type { TaskDraft } from './types';
import type { TrackedTask } from '../stories/types';

export const markdownToJira = (draft: TaskDraft): string => {
  const { data, title, type, featureName, screenPath } = draft;
  const lines: string[] = [];

  // ── Título ──
  lines.push('# ' + title);
  lines.push('');

  lines.push('| Campo | Valor |');
  lines.push('|-------|-------|');
  lines.push('| Código | ' + (draft.code || 'N/A') + ' |');
  lines.push('| Tipo | ' + type.toUpperCase() + ' |');
  lines.push('| Prioridad | ' + (draft.priority || 'medium').toUpperCase() + ' |');
  if (draft.estimatedHours) lines.push('| Estimación | ' + String(draft.estimatedHours) + 'h |');
  if (draft.dueDate) lines.push('| Vencimiento | ' + draft.dueDate + ' |');
  if (featureName) lines.push('| Funcionalidad | ' + featureName + ' |');
  if (screenPath) lines.push('| Ruta / Pantalla | `' + screenPath + '` |');
  lines.push('');

  // ── Checklist ──
  if (draft.checklists && draft.checklists.length > 0) {
    lines.push('## 📋 Checklist');
    draft.checklists.forEach(item => {
      lines.push(`${item.completed ? '- [/]' : '- [ ]'} ${item.title}`);
    });
    lines.push('');
  }

  // ── Objetivo ──
  if (data.objective) {
    lines.push('## 🎯 Objetivo');
    lines.push(data.objective);
    lines.push('');
  }

  // ── Servicios ──
  if (data.services.length > 0) {
    data.services.forEach((service, i) => {
      lines.push('### ' + (service.name || `Servicio ${String(i + 1)}`));
      lines.push('');
      lines.push('- **URL:** `' + service.url + '`');
      lines.push('- **Método:** `' + service.method + '`');

      if (service.params) {
        lines.push('- **Params:** `' + service.params + '`');
      }
      lines.push('');

      if (service.payload) {
        lines.push('**Payload:**');
        lines.push('```json');
        lines.push(service.payload);
        lines.push('```');
        lines.push('');
      }

      if (service.response) {
        lines.push('**Response:**');
        lines.push('```json');
        lines.push(service.response);
        lines.push('```');
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    });
  }

  // ── Requerimientos Funcionales ──
  if (data.requirements.length > 0) {
    lines.push('## ✅ Requerimientos Funcionales');
    data.requirements.forEach(req => {
      if (req.trim()) lines.push('- ' + req);
    });
    lines.push('');
  }

  // ── Validaciones / Criterios de Aceptación ──
  if (data.validations.length > 0) {
    lines.push('## 🧪 Criterios de Aceptación');
    data.validations.forEach(val => {
      if (val.trim()) lines.push('- [ ] ' + val);
    });
    lines.push('');
  }

  return lines.join('\n');
};

export const generateConventionalCommit = (draft: TrackedTask | TaskDraft, lang: 'es' | 'en' = 'en'): string => {
  const task = draft as TrackedTask & TaskDraft;
  const { data, title, type, featureName, code } = task;

  const typeMapEn: Record<string, string> = {
    feature: 'feat',
    bug: 'fix',
    chore: 'chore',
    refactor: 'refactor',
  };

  const typeMapEs: Record<string, string> = {
    feature: 'funcionalidad',
    bug: 'corrección',
    chore: 'tarea',
    refactor: 'refactorización',
  };

  const prefix = lang === 'es' ? (typeMapEs[type] || 'tarea') : (typeMapEn[type] || 'feat');
  const scopeStr = featureName ? `(${featureName})` : '';
  const codeStr = code ? `${code} ` : '';
  const titleStr = title || (lang === 'es' ? 'Actualización de tarea' : 'Task update');

  const header = `${prefix}${scopeStr}: ${codeStr}${titleStr}`;

  let body = '';
  if (data.objective) {
    const label = lang === 'es' ? 'Objetivo' : 'Objective';
    body = `\n\n${label}: ${data.objective}`;
  }

  return `${header}${body}`;
};
