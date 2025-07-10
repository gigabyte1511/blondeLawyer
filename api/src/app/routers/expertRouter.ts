import Router from 'koa-router'
import { createExpert, deleteExpert, getExpertByID, getExpertByTelegramId, listExperts } from '../controllers/expertController'

export const expertRouter = new Router({
  prefix: `/experts`,
})

// GET all experts
expertRouter.get(`/`, listExperts)

// GET expert by Telegram ID
expertRouter.get(`/telegram/:telegram_id`, getExpertByTelegramId)

// GET expert by ID
expertRouter.get(`/:id`, getExpertByID)

// POST create new expert
expertRouter.post(`/`, createExpert)

// DELETE expert
expertRouter.delete(`/:id`, deleteExpert)