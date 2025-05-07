import { ActivityHandler, TurnContext } from 'botbuilder';
import { OpenAIClient } from '@azure/openai';
import { CosmosClient } from '@azure/cosmos';

export class TravelBookingBot extends ActivityHandler {
    private openAIClient: OpenAIClient;
    private cosmosClient: CosmosClient;

    constructor(openAIClient: OpenAIClient, cosmosClient: CosmosClient) {
        super();
        this.openAIClient = openAIClient;
        this.cosmosClient = cosmosClient;

        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;
            const response = await this.processMessage(userMessage, context);
            await context.sendActivity(response);
            await next();
        });
    }

    private async processMessage(message: string, context: TurnContext): Promise<string> {
        // Get conversation state
        const conversationState = await this.getConversationState(context);
        
        // Process the message based on conversation state
        switch (conversationState.step) {
            case 'initial':
                return this.handleInitialGreeting();
            case 'trip_purpose':
                return this.handleTripPurpose(message);
            case 'flight_selection':
                return this.handleFlightSelection(message);
            case 'add_ons':
                return this.handleAddOns(message);
            case 'hotel_selection':
                return this.handleHotelSelection(message);
            case 'transportation':
                return this.handleTransportation(message);
            case 'restaurant':
                return this.handleRestaurantSelection(message);
            case 'attractions':
                return this.handleAttractions(message);
            default:
                return this.handleInitialGreeting();
        }
    }

    private async handleInitialGreeting(): Promise<string> {
        return `Welcome to Norse Atlantic Airways! I'm your travel assistant. 
        Before we begin, could you please tell me if this trip is for:
        1. Business
        2. Leisure
        3. A mix of both`;
    }

    private async handleTripPurpose(message: string): Promise<string> {
        // Process trip purpose and move to flight selection
        return `Great! Let's find you a flight from London Gatwick to JFK.
        Would you like to:
        1. See the cheapest option
        2. See all available options
        3. Filter by specific dates`;
    }

    private async handleFlightSelection(message: string): Promise<string> {
        return `I've found some great options for your trip. Here are the available add-ons:
        - Seat Selection
        - WiFi
        - Meals
        - Checked Bag
        - Priority Boarding
        
        Please select the add-ons you'd like (you can select multiple):`;
    }

    private async handleAddOns(message: string): Promise<string> {
        return `Based on your selection of the cheapest option and checked bag, 
        I recommend our Economy Standard fare. Would you like to proceed with this selection?`;
    }

    private async handleHotelSelection(message: string): Promise<string> {
        return `I see you're interested in Greenwich Village. Here are three great hotel options:
        1. The Greenwich Hotel - Luxury boutique hotel
        2. Washington Square Hotel - Mid-range with great location
        3. The Marlton Hotel - Budget-friendly option
        
        Which would you prefer?`;
    }

    private async handleTransportation(message: string): Promise<string> {
        return `For transportation from JFK to your hotel, we offer:
        1. Private car service
        2. Shared shuttle
        3. Public transportation
        4. Taxi/Uber
        
        What would you prefer?`;
    }

    private async handleRestaurantSelection(message: string): Promise<string> {
        return `Here are some great restaurants within 10 minutes of your hotel:
        1. Minetta Tavern - Classic American
        2. L'Artusi - Italian
        3. Blue Hill - Farm-to-table
        
        Would you like to make a reservation at any of these?`;
    }

    private async handleAttractions(message: string): Promise<string> {
        return `Here are some top attractions in New York:
        1. Central Park
        2. Empire State Building
        3. Statue of Liberty
        4. Times Square
        5. Metropolitan Museum of Art
        
        Would you like more information about any of these attractions?`;
    }

    private async getConversationState(context: TurnContext): Promise<any> {
        // Implement conversation state management
        return { step: 'initial' };
    }
} 