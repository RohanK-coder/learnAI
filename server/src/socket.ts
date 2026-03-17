import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-course", (courseId: number) => {
      socket.join(`course:${courseId}`);
    });

    socket.on("join-conversation", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
    });
  });

  return io;
}

export function getIo() {
  return io;
}