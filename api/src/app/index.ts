import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Model } from "objection";
import knex from "knex";

import { expertRouter } from './routers/expertRouter'
import { customerRouter } from './routers/customerRouter';
import { consultationRouter } from './routers/consultationRouter';

const knexConfig = require("../../knexfile");
const knexInstance = knex(knexConfig.development);
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

app.listen(3000, () => {console.log(`>> listening on port ${3000}`)})