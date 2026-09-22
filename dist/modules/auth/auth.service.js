"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const jwt_1 = require("../../utils/jwt");
const error_middleware_1 = require("../../middleware/error.middleware");
class AuthService {
    static async register(data) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingUser) {
            throw new error_middleware_1.AppError('Email address is already registered', 409);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email.toLowerCase(),
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        return { user, token };
    }
    static async login(data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (!user) {
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        }
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            token,
        };
    }
    static async getUserProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        return user;
    }
}
exports.AuthService = AuthService;
