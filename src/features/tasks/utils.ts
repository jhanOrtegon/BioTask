import type { TaskDraft } from './types';
import type { TrackedTask } from '../stories/types';

export const markdownToJira = (draft: TaskDraft): string => {
  const { data, title, type, featureName, screenPath } = draft;
  const lines: string[] = [];

  // ── Título ──
  lines.push('# ' + title);
  lines.push('');

  // ── Metadatos ──
  lines.push('| Campo | Valor |');
  lines.push('|-------|-------|');
  lines.push('| Tipo | ' + type.toUpperCase() + ' |');
  if (featureName) lines.push('| Funcionalidad | ' + featureName + ' |');
  if (screenPath) lines.push('| Ruta / Pantalla | `' + screenPath + '` |');
  lines.push('');

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

export const generateConventionalCommit = (draft: TrackedTask | TaskDraft): string => {
  const task = draft as TrackedTask & TaskDraft;
  const { data, title, type, featureName, code } = task;

  const typeMap: Record<string, string> = {
    feature: 'feat',
    bug: 'fix',
    chore: 'chore',
    refactor: 'refactor',
  };

  const prefix = typeMap[type] || 'feat';
  const scopeStr = featureName ? `(${featureName})` : '';
  const codeStr = code ? `${code} ` : '';
  const titleStr = title || 'Actualización de tarea';

  const header = `${prefix}${scopeStr}: ${codeStr}${titleStr}`;

  let body = '';
  if (data.objective) {
    body = `\n\n${data.objective}`;
  }

  return `${header}${body}`;
};
