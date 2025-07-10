import Router from 'koa-router';
import { 
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByTelegramId
} from '../controllers/userController';

export const userRouter = new Router({
  prefix: `/users`,
})

// GET all users
userRouter.get(`/`, listUsers);

// GET user by ID
userRouter.get(`/:id`, getUserById);

// POST create new user
userRouter.post(`/`, createUser);

// PUT update user
userRouter.put(`/:id`, updateUser);

// DELETE user
userRouter.delete(`/:id`, deleteUser);

// GET user by Telegram ID
userRouter.get(`/byTelegramId/:telegramId`, getUserByTelegramId);
