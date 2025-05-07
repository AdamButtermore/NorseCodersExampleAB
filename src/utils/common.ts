// Common Types
export interface User {
    id: string;
    email: string;
    name: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    language: string;
    currency: string;
    notifications: boolean;
    savedPaymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
    id: string;
    type: 'credit_card' | 'paypal';
    lastFourDigits?: string;
    expiryDate?: string;
    isDefault: boolean;
}

export interface Booking {
    id: string;
    userId: string;
    type: 'flight' | 'hotel' | 'transportation' | 'restaurant';
    status: 'pending' | 'confirmed' | 'cancelled';
    details: any;
    createdAt: Date;
    updatedAt: Date;
}

// Date Utilities
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// Currency Utilities
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Validation Utilities
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};

// Error Handling
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code: string = 'INTERNAL_SERVER_ERROR'
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// Logging
export const logger = {
    info: (message: string, data?: any) => {
        console.log(`[INFO] ${message}`, data || '');
    },
    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, error || '');
    },
    warn: (message: string, data?: any) => {
        console.warn(`[WARN] ${message}`, data || '');
    },
    debug: (message: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    }
};

// API Response Formatting
export const formatApiResponse = <T>(
    data: T,
    message: string = 'Success',
    status: number = 200
) => {
    return {
        status,
        message,
        data,
        timestamp: new Date().toISOString()
    };
};

// String Utilities
export const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Array Utilities
export const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// Object Utilities
export const pick = <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> => {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {} as Pick<T, K>);
};

export const omit = <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}; 