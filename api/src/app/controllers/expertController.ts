import { ParameterizedContext } from 'koa';
import Koa from 'koa'
import Router from 'koa-router'
import * as yup from 'yup';
import Expert from '../models/Expert';
import { transaction } from 'objection';

// Define request payload types
interface ExpertRequestPayload {
  name?: string;
  telegramId?: number;
  telegramLink?: string;
}

interface ExpertByIDRequestPayload {
  id: number;
}

// Validation schema
const expertSchema = yup.object({
  name: yup.string().nullable(),
  telegramId: yup.number().nullable(),
  telegramLink: yup.string().nullable(),
});

export async function listExperts(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  try {
    const experts = await Expert.query();
    console.log("experts", experts);

    // if (!experts.length) {
    //   appContext.status = 404;
    //   appContext.body = { error: "No experts found." };
    //   return;
    // }

    appContext.body = {
      message: "Experts retrieved successfully.",
      experts
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

export async function getExpertByID(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);

  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid expert ID is required' };
    return;
  }

  try {
    const expert = await Expert.query().findById(id);

    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with ID "${id}" not found.` };
      return;
    }

    appContext.body = {
      message: `Expert with ID "${id}" retrieved successfully.`,
      expert
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

export async function getExpertByTelegramId(appContext: ParameterizedContext<
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
    const expert = await Expert.query().where('telegramId', telegramId).first();

    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with Telegram ID "${telegramId}" not found.` };
      return;
    }

    appContext.body = {
      message: `Expert with Telegram ID "${telegramId}" retrieved successfully.`,
      expert
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


export async function createExpert(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const body = appContext.request.body as ExpertRequestPayload;
  
  try {
    // Validate request body
    await expertSchema.validate(body, { abortEarly: false });
    
    let trx;
    trx = await transaction.start(Expert.knex());
    
    // Create new expert
    const expert = await Expert.query(trx).insert({
      name: body.name,
      telegramId: body.telegramId, // Using camelCase property names
      telegramLink: body.telegramLink, // Using camelCase property names
      role: 'expert'
    });
    
    await trx.commit();
    
    appContext.status = 201;
    appContext.body = {
      message: `Expert created successfully.`,
      expert
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

export async function deleteExpert(appContext: ParameterizedContext<
  Koa.DefaultState,
  Router.IRouterParamContext<Koa.DefaultState, object>
>) {
  const id = parseInt(appContext.params.id);

  if (!id || isNaN(id)) {
    appContext.status = 400;
    appContext.body = { error: 'Valid expert ID is required' };
    return;
  }

  try {
    const expert = await Expert.query().findById(id);
    
    if (!expert) {
      appContext.status = 404;
      appContext.body = { error: `Expert with ID "${id}" not found.` };
      return;
    }
    
    await Expert.query().deleteById(id);
    
    appContext.body = {
      message: `Expert with ID "${id}" has been deleted successfully.`,
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