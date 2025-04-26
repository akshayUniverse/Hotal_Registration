/**
 * Generates an array of Room objects for the hotel
 * Floors 1-9 have rooms 01-10
 * Floor 10 has rooms 01-07
 * @returns {Array<{id: string, floor: number, index: string, booked: boolean}>}
 */
function generateRooms() {
    const rooms = [];

    // Generate rooms for floors 1-9 (10 rooms each)
    for (let floor = 1; floor <= 9; floor++) {
        for (let roomIndex = 1; roomIndex <= 10; roomIndex++) {
            rooms.push({
                id: `${floor}${roomIndex.toString().padStart(2, '0')}`,
                floor: floor,
                index: roomIndex.toString().padStart(2, '0'),
                booked: false
            });
        }
    }

    // Generate rooms for floor 10 (7 rooms)
    for (let roomIndex = 1; roomIndex <= 7; roomIndex++) {
        rooms.push({
            id: `10${roomIndex.toString().padStart(2, '0')}`,
            floor: 10,
            index: roomIndex.toString().padStart(2, '0'),
            booked: false
        });
    }

    return rooms;
}

module.exports = {
    generateRooms
}; 