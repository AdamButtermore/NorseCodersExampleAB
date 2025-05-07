import axios from 'axios';

interface TransportationSearchParams {
    from: string;
    to: string;
    date: string;
    passengers: number;
    type?: 'private' | 'shared' | 'public';
}

interface TransportationOption {
    id: string;
    type: 'private' | 'shared' | 'public';
    provider: string;
    description: string;
    price: number;
    duration: string;
    departureTime: string;
    arrivalTime: string;
    capacity: number;
    amenities: string[];
}

interface BookingDetails {
    transportationId: string;
    passengers: number;
    contactInfo: {
        name: string;
        email: string;
        phone: string;
    };
    specialRequests?: string;
}

export class TransportationService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async searchTransportation(params: TransportationSearchParams): Promise<TransportationOption[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/transportation/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    from: params.from,
                    to: params.to,
                    date: params.date,
                    passengers: params.passengers,
                    type: params.type
                }
            });

            return response.data.options;
        } catch (error) {
            console.error('Error searching transportation:', error);
            throw new Error('Failed to search transportation options');
        }
    }

    async getTransportationDetails(transportationId: string): Promise<TransportationOption> {
        try {
            const response = await axios.get(`${this.baseUrl}/transportation/${transportationId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching transportation details:', error);
            throw new Error('Failed to fetch transportation details');
        }
    }

    async bookTransportation(bookingDetails: BookingDetails): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/transportation/bookings`, bookingDetails, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.bookingReference;
        } catch (error) {
            console.error('Error booking transportation:', error);
            throw new Error('Failed to book transportation');
        }
    }

    async getBookingStatus(bookingReference: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/transportation/bookings/${bookingReference}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching booking status:', error);
            throw new Error('Failed to fetch booking status');
        }
    }

    async cancelBooking(bookingReference: string): Promise<boolean> {
        try {
            const response = await axios.delete(`${this.baseUrl}/transportation/bookings/${bookingReference}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.success;
        } catch (error) {
            console.error('Error canceling booking:', error);
            throw new Error('Failed to cancel booking');
        }
    }
} 