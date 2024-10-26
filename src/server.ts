import express, { Response, Request, Application, NextFunction } from 'express'
import 'Config/intiliseAPP'
import morgan from 'morgan'
import cors from 'cors'
import http from 'http'
import { Server, Socket } from 'socket.io'
import { ExtendedError } from "socket.io/dist/namespace";
import jwt from 'jsonwebtoken'
import errorHandeler from 'Middleware/error'
import connectDB from 'Config/db'
import Auth from 'Routers/Auth'
import Chat from 'Routers/Chat'
import Message from 'Routers/Message'
import messageModel from 'Models/Message'

connectDB()

const app: Application = express()


let server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });



app.use(cors())
app.set('trust proxy', true)

// Body parsar
app.use(express.json())

// Dev logging middleware
app.use(morgan('combined'))


// Mount routers

app.use('/users', Auth);
app.use('/chats', Chat);
app.use('/messages', Message);




//Socket

io.use((socket: Socket, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.auth.token;
  console.log(token)
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) return next(new Error("Authentication error"));
    socket.data.userId = (decoded as any).id;
    next();
  });
});

const onlineUsers: { [key: string]: string } = {};

io.on('connection', (socket: Socket) => {
  const userId = socket.data.userId;
  onlineUsers[userId] = socket.id;

  // online
  socket.broadcast.emit('userStatus', { userId, status: 'online' });

  //joining a chat room
  socket.on('joinChat', (chatId: string) => {
    socket.join(chatId);
  });

  // New message is sent
  socket.on('sendMessage', async ({ chatId, senderId, content }: { chatId: string, senderId: string, content: string }) => {
    const message = await messageModel.create({
      chatId,
      senderId,
      content,
    });

    io.to(chatId).emit('receiveMessage', {
      chatId,
      message: {
        senderId,
        content,
      }
    });
  });

  // Typing indicator
  socket.on('typing', ({ chatId, isTyping }: { chatId: string, isTyping: boolean }) => {
    socket.to(chatId).emit('typing', { userId, isTyping });
  });

  // Read receipts
  socket.on('readMessage', ({ chatId, messageId }: { chatId: string, messageId: string }) => {
    io.to(chatId).emit('messageRead', { messageId, readerId: userId });
  });

  // Disconnection
  socket.on('disconnect', () => {
    delete onlineUsers[userId];
    socket.broadcast.emit('userStatus', { userId, status: 'offline' });
  });
});



app.all('*', (req: Request, res: Response) => {
  //console.log(req.url)
  res.status(200).send('<h1>This website is for API 🤯</h1>')
})

app.use(errorHandeler)

const PORT = process.env.PORT || 7000


server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold,
  )
})


interface IError {
  message: string
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: IError) => {
  console.log(`Error: ${err?.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
