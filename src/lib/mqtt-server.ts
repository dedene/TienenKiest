import { mqttConfig } from '../config/mqtt';
import { onCounterUpdate, getListenerCount } from '../lib/global-event-bus';
import { setupMQTTClient, publishMessage, closeMQTTConnection } from './mqtt';
import 'server-only';

// Create a singleton for the MQTT client
let isInitialized = false;

export function initMQTTClient() {
  if (isInitialized) {
    console.log('MQTT client already initialized, skipping...');
    return;
  }

  console.log('Initializing MQTT client...');
  console.log('Current event bus listener counts:', getListenerCount());

  // Setup MQTT client
  setupMQTTClient(mqttConfig);
  isInitialized = true;

  // Register test handler to verify global event emission
  onCounterUpdate((data) => {
    console.log('MQTT-SERVER TEST HANDLER received counterUpdate event:', data);
  });

  // Handle graceful shutdown
  process.on('beforeExit', () => {
    console.log('Closing MQTT connection...');
    closeMQTTConnection();
    isInitialized = false;
  });
}

// Re-export functions for use in server components/routes
export { publishMessage, closeMQTTConnection };
