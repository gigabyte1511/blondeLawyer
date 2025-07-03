import Router from 'koa-router'
import { createConsultation, deleteConsultation, getConsultationByID, getConsultationsByCustomer, getConsultationsByExpert, listConsultations } from '../controllers/consultationController'

export const consultationRouter = new Router({
  prefix: `/consultations`,
})

// GET all consultations
consultationRouter.get(`/`, listConsultations)

// GET consultations by customer ID
consultationRouter.get(`/customer/:customer_id`, getConsultationsByCustomer)

// GET consultations by expert ID
consultationRouter.get(`/expert/:expert_id`, getConsultationsByExpert)

// GET consultation by ID
consultationRouter.get(`/:id`, getConsultationByID)

// POST create new consultation
consultationRouter.post(`/`, createConsultation)

// DELETE consultation
consultationRouter.delete(`/:id`, deleteConsultation)