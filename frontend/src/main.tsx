import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./routes/App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Game from "./routes/Game.tsx";
import { ToastContainer } from "react-toastify";
import NotFound from "./routes/NotFound.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>,
);
