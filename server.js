import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db.js";
import { ticketRoute } from "./routes/ticket.route.js";
import { userRoute } from "./routes/user.route.js";
import { adminRoutes } from "./routes/admin.route.js";

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
ticketRoute(app);
userRoute(app)


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
