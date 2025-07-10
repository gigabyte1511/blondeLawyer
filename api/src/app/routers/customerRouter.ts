import Router from 'koa-router'
import { createCustomer, deleteCustomer, getCustomerByID, getCustomerByTelegramId, listCustomers } from '../controllers/customerController'

export const customerRouter = new Router({
  prefix: `/customers`,
})

// GET all customers
customerRouter.get(`/`, listCustomers)

// GET customer by Telegram ID
customerRouter.get(`/telegram/:telegram_id`, getCustomerByTelegramId)

// GET customer by ID
customerRouter.get(`/:id`, getCustomerByID)

// POST create new customer
customerRouter.post(`/`, createCustomer)

// DELETE customer
customerRouter.delete(`/:id`, deleteCustomer)
