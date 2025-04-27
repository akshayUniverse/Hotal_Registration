const { generateRooms } = require('../models/room.js');

// In-memory storage for booked rooms
let bookedRoomIds = new Set();

/**
 * Calculate travel time between two rooms
 * - Horizontal travel: 1 minute per room difference (only counted if on same floor)
 * - Vertical travel: 2 minutes per floor difference (using stairs/lift)
 * @param {Object} room1 - First room
 * @param {Object} room2 - Second room
 * @returns {number} - Total travel time in minutes
 */
function calculateTravelTime(room1, room2) {
    // Vertical travel: 2 minutes per floor
    const verticalTime = Math.abs(room1.floor - room2.floor) * 2;
    
    // For horizontal travel:
    let horizontalTime = 0;
    if (room1.floor !== room2.floor) {
        // Distance from each room to the stairs/lift
        horizontalTime = (parseInt(room1.index) - 1) + (parseInt(room2.index) - 1);
    } else {
        // Direct distance between rooms on same floor
        horizontalTime = Math.abs(parseInt(room1.index) - parseInt(room2.index));
    }
    
    console.log(`Travel time between Room ${room1.id} and Room ${room2.id}:
    - Vertical: ${verticalTime} minutes (${Math.abs(room1.floor - room2.floor)} floors × 2)
    - Horizontal: ${horizontalTime} minutes
    - Total: ${verticalTime + horizontalTime} minutes`);
    
    return verticalTime + horizontalTime;
}

/**
 * Calculates the total travel time for a collection of rooms
 * @param {Array<Object>} rooms - Array of selected rooms
 * @returns {number} - Total travel time in minutes
 */
function calculateTotalTravelTime(rooms) {
    if (rooms.length <= 1) return 0;
    
    // Sort rooms by floor and then by index for calculation
    const sortedRooms = [...rooms].sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return parseInt(a.index) - parseInt(b.index);
    });
    
    // Calculate travel time between each adjacent pair of sorted rooms
    let totalTime = 0;
    for (let i = 0; i < sortedRooms.length - 1; i++) {
        const currentRoom = sortedRooms[i];
        const nextRoom = sortedRooms[i + 1];
        
        // Calculate time between this pair
        if (currentRoom.floor === nextRoom.floor) {
            // Same floor: just horizontal distance
            totalTime += Math.abs(parseInt(nextRoom.index) - parseInt(currentRoom.index));
        } else {
            // Different floors: vertical distance + horizontal distance to/from lift
            totalTime += Math.abs(nextRoom.floor - currentRoom.floor) * 2 + 
                        (parseInt(currentRoom.index) - 1) + 
                        (parseInt(nextRoom.index) - 1);
        }
    }
    
    console.log(`Total travel time for rooms ${sortedRooms.map(r => r.id).join(', ')}: ${totalTime} minutes`);
    return totalTime;
}

/**
 * Finds the best available rooms for a group booking
 * Priority 1: Same floor if possible
 * Priority 2: Minimize total travel time if cross-floor is needed
 * @param {Array<{id: string, floor: number, index: string, booked: boolean}>} rooms - All rooms
 * @param {number} k - Number of rooms needed
 * @returns {Array<{id: string, floor: number, index: string, booked: boolean, travelTime: number}>} - Selected rooms with travel time
 */
function chooseBestRooms(rooms, k) {
    console.log(`\nFinding best ${k} rooms...`);
    
    // 1. Filter out booked rooms
    const availableRooms = rooms.filter(room => !room.booked);
    if (availableRooms.length < k) {
        console.log("Not enough available rooms");
        return [];
    }

    // 2. Attempt same-floor booking
    // Group available rooms by floor
    const roomsByFloor = {};
    availableRooms.forEach(room => {
        if (!roomsByFloor[room.floor]) {
            roomsByFloor[room.floor] = [];
        }
        roomsByFloor[room.floor].push(room);
    });

    console.log('\nAvailable rooms by floor:', 
        Object.entries(roomsByFloor).map(([floor, rooms]) => 
            `\nFloor ${floor}: ${rooms.map(r => r.index).join(', ')}`
        ).join('')
    );
    
    let bestSameFloorRooms = null;
    let minSameFloorTime = Infinity;
    
    // Check each floor that has enough rooms
    for (const floor in roomsByFloor) {
        const floorRooms = roomsByFloor[floor];
        
        // Skip floors with insufficient rooms
        if (floorRooms.length < k) continue;
        
        // Sort by room index
        floorRooms.sort((a, b) => parseInt(a.index) - parseInt(b.index));
        
        // Slide a window of size k and find minimum horizontal time
        for (let i = 0; i <= floorRooms.length - k; i++) {
            const windowRooms = floorRooms.slice(i, i + k);
            const first = parseInt(windowRooms[0].index);
            const last = parseInt(windowRooms[k-1].index);
            const horizontalTime = (last - first);
            
            console.log(`Floor ${floor} window ${i}: rooms ${windowRooms.map(r => r.index).join(', ')}, time: ${horizontalTime}`);
            
            if (horizontalTime < minSameFloorTime) {
                minSameFloorTime = horizontalTime;
                bestSameFloorRooms = windowRooms;
            }
        }
    }
    
    // If we found a same-floor solution, return it
    if (bestSameFloorRooms) {
        console.log(`\nFound same-floor solution with travel time: ${minSameFloorTime}`);
        return bestSameFloorRooms.map(room => ({
            ...room,
            travelTime: minSameFloorTime
        }));
    }
    
    // 3. Multi-floor booking
    console.log("\nNo same-floor solution, trying multi-floor booking...");
    
    // Generate all combinations
    function generateCombinations(rooms, k) {
        const result = [];
        
        function backtrack(start, current) {
            if (current.length === k) {
                result.push([...current]);
                return;
            }
            
            for (let i = start; i < rooms.length; i++) {
                current.push(rooms[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }
        
        backtrack(0, []);
        return result;
    }
    
    // Generate all k-combinations of available rooms
    const allCombinations = generateCombinations(availableRooms, k);
    console.log(`Generated ${allCombinations.length} combinations`);
    
    let bestCombination = null;
    let minTotalTime = Infinity;
    
    // Evaluate each combination
    for (const combo of allCombinations) {
        const totalTime = calculateTotalTravelTime(combo);
        
        if (totalTime < minTotalTime) {
            minTotalTime = totalTime;
            bestCombination = combo;
        }
    }
    
    if (!bestCombination) {
        console.log("No valid combination found");
        return [];
    }
    
    console.log(`\nBest multi-floor solution:`, 
        bestCombination.map(r => `Room ${r.id}`).join(', '),
        `with travel time: ${minTotalTime}`
    );
    
    return bestCombination.map(room => ({
        ...room,
        travelTime: minTotalTime
    }));
}

// Controller methods for endpoints
const bookingController = {
    /**
     * Get all rooms and their status
     */
    getAllRooms: (req, res) => {
        // Use only dynamic bookings from bookedRoomIds
        const rooms = generateRooms().map(room => ({
            ...room,
            booked: bookedRoomIds.has(room.id)
        }));
        res.json(rooms);
    },

    /**
     * Get best available rooms for a group
     */
    getBestRooms: (req, res) => {
        const k = parseInt(req.query.count);
        if (isNaN(k) || k <= 0) {
            return res.status(400).json({ error: 'Invalid room count requested' });
        }

        const rooms = generateRooms().map(room => ({
            ...room,
            booked: bookedRoomIds.has(room.id)
        }));
        const bestRooms = chooseBestRooms(rooms, k);

        if (bestRooms.length === 0) {
            return res.status(404).json({ error: 'Not enough rooms available' });
        }

        res.json(bestRooms);
    },

    /**
     * Book specific rooms
     */
    bookRooms: (req, res) => {
        const { roomIds } = req.body;
        if (!Array.isArray(roomIds) || roomIds.length === 0) {
            return res.status(400).json({ error: 'Invalid room IDs provided' });
        }

        const rooms = generateRooms();
        const roomsToBook = rooms.filter(room => roomIds.includes(room.id));

        // Check if all requested rooms exist and are available
        if (roomsToBook.length !== roomIds.length) {
            return res.status(404).json({ error: 'One or more rooms not found' });
        }

        if (roomsToBook.some(room => bookedRoomIds.has(room.id))) {
            return res.status(400).json({ error: 'One or more rooms are already booked' });
        }

        // Book the rooms
        roomIds.forEach(id => bookedRoomIds.add(id));

        const bookedRooms = roomsToBook.map(room => ({
            ...room,
            booked: true
        }));

        res.json(bookedRooms);
    },

    /**
     * Unbook specific rooms
     */
    unbookRooms: (req, res) => {
        const { roomIds } = req.body;
        if (!Array.isArray(roomIds) || roomIds.length === 0) {
            return res.status(400).json({ error: 'Invalid room IDs provided' });
        }

        const rooms = generateRooms();
        const roomsToUnbook = rooms.filter(room => roomIds.includes(room.id));

        // Check if all requested rooms exist
        if (roomsToUnbook.length !== roomIds.length) {
            return res.status(404).json({ error: 'One or more rooms not found' });
        }

        // Unbook the rooms
        roomIds.forEach(id => bookedRoomIds.delete(id));

        const unbookedRooms = roomsToUnbook.map(room => ({
            ...room,
            booked: false
        }));

        res.json(unbookedRooms);
    },

    /**
     * Reset all bookings
     */
    resetBookings: (req, res) => {
        bookedRoomIds.clear();
        res.json({ success: true });
    },

    /**
     * Create random bookings (for testing)
     */
    randomBookings: (req, res) => {
        const count = parseInt(req.body.count) || 5;
        const rooms = generateRooms();
        const availableRooms = rooms.filter(room => !bookedRoomIds.has(room.id));

        if (count > availableRooms.length) {
            return res.status(400).json({ error: 'Not enough rooms available' });
        }

        // Randomly select rooms
        const selectedRooms = [];
        const tempAvailable = [...availableRooms];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * tempAvailable.length);
            const room = tempAvailable.splice(randomIndex, 1)[0];
            selectedRooms.push(room);
            bookedRoomIds.add(room.id);
        }

        res.json(selectedRooms.map(room => ({ ...room, booked: true })));
    }
};

module.exports = bookingController; 