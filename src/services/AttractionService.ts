import axios from 'axios';

interface AttractionSearchParams {
    location: string;
    category?: string;
    rating?: number;
    priceRange?: string;
    radius?: number;
}

interface Attraction {
    id: string;
    name: string;
    description: string;
    category: string;
    address: string;
    rating: number;
    reviewCount: number;
    priceRange: string;
    openingHours: {
        [key: string]: string;
    };
    images: string[];
    reviews: Review[];
    location: {
        latitude: number;
        longitude: number;
    };
    website?: string;
    phone?: string;
}

interface Review {
    id: string;
    rating: number;
    title: string;
    text: string;
    author: string;
    date: string;
    helpfulVotes: number;
}

interface AttractionDetails extends Attraction {
    nearbyAttractions: Attraction[];
    popularTimes: {
        [key: string]: {
            [key: string]: number;
        };
    };
    accessibility: {
        wheelchairAccessible: boolean;
        parking: boolean;
        publicTransport: boolean;
    };
}

export class AttractionService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async searchAttractions(params: AttractionSearchParams): Promise<Attraction[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/attractions/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    location: params.location,
                    category: params.category,
                    rating: params.rating,
                    priceRange: params.priceRange,
                    radius: params.radius
                }
            });

            return response.data.attractions;
        } catch (error) {
            console.error('Error searching attractions:', error);
            throw new Error('Failed to search attractions');
        }
    }

    async getAttractionDetails(attractionId: string): Promise<AttractionDetails> {
        try {
            const response = await axios.get(`${this.baseUrl}/attractions/${attractionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching attraction details:', error);
            throw new Error('Failed to fetch attraction details');
        }
    }

    async getTopAttractions(location: string, limit: number = 10): Promise<Attraction[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/attractions/top`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    location,
                    limit
                }
            });

            return response.data.attractions;
        } catch (error) {
            console.error('Error fetching top attractions:', error);
            throw new Error('Failed to fetch top attractions');
        }
    }

    async getNearbyAttractions(attractionId: string, radius: number = 5): Promise<Attraction[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/attractions/${attractionId}/nearby`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    radius
                }
            });

            return response.data.attractions;
        } catch (error) {
            console.error('Error fetching nearby attractions:', error);
            throw new Error('Failed to fetch nearby attractions');
        }
    }

    async getAttractionReviews(attractionId: string, limit: number = 10): Promise<Review[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/attractions/${attractionId}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    limit
                }
            });

            return response.data.reviews;
        } catch (error) {
            console.error('Error fetching attraction reviews:', error);
            throw new Error('Failed to fetch attraction reviews');
        }
    }
} 