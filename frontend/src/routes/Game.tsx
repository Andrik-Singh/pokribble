import { useEffect } from "react";
import { useParams } from "react-router";
const backendUrl=import.meta.env.VITE_BACKEND_URL
const Game = () => {
  const { gameId } = useParams();
  useEffect(()=>{
    const fetchData=async()=>{
      try {
        const userId=window.localStorage.getItem("pokribble-user-id")
        const res=await fetch(`${backendUrl}/loadGame`,{
          method:"POST",
          headers:{
            "content-type":"application/json"
          },
          body:JSON.stringify({
            roomId:gameId,
            userId
          })
        })
        if(!res.ok){
          console.error("error")
        }
        const data=await res.json()
        if(data.userId){
          localStorage.setItem("pokribble-user-id",data.userId)
        }
        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  })
  return <div>{gameId}</div>;
};

export default Game;
