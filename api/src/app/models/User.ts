import { Model } from 'objection';

export default class User extends Model {
  id!: number;
  name?: string;
  telegramId?: number; // Maps to telegram_id in DB
  telegramLink?: string; // Maps to telegram_link in DB
  role?: string;
  createdAt!: Date; // Maps to created_at in DB
  updatedAt!: Date; // Maps to updated_at in DB

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
        telegramId: { type: ['integer', 'null'] },
        telegramLink: { type: ['string', 'null'] },
        role: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    };
  }
}
