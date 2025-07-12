import TelegramBot from 'node-telegram-bot-api';
import config from 'config';
import User from '../models/User';
import { transaction, PartialModelObject } from 'objection';

// Define bot types
interface BotConfig {
  token: string;
  options?: TelegramBot.ConstructorOptions;
}

class TelegramBotService {
  private bot: TelegramBot;
  private static instance: TelegramBotService;

  private constructor(config: BotConfig) {
    this.bot = new TelegramBot(config.token, config.options || { polling: true });
    this.setupEventHandlers();
  }

  /**
   * Get singleton instance of TelegramBotService
   */
  public static getInstance(): TelegramBotService {
    if (!TelegramBotService.instance) {
      const token = config.get<string>('telegramBot.token');
      if (!token) {
        throw new Error('Telegram bot token is not configured');
      }
      
      TelegramBotService.instance = new TelegramBotService({
        token,
        options: { polling: true }
      });
    }
    return TelegramBotService.instance;
  }

  /**
   * Set up event handlers for the bot
   */
  private setupEventHandlers(): void {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const firstName = msg.from?.first_name || '';
      const lastName = msg.from?.last_name || '';
      const username = msg.from?.username;
      
      if (!userId) {
        console.error('No user ID found in message');
        return;
      }
      
      console.log(`Start command received from user ${userId} in chat ${chatId}`);

      try {
        // Check if user already exists
        const existingUser = await User.query().where('telegramId', String(userId)).first();
        
        if (existingUser) {
          // User already exists, update chat ID if needed
          if (existingUser.chatId !== String(chatId)) {
            await User.query().findById(existingUser.id).patch({
              chatId: String(chatId),
              updatedAt: new Date().toISOString()
            });
            console.log(`Updated chat ID for user ${userId} to ${chatId}`);
          }
          
          // Send welcome back message
          await this.bot.sendMessage(chatId, `С возвращением, ${firstName}! Чем я могу помочь?`);
          return;
        }

        // Create new user
        let trx;
        try {
          trx = await transaction.start(User.knex());
          
          // Create user with role 'customer' by default
          const userData: PartialModelObject<User> = {
            name: `${firstName} ${lastName}`.trim(),
            telegramId: String(userId),
            chatId: String(chatId),
            telegramLink: username ? `https://t.me/${username}` : undefined,
            role: 'customer',
          };
          
          const user = await User.query(trx).insert(userData);
          
          await trx.commit();
          
          // Send welcome message
          await this.bot.sendMessage(
            chatId, 
            `Добро пожаловать, ${firstName}! Я бот-помощник Блондинки в Законе. Вы можете записаться на консультацию через наше веб-приложение, нажав на кнопку "Открыть"`
          );
          
          console.log(`New user created: ${user.id} (Telegram ID: ${userId})`);
        } catch (error) {
          if (trx) await trx.rollback();
          throw error;
        }
      } catch (error) {
        console.error('Error handling /start command:', error);
        await this.bot.sendMessage(chatId, 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
      }
    });

    // Handle /setexpert command - sets user role to expert
    this.bot.onText(/\/setexpert/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      
      if (!userId) {
        console.error('No user ID found in message');
        return;
      }
      
      console.log(`Set expert command received from user ${userId} in chat ${chatId}`);

      try {
        // Check if user exists
        const existingUser = await User.query().where('telegramId', String(userId)).first();
        
        if (!existingUser) {
          await this.bot.sendMessage(chatId, 'Пользователь не найден. Пожалуйста, сначала выполните команду /start');
          return;
        }
        
        // Update user role to expert
        await User.query().findById(existingUser.id).patch({
          role: 'expert',
          updatedAt: new Date().toISOString()
        });
        
        await this.bot.sendMessage(chatId, 'Ваша роль изменена на "Эксперт". Теперь вы можете принимать и управлять консультациями.');
        console.log(`User ${userId} role updated to expert`);
      } catch (error) {
        console.error('Error handling /setexpert command:', error);
        await this.bot.sendMessage(chatId, 'Произошла ошибка при изменении роли. Пожалуйста, попробуйте позже.');
      }
    });
    
    // Handle /help command - shows available commands
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      try {
        await this.bot.sendMessage(
          chatId,
          `Доступные команды:\n\n` +
          `/start - Начать работу с ботом\n` +
          `/help - Показать список доступных команд\n` +
          `/setexpert - Установить роль "Эксперт"\n` +
          `/setcustomer - Установить роль "Клиент"`
        );
      } catch (error) {
        console.error('Error handling /help command:', error);
      }
    });
    
    // Handle /setcustomer command - sets user role to customer
    this.bot.onText(/\/setcustomer/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      
      if (!userId) {
        console.error('No user ID found in message');
        return;
      }
      
      console.log(`Set customer command received from user ${userId} in chat ${chatId}`);

      try {
        // Check if user exists
        const existingUser = await User.query().where('telegramId', String(userId)).first();
        
        if (!existingUser) {
          await this.bot.sendMessage(chatId, 'Пользователь не найден. Пожалуйста, сначала выполните команду /start');
          return;
        }
        
        // Update user role to customer
        await User.query().findById(existingUser.id).patch({
          role: 'customer',
          updatedAt: new Date().toISOString()
        });
        
        await this.bot.sendMessage(chatId, 'Ваша роль изменена на "Клиент". Теперь вы можете записываться на консультации.');
        console.log(`User ${userId} role updated to customer`);
      } catch (error) {
        console.error('Error handling /setcustomer command:', error);
        await this.bot.sendMessage(chatId, 'Произошла ошибка при изменении роли. Пожалуйста, попробуйте позже.');
      }
    });
    
    // Log errors
    this.bot.on('polling_error', (error: Error) => {
      console.error('Telegram bot polling error:', error);
    });
  }

  /**
   * Send notification to a user by Telegram ID
   */
  public async sendNotification(telegramId: string | number, message: string): Promise<boolean> {
    try {
      await this.bot.sendMessage(telegramId, message);
      return true;
    } catch (error) {
      console.error(`Error sending notification to user ${telegramId}:`, error);
      return false;
    }
  }

  /**
   * Send notification about consultation status change
   */
  public async sendConsultationStatusNotification(
    telegramId: string | number, 
    consultationId: number, 
    status: string,
    scheduledFor?: string | Date,
    expertName?: string
  ): Promise<boolean> {
    // Format date if provided
    let formattedDate = '';
    if (scheduledFor) {
      const date = new Date(scheduledFor);
      formattedDate = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Create appropriate message based on status
    let message = '';
    
    switch(status) {
      case 'approved':
        message = `✅ Ваша консультация #${consultationId} подтверждена!\n\n`;
        if (formattedDate && expertName) {
          message += `📅 Дата и время: ${formattedDate}\n`;
          message += `👩‍⚖️ Юрист: ${expertName}\n\n`;
          message += `Пожалуйста, не опаздывайте на консультацию.`;
        }
        break;
        
      case 'rejected':
        message = `❌ Ваша заявка на консультацию #${consultationId} отклонена.\n\n`;
        message += `Для получения дополнительной информации или записи на другое время, пожалуйста, свяжитесь с нами.`;
        break;
        
      case 'completed':
        message = `✓ Консультация #${consultationId} завершена.\n\n`;
        message += `Благодарим вас за обращение! Если у вас остались вопросы, вы всегда можете записаться на новую консультацию.`;
        break;
        
      case 'cancelled':
        message = `🚫 Консультация #${consultationId} отменена.\n\n`;
        message += `Если вы хотите записаться на новую консультацию, воспользуйтесь нашим веб-приложением.`;
        break;
        
      default:
        message = `Статус вашей консультации #${consultationId} изменен на: ${status}`;
        if (formattedDate && expertName) {
          message += `\n\n📅 Дата и время: ${formattedDate}\n`;
          message += `👩‍⚖️ Юрист: ${expertName}`;
        }
    }
    
    return this.sendNotification(telegramId, message);
  }
}

export default TelegramBotService;
