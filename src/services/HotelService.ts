import axios from 'axios';

interface HotelSearchParams {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType?: string;
    priceRange?: {
        min: number;
        max: number;
    };
}

interface Hotel {
    id: string;
    name: string;
    description: string;
    address: string;
    rating: number;
    pricePerNight: number;
    amenities: string[];
    images: string[];
    distanceFromAirport: number;
    distanceFromAttractions: {
        [key: string]: number;
    };
}

interface Room {
    id: string;
    type: string;
    description: string;
    price: number;
    capacity: number;
    amenities: string[];
}

export class HotelService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/hotels/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    location: params.location,
                    checkIn: params.checkIn,
                    checkOut: params.checkOut,
                    guests: params.guests,
                    roomType: params.roomType,
                    priceRange: params.priceRange
                }
            });

            return response.data.hotels;
        } catch (error) {
            console.error('Error searching hotels:', error);
            throw new Error('Failed to search hotels');
        }
    }

    async getHotelDetails(hotelId: string): Promise<Hotel> {
        try {
            const response = await axios.get(`${this.baseUrl}/hotels/${hotelId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching hotel details:', error);
            throw new Error('Failed to fetch hotel details');
        }
    }

    async getAvailableRooms(hotelId: string, checkIn: string, checkOut: string): Promise<Room[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/hotels/${hotelId}/rooms`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    checkIn,
                    checkOut
                }
            });

            return response.data.rooms;
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            throw new Error('Failed to fetch available rooms');
        }
    }

    async bookRoom(hotelId: string, roomId: string, bookingDetails: any): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/bookings`, {
                hotelId,
                roomId,
                ...bookingDetails
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.bookingReference;
        } catch (error) {
            console.error('Error booking room:', error);
            throw new Error('Failed to book room');
        }
    }

    async getNearbyRestaurants(hotelId: string, radius: number = 10): Promise<any[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/hotels/${hotelId}/nearby-restaurants`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    radius
                }
            });

            return response.data.restaurants;
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
            throw new Error('Failed to fetch nearby restaurants');
        }
    }
} 