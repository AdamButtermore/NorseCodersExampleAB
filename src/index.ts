import express from 'express';
import { BotFrameworkAdapter } from 'botbuilder';
import { OpenAIClient } from '@azure/openai';
import { CosmosClient } from '@azure/cosmos';
import { TravelBookingBot } from './bot/TravelBookingBot';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendActivity('Sorry, it looks like something went wrong!');
};

// Initialize Azure services
const openAIClient = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT!,
    process.env.AZURE_OPENAI_API_KEY!
);

const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
});

// Create bot instance
const bot = new TravelBookingBot(openAIClient, cosmosClient);

// Listen for incoming requests
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Start server
const PORT = process.env.PORT || 3978;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 