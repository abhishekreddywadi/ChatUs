import type WebSocket from "ws"
import type { Moves } from "./GameTypes.js"
import { Chess } from "chess.js"

export class Game {
    public participant1:WebSocket
    public participant2:WebSocket
    public moves:Moves[]
    public board: Chess
    public movesLength :number
    constructor(participant1:WebSocket,participant2:WebSocket){
        this.participant1 = participant1,
        this.participant2= participant2,
        this.moves=[],
        this.board=new Chess(),
        this.movesLength=0;
        this.participant1.send(JSON.stringify({
            type:"Game Started",
            message:"game has been Started",
            color : "white"
        }))
        this.participant2.send(JSON.stringify({
            type:"Game Started",
            message:"game has been Started",
            color : "black"
        }))
    }

    public makeMove(socket:WebSocket,move:Moves){
        if(this.movesLength %2==0 && socket !== this.participant1){
            return
        }

        if(this.movesLength %2==1 && socket !== this.participant2){
            return
        }
        try{
            this.board.move(move)
             if(this.movesLength %2==0 && socket == this.participant1){
             this.participant2.send(JSON.stringify({
                type:"move",
                payload:move
             }))
        }else{
             this.participant1.send(JSON.stringify({
                type:"move",
                payload:move
             }))
        }

        }

        catch(e){
            socket.send(JSON.stringify({
                type:"invalid_move",
                message:"invalid Move"
            }))
            return
        }
        if(this.board.isGameOver()){
            if(this.board.turn()=='w'){
                this.participant1.send(JSON.stringify({
                    type:"black won",
                    message:"black won"
                }))
                return
            }else{
                this.participant1.send(JSON.stringify({
                    type:"white won",
                    message:"white won"
                }))
                return
            }
        }
        this.movesLength++;
    }
}