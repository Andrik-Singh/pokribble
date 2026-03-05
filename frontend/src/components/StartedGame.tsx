import React from 'react'
import type { Room } from '../routes/Game'

const StartedGame = ({room}:{
    room:Room
}) => {
    console.log(room)
  return (
    <div>StartedGame</div>
  )
}

export default StartedGame