import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database');

    const server = app.listen(PORT, () => {
      console.log(`LeadFlow API Server running at http://localhost:${PORT}`);
    });

    const handleGracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down server gracefully...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log('Database connection closed cleanly.');
          process.exit(0);
        } catch (err) {
          console.error('Error disconnecting database during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]:', error);
});

bootstrap();
