import { create } from "zustand";
type IDrawingState={
    drawingData:[number, number, number, string, number, "pen" | "eraser"]
    setDrawingData:(data:[number,number,number,string,number,"pen" | "eraser"])=>void
}
export const useDrawingSocket=create<IDrawingState>((set)=>({
    drawingData:[0,0,0,"",0,"pen"],
    setDrawingData:(drawingData:[number,number,number,string,number,"pen" | "eraser"]) => set({ drawingData })
}))