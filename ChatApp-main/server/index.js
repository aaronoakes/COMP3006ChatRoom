// .env - setup environment variables
import * as dotenv from 'dotenv'
dotenv.config()
  // web framework
import express from "express";
import http from "http";
import https from "https";
import { Server } from "socket.io";
// helpers
import path from "path";
import fs from "fs";

// db connection
import "./config/mongo.js";

// routes
import authRouter from "./routes/auth.js";
import roomRouter from "./routes/room.js";
import userRouter from "./routes/user.js";

// socket configuration
import WebSockets from "./net/websockets.js";


const __dirname = path.resolve();
const port = "8080"
const sslPort = "8443"
const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // so we can access our js/css

// set up the routes
app.use("/auth", authRouter);
app.use("/room", roomRouter);
app.use("/users", userRouter);

// serve up the client
app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

const httpServer = http.createServer(app).listen(port);
const httpsServer = https.createServer(httpsOptions, app).listen(sslPort);
const io = new Server(httpServer);
const ioS = new Server(httpsServer);

global.io = io.listen(httpServer);
global.io.on('connection', WebSockets.connection)
// global.ioS = ioS.listen(httpServer);
// global.ioS.on('connection', WebSockets.connection)

httpServer.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${port}/`)
});

httpsServer.on("listening", () => {
  console.log(`Listening on port:: https://localhost:${sslPort}/`)
});