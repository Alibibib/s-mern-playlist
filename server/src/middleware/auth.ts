import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

export interface JWTPayload {
    id: string;
    email: string;
}

export const authenticateToken = (token: string | undefined): JWTPayload | null => {
    if (!token) {
        return null;
    }

    try {
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        return jwt.verify(
            cleanToken,
            process.env.JWT_SECRET || 'unsafe_secret_key'
        ) as JWTPayload;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new GraphQLError('Token expired', {
                extensions: { code: 'TOKEN_EXPIRED' },
            });
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new GraphQLError('Invalid token', {
                extensions: { code: 'INVALID_TOKEN' },
            });
        }
        return null;
    }
};

export const getContextUser = (req: any) => {
    const token = req.headers.authorization || '';
    return authenticateToken(token);
};