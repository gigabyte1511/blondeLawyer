import { ParameterizedContext } from 'koa';
import Koa from 'koa';
import Router from 'koa-router';
import * as yup from 'yup';
import Consultation, { ConsultationStatus } from '../models/Consultation';
import User from '../models/User';
import { transaction } from 'objection';
import TelegramBotService from '../services/telegramBot';

// Define request payload types
interface StatusUpdatePayload {
  status: string;
  comment?: string;
}

// Validation schema
const statusUpdateSchema = yup.object({
  status: yup.string().oneOf([ConsultationStatus.PENDING, 'approved', 'rejected', ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED]).required('Status is required'),
  comment: yup.string().nullable()
});

/**
 * Update consultation status and notify the customer
 */
export async function updateConsultationStatus(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);
  
  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid consultation ID is required' };
    return;
  }
  
  const body = appContext.request.body as StatusUpdatePayload;
  
  try {
    // Validate request body
    await statusUpdateSchema.validate(body, { abortEarly: false });
    
    // First check if the consultation exists and fetch with related data
    const existingConsultation = await Consultation.query()
      .findById(id)
      .withGraphFetched('[expert, customer]');
      
    if (!existingConsultation) {
      appContext.status = 404;
      appContext.body = { error: `Consultation with ID "${id}" not found.` };
      return;
    }
    
    // Check if status is actually changing
    if (existingConsultation.status === body.status) {
      appContext.body = {
        message: `Consultation status is already "${body.status}".`,
        consultation: existingConsultation
      };
      return;
    }
    
    // Start a transaction
    let trx;
    try {
      trx = await transaction.start(Consultation.knex());
      
      // Update the consultation status
      await Consultation.query(trx)
        .findById(id)
        .patch({
          status: body.status as ConsultationStatus
          // Note: comment field is not in the Consultation model
        });
      
      await trx.commit();
      
      // Fetch the updated consultation with related data
      const updatedConsultation = await Consultation.query()
        .findById(id)
        .withGraphFetched('[expert, customer]');
      
      if (!updatedConsultation) {
        throw new Error(`Could not fetch updated consultation with ID ${id}`);
      }
      
      // Get customer's Telegram ID to send notification
      if (updatedConsultation.customer?.id) {
        const customer = await User.query()
          .where('id', updatedConsultation.customer.id)
          .first();
        
        if (customer?.telegramId) {
          try {
            // Get bot service instance
            const botService = TelegramBotService.getInstance();
            
            // Send notification about status change
            await botService.sendConsultationStatusNotification(
              customer.telegramId,
              id,
              body.status,
              updatedConsultation.scheduledFor,
              updatedConsultation.expert?.name
            );
            
            console.log(`Notification sent to user ${customer.telegramId} about consultation #${id} status change to ${body.status}`);
          } catch (error) {
            console.error('Error sending notification:', error);
            // Don't fail the request if notification fails
          }
        }
      }
      
      appContext.body = {
        message: `Consultation status updated to "${body.status}" successfully.`,
        consultation: updatedConsultation || { id, status: body.status }
      };
    } catch (error) {
      if (trx) await trx.rollback();
      throw error;
    }
  } catch (error) {
    let errorMessage = 'An unexpected error occurred.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    appContext.status = 500;
    appContext.body = {
      error: errorMessage
    };
  }
}

/**
 * Approve consultation
 */
export async function approveConsultation(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const requestBody = appContext.request.body as { comment?: string } || {};
  appContext.request.body = {
    status: 'approved',
    comment: requestBody.comment
  };
  return updateConsultationStatus(appContext);
}

/**
 * Reject consultation
 */
export async function rejectConsultation(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const requestBody = appContext.request.body as { comment?: string } || {};
  appContext.request.body = {
    status: 'rejected',
    comment: requestBody.comment
  };
  return updateConsultationStatus(appContext);
}
