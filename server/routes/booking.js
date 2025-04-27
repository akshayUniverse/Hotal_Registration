const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking');

// GET /api/rooms - Get all rooms and their status
router.get('/rooms', bookingController.getAllRooms);

// GET /api/rooms/best?count=n - Get best available rooms for a group
router.get('/rooms/best', bookingController.getBestRooms);

// POST /api/rooms/book - Book specific rooms
router.post('/rooms/book', bookingController.bookRooms);

// Enable unbooking of rooms
router.post('/rooms/unbook', bookingController.unbookRooms);

// POST /api/reset - Reset all bookings
router.post('/reset', bookingController.resetBookings);

// POST /api/random - Create random bookings
router.post('/random', bookingController.randomBookings);

module.exports = router; 