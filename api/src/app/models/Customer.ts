import User from './User';

export default class Customer extends User {
  // Customer-specific properties can be added here
  
  static get tableName() {
    return 'users';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        ...super.jsonSchema.properties,
        // Add any Customer-specific properties here
      }
    };
  }
  
  // Query modifier to filter only customers
  static modifiers = {
    onlyCustomers(query: any) {
      query.where('role', 'customer');
    }
  };
  
  // Override the query builder to always filter for customers
  static query(...args: any[]) {
    return super.query(...args).modify('onlyCustomers');
  }
}
