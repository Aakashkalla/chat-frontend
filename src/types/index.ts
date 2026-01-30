export interface Message{
    username : string;
    message : string;
    timestamp : string;
    system?: boolean;
}

export interface RoomData{
    roomId : string;
    capacity : number;
}

export interface JoinRoomData{
    roomId : string;
    username : string;
}

export interface User{
    username : string;
    socketId : string;
}