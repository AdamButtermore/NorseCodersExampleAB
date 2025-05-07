import { DatabaseService } from './DatabaseService';
import { logger } from '../utils/common';
import { User, UserPreferences, PaymentMethod } from '../utils/common';
import { AppError } from '../utils/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class UserService {
    private db: DatabaseService;
    private readonly JWT_SECRET: string;
    private readonly JWT_EXPIRES_IN: string;

    constructor(db: DatabaseService) {
        this.db = db;
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        this.JWT_EXPIRES_IN = '24h';
    }

    async register(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<User> {
        try {
            // Check if user already exists
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError('User already exists', 400, 'USER_EXISTS');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const user: User = {
                id: this.generateUserId(),
                email: userData.email,
                name: userData.name,
                preferences: this.createDefaultPreferences()
            };

            // Store user in database
            await this.db.createItem('users', {
                ...user,
                password: hashedPassword
            });

            return user;
        } catch (error) {
            logger.error('Failed to register user:', error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }

            const token = this.generateToken(user);
            return { user, token };
        } catch (error) {
            logger.error('Failed to login user:', error);
            throw error;
        }
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        try {
            const currentUser = await this.getUser(userId);
            const updatedUser = { ...currentUser, ...updates };
            
            await this.db.updateItem('users', userId, userId, updatedUser);
            return updatedUser;
        } catch (error) {
            logger.error('Failed to update user:', error);
            throw error;
        }
    }

    async updatePreferences(
        userId: string,
        preferences: Partial<UserPreferences>
    ): Promise<UserPreferences> {
        try {
            const user = await this.getUser(userId);
            const updatedPreferences = { ...user.preferences, ...preferences };
            
            await this.db.updateItem('users', userId, userId, {
                preferences: updatedPreferences
            });

            return updatedPreferences;
        } catch (error) {
            logger.error('Failed to update preferences:', error);
            throw error;
        }
    }

    async addPaymentMethod(
        userId: string,
        paymentMethod: Omit<PaymentMethod, 'id'>
    ): Promise<PaymentMethod> {
        try {
            const user = await this.getUser(userId);
            const newPaymentMethod: PaymentMethod = {
                id: this.generatePaymentMethodId(),
                ...paymentMethod
            };

            const updatedPaymentMethods = [
                ...user.preferences.savedPaymentMethods,
                newPaymentMethod
            ];

            await this.db.updateItem('users', userId, userId, {
                'preferences.savedPaymentMethods': updatedPaymentMethods
            });

            return newPaymentMethod;
        } catch (error) {
            logger.error('Failed to add payment method:', error);
            throw error;
        }
    }

    async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
        try {
            const user = await this.getUser(userId);
            const updatedPaymentMethods = user.preferences.savedPaymentMethods.filter(
                pm => pm.id !== paymentMethodId
            );

            await this.db.updateItem('users', userId, userId, {
                'preferences.savedPaymentMethods': updatedPaymentMethods
            });
        } catch (error) {
            logger.error('Failed to remove payment method:', error);
            throw error;
        }
    }

    private async findByEmail(email: string): Promise<(User & { password: string }) | null> {
        try {
            const users = await this.db.queryItems<(User & { password: string })>(
                'users',
                'SELECT * FROM c WHERE c.email = @email',
                [{ name: '@email', value: email }]
            );

            return users[0] || null;
        } catch (error) {
            logger.error('Failed to find user by email:', error);
            throw error;
        }
    }

    private async getUser(userId: string): Promise<User> {
        try {
            const user = await this.db.getItem<User>('users', userId, userId);
            if (!user) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        } catch (error) {
            logger.error('Failed to get user:', error);
            throw error;
        }
    }

    private generateToken(user: User): string {
        return jwt.sign(
            { id: user.id, email: user.email },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generatePaymentMethodId(): string {
        return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private createDefaultPreferences(): UserPreferences {
        return {
            language: 'en',
            currency: 'USD',
            notifications: true,
            savedPaymentMethods: []
        };
    }
} 