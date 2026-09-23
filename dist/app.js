"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const lead_routes_1 = __importDefault(require("./modules/leads/lead.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'LeadFlow API is online', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/leads', lead_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
