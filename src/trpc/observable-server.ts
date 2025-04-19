import { EventEmitter } from 'events';

/**
 * Enhanced EventEmitter with detailed logging for debugging
 */
class DiagnosticEventEmitter {
  private emitter = new EventEmitter();
  private name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  constructor(name: string) {
    this.name = name;
    this.emitter.setMaxListeners(20);

    // Log every 30 seconds how many listeners we have
    setInterval(() => {
      console.log(`[MONITOR] ${this.name} event emitter has ${this.countAllListeners()} listeners`);
      this.listeners.forEach((listenerSet, event) => {
        console.log(`[MONITOR] ${this.name}.${event}: ${listenerSet.size} listeners`);
      });
    }, 30000);
  }

  countAllListeners(): number {
    let count = 0;
    this.listeners.forEach((set) => {
      count += set.size;
    });
    return count;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]): void {
    console.log(
      `[EMITTER] ${this.name}.${event} emitting with ${
        this.listeners.get(event)?.size || 0
      } listeners`
    );
    try {
      this.emitter.emit(event, ...args);
      console.log(`[EMITTER] ${this.name}.${event} successfully emitted`);
    } catch (error) {
      console.error(`[EMITTER ERROR] Error emitting ${this.name}.${event}:`, error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);

    console.log(
      `[LISTENER] Adding listener to ${this.name}.${event}, now has ${
        this.listeners.get(event)?.size
      } listeners`
    );

    this.emitter.on(event, listener);

    // Manually test the listener by calling it directly to verify it works
    try {
      if (event === 'activeQuestionChange') {
        console.log(`[TEST] Testing new ${this.name}.${event} listener directly`);
        listener({ questionId: 'test-id-direct-call' });
      }
    } catch (error) {
      console.error(`[TEST ERROR] Error testing ${this.name}.${event} listener:`, error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, listener: (...args: any[]) => void): void {
    const listenerSet = this.listeners.get(event);
    if (listenerSet) {
      listenerSet.delete(listener);
      console.log(
        `[LISTENER] Removed listener from ${this.name}.${event}, now has ${listenerSet.size} listeners`
      );
    }

    this.emitter.off(event, listener);
  }
}

/**
 * Server-wide event emitters for various event types
 */
export const observableServer = {
  counterUpdate: new DiagnosticEventEmitter('counterUpdate'),
  activeQuestionChange: new DiagnosticEventEmitter('activeQuestionChange'),
};

// Create a test emitter function that can be called from anywhere to test event propagation
export function testEvents(): void {
  console.log('[TEST] Testing event emission');
  observableServer.activeQuestionChange.emit('activeQuestionChange', {
    questionId: 'test-id-' + Date.now(),
  });
  console.log('[TEST] Test event emission complete');
}
