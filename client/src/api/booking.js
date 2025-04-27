import axios from 'axios';

// Use environment variable for API URL (React App uses REACT_APP_API_URL)
const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Get all rooms and their status
 * @returns {Promise<Array<{id: string, floor: number, index: string, booked: boolean}>>}
 */
export const getAllRooms = async () => {
    try {
        const response = await api.get('/rooms');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch rooms');
    }
};

/**
 * Get best available rooms for a group
 * @param {number} count - Number of rooms needed
 * @returns {Promise<Array<{id: string, floor: number, index: string, booked: boolean}>>}
 */
export const getBestRooms = async (count) => {
    try {
        const response = await api.get(`/rooms/best?count=${count}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to get best rooms');
    }
};

/**
 * Book specific rooms
 * @param {Array<string>} roomIds - Array of room IDs to book
 * @returns {Promise<Array<{id: string, floor: number, index: string, booked: boolean}>>}
 */
export const bookRooms = async (roomIds) => {
    try {
        const response = await api.post('/rooms/book', { roomIds });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to book rooms');
    }
};

/**
 * Reset all room bookings
 * @returns {Promise<{success: boolean}>}
 */
export const resetBookings = async () => {
    try {
        const response = await api.post('/reset');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to reset bookings');
    }
};

/**
 * Randomly book some rooms (for testing)
 * @param {number} count - Number of rooms to randomly book
 * @returns {Promise<Array<{id: string, floor: number, index: string, booked: boolean}>>}
 */
export const randomBookings = async (count = 5) => {
    try {
        const response = await api.post('/random', { count });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create random bookings');
    }
};

/**
 * Unbook specific rooms
 * @param {Array<string>} roomIds - Array of room IDs to unbook
 * @returns {Promise<Array<{id: string, floor: number, index: string, booked: boolean}>>}
 */
export const unbookRooms = async (roomIds) => {
    try {
        const response = await api.post('/rooms/unbook', { roomIds });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to unbook rooms');
    }
};

export default {
    getAllRooms,
    getBestRooms,
    bookRooms,
    resetBookings,
    randomBookings,
    unbookRooms
}; 