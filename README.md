# Tienen Kiest

A real-time voting application built with Next.js, SQLite, and MQTT.

## Features

- Admin interface to manage questions and answers
- Real-time updates via tRPC using SSE (requires modern browser, but no need for a separate
  websocker server)
- MQTT integration for receiving vote counts from external devices
- SQLite database for persistent storage

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Shadcn UI
- **Backend**: tRPC, Next.js App Router
- **Database**: SQLite with Drizzle ORM
- **Real-time**: tRPC observables for reactivity
- **Communication**: MQTT for IoT integration
- **State Management**: React Query, tRPC
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended, v1.22+)
- An MQTT broker (e.g., Mosquitto, HiveMQ)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tienen-kiest.git
cd tienen-kiest
```

2. Install dependencies:

```bash
yarn install
```

3. Configure environment variables:

Create a `.env.local` file in the root directory:

```
# MQTT Configuration
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_USERNAME=your_username  # optional
MQTT_PASSWORD=your_password  # optional
```

4. Start the development server:

```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Docker Deployment (Raspberry Pi)

You can deploy this application to a Raspberry Pi (or any other environment) using Docker:

### Prerequisites for Docker Deployment

- Docker installed on your Raspberry Pi
- A properly configured `.env` file with your environment variables

### Environment Variables

Create a `.env` file with the following variables:

```
# MQTT Configuration
MQTT_BROKER=your_mqtt_broker_address
MQTT_PORT=1883
MQTT_USERNAME=your_username  # optional
MQTT_PASSWORD=your_password  # optional

# App Configuration
NEXT_PUBLIC_APP_URL=http://your-raspberry-pi-ip:3000
NEXT_PUBLIC_WS_URL=ws://your-raspberry-pi-ip:3001  # if applicable

# Database Configuration
SQLITE_DB_PATH=/app/data/sqlite.db  # This is the path inside the container
```

### Building and Running with Docker

1. Build the Docker image for the Raspberry Pi4 architecture:

```bash
docker buildx build --platform linux/arm64/v8 -t dedene/tienen-kiest -f Dockerfile .
```

If you haven't set up buildx yet, you'll need to create and use a new builder instance first:

```bash
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap
```

2. Create a directory for persistent data:

```bash
mkdir -p ./data
```

3. Copy your existing SQLite database to the data directory (if applicable):

```bash
cp sqlite.db ./data/
```

4. Run the Docker container:

To run in foreground and view logs (i.e. while testing):

```bash
docker run --rm -it -p 3000:3000 -v "$(pwd)/data:/app/data" -v "$(pwd)/.env:/app/.env" dedene/tienen-kiest
```

```bash
docker run -d --name tienen-kiest -p 3000:3000 -v "$(pwd)/data:/app/data" -v "$(pwd)/.env:/app/.env" --restart unless-stopped dedene/tienen-kiest
```

This command:

- Maps port 3000 from the container to port 3000 on your host
- Mounts your local `./data` directory to `/app/data` in the container (for SQLite persistence)
- Mounts your `.env` file to the container for configuration
- Sets the container to restart automatically unless manually stopped

5. Access the application at `http://your-raspberry-pi-ip:3000`

### Updating the Application

To update to a new version:

```bash
# Stop and remove the old container
docker stop tienen-kiest
docker rm tienen-kiest

# Pull the latest code and rebuild
git pull
docker build -t tienen-kiest .

# Start a new container
docker run -d \
  --name tienen-kiest \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/.env:/app/.env" \
  --restart unless-stopped \
  tienen-kiest
```

### Monitoring and Troubleshooting

To view the logs from the Docker container:

```bash
# View all logs
docker logs tienen-kiest

# Follow logs in real-time
docker logs -f tienen-kiest
```

To check the container status:

```bash
docker ps -a | grep tienen-kiest
```

If the container is not running or you encounter issues:

1. Check if the database file is correctly mounted:

   ```bash
   docker exec -it tienen-kiest ls -la /app/data
   ```

2. Verify the environment variables are loaded:

   ```bash
   docker exec -it tienen-kiest printenv | grep MQTT
   ```

3. For persistent issues, try running the container in interactive mode:
   ```bash
   docker run -it --rm \
     -p 3000:3000 \
     -v "$(pwd)/data:/app/data" \
     -v "$(pwd)/.env:/app/.env" \
     tienen-kiest /bin/sh
   ```

## MQTT Topics

The application listens to the following MQTT topics:

- `counter/{answerId}` - For receiving vote counts

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components (both server and client components)
- `/src/lib` - Utility functions, database config, MQTT client, and global event bus
- `/src/trpc` - tRPC routers, context, and observable server setup
- `/src/config` - Application configuration
- `/public` - Static assets and uploaded images
- `/drizzle` - Database migrations

## Database Schema

The application uses a SQLite database with the following schema:

- `questions` - Stores questions with embedded answers, vote counts, and colors

## Admin Interface

The admin interface provides the following functionality:

1. Question Management

   - Create, edit, and delete questions
   - Set active questions for voting
   - Customize answer text and colors

2. Answer Management
   - View real-time vote counts
   - Reset vote counters

## Client Interface

The client interface shows:

- Active questions for voting
- Answers with real-time vote counts and visual feedback
- Animated visualizations of voting results

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [tRPC](https://trpc.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Drizzle ORM](https://orm.drizzle.team/)
- [SQLite](https://www.sqlite.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
