"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            if (parsed.body)
                req.body = parsed.body;
            if (parsed.query)
                req.query = parsed.query;
            if (parsed.params)
                req.params = parsed.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.').replace(/^body\.|^query\.|^params\./, '');
                    formattedErrors[path] = err.message;
                });
                return res.status(422).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
