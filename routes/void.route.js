import { voidMarket } from "../controllers/voidGame.controller.js";


export const voidGameRoute = (app) => {
  app.post(
    "/api/void-market-lottery",
    voidMarket

  );

};