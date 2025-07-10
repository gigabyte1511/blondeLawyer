import { ParameterizedContext } from 'koa';
import Koa from 'koa'
import Router from 'koa-router'
import * as yup from 'yup';
import User from '../models/User';
import Expert from '../models/Expert';
import Customer from '../models/Customer';
import { transaction } from 'objection';

// Define request payload types
interface UserRequestPayload {
  name?: string;
  telegramId?: number;
  telegramLink?: string;
  role?: string;
}

// Validation schema
const userSchema = yup.object({
  name: yup.string().nullable(),
  telegramId: yup.number().nullable(),
  telegramLink: yup.string().nullable(),
  role: yup.string().oneOf(['expert', 'customer']).nullable()
});

/**
 * List all users
 */
export const listUsers = async (ctx: ParameterizedContext) => {
  try {
    const users = await User.query();

    // if (!users.length) {
    //   ctx.status = 404;
    //   ctx.body = { error: "No users found." };
    //   return;
    // }

    ctx.body = {
      message: "Users retrieved successfully.",
      users
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred.'
    };
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (ctx: ParameterizedContext) => {
  const id = parseInt(ctx.params.id);

  if (!id || isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Valid user ID is required' };
    return;
  }

  try {
    const user = await User.query().findById(id);

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: `User with ID "${id}" not found.` };
      return;
    }

    ctx.body = {
      message: `User retrieved successfully.`,
      user
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred.'
    };
  }
};

/**
 * Get user by Telegram ID
 * @param ctx Koa context
 */
export const getUserByTelegramId = async (ctx: ParameterizedContext) => {
  try {
    const { telegramId } = ctx.params;
    
    if (!telegramId) {
      ctx.status = 400;
      ctx.body = { error: 'Telegram ID is required' };
      return;
    }
  
    // Check if user exists with this telegramId
    const user = await User.query().where('telegramId', telegramId).first();
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: `User with Telegram ID "${telegramId}" not found.` };
      return;
    }
  
    ctx.body = {
      message: `User retrieved successfully.`,
      user
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { 
      error: 'An error occurred while fetching user role',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
  };

/**
 * Create a new user
 */
export const createUser = async (ctx: ParameterizedContext) => {
  const body = ctx.request.body as UserRequestPayload;
  
  try {
    // Validate request body
    await userSchema.validate(body, { abortEarly: false });
    
    let trx;
    trx = await transaction.start(User.knex());
    
    // Create new user
    const user = await User.query(trx).insert({
      name: body.name,
      telegramId: body.telegramId, // Using camelCase property names
      telegramLink: body.telegramLink, // Using camelCase property names
      role: body.role
    });
    
    await trx.commit();
    
    ctx.status = 201;
    ctx.body = {
      message: `User created successfully.`,
      user
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred.'
    };
  }
};

/**
 * Update a user
 */
export const updateUser = async (ctx: ParameterizedContext) => {
  const id = parseInt(ctx.params.id);
  const body = ctx.request.body as UserRequestPayload;

  if (!id || isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Valid user ID is required' };
    return;
  }

  try {
    // Validate request body
    await userSchema.validate(body, { abortEarly: false });
    
    const user = await User.query().findById(id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: `User with ID "${id}" not found.` };
      return;
    }
    
    const updatedUser = await User.query().patchAndFetchById(id, {
      name: body.name,
      telegramId: body.telegramId, // Using camelCase property names
      telegramLink: body.telegramLink, // Using camelCase property names
      role: body.role
    });
    
    ctx.body = {
      message: `User updated successfully.`,
      user: updatedUser
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred.'
    };
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (ctx: ParameterizedContext) => {
  const id = parseInt(ctx.params.id);

  if (!id || isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Valid user ID is required' };
    return;
  }

  try {
    const user = await User.query().findById(id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: `User with ID "${id}" not found.` };
      return;
    }
    
    await User.query().deleteById(id);
    
    ctx.body = {
      message: `User with ID "${id}" has been deleted successfully.`,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred.'
    };
  }
};
