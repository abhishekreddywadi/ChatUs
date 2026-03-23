import {WebSocketServer}  from "ws"
import { GameManagement } from "./gameManagement.js"
const wss = new WebSocketServer ({
    port:8080
})
const gameManager = new GameManagement()

wss.on('connection',(ws)=>{
    ws.send("connected to ws")
    gameManager.addUser(ws)
    ws.on('close',()=>gameManager.removeUser)
})