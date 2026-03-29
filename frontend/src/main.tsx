import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./routes/App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Game from "./routes/Game.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>,
);
