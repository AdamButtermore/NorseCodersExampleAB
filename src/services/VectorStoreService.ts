    import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { OpenAIClient } from '@azure/openai';
import { logger } from '../utils/common';
import config from '../config/config';

interface SupportContent {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    vector: number[];
    metadata: {
        lastUpdated: string;
        source: string;
        url?: string;
    };
}

export class VectorStoreService {
    private searchClient: SearchClient<SupportContent>;
    private openAIClient: OpenAIClient;

    constructor() {
        this.searchClient = new SearchClient<SupportContent>(
            config.azure.search.endpoint!,
            'norse-support-content',
            new AzureKeyCredential(config.azure.search.apiKey!)
        );

        this.openAIClient = new OpenAIClient(
            config.azure.openai.endpoint!,
            config.azure.openai.apiKey!
        );
    }

    async addContent(content: Omit<SupportContent, 'vector'>): Promise<void> {
        try {
            // Generate embedding for the content
            const vector = await this.generateEmbedding(content.content);
            
            // Add vector to the content
            const contentWithVector: SupportContent = {
                ...content,
                vector
            };

            // Upload to Azure Cognitive Search
            await this.searchClient.uploadDocuments([contentWithVector]);
            logger.info(`Successfully added content: ${content.title}`);
        } catch (error) {
            logger.error('Failed to add content to vector store:', error);
            throw error;
        }
    }

    async searchSimilarContent(query: string, limit: number = 5): Promise<SupportContent[]> {
        try {
            // Generate embedding for the query
            const queryVector = await this.generateEmbedding(query);

            // Search using vector similarity
            const searchResults = await this.searchClient.search('*', {
                vectorSearchOptions: {
                    queries: [{
                        kind: 'vector',
                        vector: queryVector,
                        fields: ['vector'],
                        kNearestNeighbors: limit
                    }]
                },
                select: ['id', 'title', 'content', 'category', 'tags', 'metadata']
            });

            const results: SupportContent[] = [];
            for await (const result of searchResults.results) {
                results.push(result.document);
            }

            return results;
        } catch (error) {
            logger.error('Failed to search similar content:', error);
            throw error;
        }
    }

    async updateContent(id: string, updates: Partial<SupportContent>): Promise<void> {
        try {
            // If content is being updated, regenerate the vector
            if (updates.content) {
                updates.vector = await this.generateEmbedding(updates.content);
            }

            // Update the document
            await this.searchClient.mergeDocuments([{ id, ...updates }]);
            logger.info(`Successfully updated content: ${id}`);
        } catch (error) {
            logger.error('Failed to update content:', error);
            throw error;
        }
    }

    async deleteContent(id: string): Promise<void> {
        try {
            await this.searchClient.deleteDocuments([{ id }]);
            logger.info(`Successfully deleted content: ${id}`);
        } catch (error) {
            logger.error('Failed to delete content:', error);
            throw error;
        }
    }

    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openAIClient.getEmbeddings({
                model: config.azure.openai.embeddingDeploymentName!,
                input: text
            });

            return response.data[0].embedding;
        } catch (error) {
            logger.error('Failed to generate embedding:', error);
            throw error;
        }
    }

    async bulkImport(contents: Omit<SupportContent, 'vector'>[]): Promise<void> {
        try {
            // Generate embeddings for all contents
            const contentsWithVectors = await Promise.all(
                contents.map(async (content) => ({
                    ...content,
                    vector: await this.generateEmbedding(content.content)
                }))
            );

            // Upload in batches
            const batchSize = 100;
            for (let i = 0; i < contentsWithVectors.length; i += batchSize) {
                const batch = contentsWithVectors.slice(i, i + batchSize);
                await this.searchClient.uploadDocuments(batch);
                logger.info(`Uploaded batch ${i / batchSize + 1}`);
            }
        } catch (error) {
            logger.error('Failed to bulk import contents:', error);
            throw error;
        }
    }
} 