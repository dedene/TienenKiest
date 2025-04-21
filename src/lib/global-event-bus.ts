/**
 * Global event bus using Node.js global object to ensure a single instance
 * across all parts of the Next.js application
 */
import { EventEmitter } from 'events';

// Define event types
interface CounterUpdateEvent {
  answerId: string;
  count: number;
}

interface StatusUpdateEvent {
  answerId: string;
  status: number;
}

interface ActiveQuestionEvent {
  questionId: string;
}

// Create a global namespace for our app
declare global {
  // eslint-disable-next-line no-var
  var appEventBus:
    | {
        emitter: EventEmitter;
        initialized: boolean;
      }
    | undefined;
}

// Define event channels
const COUNTER_UPDATE = 'counter:update';
const STATUS_UPDATE = 'status:update';
const ACTIVE_QUESTION = 'question:active';

// Determine if we're in actual runtime or just at build time
export const isRuntimeExecution =
  process.env.NEXT_PHASE !== 'phase-production-build' && process.env.NEXT_PHASE !== 'phase-export';

// Lazy initialization of the event bus
const getEventBus = () => {
  if (!global.appEventBus && isRuntimeExecution) {
    console.log('Creating global event bus on demand');
    global.appEventBus = {
      emitter: new EventEmitter().setMaxListeners(20),
      initialized: true,
    };
  }
  return global.appEventBus;
};

// Counter update methods
export function emitCounterUpdate(data: CounterUpdateEvent): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Emitting counter update:', data);
  eventBus.emitter.emit(COUNTER_UPDATE, data);
}

export function onCounterUpdate(handler: (data: CounterUpdateEvent) => void): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Adding counter update handler');
  eventBus.emitter.on(COUNTER_UPDATE, handler);
}

export function offCounterUpdate(handler: (data: CounterUpdateEvent) => void): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Removing counter update handler');
  eventBus.emitter.off(COUNTER_UPDATE, handler);
}

// Status update methods
export function emitStatusUpdate(data: StatusUpdateEvent): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Emitting status update:', data);
  eventBus.emitter.emit(STATUS_UPDATE, data);
}

export function onStatusUpdate(handler: (data: StatusUpdateEvent) => void): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Adding status update handler');
  eventBus.emitter.on(STATUS_UPDATE, handler);
}

export function offStatusUpdate(handler: (data: StatusUpdateEvent) => void): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Removing status update handler');
  eventBus.emitter.off(STATUS_UPDATE, handler);
}

// Active question methods
export function emitActiveQuestion(data: ActiveQuestionEvent): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Emitting active question:', data);
  eventBus.emitter.emit(ACTIVE_QUESTION, data);
}

export function onActiveQuestion(handler: (data: ActiveQuestionEvent) => void): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Adding active question handler');
  eventBus.emitter.on(ACTIVE_QUESTION, handler);
}

export function offActiveQuestion(handler: (data: ActiveQuestionEvent) => void): void {
  const eventBus = getEventBus();
  if (!eventBus) return;

  console.log('[EventEmitter] Removing active question handler');
  eventBus.emitter.off(ACTIVE_QUESTION, handler);
}

export function getListenerCount(): {
  counterUpdate: number;
  statusUpdate: number;
  activeQuestion: number;
} {
  const eventBus = getEventBus();
  if (!eventBus) {
    return {
      counterUpdate: 0,
      statusUpdate: 0,
      activeQuestion: 0,
    };
  }

  return {
    counterUpdate: eventBus.emitter.listenerCount(COUNTER_UPDATE),
    statusUpdate: eventBus.emitter.listenerCount(STATUS_UPDATE),
    activeQuestion: eventBus.emitter.listenerCount(ACTIVE_QUESTION),
  };
}
