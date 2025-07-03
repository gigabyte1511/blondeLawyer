import Router from 'koa-router'
import { createExpert, deleteExpert, getExpertByID, listExperts } from '../controllers/expertController'

export const expertRouter = new Router({
  prefix: `/experts`,
})

// GET all experts
expertRouter.get(`/`, listExperts)

// GET expert by ID
expertRouter.get(`/:id`, getExpertByID)

// POST create new expert
expertRouter.post(`/`, createExpert)

// DELETE expert
expertRouter.delete(`/:id`, deleteExpert)