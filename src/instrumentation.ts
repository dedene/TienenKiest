export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // First, ensure global event bus is initialized
    const { getListenerCount } = await import('./lib/global-event-bus');
    console.log('Instrumentation - initialized global event bus');
    console.log('Initial listener counts:', getListenerCount());

    // Then initialize MQTT client
    const { initMQTTClient } = await import('./lib/mqtt-server');
    initMQTTClient();
  }
}
