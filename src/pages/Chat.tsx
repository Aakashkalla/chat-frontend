import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import type { Message } from "../types";

const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRoomId = localStorage.getItem('roomId');

        if (!storedRoomId || !storedUsername) {
            navigate('/');
            return;
        }

        setUsername(storedUsername);
        setRoomId(storedRoomId);

        // Listen for messages
        socket.on('receive_message', (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        // Listen for users joining
        socket.on('user_joined', (data) => {
            setMessages((prev) => [...prev, {
                username: 'System',
                message: `${data.username} joined the chat`,
                timestamp: new Date().toISOString(),
                system: true
            }]);
        });

        // ✅ Listen for users leaving
        socket.on('user_left', () => {
            setMessages((prev) => [...prev, {
                username: 'System',
                message: 'A user left the chat',
                timestamp: new Date().toISOString(),
                system: true
            }]);
        });

        // Cleanup listeners on unmount
        return () => {
            socket.off('receive_message');
            socket.off('user_joined');
            socket.off('user_left');
        };
    }, [navigate]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!messageInput.trim()) return;

        socket.emit('send_message', {
            roomId,
            username,
            message: messageInput
        });

        setMessageInput('');
    };

    const leaveRoom = () => {
        socket.disconnect();
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Chat Room: {roomId}</h1>
                        <p className="text-sm opacity-90">Logged in as: {username}</p>
                    </div>
                    <button 
                        onClick={leaveRoom}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition duration-200"
                    >
                        Leave Room
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <p className="text-lg">No messages yet. Start the conversation! 💬</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div 
                                key={index}
                                className={
                                    msg.system 
                                        ? "text-center py-2" 
                                        : msg.username === username
                                            ? "flex justify-end"
                                            : "flex justify-start"
                                }
                            >
                                {msg.system ? (
                                    // System message
                                    <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm italic inline-block">
                                        {msg.message}
                                    </div>
                                ) : (
                                    // Regular message
                                    <div 
                                        className={
                                            msg.username === username
                                                ? "bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs lg:max-w-md"
                                                : "bg-white text-gray-800 px-4 py-2 rounded-lg max-w-xs lg:max-w-md shadow"
                                        }
                                    >
                                        <p className="font-bold text-sm mb-1">
                                            {msg.username === username ? 'You' : msg.username}
                                        </p>
                                        <p>{msg.message}</p>
                                        <p className="text-xs mt-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-300 p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;