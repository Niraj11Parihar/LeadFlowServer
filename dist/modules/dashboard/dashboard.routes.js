"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticateUser, (0, asyncHandler_1.asyncHandler)(dashboard_controller_1.DashboardController.getStats));
exports.default = router;
