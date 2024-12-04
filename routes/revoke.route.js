import { revokeMarket } from "../controllers/revokeGame.controller.js";



export const revokeGameRoute = (app) => {
    app.post(
      "/api/revoke-market-lottery",
      revokeMarket);
  
  };   