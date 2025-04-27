import React, { useState, useEffect } from 'react';
import RoomGrid from '../components/RoomGrid';
import { getAllRooms, getBestRooms, bookRooms, resetBookings, randomBookings, unbookRooms } from '../api/booking';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  controls: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap',
    padding: '0 20px',
  },
  controlItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '200px',
  },
  inputWrapper: {
    border: '1px solid #333',
    padding: '15px 30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    padding: '15px 30px',
    backgroundColor: '#ddd',
    color: '#333',
    border: '1px solid #333',
    cursor: 'pointer',
    fontWeight: 'normal',
    minWidth: '200px',
    textAlign: 'center',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#ccc',
    },
  },
  input: {
    padding: '8px 12px',
    width: '80px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  messageContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  messageBox: {
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '4px',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  successMessage: {
    backgroundColor: '#dff0d8',
    color: '#3c763d',
    border: '1px solid #d6e9c6',
  },
  errorMessage: {
    backgroundColor: '#f2dede',
    color: '#a94442',
    border: '1px solid #ebccd1',
  },
  infoMessage: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #bbdefb',
  },
  loadingMessage: {
    textAlign: 'center',
    margin: '20px 0',
    color: '#666',
  },
  gridContainer: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box',
  },
  bookSelectedButton: {
    marginTop: '20px',
    padding: '15px 30px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
  '@media (max-width: 768px)': {
    controls: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
    },
    controlItem: {
      width: '100%',
      maxWidth: '300px',
    },
    button: {
      width: '100%',
    },
    title: {
      fontSize: '24px',
    },
    messageBox: {
      margin: '10px',
    },
  },
};

const MAX_ROOMS_PER_BOOKING = 5;

const BookingPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomCount, setRoomCount] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [travelTime, setTravelTime] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRooms();
      setRooms(data);
    } catch (error) {
      setError('Failed to fetch rooms. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate travel time between two rooms
  const calculateTravelTime = (room1, room2) => {
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
    
    return verticalTime + horizontalTime;
  };

  // Calculate total travel time for selected rooms
  const calculateTotalTravelTime = (selectedRoomIds) => {
    if (selectedRoomIds.length <= 1) return 0;

    // Map IDs to room objects and sort by floor then index
    const selectedRoomObjects = selectedRoomIds.map(id => rooms.find(room => room.id === id));
    const sortedRooms = [...selectedRoomObjects].sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return parseInt(a.index) - parseInt(b.index);
    });

    // Sum travel times between adjacent rooms
    let totalTime = 0;
    for (let i = 0; i < sortedRooms.length - 1; i++) {
      totalTime += calculateTravelTime(sortedRooms[i], sortedRooms[i + 1]);
    }

    return totalTime;
  };

  // Handle clicking on a room: unbook if already booked, otherwise toggle selection
  const handleRoomClick = async (room) => {
    if (room.booked) {
      // Unbook this room
      try {
        setLoading(true);
        await unbookRooms([room.id]);
        await fetchRooms();
        setSelectedRooms([]);
        setMessage(`Room ${room.id} has been unbooked`);
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setError('Failed to unbook room. Please try again.');
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }
    // Toggle selection for available rooms
    setSelectedRooms(prev => {
      const newSelection = prev.includes(room.id)
        ? prev.filter(id => id !== room.id)
        : prev.length >= MAX_ROOMS_PER_BOOKING
          ? (setError(`You can only book up to ${MAX_ROOMS_PER_BOOKING} rooms at a time.`), prev)
          : [...prev, room.id];

      // Calculate and update travel time for the new selection
      if (newSelection.length > 1) {
        setTravelTime(calculateTotalTravelTime(newSelection));
      } else {
        setTravelTime(null);
      }

      return newSelection;
    });
  };

  const handleResetClick = async () => {
    try {
      setLoading(true);
      await resetBookings();
      await fetchRooms();
      setSelectedRooms([]);
      setMessage('All bookings have been reset');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Failed to reset bookings. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomClick = async () => {
    try {
      setLoading(true);
      // Randomly book between 5 and 30 rooms, up to available rooms
      const availableRoomsCount = rooms.filter(r => !r.booked).length;
      const minRooms = 5;
      const maxRooms = 30;
      const count = Math.min(
        Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms,
        availableRoomsCount
      );
      await randomBookings(count);
      await fetchRooms();
      setSelectedRooms([]);
      setMessage(`${count} rooms have been randomly booked`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Failed to create random bookings. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async () => {
    if (selectedRooms.length === 0) {
      setError('Please select at least one room to book');
      return;
    }

    if (selectedRooms.length > MAX_ROOMS_PER_BOOKING) {
      setError(`You can only book up to ${MAX_ROOMS_PER_BOOKING} rooms at a time.`);
      return;
    }

    try {
      setLoading(true);
      await bookRooms(selectedRooms);
      await fetchRooms();
      setMessage(`${selectedRooms.length} rooms have been booked`);
      setSelectedRooms([]);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Failed to book rooms. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindBestRooms = async () => {
    try {
      if (roomCount <= 0 || roomCount > MAX_ROOMS_PER_BOOKING) {
        setError(`Please enter a number between 1 and ${MAX_ROOMS_PER_BOOKING}`);
        return;
      }
      // Check if enough rooms are available before requesting
      const availableCount = rooms.filter(r => !r.booked).length;
      if (availableCount < roomCount) {
        setError('Not enough available rooms');
        return;
      }

      setLoading(true);
      const bestRooms = await getBestRooms(roomCount);
      setSelectedRooms(bestRooms.map(room => room.id));
      setTravelTime(bestRooms[0]?.travelTime || null);
      setMessage(`Found ${bestRooms.length} best rooms with minimum travel time of ${bestRooms[0]?.travelTime} minutes`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      // Show specific message if it's an insufficient-rooms error
      const errMsg = error.message || '';
      if (errMsg.toLowerCase().includes('not enough')) {
        setError('Not enough available rooms');
      } else {
        setError('Failed to find best rooms. Please try again.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Hotel Room Reservation System</h1>
      </div>

      <div style={styles.controls}>
        <div style={styles.controlItem}>
          <div style={styles.inputWrapper}>
            No of Rooms
            <input 
              type="number" 
              min="1" 
              max={MAX_ROOMS_PER_BOOKING} 
              value={roomCount} 
              onChange={(e) => setRoomCount(Math.min(MAX_ROOMS_PER_BOOKING, Math.max(1, parseInt(e.target.value) || 1)))}
              style={styles.input}
            />
          </div>
        </div>
        
        <div style={styles.controlItem}>
          <button 
            style={styles.button} 
            onClick={handleFindBestRooms}
          >
            Find Best Rooms
          </button>
        </div>
        
        <div style={styles.controlItem}>
          <button 
            style={styles.button} 
            onClick={handleResetClick}
          >
            Reset
          </button>
        </div>
        
        <div style={styles.controlItem}>
          <button 
            style={styles.button} 
            onClick={handleRandomClick}
          >
            Random
          </button>
        </div>
      </div>

      <div style={styles.messageContainer}>
        {travelTime !== null && (
          <div style={{...styles.messageBox, ...styles.infoMessage}}>
            Total travel time between selected rooms: {travelTime} minutes
          </div>
        )}

        {message && (
          <div style={{...styles.messageBox, ...styles.successMessage}}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{...styles.messageBox, ...styles.errorMessage}}>
            {error}
          </div>
        )}
      </div>
      
      {loading ? (
        <div style={styles.loadingMessage}>Loading rooms...</div>
      ) : (
        <div style={styles.gridContainer}>
          <RoomGrid 
            rooms={rooms} 
            selectedRooms={selectedRooms}
            onRoomClick={handleRoomClick} 
          />
          
          {selectedRooms.length > 0 && (
            <div style={{textAlign: 'center'}}>
              <button 
                style={styles.bookSelectedButton}
                onClick={handleBookClick}
              >
                Book Selected ({selectedRooms.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingPage; 