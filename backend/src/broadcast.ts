import { Room } from "./utils.js";

export function broadcast(myRoom:Room,payload:string){
    myRoom.sockets.forEach((socket)=>{
        socket.send(payload)
    })
}
