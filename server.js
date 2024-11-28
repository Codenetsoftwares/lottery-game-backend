import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import sequelize from './config/db.js';
import { ticketRoute } from './routes/ticket.route.js';
import { userRoute } from './routes/user.route.js';
import { adminRoutes } from './routes/admin.route.js';
import PurchaseLottery from './models/purchase.model.js';
import UserRange from './models/user.model.js';
import { ResultDeclarationModule } from './routes/ResultDeclaration.route.js';
import { ExternalApiModule } from './routes/externalApis.route.js';
import TicketRange from './models/ticketRange.model.js';
import cron from 'node-cron'
import { Op } from 'sequelize';
import moment from 'moment';

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.FRONTEND_URI.split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Status : OK');
});

adminRoutes(app);
ticketRoute(app);
userRoute(app);
ResultDeclarationModule(app);
ExternalApiModule(app);

PurchaseLottery.belongsTo(UserRange, {
  foreignKey: 'generateId',
  targetKey: 'generateId', // Assuming `generateId` links them
  as: 'userRange',
});

UserRange.hasMany(PurchaseLottery, {
  foreignKey: 'generateId',
  sourceKey: 'generateId',
  as: 'purchases',
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((err) => {
    console.error('Unable to create tables:', err);
  });

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database & tables created!');
    app.listen(process.env.PORT, () => {
      console.log(`App is running on  - http://localhost:${process.env.PORT || 7000}`);
    });
    cron.schedule('*/2 * * * * *', async () => {
      try {
        const markets = await TicketRange.findAll({
          where: {
            isActive: true,
            end_time: { [Op.lte]: moment().utc().format() }
          }
        });
        // let markets = []
        let updateMarket = []
        for (const market of markets) {

          market.isActive = false;
          const response = await market.save();

          console.log("Markets Inactivated:", JSON.stringify(response, null, 2));

          console.log(`Market ${response.marketName} has been deactivated.`);
          updateMarket.push(JSON.parse(JSON.stringify(response)))

        }

        // clients.forEach((client) => {
        //   client.write(`data: ${JSON.stringify(updateMarket)}\n\n`);
        // })
         console.log(`Message sent: ${JSON.stringify(updateMarket)}\n`);

      } catch (error) {
        console.error('Error checking market statuses:', error);
      }
    });

  })
  .catch((err) => {
    console.error('Unable to create tables:', err);
  });
