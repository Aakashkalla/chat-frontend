import { useNavigate } from "react-router-dom";
import { useState } from "react";
import socket from "../services/socket";

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [createdRoomId, setCreatedRoomId] = useState(''); // ✅ Fixed typo
    const [error, setError] = useState('');

    const createRoom = () => {
        socket.connect();
        socket.emit('create_room', 2);

        socket.on('room_created', (data) => {
            setCreatedRoomId(data.roomId);
            socket.off('room_created');
        });
    }

    const joinRoom = () => {
        if (!roomId || !username) {
            setError('Please enter both Room ID and Username');
            return;
        }

        socket.connect();
        socket.emit('join_room', { roomId, username });

        socket.on('join_success', () => {
            localStorage.setItem('username', username);
            localStorage.setItem('roomId', roomId);

            navigate('/chat');
            socket.off('join_success');
        });

        socket.on('join_error', (data) => {
            setError(data.message);
            socket.off('join_error');
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
                <h1 className="text-4xl font-bold text-center text-gray-800">
                    Real Time Chat App
                </h1>

                {/* Create Room Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Create Room</h2>
                    <button 
                        onClick={createRoom}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Create Room (Capacity: 2)
                    </button>
                    
                    {/* ✅ Show created room ID */}
                    {createdRoomId && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-gray-600">Room Created! Share this code:</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">{createdRoomId}</p>
                        </div>
                    )}
                </div>

                {/* Join Room Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Join Room</h2>
                    
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value.toUpperCase())} // ✅ Auto uppercase
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={joinRoom}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            Join Room
                        </button>
                    </div>

                    {/* ✅ Show error */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 font-medium">❌ {error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;