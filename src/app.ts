import express from "express"
import cors from 'cors'
import http from 'http'
import { Server } from "socket.io"
import reActAgent from "./controllers/agent.controller"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  }
})

app.use(cors({
  origin: "*",
  credentials: true,
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true , limit:"16kb"})) 

app.get("/" , (req, res) =>{
  res.status(200).json({
    message: "Going good"
  })
})

io.on("connection" , (socket)=>{
  console.log("A new user has connected")
  socket.on("chat" , async (message)=>{
    const agentResponse = await reActAgent(message)
    console.log("user messsage" , message)

    socket.emit("chat-response", agentResponse)
  })
})

export {server , io}