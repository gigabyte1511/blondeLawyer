import { ParameterizedContext } from 'koa';
import Koa from 'koa'
import Router from 'koa-router'
import * as yup from 'yup';
import Customer from '../models/Customer';
import { transaction } from 'objection';

// Define request payload types
interface CustomerRequestPayload {
  name?: string;
  telegramId?: number;
  telegramLink?: string;
}

interface CustomerByIDRequestPayload {
  id: number;
}

// Validation schema
const customerSchema = yup.object({
  name: yup.string().nullable(),
  telegramId: yup.number().nullable(),
  telegramLink: yup.string().nullable(),
});

export async function listCustomers(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  try {
    const customers = await Customer.query();

    // if (!customers.length) {
    //   appContext.status = 404;
    //   appContext.body = { error: "No customers found." };
    //   return;
    // }

    appContext.body = {
      message: "Customers retrieved successfully.",
      customers
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

export async function getCustomerByID(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);

  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid customer ID is required' };
    return;
  }

  try {
    const customer = await Customer.query().findById(id);

    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with ID "${id}" not found.` };
      return;
    }

    appContext.body = {
      message: `Customer with ID "${id}" retrieved successfully.`,
      customer
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

export async function getCustomerByTelegramId(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const telegramId = appContext.params.telegram_id;

  if (!telegramId) {
    appContext.status = 400;
    appContext.body = { error: 'Telegram ID is required' };
    return;
  }

  try {
    const customer = await Customer.query().where('telegramId', telegramId).first();

    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with Telegram ID "${telegramId}" not found.` };
      return;
    }

    appContext.body = {
      message: `Customer with Telegram ID "${telegramId}" retrieved successfully.`,
      customer
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

export async function createCustomer(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const body = appContext.request.body as CustomerRequestPayload;
  
  try {
    // Validate request body
    await customerSchema.validate(body, { abortEarly: false });
    
    let trx;
    trx = await transaction.start(Customer.knex());
    
    // Create new customer
    const customer = await Customer.query(trx).insert({
      name: body.name,
      telegramId: body.telegramId, // Using camelCase property names
      telegramLink: body.telegramLink, // Using camelCase property names
      role: 'customer'
    });
    
    await trx.commit();
    
    appContext.status = 201;
    appContext.body = {
      message: `Customer created successfully.`,
      customer
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

export async function deleteCustomer(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);

  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid customer ID is required' };
    return;
  }

  try {
    const customer = await Customer.query().findById(id);
    
    if (!customer) {
      appContext.status = 404;
      appContext.body = { error: `Customer with ID "${id}" not found.` };
      return;
    }
    
    await Customer.query().deleteById(id);
    
    appContext.body = {
      message: `Customer with ID "${id}" has been deleted successfully.`,
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