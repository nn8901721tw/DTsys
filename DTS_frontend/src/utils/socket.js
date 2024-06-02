import { io } from "socket.io-client";

const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://140.115.126.47:3000';

export const socket = io(URL, {
    autoConnect: false
});