import { getAllExternalLotteries } from "../controllers/externalApiController.js";
import { authenticateUser } from "../middlewares/colorgameAuth.js";

export const externalApiRoute = (app) => {
    app.get("/api/get-external-lotteries",  getAllExternalLotteries);
}   