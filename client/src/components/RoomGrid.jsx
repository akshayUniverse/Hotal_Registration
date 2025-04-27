import React from 'react';
import PropTypes from 'prop-types';
import '../styles/RoomGrid.css';

const RoomGrid = ({ rooms, selectedRooms = [], onRoomClick }) => {
    // Group rooms by floor
    const roomsByFloor = rooms.reduce((acc, room) => {
        if (!acc[room.floor]) {
            acc[room.floor] = [];
        }
        acc[room.floor].push(room);
        return acc;
    }, {});

    // Sort rooms within each floor by index
    Object.values(roomsByFloor).forEach(floorRooms => {
        floorRooms.sort((a, b) => a.index.localeCompare(b.index));
    });

    const getRoomClasses = (room) => {
        const classes = ['room'];
        if (room.booked) {
            classes.push('booked');
        } else {
            classes.push('available');
        }
        if (selectedRooms.includes(room.id)) {
            classes.push('selected');
        }
        return classes.join(' ');
    };

    return (
        <div className="grid-container">
            {/* Render floors in reverse order (top floor first) */}
            {Object.entries(roomsByFloor)
                .sort(([floorA], [floorB]) => Number(floorB) - Number(floorA))
                .map(([floor, floorRooms]) => (
                    <div key={floor} className="floor-row">
                        <div className="floor-label">
                            <span className="stairs-icon">⇕</span>
                            {floor === '10' ? 'Floor 10 (Top)' : `Floor ${floor}`}
                        </div>
                        <div className="rooms-row">
                            {floorRooms.map(room => (
                                <div
                                    key={room.id}
                                    className={getRoomClasses(room)}
                                    onClick={() => onRoomClick(room)}
                                    title={`Room ${room.id}`}
                                    aria-label={`Room ${room.id}, ${room.booked ? 'booked' : 'available'}`}
                                >
                                    {room.id}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
};

RoomGrid.propTypes = {
    rooms: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        floor: PropTypes.number.isRequired,
        index: PropTypes.string.isRequired,
        booked: PropTypes.bool.isRequired,
    })).isRequired,
    selectedRooms: PropTypes.arrayOf(PropTypes.string),
    onRoomClick: PropTypes.func.isRequired,
};

export default RoomGrid; 