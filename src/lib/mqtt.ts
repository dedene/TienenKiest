import { mqttConfig } from '../config/mqtt';
import { emitCounterUpdate } from '../lib/global-event-bus';
import { db } from './db';
import { questions } from './db/schema';
import { eq } from 'drizzle-orm';
import mqtt from 'mqtt';

let mqttClient: mqtt.MqttClient | null = null;

// Log on module initialization
console.log('MQTT module loaded');

interface MQTTConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
}

// Setup MQTT client and listeners
export function setupMQTTClient(config: MQTTConfig) {
  const { broker, port, username, password } = config;
  const url = `mqtt://${broker}:${port}`;

  // Connect to MQTT broker
  mqttClient = mqtt.connect(url, {
    username,
    password,
    clientId: `nextjs_server_${Math.random().toString(16).substring(2, 10)}`,
    clean: true,
  });

  // Handle connection
  mqttClient.on('connect', async () => {
    console.log('Connected to MQTT broker');

    if (!mqttClient) {
      console.error('MQTT client not initialized');
      return;
    }

    // Subscribe to counter topics
    mqttClient.subscribe('counter/+', { qos: 0 });
    mqttClient.subscribe('image/+', { qos: 0 });
  });

  // Handle messages
  mqttClient.on('message', async (topic, payload) => {
    console.log(`Received message on topic: ${topic}, payload: ${payload.toString()}`);

    if (topic.startsWith('counter/')) {
      const answerPosition = topic.split('/')[1];
      if (!answerPosition || (answerPosition !== '1' && answerPosition !== '2')) {
        console.log(`Invalid answer position: ${answerPosition}`);
        return;
      }

      try {
        const count = parseInt(payload.toString(), 10);
        if (isNaN(count)) {
          console.log(`Invalid count value: ${payload.toString()}`);
          return;
        }

        console.log(`Processing counter update for position ${answerPosition}, count: ${count}`);

        // Find the active question
        const activeQuestion = await db.query.questions.findFirst({
          where: eq(questions.isActive, true),
        });

        if (!activeQuestion) {
          console.error('No active question found');
          return;
        }

        console.log(`Found active question: ${activeQuestion.id}`);

        // Update the counter in the database based on answer position
        const updateData = {
          updatedAt: new Date().toISOString(),
          ...(answerPosition === '1' ? { answer1Count: count } : { answer2Count: count }),
        };

        await db.update(questions).set(updateData).where(eq(questions.id, activeQuestion.id));

        // Create format for counter update event
        const answerId =
          answerPosition === '1' ? `${activeQuestion.id}_answer1` : `${activeQuestion.id}_answer2`;

        console.log(`Emitting counterUpdate event with answerId: ${answerId}, count: ${count}`);

        // Emit event through global event bus
        emitCounterUpdate({
          answerId,
          count,
        });

        console.log('counterUpdate event emitted successfully');
      } catch (error) {
        console.error('Error processing counter update:', error);
      }
    }
  });

  // Handle errors
  mqttClient.on('error', (error) => {
    console.error('MQTT client error:', error);
  });

  return mqttClient;
}

// Publish a message to the MQTT broker
export function publishMessage(topic: string, message: string) {
  if (!mqttClient) {
    console.error('MQTT client not initialized');
    return;
  }

  mqttClient.publish(topic, message, { qos: 0, retain: false });
}

// Reset counters for the active question
export async function resetCounters() {
  if (!mqttClient) {
    console.error('MQTT client not initialized');
    return false;
  }

  try {
    // Find the active question
    const activeQuestion = await db.query.questions.findFirst({
      where: eq(questions.isActive, true),
    });

    if (!activeQuestion) {
      console.error('No active question found');
      return false;
    }

    // Update the database to reset both counters
    await db
      .update(questions)
      .set({
        answer1Count: 0,
        answer2Count: 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(questions.id, activeQuestion.id));

    // Publish the reset to MQTT
    publishMessage(mqttConfig.topics.setCounter1, '0');
    publishMessage(mqttConfig.topics.setCounter2, '0');

    // Emit update through global event bus
    const answer1Id = `${activeQuestion.id}_answer1`;
    const answer2Id = `${activeQuestion.id}_answer2`;

    emitCounterUpdate({ answerId: answer1Id, count: 0 });
    emitCounterUpdate({ answerId: answer2Id, count: 0 });

    return true;
  } catch (error) {
    console.error('Error resetting counters:', error);
    return false;
  }
}

// Close the MQTT connection
export function closeMQTTConnection() {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
  }
}
