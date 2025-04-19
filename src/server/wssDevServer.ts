import { mqttConfig } from '@/config/mqtt';
import { setupMQTTClient } from '@/lib/mqtt';
import { createContext } from '@/trpc/context';
import { appRouter } from '@/trpc/routers';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 3001,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

// Initialize MQTT client if broker is configured
if (mqttConfig.broker) {
  setupMQTTClient(mqttConfig);
  console.log('MQTT client initialized for broker:', mqttConfig.broker);
} else {
  console.log('MQTT client not initialized - broker not configured');
}

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://localhost:3001');

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
