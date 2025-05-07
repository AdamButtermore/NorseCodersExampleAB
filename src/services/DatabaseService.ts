import { CosmosClient, Container, Database } from '@azure/cosmos';
import { logger } from '../utils/common';
import config from '../config/config';

export class DatabaseService {
    private client: CosmosClient;
    private database: Database;
    private containers: Map<string, Container>;

    constructor() {
        this.client = new CosmosClient({
            endpoint: config.azure.cosmos.endpoint!,
            key: config.azure.cosmos.key!
        });
        this.containers = new Map();
    }

    async initialize(): Promise<void> {
        try {
            // Create database if it doesn't exist
            const { database } = await this.client.databases.createIfNotExists({
                id: config.azure.cosmos.databaseId!
            });
            this.database = database;

            // Create containers
            await this.createContainers();
            logger.info('Database initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async createContainers(): Promise<void> {
        const containerDefinitions = [
            {
                id: 'users',
                partitionKey: { paths: ['/id'] }
            },
            {
                id: 'bookings',
                partitionKey: { paths: ['/userId'] }
            },
            {
                id: 'conversations',
                partitionKey: { paths: ['/userId'] }
            }
        ];

        for (const definition of containerDefinitions) {
            const { container } = await this.database.containers.createIfNotExists(definition);
            this.containers.set(definition.id, container);
        }
    }

    async createItem<T>(containerId: string, item: T): Promise<T> {
        try {
            const container = this.containers.get(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} not found`);
            }

            const { resource } = await container.items.create(item);
            return resource as T;
        } catch (error) {
            logger.error(`Failed to create item in ${containerId}:`, error);
            throw error;
        }
    }

    async getItem<T>(containerId: string, id: string, partitionKey: string): Promise<T> {
        try {
            const container = this.containers.get(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} not found`);
            }

            const { resource } = await container.item(id, partitionKey).read();
            return resource as T;
        } catch (error) {
            logger.error(`Failed to get item from ${containerId}:`, error);
            throw error;
        }
    }

    async updateItem<T>(containerId: string, id: string, partitionKey: string, item: Partial<T>): Promise<T> {
        try {
            const container = this.containers.get(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} not found`);
            }

            const { resource } = await container.item(id, partitionKey).replace(item);
            return resource as T;
        } catch (error) {
            logger.error(`Failed to update item in ${containerId}:`, error);
            throw error;
        }
    }

    async deleteItem(containerId: string, id: string, partitionKey: string): Promise<void> {
        try {
            const container = this.containers.get(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} not found`);
            }

            await container.item(id, partitionKey).delete();
        } catch (error) {
            logger.error(`Failed to delete item from ${containerId}:`, error);
            throw error;
        }
    }

    async queryItems<T>(
        containerId: string,
        query: string,
        parameters: { name: string; value: any }[]
    ): Promise<T[]> {
        try {
            const container = this.containers.get(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} not found`);
            }

            const { resources } = await container.items.query({
                query,
                parameters
            }).fetchAll();

            return resources as T[];
        } catch (error) {
            logger.error(`Failed to query items from ${containerId}:`, error);
            throw error;
        }
    }

    async upsertItem<T>(containerId: string, item: T): Promise<T> {
        try {
            const container = this.containers.get(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} not found`);
            }

            const { resource } = await container.items.upsert(item);
            return resource as T;
        } catch (error) {
            logger.error(`Failed to upsert item in ${containerId}:`, error);
            throw error;
        }
    }

    async getContainer(containerId: string): Promise<Container> {
        const container = this.containers.get(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }
        return container;
    }
} 