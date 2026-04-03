const isProd = window.location.hostname !== "localhost";

export const API_URL = isProd ? "" : "http://localhost:3000";
export const WS_URL = isProd
  ? `wss://${window.location.host}`
  : "ws://localhost:3000";
