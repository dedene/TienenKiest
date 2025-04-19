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

// Initialize the global event bus if it doesn't exist
if (!global.appEventBus) {
  console.log('Creating global event bus');
  global.appEventBus = {
    emitter: new EventEmitter().setMaxListeners(20),
    initialized: false,
  };
} else {
  console.log('Using existing global event bus');
}

// Define event channels
const COUNTER_UPDATE = 'counter:update';
const ACTIVE_QUESTION = 'question:active';

// Register diagnostic handler
if (!global.appEventBus.initialized) {
  global.appEventBus.initialized = true;
}

// Counter update methods
export function emitCounterUpdate(data: CounterUpdateEvent): void {
  console.log('[EventEmitter] Emitting counter update:', data);
  global.appEventBus!.emitter.emit(COUNTER_UPDATE, data);
}

export function onCounterUpdate(handler: (data: CounterUpdateEvent) => void): void {
  console.log('[EventEmitter] Adding counter update handler');
  global.appEventBus!.emitter.on(COUNTER_UPDATE, handler);
}

export function offCounterUpdate(handler: (data: CounterUpdateEvent) => void): void {
  console.log('[EventEmitter] Removing counter update handler');
  global.appEventBus!.emitter.off(COUNTER_UPDATE, handler);
}

// Active question methods
export function emitActiveQuestion(data: ActiveQuestionEvent): void {
  console.log('[EventEmitter] Emitting active question:', data);
  global.appEventBus!.emitter.emit(ACTIVE_QUESTION, data);
}

export function onActiveQuestion(handler: (data: ActiveQuestionEvent) => void): void {
  console.log('[EventEmitter] Adding active question handler');
  global.appEventBus!.emitter.on(ACTIVE_QUESTION, handler);
}

export function offActiveQuestion(handler: (data: ActiveQuestionEvent) => void): void {
  console.log('[EventEmitter] Removing active question handler');
  global.appEventBus!.emitter.off(ACTIVE_QUESTION, handler);
}

export function getListenerCount(): { counterUpdate: number; activeQuestion: number } {
  return {
    counterUpdate: global.appEventBus!.emitter.listenerCount(COUNTER_UPDATE),
    activeQuestion: global.appEventBus!.emitter.listenerCount(ACTIVE_QUESTION),
  };
}
