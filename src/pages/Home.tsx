import { useNavigate } from "react-router-dom";
import { useState } from "react";
import socket from "../services/socket";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [error, setError] = useState("");

  const createRoom = () => {
    socket.connect();
    socket.emit("create_room", 2);

    socket.on("room_created", (data) => {
      setCreatedRoomId(data.roomId);
      socket.off("room_created");
    });
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      setError("Room ID and username are required");
      return;
    }

    socket.connect();
    socket.emit("join_room", { roomId, username });

    socket.on("join_success", () => {
      localStorage.setItem("username", username);
      localStorage.setItem("roomId", roomId);
      navigate("/chat");
      socket.off("join_success");
    });

    socket.on("join_error", (data) => {
      setError(data.message);
      socket.off("join_error");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-5 gap-8 z-10">
        
        {/* Left Side: Hero Text */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-400 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live Anonymous Chat
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Talk freely. <br />
              <span className="text-zinc-500">No traces.</span>
            </h1>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
              Create a temporary encrypted room, share the code, and chat.
              Once you leave, the history is gone forever.
            </p>
          </div>
        </div>

        {/* Right Side: Action Cards */}
        <div className="md:col-span-3 space-y-4">
          
          {/* Join Room Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
            <h2 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
              Join a Room
            </h2>
            <div className="space-y-3">
              <div className="group relative">
                <input
                  placeholder="Room ID (e.g. A1B2)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 font-mono tracking-widest uppercase"
                />
              </div>
              <input
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
              
              <button
                onClick={joinRoom}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                Enter Room
              </button>
              
              {error && (
                <p className="text-red-400 text-xs text-center mt-2 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Create Room Section */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-medium text-zinc-300">Need a new room?</h3>
              <p className="text-xs text-zinc-500 mt-1">Generate a secure ID instantly.</p>
            </div>
            
            {createdRoomId ? (
               <div className="flex flex-col items-end">
                 <span className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Your Room ID</span>
                 <div className="text-2xl font-mono font-bold text-indigo-400 tracking-widest bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                   {createdRoomId}
                 </div>
               </div>
            ) : (
              <button
                onClick={createRoom}
                className="whitespace-nowrap px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl border border-zinc-700 transition-colors"
              >
                Generate ID
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;