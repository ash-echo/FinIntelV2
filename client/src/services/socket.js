import { io } from 'socket.io-client';

// Singleton socket connection
const socket = io('http://localhost:3001');

export default socket;
