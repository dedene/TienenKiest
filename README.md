# Tienen Kiest

A real-time voting application built with Next.js, SQLite, and MQTT.

## Features

- Admin interface to manage topics, questions, and answers
- Real-time updates via WebSockets
- MQTT integration for receiving vote counts from external devices
- SQLite database for persistent storage
- Mobile-friendly responsive design

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes, custom server
- **Database**: SQLite with Drizzle ORM
- **Real-time**: Socket.IO for WebSockets
- **Communication**: MQTT for IoT integration
- **Styling**: Tailwind CSS, Framer Motion for animations

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
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

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000  # optional, defaults to window.location.origin
```

4. Start the development server:

```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## MQTT Topics

The application listens to the following MQTT topics:

- `counter/{answerId}` - For receiving vote counts
- `image/{answerId}` - For receiving image updates

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - React components
- `/src/lib` - Utility functions, database config, and MQTT client
- `/public` - Static assets and uploaded images

## Admin Interface

The admin interface is available at `/admin` and provides the following functionality:

1. Topic Management

   - Create, edit, and delete topics
   - Set the active topic

2. Question Management

   - Add questions to topics
   - Edit and delete questions

3. Answer Management
   - Add answers to questions
   - Upload images for answers
   - Reset vote counters

## Client Interface

The client interface is available at the root URL `/` and shows:

- The active topic
- Questions within the active topic
- Answers for each question with real-time vote counts and percentages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Socket.IO](https://socket.io/)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Drizzle ORM](https://orm.drizzle.team/)
- [SQLite](https://www.sqlite.org/)
