import { Model } from 'objection';

export default class Expert extends Model {
  id!: number;
  name?: string;
  telegram_id?: number;
  telegram_link?: string;
  created_at!: Date;
  updated_at!: Date;

  static get tableName() {
    return 'experts';
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
        telegram_id: { type: ['integer', 'null'] },
        telegram_link: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }
}
