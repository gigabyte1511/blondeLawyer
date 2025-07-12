import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Model, knexSnakeCaseMappers } from "objection";
import knex from "knex";
import TelegramBotService from './services/telegramBot';

import { expertRouter } from './routers/expertRouter'
import { customerRouter } from './routers/customerRouter';
import { consultationRouter } from './routers/consultationRouter';
import { consultationStatusRouter } from './routers/consultationStatusRouter';
import { userRouter } from './routers/userRouter';

const knexConfig = require("../../knexfile");

// Add knexSnakeCaseMappers to automatically convert between snake_case (DB) and camelCase (API)
const knexInstance = knex({
  ...knexConfig.development,
  ...knexSnakeCaseMappers() // This handles the conversion automatically
});

Model.knex(knexInstance);

const app = new Koa()

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 86400, // Cache preflight requests for 1 day
}))

app.use(bodyParser())

app.use(customerRouter.routes())
app.use(expertRouter.routes())
app.use(consultationRouter.routes())
app.use(consultationStatusRouter.routes())
app.use(userRouter.routes())

// Initialize Telegram bot
try {
  const botService = TelegramBotService.getInstance();
  console.log('Telegram bot initialized successfully');
} catch (error) {
  console.error('Failed to initialize Telegram bot:', error);
}

app.listen(3000, () => {console.log(`>> listening on port ${3000}`)})