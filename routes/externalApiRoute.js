import { getAllExternalLotteries } from "../controllers/externalApiController.js";

export const externalApiRoute=(app)=>{
    app.get("/api/get-external-lotteries", getAllExternalLotteries);
}   