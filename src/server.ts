import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log(`LeadFlow API Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
