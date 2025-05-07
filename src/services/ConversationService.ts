import { DatabaseService } from './DatabaseService';
import { logger } from '../utils/common';
import { OpenAIClient } from '@azure/openai';
import { VectorStoreService } from './VectorStoreService';
import config from '../config/config';

interface ConversationState {
    userId: string;
    currentStep: string;
    context: {
        tripPurpose?: 'business' | 'leisure' | 'mixed';
        flightDetails?: {
            origin: string;
            destination: string;
            departureDate: string;
            returnDate?: string;
            passengers: number;
            cabinClass: string;
            addOns: string[];
        };
        hotelDetails?: {
            location: string;
            checkIn: string;
            checkOut: string;
            guests: number;
            preferences: string[];
        };
        transportationDetails?: {
            type: string;
            from: string;
            to: string;
            date: string;
            passengers: number;
        };
        restaurantDetails?: {
            location: string;
            cuisine: string;
            date: string;
            time: string;
            partySize: number;
        };
    };
    lastMessage: string;
    lastResponse: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ConversationService {
    private db: DatabaseService;
    private openAIClient: OpenAIClient;
    private vectorStore: VectorStoreService;

    constructor(db: DatabaseService, openAIClient: OpenAIClient, vectorStore: VectorStoreService) {
        this.db = db;
        this.openAIClient = openAIClient;
        this.vectorStore = vectorStore;
    }

    async getConversationState(userId: string): Promise<ConversationState> {
        try {
            const state = await this.db.getItem<ConversationState>('conversations', userId, userId);
            return state;
        } catch (error) {
            logger.error('Failed to get conversation state:', error);
            return this.createInitialState(userId);
        }
    }

    private async createInitialState(userId: string): Promise<ConversationState> {
        const initialState: ConversationState = {
            userId,
            currentStep: 'initial',
            context: {},
            lastMessage: '',
            lastResponse: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.db.createItem('conversations', initialState);
        return initialState;
    }

    async updateConversationState(
        userId: string,
        updates: Partial<ConversationState>
    ): Promise<ConversationState> {
        try {
            const currentState = await this.getConversationState(userId);
            const updatedState = {
                ...currentState,
                ...updates,
                updatedAt: new Date()
            };

            await this.db.updateItem('conversations', userId, userId, updatedState);
            return updatedState;
        } catch (error) {
            logger.error('Failed to update conversation state:', error);
            throw error;
        }
    }

    async processMessage(userId: string, message: string): Promise<string> {
        try {
            const state = await this.getConversationState(userId);
            
            // First, try to find relevant support content
            const relevantContent = await this.vectorStore.searchSimilarContent(
                message,
                config.defaults.vectorSearchLimit
            );

            // Generate response using RAG if relevant content is found
            const response = await this.generateResponse(state, message, relevantContent);
            
            await this.updateConversationState(userId, {
                lastMessage: message,
                lastResponse: response
            });

            return response;
        } catch (error) {
            logger.error('Failed to process message:', error);
            throw error;
        }
    }

    private async generateResponse(
        state: ConversationState,
        message: string,
        relevantContent: any[]
    ): Promise<string> {
        try {
            const prompt = this.buildPrompt(state, message, relevantContent);
            
            const response = await this.openAIClient.getCompletions({
                model: config.azure.openai.deploymentName!,
                prompt: [prompt],
                maxTokens: 150,
                temperature: 0.7,
                topP: 0.95,
                frequencyPenalty: 0,
                presencePenalty: 0,
                stop: ['\n', 'Human:', 'AI:']
            });

            return response.choices[0].text.trim();
        } catch (error) {
            logger.error('Failed to generate response:', error);
            throw error;
        }
    }

    private buildPrompt(
        state: ConversationState,
        message: string,
        relevantContent: any[]
    ): string {
        const context = state.context;
        let prompt = `You are a travel booking assistant for Norse Atlantic Airways. Current conversation state:\n`;
        prompt += `Step: ${state.currentStep}\n`;
        
        if (context.tripPurpose) {
            prompt += `Trip Purpose: ${context.tripPurpose}\n`;
        }
        
        if (context.flightDetails) {
            prompt += `Flight Details: ${JSON.stringify(context.flightDetails)}\n`;
        }
        
        if (context.hotelDetails) {
            prompt += `Hotel Details: ${JSON.stringify(context.hotelDetails)}\n`;
        }
        
        if (context.transportationDetails) {
            prompt += `Transportation Details: ${JSON.stringify(context.transportationDetails)}\n`;
        }
        
        if (context.restaurantDetails) {
            prompt += `Restaurant Details: ${JSON.stringify(context.restaurantDetails)}\n`;
        }

        // Add relevant support content if available
        if (relevantContent.length > 0) {
            prompt += '\nRelevant support content:\n';
            relevantContent.forEach((content, index) => {
                prompt += `${index + 1}. ${content.title}\n${content.content}\n\n`;
            });
        }

        prompt += `\nLast message: ${message}\n`;
        prompt += `\nPlease provide a helpful response that guides the user through the booking process.`;
        if (relevantContent.length > 0) {
            prompt += ` Use the provided support content as your primary source of information.`;
        }

        return prompt;
    }

    async resetConversation(userId: string): Promise<void> {
        try {
            await this.db.deleteItem('conversations', userId, userId);
            await this.createInitialState(userId);
        } catch (error) {
            logger.error('Failed to reset conversation:', error);
            throw error;
        }
    }
} 