import 'server-only';
import { getListenerCount } from '../lib/global-event-bus';
import { closeMQTTConnection, ensureMQTTClient, publishMessage } from './mqtt';

// Create a singleton for the MQTT client
let isInitialized = false;

export async function initMQTTClient() {
  if (isInitialized) {
    console.log('MQTT client already initialized, skipping...');
    return;
  }

  console.log('Initializing MQTT client...');
  console.log('Current event bus listener counts:', getListenerCount());

  // Setup MQTT client
  await ensureMQTTClient();
  isInitialized = true;

  // Handle graceful shutdown
  process.on('beforeExit', () => {
    console.log('Closing MQTT connection...');
    closeMQTTConnection();
    isInitialized = false;
  });
}

// Re-export functions for use in server components/routes
export { closeMQTTConnection, publishMessage };
