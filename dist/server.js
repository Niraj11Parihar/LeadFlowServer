"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const PORT = env_1.env.PORT || 5000;
async function bootstrap() {
    try {
        await prisma_1.prisma.$connect();
        console.log('Successfully connected to PostgreSQL database');
        const server = app_1.default.listen(PORT, () => {
            console.log(`LeadFlow API Server running at http://localhost:${PORT}`);
        });
        const handleGracefulShutdown = async (signal) => {
            console.log(`Received ${signal}. Shutting down server gracefully...`);
            server.close(async () => {
                try {
                    await prisma_1.prisma.$disconnect();
                    console.log('Database connection closed cleanly.');
                    process.exit(0);
                }
                catch (err) {
                    console.error('Error disconnecting database during shutdown:', err);
                    process.exit(1);
                }
            });
        };
        process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        await prisma_1.prisma.$disconnect();
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
