"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    static register = async (req, res) => {
        const result = await auth_service_1.AuthService.register(req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    };
    static login = async (req, res) => {
        const result = await auth_service_1.AuthService.login(req.body);
        res.status(200).json({
            success: true,
            data: result,
        });
    };
    static me = async (req, res) => {
        const user = await auth_service_1.AuthService.getUserProfile(req.user.userId);
        res.status(200).json({
            success: true,
            data: user,
        });
    };
}
exports.AuthController = AuthController;
