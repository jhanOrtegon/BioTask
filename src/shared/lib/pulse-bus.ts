type PulseEvent = {
  type: 'TASK_BLOCKED' | 'TASK_COMPLETED' | 'METRIC_ALERT' | 'STORY_STARTED' | 'SPRINT_VITAL';
  title: string;
  description: string;
  user?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
};

type Listener = (event: PulseEvent) => void;

class PulseBus {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: Omit<PulseEvent, 'timestamp'>) {
    const fullEvent: PulseEvent = { ...event, timestamp: new Date() };
    this.listeners.forEach(listener => { listener(fullEvent); });
  }
}

export const pulseBus = new PulseBus();
