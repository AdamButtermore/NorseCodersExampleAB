import axios from 'axios';

interface RestaurantSearchParams {
    location: string;
    cuisine?: string;
    priceRange?: string;
    rating?: number;
    radius?: number;
}

interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    description: string;
    address: string;
    rating: number;
    priceRange: string;
    openingHours: {
        [key: string]: string;
    };
    menu: MenuItem[];
    images: string[];
    reviews: Review[];
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    dietaryInfo: string[];
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    author: string;
    date: string;
}

interface ReservationDetails {
    restaurantId: string;
    date: string;
    time: string;
    partySize: number;
    contactInfo: {
        name: string;
        email: string;
        phone: string;
    };
    specialRequests?: string;
}

export class RestaurantService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async searchRestaurants(params: RestaurantSearchParams): Promise<Restaurant[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/restaurants/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    location: params.location,
                    cuisine: params.cuisine,
                    priceRange: params.priceRange,
                    rating: params.rating,
                    radius: params.radius
                }
            });

            return response.data.restaurants;
        } catch (error) {
            console.error('Error searching restaurants:', error);
            throw new Error('Failed to search restaurants');
        }
    }

    async getRestaurantDetails(restaurantId: string): Promise<Restaurant> {
        try {
            const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            throw new Error('Failed to fetch restaurant details');
        }
    }

    async checkAvailability(restaurantId: string, date: string, partySize: number): Promise<string[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}/availability`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    date,
                    partySize
                }
            });

            return response.data.availableTimes;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw new Error('Failed to check availability');
        }
    }

    async makeReservation(details: ReservationDetails): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/reservations`, details, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.reservationId;
        } catch (error) {
            console.error('Error making reservation:', error);
            throw new Error('Failed to make reservation');
        }
    }

    async getReservationDetails(reservationId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/reservations/${reservationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching reservation details:', error);
            throw new Error('Failed to fetch reservation details');
        }
    }

    async cancelReservation(reservationId: string): Promise<boolean> {
        try {
            const response = await axios.delete(`${this.baseUrl}/reservations/${reservationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.success;
        } catch (error) {
            console.error('Error canceling reservation:', error);
            throw new Error('Failed to cancel reservation');
        }
    }
} 