import axios from 'axios';

interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    cabinClass: string;
}

interface FlightOption {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    cabinClass: string;
    availableSeats: number;
}

interface AddOn {
    id: string;
    name: string;
    description: string;
    price: number;
}

export class NorseAirwaysService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async searchFlights(params: FlightSearchParams): Promise<FlightOption[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/flights/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    origin: params.origin,
                    destination: params.destination,
                    departureDate: params.departureDate,
                    returnDate: params.returnDate,
                    passengers: params.passengers,
                    cabinClass: params.cabinClass
                }
            });

            return response.data.flights;
        } catch (error) {
            console.error('Error searching flights:', error);
            throw new Error('Failed to search flights');
        }
    }

    async getAvailableAddOns(flightNumber: string): Promise<AddOn[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/flights/${flightNumber}/add-ons`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.addOns;
        } catch (error) {
            console.error('Error fetching add-ons:', error);
            throw new Error('Failed to fetch add-ons');
        }
    }

    async bookFlight(flightNumber: string, addOns: string[], passengerDetails: any): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/bookings`, {
                flightNumber,
                addOns,
                passengerDetails
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.bookingReference;
        } catch (error) {
            console.error('Error booking flight:', error);
            throw new Error('Failed to book flight');
        }
    }

    async getBookingDetails(bookingReference: string): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/bookings/${bookingReference}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw new Error('Failed to fetch booking details');
        }
    }
} 