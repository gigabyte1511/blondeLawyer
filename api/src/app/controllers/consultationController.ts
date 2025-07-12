import { ParameterizedContext } from 'koa';
import Koa from 'koa'
import Router from 'koa-router'
import * as yup from 'yup';
import Consultation, { ConsultationStatus } from '../models/Consultation';
import Expert from '../models/Expert';
import Customer from '../models/Customer';
import User from '../models/User';
import { transaction } from 'objection';
import TelegramBotService from '../services/telegramBot';

// Define request payload types

interface ConsultationRequestPayload {
  expertId: number;
  customerId: number;
  type: string;
  status: ConsultationStatus;
  message?: string;
  scheduledFor: string; // ISO date string
  comment?: string; // Optional comment field for status updates
}

interface ConsultationByIDRequestPayload {
  id: number;
}

interface ConsultationByCustomerIDRequestPayload {
  customerId: number;
}

interface ConsultationByExpertIDRequestPayload {
  expertId: number;
}

// Validation schema
const consultationSchema = yup.object({
  expertId: yup.number().required('Expert ID is required'),
  customerId: yup.number().required('Customer ID is required'),
  type: yup.string().required('Consultation type is required'),
  status: yup.mixed<ConsultationStatus>().required('Consultation status is required'),
  message: yup.string().nullable(),
  scheduledFor: yup.string().required('Scheduled date is required')
});

export async function listConsultations(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  try {
    let consultations = await Consultation.query()
      .withGraphFetched('[expert, customer]');
    
    // If relations are null, manually fetch and attach them
    if (consultations.length > 0) {
      // Map over consultations to attach relations
      consultations = await Promise.all(consultations.map(async (consultation) => {
        // Fetch expert if null
        if (!consultation.expert && consultation.expertId) {
          consultation.expert = await Expert.query().findById(consultation.expertId);
        }
        
        // Fetch customer if null
        if (!consultation.customer && consultation.customerId) {
          consultation.customer = await Customer.query().findById(consultation.customerId);
        }
        
        return consultation;
      }));
    }
    
    // if (!consultations.length) {
    //   appContext.status = 404;
    //   appContext.body = { error: "No consultations found." };
    //   return;
    // }

    appContext.body = {
      message: "Consultations retrieved successfully.",
      consultations
    };
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


export async function getConsultationByID(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);

  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid consultation ID is required' };
    return;
  }

  try {
    let consultation = await Consultation.query()
      .findById(id)
      .withGraphFetched('[expert, customer]');

    if (!consultation) {
      appContext.status = 404;
      appContext.body = { error: `Consultation with ID "${id}" not found.` };
      return;
    }
    
    // Manually fetch relations if they're null
    if (!consultation.expert && consultation.expertId) {
      consultation.expert = await Expert.query().findById(consultation.expertId);
    }
    
    if (!consultation.customer && consultation.customerId) {
      consultation.customer = await Customer.query().findById(consultation.customerId);
    }

    appContext.body = {
      message: `Consultation with ID "${id}" retrieved successfully.`,
      consultation
    };
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

export async function createConsultation(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  console.log(appContext.request.body);
  const body = appContext.request.body as ConsultationRequestPayload;
  
  try {
    // Validate request body
    await consultationSchema.validate(body, { abortEarly: false });
    
    // Verify that expert and customer exist
    const expert = await Expert.query().findById(body.expertId);
    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with ID "${body.expertId}" not found.` };
      return;
    }
    
    const customer = await Customer.query().findById(body.customerId);
    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with ID "${body.customerId}" not found.` };
      return;
    }
    
    let trx;
    trx = await transaction.start(Consultation.knex());
    
    // Create new consultation
    const consultation = await Consultation.query(trx).insert({
      expertId: body.expertId, // Using camelCase property names
      customerId: body.customerId,
      type: body.type,
      status: body.status,
      message: body.message,
      scheduledFor: body.scheduledFor
    });
    
    await trx.commit();
    
    // Fetch the complete consultation with related data
    const completeConsultation = await Consultation.query()
      .findById(consultation.id)
      .withGraphFetched('[expert, customer]');
    console.log("completeConsultation",completeConsultation)
    // Send notifications to both expert and customer
    try {
      console.log("completeConsultation",completeConsultation)
      const botService = TelegramBotService.getInstance();
      
        if (expert.telegramId) {
          // Format date for display
          const scheduledDate = new Date(body.scheduledFor);
          const formattedDate = scheduledDate.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Notify expert about new consultation
          await botService.sendNotification(
            expert.telegramId, // telegramId is now a string
            `🆕 У вас новая запись с номером #${consultation.id}!\n\n` +
            `🆕 Новая консультация #${consultation.id} создана!\n\n` +
            `📅 Дата и время: ${formattedDate}\n` +
            `👤 Клиент: ${expert.name || 'Неизвестно'}\n\n` +
            `Пожалуйста, подтвердите или отклоните запрос.`
          );
        }
      
      // Get customer's Telegram ID
        if (customer.telegramId) {
          // Notify customer about consultation creation
          await botService.sendNotification(
            customer.telegramId, // telegramId is now a string
            `✅ Ваша заявка на консультацию #${consultation.id} успешно создана!\n\n` +
            `Статус: ожидает подтверждения\n\n` +
            `Мы уведомим вас, когда юрист подтвердит консультацию.`
          );
        }     
      } catch (error) {
        // Log notification error but don't fail the request
        console.error('Error sending consultation creation notifications:', error);
      }
    
    appContext.status = 201;
    appContext.body = {
      message: `Consultation created successfully.`,
      consultation: completeConsultation
    };
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

export async function updateConsultation(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);
  
  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid consultation ID is required' };
    return;
  }
  
  console.log("updateConsultation", appContext.request.body);
  const body = appContext.request.body as Partial<ConsultationRequestPayload>;
  
  
  try {
    
    // First check if the consultation exists
    const existingConsultation = await Consultation.query().findById(id);

    

    console.log("existingConsultation", existingConsultation)
    if (!existingConsultation) {
      appContext.status = 404;
      appContext.body = { error: `Consultation with ID "${id}" not found.` };
      return;
    }
    
    const expert = await Expert.query().findById(existingConsultation.expertId);
    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with ID "${existingConsultation.expertId}" not found.` };
      return;
    }
    
    const customer = await Customer.query().findById(existingConsultation.customerId);
    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with ID "${existingConsultation.customerId}" not found.` };
      return;
    }
    
    // Prepare the update data
    const updateData: Partial<ConsultationRequestPayload> = {};
    
    // Only update fields that are provided in the request
    if (body.expertId !== undefined) updateData.expertId = body.expertId;
    if (body.customerId !== undefined) updateData.customerId = body.customerId;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.message !== undefined) updateData.message = body.message;
    if (body.scheduledFor !== undefined) updateData.scheduledFor = body.scheduledFor;
    if (body.comment !== undefined) updateData.comment = body.comment;
    
    // If updating expert or customer IDs, verify they exist
    if (updateData.expertId !== undefined) {
      const expert = await Expert.query().findById(updateData.expertId);
      if (!expert) {
        appContext.status = 404;
        appContext.body = { error: `Expert with ID "${updateData.expertId}" not found.` };
        return;
      }
    }
    
    if (updateData.customerId !== undefined) {
      const customer = await Customer.query().findById(updateData.customerId);
      if (!customer) {
        appContext.status = 404;
        appContext.body = { error: `Customer with ID "${updateData.customerId}" not found.` };
        return;
      }
    }
    
    // Start a transaction
    let trx;
    trx = await transaction.start(Consultation.knex());
    const {comment, ...rest} = updateData;
    // Update the consultation
    await Consultation.query(trx)
      .findById(id)
      .patch(rest);
    
    await trx.commit();
    
    // Fetch the updated consultation with related data
    const updatedConsultation = await Consultation.query()
      .findById(id)
      .withGraphFetched('[expert, customer]');
    
      try {
        const botService = TelegramBotService.getInstance();
        
        if (updatedConsultation && updatedConsultation.scheduledFor) {
          // Format date for display
          const scheduledDate = new Date(updatedConsultation.scheduledFor);
          const formattedDate = scheduledDate.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Notify expert about consultation status update
          if (expert.telegramId && updatedConsultation.id) {
            let expertMessage = `📝 Обновление консультации #${updatedConsultation.id}\n\n`;
            expertMessage += `📅 Дата и время: ${formattedDate}\n`;
            expertMessage += `👤 Клиент: ${customer.name || 'Неизвестно'}\n`;
            expertMessage += `🔄 Статус: ${updatedConsultation.status || 'не указан'}\n\n`;
            
            // Check the status from the request body
            if (body.status && body.status === 'approved') {
              expertMessage += `Вы подтвердили эту консультацию. Клиент уведомлен.`;
            } else if (body.status && body.status === 'cancelled') {
              expertMessage += `Вы отклонили эту консультацию. Клиент уведомлен.`;
            } else if (body.status && body.status === 'completed') {
              expertMessage += `Вы отметили эту консультацию как завершенную. Клиент уведомлен.`;
            } else {
              expertMessage += `Статус консультации был обновлен.`;
            }
            
            await botService.sendNotification(expert.telegramId, expertMessage);
          }
          
          // Notify customer about consultation status update
          if (customer.telegramId && updatedConsultation.id) {
            let customerMessage = `📝 Обновление консультации #${updatedConsultation.id}\n\n`;
            customerMessage += `📅 Дата и время: ${formattedDate}\n`;
            customerMessage += `👩‍⚖️ Юрист: ${expert.name || 'Неизвестно'}\n`;
            
            // Check the status from the request body
            if (body.status && body.status === 'approved') {
              customerMessage += `✅ Юрист подтвердил вашу консультацию!\n\n`;
              customerMessage += `Пожалуйста, будьте готовы к консультации в указанное время.`;
            } else if (body.status && body.status === 'cancelled') {
              customerMessage += `❌ К сожалению, юрист не может провести консультацию в указанное время.\n\n`;
              customerMessage += `Причина: ${body.comment || 'Не указано'}.\n\n`;
              customerMessage += `Пожалуйста, выберите другое время или свяжитесь с нами для получения помощи.`;
            } else if (body.status && body.status === 'completed') {
              customerMessage += `🎉 Ваша консультация успешно завершена!\n\n`;
              customerMessage += `Спасибо за использование нашего сервиса. Если у вас остались вопросы, вы можете записаться на новую консультацию.`;
            } else {
              customerMessage += `🔄 Статус вашей консультации изменен на: ${updatedConsultation.status || 'обновлен'}`;
            }
            
            await botService.sendNotification(customer.telegramId, customerMessage);
          }
        }     
      } catch (error) {
        // Log notification error but don't fail the request
        console.error('Error sending consultation status update notifications:', error);
        }


    appContext.body = {
      message: `Consultation with ID "${id}" updated successfully.`,
      consultation: updatedConsultation
    };
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

export async function deleteConsultation(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);

  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid consultation ID is required' };
    return;
  }

  try {
    const consultation = await Consultation.query().findById(id);
    
    if (!consultation) {
      appContext.status = 404;
      appContext.body = { error: `Consultation with ID "${id}" not found.` };
      return;
    }
    
    await Consultation.query().deleteById(id);
    
    appContext.body = {
      message: `Consultation with ID "${id}" has been deleted successfully.`,
    };
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

export async function getConsultationsByUser(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const user_id = parseInt(appContext.params.user_id);

  if (!user_id || isNaN(user_id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid user ID is required' };
    return;
  }

  try {
    let consultations = await Consultation.query()
      .where('userId', user_id) // Using camelCase property names
      .withGraphFetched('[expert, customer]');
    
    // If relations are null, manually fetch and attach them
    if (consultations.length > 0) {
      // Map over consultations to attach relations
      consultations = await Promise.all(consultations.map(async (consultation) => {
        // Fetch expert if null
        if (!consultation.expert && consultation.expertId) {
          consultation.expert = await Expert.query().findById(consultation.expertId);
        }
        
        // Fetch customer if null
        if (!consultation.customer && consultation.customerId) {
          consultation.customer = await Customer.query().findById(consultation.customerId);
        }
        
        return consultation;
      }));
    }

    if (!consultations.length) {
      appContext.status = 404;
      appContext.body = { error: `No consultations found for user with ID "${user_id}".` };
      return;
    }
    
    // The $formatJson method in the Consultation model will convert snake_case to camelCase

    appContext.body = {
      message: `Consultations for user with ID "${user_id}" retrieved successfully.`,
      consultations
    };
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

export async function getConsultationsByCustomer(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const customer_id = parseInt(appContext.params.customer_id);

  if (!customer_id || isNaN(customer_id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid customer ID is required' };
    return;
  }

  try {
    // Verify that customer exists
    const customer = await Customer.query().findById(customer_id);
    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with ID "${customer_id}" not found.` };
      return;
    }
    
    // Get all consultations for this customer
    let consultations = await Consultation.query()
      .where('customerId', customer_id) // Using camelCase property names
      .withGraphFetched('[expert, customer]');
    
    // If relations are null, manually fetch and attach them
    if (consultations.length > 0) {
      // Map over consultations to attach relations
      consultations = await Promise.all(consultations.map(async (consultation) => {
        // Fetch expert if null
        if (!consultation.expert && consultation.expertId) {
          consultation.expert = await Expert.query().findById(consultation.expertId);
        }
        
        // Fetch customer if null
        if (!consultation.customer && consultation.customerId) {
          consultation.customer = await Customer.query().findById(consultation.customerId);
        }
        
        return consultation;
      }));
    }

    if (!consultations.length) {
      appContext.status = 404;
      appContext.body = { error: `No consultations found for customer with ID "${customer_id}".` };
      return;
    }

    appContext.body = {
      message: `Consultations for customer with ID "${customer_id}" retrieved successfully.`,
      consultations
    };
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

export async function getConsultationsByExpert(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const expert_id = parseInt(appContext.params.expert_id);

  if (!expert_id || isNaN(expert_id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid expert ID is required' };
    return;
  }

  try {
    // Verify that expert exists
    const expert = await Expert.query().findById(expert_id);
    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with ID "${expert_id}" not found.` };
      return;
    }
    
    // Get all consultations for this expert
    let consultations = await Consultation.query()
      .where('expertId', expert_id) // Using camelCase property names
      .withGraphFetched('[expert, customer]');
    
    // Log the JSON representation to see how $formatJson transforms it    
    // If relations are null, manually fetch and attach them
    if (consultations.length > 0) {
      // Map over consultations to attach relations
      consultations = await Promise.all(consultations.map(async (consultation) => {
        // Fetch expert if null
        if (!consultation.expert && consultation.expertId) {
          consultation.expert = await Expert.query().findById(consultation.expertId);
        }
        
        // Fetch customer if null
        if (!consultation.customer && consultation.customerId) {
          consultation.customer = await Customer.query().findById(consultation.customerId);
        }
        
        return consultation;
      }));
    }

    if (!consultations.length) {
      appContext.status = 404;
      appContext.body = { error: `No consultations found for expert with ID "${expert_id}".` };
      return;
    }

    appContext.body = {
      message: `Consultations for expert with ID "${expert_id}" retrieved successfully.`,
      consultations
    };
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
