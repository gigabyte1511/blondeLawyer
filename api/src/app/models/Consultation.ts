import { Model } from 'objection';
import Expert from './Expert';
import Customer from './Customer';

export enum ConsultationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export default class Consultation extends Model {
  id!: number;
  expertId!: number; // Maps to expert_id in DB
  customerId!: number; // Maps to customer_id in DB
  type!: string;
  message?: string;
  status!: ConsultationStatus;
  scheduledFor!: string; // Maps to scheduled_for in DB, ISO date string
  createdAt!: Date; // Maps to created_at in DB
  updatedAt!: Date; // Maps to updated_at in DB

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
      required: ['expertId', 'customerId', 'type', 'scheduledFor'],
      properties: {
        id: { type: 'integer' },
        expertId: { type: 'integer' },
        customerId: { type: 'integer' },
        type: { type: 'string' },
        status: { type: 'string' },
        message: { type: ['string', 'null'] },
        scheduledFor: { type: 'string', format: 'date-time' }, // ISO date string
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    // Use path for imports to avoid issues
    const path = require('path');
    
    return {
      expert: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Expert'),
        join: {
          from: 'consultations.expert_id', // DB column name is snake_case
          to: 'users.id'
        }
      },
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Customer'),
        join: {
          from: 'consultations.customer_id', // DB column name is snake_case
          to: 'users.id'
        }
      }
    };
  }

  // We're now using knexSnakeCaseMappers() for automatic snake_case to camelCase conversion
  // No need for custom $formatJson method anymore
}
