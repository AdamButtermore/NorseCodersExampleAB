import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/common';
import { logger } from '../utils/common';
import { CosmosClient } from '@azure/cosmos';
import config from '../config/config';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export class AuthMiddleware {
    private cosmosClient: CosmosClient;

    constructor(cosmosClient: CosmosClient) {
        this.cosmosClient = cosmosClient;
    }

    authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                throw new AppError('No authorization header', 401, 'UNAUTHORIZED');
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                throw new AppError('No token provided', 401, 'UNAUTHORIZED');
            }

            // Verify token and get user information
            const user = await this.verifyToken(token);
            req.user = user;

            next();
        } catch (error) {
            logger.error('Authentication error:', error);
            next(error);
        }
    };

    authorize = (roles: string[]) => {
        return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                if (!req.user) {
                    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
                }

                if (!roles.includes(req.user.role)) {
                    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
                }

                next();
            } catch (error) {
                logger.error('Authorization error:', error);
                next(error);
            }
        };
    };

    private async verifyToken(token: string): Promise<any> {
        try {
            // Get the container for users
            const container = this.cosmosClient
                .database(config.azure.cosmos.databaseId!)
                .container(config.azure.cosmos.containerId!);

            // Query for the user with the given token
            const query = {
                query: 'SELECT * FROM c WHERE c.token = @token',
                parameters: [{ name: '@token', value: token }]
            };

            const { resources } = await container.items.query(query).fetchAll();

            if (resources.length === 0) {
                throw new AppError('Invalid token', 401, 'UNAUTHORIZED');
            }

            const user = resources[0];
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            };
        } catch (error) {
            logger.error('Token verification error:', error);
            throw new AppError('Token verification failed', 401, 'UNAUTHORIZED');
        }
    }
}

// Error handling middleware
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error:', error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            code: error.code,
            message: error.message
        });
    }

    return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
    });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });

    next();
};

// Rate limiting middleware
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    // Implement rate limiting logic here
    // This is a placeholder for actual rate limiting implementation
    next();
};

// CORS middleware
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}; 