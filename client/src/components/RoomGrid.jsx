import React from 'react';
import PropTypes from 'prop-types';

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        maxWidth: '100%',
        margin: '0 auto',
    },
    floorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        justifyContent: 'flex-start',
        width: '100%',
    },
    floorLabel: {
        minWidth: '150px',
        height: '40px',
        textAlign: 'center',
        fontWeight: 'bold',
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        position: 'relative',
        flexShrink: 0,
    },
    stairsIcon: {
        position: 'absolute',
        left: '10px',
        fontSize: '20px',
    },
    roomsRow: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        flexGrow: 1,
    },
    room: {
        width: '40px',
        height: '40px',
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        userSelect: 'none',
    },
    available: {
        backgroundColor: 'white',
        '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: '#f0f0f0',
        },
    },
    booked: {
        backgroundColor: '#f44336',
        color: 'white',
        cursor: 'not-allowed',
    },
    selected: {
        backgroundColor: '#2196F3',
        color: 'white',
        transform: 'scale(1.05)',
    },
    '@media (max-width: 768px)': {
        gridContainer: {
            padding: '10px',
        },
        floorRow: {
            gap: '12px',
        },
        floorLabel: {
            minWidth: '120px',
            fontSize: '14px',
        },
        room: {
            width: '35px',
            height: '35px',
            fontSize: '12px',
        },
    },
    '@media (max-width: 480px)': {
        floorLabel: {
            minWidth: '100px',
            fontSize: '12px',
        },
        room: {
            width: '30px',
            height: '30px',
            fontSize: '11px',
        },
    }
};

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

    const getRoomStyle = (room) => {
        const isSelected = selectedRooms.includes(room.id);
        return {
            ...styles.room,
            ...(room.booked ? styles.booked : styles.available),
            ...(isSelected ? styles.selected : {}),
        };
    };

    return (
        <div style={styles.gridContainer}>
            {/* Render floors in reverse order (top floor first) */}
            {Object.entries(roomsByFloor)
                .sort(([floorA], [floorB]) => Number(floorB) - Number(floorA))
                .map(([floor, floorRooms]) => (
                    <div key={floor} style={styles.floorRow}>
                        <div style={styles.floorLabel}>
                            <span style={styles.stairsIcon}>⇕</span>
                            {floor === '10' ? 'Floor 10 (Top)' : `Floor ${floor}`}
                        </div>
                        <div style={styles.roomsRow}>
                            {floorRooms.map(room => (
                                <div
                                    key={room.id}
                                    style={getRoomStyle(room)}
                                    onClick={() => !room.booked && onRoomClick(room)}
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