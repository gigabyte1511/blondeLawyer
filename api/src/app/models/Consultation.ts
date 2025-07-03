import { Model } from 'objection';
import Expert from './Expert';
import Customer from './Customer';

export default class Consultation extends Model {
  id!: number;
  expert_id!: number;
  customer_id!: number;
  type!: string;
  message?: string;
  scheduled_for!: Date;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  expert?: Expert;
  customer?: Customer;

  static get tableName() {
    return 'consultations';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['expert_id', 'customer_id', 'type', 'scheduled_for'],
      properties: {
        id: { type: 'integer' },
        expert_id: { type: 'integer' },
        customer_id: { type: 'integer' },
        type: { type: 'string' },
        message: { type: ['string', 'null'] },
        scheduled_for: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      expert: {
        relation: Model.BelongsToOneRelation,
        modelClass: Expert,
        join: {
          from: 'consultations.expert_id',
          to: 'experts.id'
        }
      },
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'consultations.customer_id',
          to: 'customers.id'
        }
      }
    };
  }
}
