"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const lead_routes_1 = __importDefault(require("./modules/leads/lead.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: [env_1.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'LeadFlow API is online', timestamp: new Date().toISOString() });
});
// Module Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/leads', lead_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Global 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
