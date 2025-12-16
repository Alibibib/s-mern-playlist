import { GraphQLError } from 'graphql';
import type { ZodError, ZodSchema } from 'zod';

export interface ValidationErrorItem {
    field: string;
    message: string;
}

export const formatZodError = (error: ZodError): ValidationErrorItem[] => {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
};

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = formatZodError(result.error);

        throw new GraphQLError('Validation failed', {
            extensions: {
                code: 'VALIDATION_ERROR',
                errors,
                firstError: errors[0],
            },
        });
    }

    return result.data;
};

export const validateAsync = async <T>(schema: ZodSchema<T>, data: unknown): Promise<T> => {
    const result = await schema.safeParseAsync(data);

    if (!result.success) {
        const errors = formatZodError(result.error);

        throw new GraphQLError('Validation failed', {
            extensions: {
                code: 'VALIDATION_ERROR',
                errors,
                firstError: errors[0],
            },
        });
    }

    return result.data;
};
