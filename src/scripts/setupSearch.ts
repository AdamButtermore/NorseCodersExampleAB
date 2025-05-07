import { SearchClient, AzureKeyCredential, SearchIndexClient } from '@azure/search-documents';
import { OpenAIClient } from '@azure/openai';
import { logger } from '../utils/common';
import config from '../config/config';

interface SupportContent {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    vector?: number[];
    metadata: string;
}

// Define the index schema
const indexDefinition = {
    name: 'norse-support-content',
    fields: [
        { name: 'id', type: 'Edm.String', key: true },
        { name: 'title', type: 'Edm.String', searchable: true },
        { name: 'content', type: 'Edm.String', searchable: true },
        { name: 'category', type: 'Edm.String', filterable: true },
        { name: 'tags', type: 'Collection(Edm.String)', filterable: true },
        { name: 'vector', type: 'Collection(Edm.Single)', vectorSearchDimensions: 1536 },
        { name: 'metadata', type: 'Edm.String' }
    ],
    vectorSearch: {
        algorithmConfigurations: [
            {
                name: 'vector-config',
                kind: 'hnsw'
            }
        ]
    }
};

// Sample support content
const supportContent = [
    {
        id: 'booking-policy-1',
        title: 'Booking and Cancellation Policy',
        content: 'Norse Atlantic Airways allows free changes and cancellations up to 24 hours before departure. After this time, a fee may apply. Refunds are processed within 7-10 business days.',
        category: 'Booking',
        tags: ['booking', 'cancellation', 'policy'],
        metadata: JSON.stringify({
            lastUpdated: '2024-01-01',
            source: 'Norse Airways Support Center',
            url: 'https://norse.com/support/booking-policy'
        })
    },
    {
        id: 'baggage-allowance-1',
        title: 'Baggage Allowance',
        content: 'Economy passengers are allowed one carry-on bag (max 10kg) and one personal item. Checked baggage can be purchased up to 23kg per bag. Premium passengers receive one free checked bag.',
        category: 'Baggage',
        tags: ['baggage', 'luggage', 'allowance'],
        metadata: JSON.stringify({
            lastUpdated: '2024-01-01',
            source: 'Norse Airways Support Center',
            url: 'https://norse.com/support/baggage'
        })
    },
    {
        id: 'check-in-1',
        title: 'Online Check-in',
        content: 'Online check-in opens 24 hours before departure and closes 1 hour before departure. You can check in through our website or mobile app. Boarding passes can be printed or saved to your mobile device.',
        category: 'Check-in',
        tags: ['check-in', 'boarding', 'online'],
        metadata: JSON.stringify({
            lastUpdated: '2024-01-01',
            source: 'Norse Airways Support Center',
            url: 'https://norse.com/support/check-in'
        })
    }
];

async function setupSearchIndex() {
    try {
        // Initialize clients
        const searchClient = new SearchClient<SupportContent>(
            config.azure.search.endpoint!,
            'norse-support-content',
            new AzureKeyCredential(config.azure.search.apiKey!)
        );

        const indexClient = new SearchIndexClient(
            config.azure.search.endpoint!,
            new AzureKeyCredential(config.azure.search.apiKey!)
        );

        const openAIClient = new OpenAIClient(
            config.azure.openai.endpoint!,
            config.azure.openai.apiKey!
        );

        // Create or update the index
        logger.info('Creating/updating search index...');
        await indexClient.createOrUpdateIndex(indexDefinition);
        logger.info('Search index created/updated successfully');

        // Generate embeddings and upload documents
        logger.info('Generating embeddings and uploading documents...');
        const documentsWithVectors = await Promise.all(
            supportContent.map(async (doc) => {
                const embedding = await openAIClient.getEmbeddings({
                    model: config.azure.openai.embeddingDeploymentName!,
                    input: doc.content
                });

                return {
                    ...doc,
                    vector: embedding.data[0].embedding
                };
            })
        );

        // Upload documents in batches
        const batchSize = 100;
        for (let i = 0; i < documentsWithVectors.length; i += batchSize) {
            const batch = documentsWithVectors.slice(i, i + batchSize);
            await searchClient.uploadDocuments(batch);
            logger.info(`Uploaded batch ${i / batchSize + 1}`);
        }

        logger.info('Setup completed successfully');
    } catch (error) {
        logger.error('Failed to set up search index:', error);
        throw error;
    }
}

// Run the setup
setupSearchIndex().catch(console.error); 