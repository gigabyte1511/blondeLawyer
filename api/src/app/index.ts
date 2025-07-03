import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { Model } from "objection";
import knex from "knex";

import { expertRouter } from './routers/expertRouter'
import { customerRouter } from './routers/customerRouter';
import { consultationRouter } from './routers/consultationRouter';

const knexConfig = require("../../knexfile");
const knexInstance = knex(knexConfig.development);
Model.knex(knexInstance);

const app = new Koa()

app.use(bodyParser())

app.use(customerRouter.routes())
app.use(expertRouter.routes())
app.use(consultationRouter.routes())

app.listen(3000, () => {console.log(`>> listening on port ${3000}`)})