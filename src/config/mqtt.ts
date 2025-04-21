/**
 * MQTT configuration settings
 *
 * These settings are used to connect to the MQTT broker.
 * They should be defined in the .env.local file.
 */

import { isRuntimeExecution } from '@/lib/global-event-bus';
import * as dotenv from 'dotenv';

dotenv.config();

// Check for required environment variables
function validateEnvVariables() {
  const requiredVars = ['MQTT_BROKER', 'MQTT_USERNAME', 'MQTT_PASSWORD'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Required MQTT environment variables are missing: ${missingVars.join(
        ', '
      )}. Please define them in your .env.local file.`
    );
  }
}

if (isRuntimeExecution) {
  // Validate environment variables during initialization
  validateEnvVariables();
}

export const mqttConfig = {
  broker: process.env.MQTT_BROKER || '',
  port: process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT, 10) : 1883,
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',

  // Define topics
  topics: {
    counter1: 'counter/1',
    counter2: 'counter/2',
    setCounter1: 'set_counter/1',
    setCounter2: 'set_counter/2',
    image: 'image',
  },
};
