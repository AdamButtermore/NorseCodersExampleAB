import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3978,
        environment: process.env.NODE_ENV || 'development'
    },

    // Azure Configuration
    azure: {
        openai: {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            embeddingDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME
        },
        cosmos: {
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY,
            databaseId: process.env.COSMOS_DATABASE_ID,
            containerId: process.env.COSMOS_CONTAINER_ID
        },
        search: {
            endpoint: process.env.AZURE_SEARCH_ENDPOINT,
            apiKey: process.env.AZURE_SEARCH_API_KEY,
            indexName: 'norse-support-content'
        },
        keyVault: {
            name: process.env.AZURE_KEY_VAULT_NAME,
            clientId: process.env.AZURE_CLIENT_ID,
            clientSecret: process.env.AZURE_CLIENT_SECRET,
            tenantId: process.env.AZURE_TENANT_ID
        }
    },

    // Bot Framework Configuration
    bot: {
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword
    },

    // Norse Atlantic Airways API Configuration
    norseAirways: {
        apiKey: process.env.NORSE_API_KEY,
        apiEndpoint: process.env.NORSE_API_ENDPOINT
    },

    // Hotel API Configuration
    hotel: {
        apiKey: process.env.HOTEL_API_KEY,
        apiEndpoint: process.env.HOTEL_API_ENDPOINT
    },

    // Transportation API Configuration
    transportation: {
        apiKey: process.env.TRANSPORTATION_API_KEY,
        apiEndpoint: process.env.TRANSPORTATION_API_ENDPOINT
    },

    // Restaurant API Configuration
    restaurant: {
        apiKey: process.env.RESTAURANT_API_KEY,
        apiEndpoint: process.env.RESTAURANT_API_ENDPOINT
    },

    // TripAdvisor API Configuration
    tripAdvisor: {
        apiKey: process.env.TRIPADVISOR_API_KEY,
        apiEndpoint: process.env.TRIPADVISOR_API_ENDPOINT
    },

    // Default Values
    defaults: {
        searchRadius: 10, // kilometers
        maxResults: 10,
        defaultCurrency: 'USD',
        defaultLanguage: 'en',
        vectorSearchLimit: 5
    },

    // Feature Flags
    features: {
        enableHotelBooking: true,
        enableRestaurantReservations: true,
        enableTransportationBooking: true,
        enableAttractionRecommendations: true,
        enableVectorSearch: true
    }
};

// Validate required environment variables
const requiredEnvVars = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_DEPLOYMENT_NAME',
    'AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME',
    'AZURE_SEARCH_ENDPOINT',
    'AZURE_SEARCH_API_KEY',
    'COSMOS_ENDPOINT',
    'COSMOS_KEY',
    'MicrosoftAppId',
    'MicrosoftAppPassword'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export default config; 