"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
class DashboardController {
    static getStats = async (req, res) => {
        const stats = await dashboard_service_1.DashboardService.getDashboardStats(req.user.userId);
        res.status(200).json({
            success: true,
            data: stats,
        });
    };
}
exports.DashboardController = DashboardController;
