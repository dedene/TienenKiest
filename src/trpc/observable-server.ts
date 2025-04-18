import { EventEmitter } from 'events';

// Define event types with their payloads
interface ServerEvents {
  counterUpdate: {
    answerId: string;
    count: number;
  };
}

// Create a type-safe event emitter
class TypedEventEmitter<T extends Record<string, unknown>> {
  private emitter = new EventEmitter();

  // Create an event emitter for each event type
  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.emitter.emit(String(event), data);
  }

  // Listen to events
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.emitter.on(String(event), listener);
  }

  // Remove event listener
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.emitter.off(String(event), listener);
  }
}

// Create the observable server instance
export const observableServer = {
  counterUpdate: new TypedEventEmitter<{ counterUpdate: ServerEvents['counterUpdate'] }>(),
};
