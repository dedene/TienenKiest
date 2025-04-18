import { mqttConfig } from '../config/mqtt';
import { setupMQTTClient, closeMQTTConnection } from '@/lib/mqtt';
import { createContext } from '@/trpc/context';
import { appRouter } from '@/trpc/routers';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import type { Socket } from 'net';
import next from 'next';
import { createServer } from 'node:http';
import { parse } from 'node:url';
import { WebSocketServer } from 'ws';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    if (!req.url) return;
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });
  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  // Initialize MQTT client if broker is configured
  if (mqttConfig.broker) {
    setupMQTTClient(mqttConfig);
    console.log('MQTT client initialized for broker:', mqttConfig.broker);
  } else {
    console.log('MQTT client not initialized - broker not configured');
  }

  process.on('SIGTERM', () => {
    console.log('SIGTERM');
    closeMQTTConnection();
    handler.broadcastReconnectNotification();
  });

  server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket as Socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  // Keep the next.js upgrade handler from being added to our custom server
  // so sockets stay open even when not HMR.
  const originalOn = server.on.bind(server);
  server.on = function (event, listener) {
    return event !== 'upgrade' ? originalOn(event, listener) : server;
  };
  server.listen(port);

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  );
});
