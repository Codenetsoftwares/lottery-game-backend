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
import { voidGameRoute } from './routes/void.route.js';
import TicketRange from './models/ticketRange.model.js';
import cron from 'node-cron'
import { Op } from 'sequelize';
import moment from 'moment';
import { revokeGameRoute } from './routes/revoke.route.js';

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
voidGameRoute(app) 
revokeGameRoute(app)

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

// SSE endpoint
const clients = [];
app.get('/events', (req, res) => {
  console.log("Client connected to events");

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.flushHeaders(); // Ensure headers are sent immediately

  // Add the connected client to the list
  clients.push(res);

  // Send an initial message
  const initialMessage = { message: "SSE service is connected successfully!" };
  res.write(`data: ${JSON.stringify(initialMessage)}\n\n`);

  // Handle client disconnection
  req.on('close', () => {
    console.log('Client disconnected');
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1); // Remove the client from the list
    }
    res.end(); // End the response
  });
});


sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database & tables created!');
    app.listen(process.env.PORT, () => {
      console.log(`App is running on - http://localhost:${process.env.PORT || 7000}`);
    });

    // Function to get current time in IST
    const getISTTime = () => {
      const currentTime = new Date();
      const istOffset = 5 * 60 + 30; // IST is UTC + 5:30
      const localTime = new Date(currentTime.getTime() + istOffset * 60 * 1000);
      return localTime;
    };

    cron.schedule('*/2 * * * * *', async () => {
      try {
        const currentTime = getISTTime();

        const markets = await TicketRange.findAll({
          where: {
            isActive: true,
          },
        });

        let updateMarket = [];
        for (const market of markets) {
          if (currentTime >= new Date(market.end_time)) {
            market.isActive = false; // Deactivate market if the time has passed
            const response = await market.save();
            console.log("Markets Inactivated:", JSON.stringify(response, null, 2));
            console.log(`Market ${response.marketName} has been deactivated.`);
            updateMarket.push(JSON.parse(JSON.stringify(response)));
          }
        }
        // Optionally send a message to clients if needed
        clients.forEach((client) => {
          client.write(`data: ${JSON.stringify(updateMarket)}\n\n`);
        });

        //console.log(`Message sent: ${JSON.stringify(updateMarket)}\n`);

      } catch (error) {
        console.error('Error checking market statuses:', error);
      }
    });

  })
  .catch((err) => {
    console.error('Unable to create tables:', err);
  });