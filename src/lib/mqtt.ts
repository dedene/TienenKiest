import { db } from './db';
import { questions } from './db/schema';
import { eq } from 'drizzle-orm';
import mqtt from 'mqtt';
import { Server as SocketIOServer } from 'socket.io';

let mqttClient: mqtt.MqttClient | null = null;
let io: SocketIOServer | null = null;

interface MQTTConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
}

// Setup MQTT client and listeners
export function setupMQTTClient(config: MQTTConfig, socketIO: SocketIOServer) {
  io = socketIO;

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
  mqttClient.on('connect', () => {
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

        // Update the counter in the database based on answer position
        const updateData = {
          updatedAt: new Date().toISOString(),
          ...(answerPosition === '1' ? { answer1Count: count } : { answer2Count: count }),
        };

        await db.update(questions).set(updateData).where(eq(questions.id, activeQuestion.id));

        // Fake answerId to maintain compatibility with client expectations
        // The client expects an answerId and count format
        const answerId =
          answerPosition === '1' ? `${activeQuestion.id}_answer1` : `${activeQuestion.id}_answer2`;

        if (io) {
          // Emit updated data to all connected clients
          io.emit('counter-update', {
            answerId,
            count,
          });
        }
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
    return;
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
    publishMessage(`set_counter/1`, '0');
    publishMessage(`set_counter/2`, '0');

    if (io) {
      // Emit updated data to all connected clients with the format expected by clients
      const answer1Id = `${activeQuestion.id}_answer1`;
      const answer2Id = `${activeQuestion.id}_answer2`;

      io.emit('counter-update', { answerId: answer1Id, count: 0 });
      io.emit('counter-update', { answerId: answer2Id, count: 0 });
    }

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
