import { EventEmitter } from 'events';

// Define event types with their payloads
interface ServerEvents {
  counterUpdate: {
    answerId: string;
    count: number;
  };
  activeQuestion: {
    questionId: string;
  };
}

// Create a type-safe event emitter
class TypedEventEmitter<T extends Record<string, unknown>> {
  private emitter = new EventEmitter();
  private name: string;

  constructor(name: string) {
    this.name = name;

    // Set a higher limit for listeners to avoid memory leak warnings
    this.emitter.setMaxListeners(20);
  }

  // Create an event emitter for each event type
  emit<K extends keyof T>(event: K, data: T[K]): void {
    console.log(`[${this.name}] Emitting event '${String(event)}'`, data);
    this.emitter.emit(String(event), data);
    console.log(
      `[${this.name}] Event '${String(event)}' emitted, listener count:`,
      this.emitter.listenerCount(String(event))
    );
  }

  // Listen to events
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    console.log(`[${this.name}] Adding listener for event '${String(event)}'`);
    this.emitter.on(String(event), listener);
    console.log(
      `[${this.name}] Listener added for '${String(event)}', current count:`,
      this.emitter.listenerCount(String(event))
    );
  }

  // Remove event listener
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    console.log(`[${this.name}] Removing listener for event '${String(event)}'`);
    this.emitter.off(String(event), listener);
    console.log(
      `[${this.name}] Listener removed for '${String(event)}', remaining count:`,
      this.emitter.listenerCount(String(event))
    );
  }
}

// Create the observable server instance
export const observableServer = {
  counterUpdate: new TypedEventEmitter<{ counterUpdate: ServerEvents['counterUpdate'] }>(
    'counterUpdate'
  ),
  activeQuestion: new TypedEventEmitter<{ activeQuestion: ServerEvents['activeQuestion'] }>(
    'activeQuestion'
  ),
};
