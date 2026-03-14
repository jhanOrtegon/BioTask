import type { TrackedTask } from "@/features/stories/types";

export function getTaskAlertStatus(task: TrackedTask) {
  const alerts: { type: 'error' | 'warning' | 'info'; message: string }[] = [];

  // 1. Time Overrun
  if (task.estimatedHours && task.timeSpent) {
    const elapsedHours = task.timeSpent / 3600;
    if (elapsedHours > task.estimatedHours) {
      alerts.push({ 
        type: 'error', 
        message: `Exceso de tiempo: ${(elapsedHours - task.estimatedHours).toFixed(1)}h sobre lo estimado.` 
      });
    } else if (elapsedHours > task.estimatedHours * 0.8) {
      alerts.push({ 
        type: 'warning', 
        message: 'Cerca del límite de tiempo estimado (80%+).' 
      });
    }
  }

  // 2. Deadline
  if (task.dueDate && task.status !== 'completed' && task.status !== 'archived') {
    const deadline = new Date(task.dueDate);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      alerts.push({ type: 'error', message: 'Tarea vencida.' });
    } else if (diffDays <= 2) {
      alerts.push({ type: 'warning', message: `Vence en ${String(diffDays)} ${diffDays === 1 ? 'día' : 'días'}.` });
    }
  }

  return alerts;
}
