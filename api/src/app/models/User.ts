import { Model } from 'objection';

export default class User extends Model {
  id!: number;
  name?: string;
  telegramId?: string; // Maps to telegram_id in DB (BIGINT in database, string in JS)
  chatId?: string; // Maps to chat_id in DB (BIGINT in database, string in JS)
  telegramLink?: string; // Maps to telegram_link in DB
  role?: string;
  createdAt!: string; // Maps to created_at in DB (ISO string format)
  updatedAt!: string; // Maps to updated_at in DB (ISO string format)

  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        name: { type: ['string', 'null'] },
        telegramId: { type: ['string', 'null'] }, // Changed to string to handle large BIGINT values
        chatId: { type: ['string', 'null'] }, // Changed to string to handle large BIGINT values
        telegramLink: { type: ['string', 'null'] },
        role: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    };
  }
}
