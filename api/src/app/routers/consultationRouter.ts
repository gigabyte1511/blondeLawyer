import Router from 'koa-router'
import { createConsultation, deleteConsultation, getConsultationByID, getConsultationsByCustomer, getConsultationsByExpert, getConsultationsByUser, listConsultations, updateConsultation } from '../controllers/consultationController'

export const consultationRouter = new Router({
  prefix: `/consultations`,
})

// GET all consultations
consultationRouter.get(`/`, listConsultations)

// GET consultations by customer ID
consultationRouter.get(`/customer/:customer_id`, getConsultationsByCustomer)

// GET consultations by expert ID
consultationRouter.get(`/expert/:expert_id`, getConsultationsByExpert)

// GET consultations by user ID
consultationRouter.get(`/user/:user_id`, getConsultationsByUser)

// GET consultation by ID
consultationRouter.get(`/:id`, getConsultationByID)

// POST create new consultation
consultationRouter.post(`/`, createConsultation)

// PUT create new consultation
consultationRouter.put(`/:id`, updateConsultation)

// DELETE consultation
consultationRouter.delete(`/:id`, deleteConsultation)