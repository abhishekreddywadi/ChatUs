import WebSocket from "ws"
import { Game } from "./Game.js";
import type { Moves } from "./GameTypes.js"



export class GameManagement {
    private PendingParticipants : WebSocket | null ;
    private users :WebSocket[]
    private games : Game[]
    constructor(){
        this.games=[]
        this.users=[],
        this.PendingParticipants=null
    }
    
    public addUser(userWs:WebSocket){
        this.users.push(userWs)
        this.addEventHandler(userWs)
    }
    public removeUser(userWs:WebSocket){
        this.users = this.users.filter((user)=>user!=userWs)
        this.games = this.games.filter((game)=>game.participant1==userWs || game.participant2==userWs)
        console.log("removed the moderuker");
    }
    public addEventHandler(userWs:WebSocket){
        userWs.on('message',(data)=>{
            const ParsedData = JSON.parse(data.toString())
            if(ParsedData.type=="init_user"){
                if(this.PendingParticipants){
                    const game = new Game(this.PendingParticipants,userWs);
                    this.games.push(game)
                }else{
                    this.PendingParticipants=userWs
                }
            }
            else if(ParsedData.type=="move"){
                const game = this.games.find((userWss)=>userWss.participant1== userWs || userWss.participant2)
                game?.makeMove(userWs,ParsedData.payload)
            }
        })
    }


    // public InitGame(PendingParticipants:WebSocket) {
    //     this.PendingParticipants.push(PendingParticipants)
    //     // params.board.setHeader(,"White")

    // }
    // public  GetParticipantsLength(){
    //     return this.PendingParticipants.length
    // }

    // public InitializeGame(participant1:WebSocket,participant2:WebSocket){
    //     const chess = new Chess()
    //     const colorMap = new Map<WebSocket,string>()
    //     colorMap.set(participant1,"w")
    //     colorMap.set(participant2,"b")

    //     const game : Game = {
    //         participant1,
    //         participant2,
    //         board:  chess,
    //         moves:[],
    //         participantsToColor:colorMap
    //         }
    //         this.game.push(game)
    //         this.GameToUsers.set(participant1, game)
    //         this.GameToUsers.set(participant2, game)
    // }
    // public GetPendingParticipant (){
    //         if(this.PendingParticipants.length>0){
    //             const participant = this.PendingParticipants[0];
    //                 this.PendingParticipants.shift()
    //                 return participant;
    //         }
    //         return null
    //     }
    // public HandleMove(
    //     participant:WebSocket,
    //     move:{from:string,to:string}
    // ){
    //     try {
            
    //         // get the game of users 
    //         const user = this.GameToUsers.get(participant);
    //         const oppositeUser = user?.participant1==participant? user.participant2:user?.participant1
    //         if(!user){
    //             return false
    //         }
    //         if(!oppositeUser){
    //             return false
    //         }
    //         const color = user.participantsToColor.get(participant)
    //         if(user.board?.turn()==color){
    //             const successMove=user.board.move({from:move.from,to:move.to})
    //             if(!successMove){
    //                 return false
    //             }
    //             user.moves.push(move)
    //             this.BroadCastMoves(oppositeUser,move)
    //             return true
    //         }else{
    //             return false
    //         }
    //     } catch (error) {
    //         return false
    //     }
    // }
    // public BroadCastMoves(participant:WebSocket ,move:{from:string,to:string}){
    //     participant.send(JSON.stringify({
    //         type:"MOVE",
    //         payload:{
    //             from: move.from,
    //             to:move.to
    //         }
    //     }))

    // }
}