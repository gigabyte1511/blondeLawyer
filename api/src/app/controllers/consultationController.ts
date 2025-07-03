import { ParameterizedContext } from 'koa';
import Koa from 'koa'
import Router from 'koa-router'
import * as yup from 'yup';
import Consultation from '../models/Consultation';
import Expert from '../models/Expert';
import Customer from '../models/Customer';
import { transaction } from 'objection';

// Define request payload types
interface ConsultationRequestPayload {
  expert_id: number;
  customer_id: number;
  type: string;
  message?: string;
  scheduled_for: string; // ISO date string
}

interface ConsultationByIDRequestPayload {
  id: number;
}

interface ConsultationByCustomerIDRequestPayload {
  customer_id: number;
}

interface ConsultationByExpertIDRequestPayload {
  expert_id: number;
}

// Validation schema
const consultationSchema = yup.object({
  expert_id: yup.number().required('Expert ID is required'),
  customer_id: yup.number().required('Customer ID is required'),
  type: yup.string().required('Consultation type is required'),
  message: yup.string().nullable(),
  scheduled_for: yup.string().required('Scheduled date is required')
});

export async function listConsultations(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  try {
    const consultations = await Consultation.query()
      .withGraphFetched('[expert, customer]');
    
    if (!consultations.length) {
      appContext.status = 404;
      appContext.body = { error: "No consultations found." };
      return;
    }

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
    const consultation = await Consultation.query()
      .findById(id)
      .withGraphFetched('[expert, customer]');

    if (!consultation) {
      appContext.status = 404;
      appContext.body = { error: `Consultation with ID "${id}" not found.` };
      return;
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
  const body = appContext.request.body as ConsultationRequestPayload;
  
  try {
    // Validate request body
    await consultationSchema.validate(body, { abortEarly: false });
    
    // Verify that expert and customer exist
    const expert = await Expert.query().findById(body.expert_id);
    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with ID "${body.expert_id}" not found.` };
      return;
    }
    
    const customer = await Customer.query().findById(body.customer_id);
    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with ID "${body.customer_id}" not found.` };
      return;
    }
    
    let trx;
    trx = await transaction.start(Consultation.knex());
    
    // Create new consultation
    const consultation = await Consultation.query(trx).insert({
      expert_id: body.expert_id,
      customer_id: body.customer_id,
      type: body.type,
      message: body.message,
      scheduled_for: new Date(body.scheduled_for)
    });
    
    await trx.commit();
    
    // Fetch the complete consultation with related data
    const completeConsultation = await Consultation.query()
      .findById(consultation.id)
      .withGraphFetched('[expert, customer]');
    
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
    const consultations = await Consultation.query()
      .where('customer_id', customer_id)
      .withGraphFetched('[expert, customer]');

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
    const consultations = await Consultation.query()
      .where('expert_id', expert_id)
      .withGraphFetched('[expert, customer]');

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
