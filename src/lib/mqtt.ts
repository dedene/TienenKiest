import { mqttConfig } from '../config/mqtt';
import { observableServer } from '../trpc/observable-server';
import { db } from './db';
import { questions } from './db/schema';
import { eq } from 'drizzle-orm';
import mqtt from 'mqtt';

let mqttClient: mqtt.MqttClient | null = null;
// Track the current active question ID
let currentActiveQuestionId: string | null = null;

interface MQTTConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
}

// Helper function to check and update the current active question
async function checkActiveQuestionChange() {
  try {
    const activeQuestion = await db.query.questions.findFirst({
      where: eq(questions.isActive, true),
    });

    if (activeQuestion && activeQuestion.id !== currentActiveQuestionId) {
      // Update the current active question ID
      const oldId = currentActiveQuestionId;
      currentActiveQuestionId = activeQuestion.id;

      console.log(
        `[DEBUG MQTT] Active question change detected from ${oldId} to ${activeQuestion.id}`
      );

      // Emit the event
      console.log(`[DEBUG MQTT] Emitting activeQuestionChange event for: ${activeQuestion.id}`);
      observableServer.activeQuestionChange.emit('activeQuestionChange', {
        questionId: activeQuestion.id,
      });
      console.log(`[DEBUG MQTT] activeQuestionChange event emitted successfully`);

      console.log(`Active question changed to: ${activeQuestion.id}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking for active question changes:', error);
    return false;
  }
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

    // Check for active question on connection
    await checkActiveQuestionChange();
  });

  // Handle messages
  mqttClient.on('message', async (topic, payload) => {
    console.log(`Received message on topic: ${topic}`);

    if (topic.startsWith('counter/')) {
      const answerPosition = topic.split('/')[1];
      if (!answerPosition || (answerPosition !== '1' && answerPosition !== '2')) return;

      try {
        const count = parseInt(payload.toString(), 10);
        if (isNaN(count)) return;

        // Find the active question
        const activeQuestion = await db.query.questions.findFirst({
          where: eq(questions.isActive, true),
        });

        if (!activeQuestion) {
          console.error('No active question found');
          return;
        }

        // Check if the active question has changed
        if (currentActiveQuestionId !== activeQuestion.id) {
          // Update tracking and emit change event
          currentActiveQuestionId = activeQuestion.id;
          observableServer.activeQuestionChange.emit('activeQuestionChange', {
            questionId: activeQuestion.id,
          });
        }

        // Update the counter in the database based on answer position
        const updateData = {
          updatedAt: new Date().toISOString(),
          ...(answerPosition === '1' ? { answer1Count: count } : { answer2Count: count }),
        };

        await db.update(questions).set(updateData).where(eq(questions.id, activeQuestion.id));

        // Create format for counter update event
        const answerId =
          answerPosition === '1' ? `${activeQuestion.id}_answer1` : `${activeQuestion.id}_answer2`;

        // Emit event through tRPC observable
        observableServer.counterUpdate.emit('counterUpdate', {
          answerId,
          count,
        });
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

    // Check if active question has changed
    if (currentActiveQuestionId !== activeQuestion.id) {
      currentActiveQuestionId = activeQuestion.id;
      observableServer.activeQuestionChange.emit('activeQuestionChange', {
        questionId: activeQuestion.id,
      });
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

    // Emit update through tRPC observable
    const answer1Id = `${activeQuestion.id}_answer1`;
    const answer2Id = `${activeQuestion.id}_answer2`;

    observableServer.counterUpdate.emit('counterUpdate', { answerId: answer1Id, count: 0 });
    observableServer.counterUpdate.emit('counterUpdate', { answerId: answer2Id, count: 0 });

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
