"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.errors.map((e) => e.message).join(', ');
                return res.status(400).json({
                    success: false,
                    message: message || 'Validation error',
                    errors: error.errors,
                });
            }
            return next(error);
        }
    };
};
exports.validateRequest = validateRequest;
