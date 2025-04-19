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
