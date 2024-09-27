import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db.js";
import { adminRoutes } from "./routes/adminRoute.js";
import { lotteryRoutes } from "./routes/lotteryRoute.js";
import { resultRoutes } from "./routes/resultRoute.js";
import { externalApiRoute } from "./routes/externalApiRoute.js";
import { checkAndManageIndexes } from "./helpers/indexManager.js";
import { ticketRoutes } from "./routes/ticketRoute.js";
import Lottery from "./models/lotteryModel.js";
import LotteryPurchase from "./models/lotteryPurchaseModel.js";
import Result from "./models/resultModel.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.FRONTEND_URI.split(",");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Status : OK");
});

adminRoutes(app);
lotteryRoutes(app);
resultRoutes(app);
ticketRoutes(app);
externalApiRoute(app);



Lottery.hasMany(LotteryPurchase, { foreignKey: "lotteryId" });
LotteryPurchase.belongsTo(Lottery, { foreignKey: "lotteryId" });
Lottery.hasMany(Result, { foreignKey: "lotteryId", sourceKey: "lotteryId" });
Result.belongsTo(Lottery, { foreignKey: "lotteryId", targetKey: "lotteryId" });


checkAndManageIndexes('lotteries');
checkAndManageIndexes('tickets');

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Unable to create tables:", err);
  });

app.listen(process.env.PORT, () => {
  console.log(
    `App is running on  - http://localhost:${process.env.PORT || 8000}`
  );
});
