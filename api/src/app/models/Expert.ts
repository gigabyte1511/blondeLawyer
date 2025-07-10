import User from './User';

export default class Expert extends User {
  // Expert-specific properties can be added here
  
  static get tableName() {
    return 'users';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        ...super.jsonSchema.properties,
        // Add any Expert-specific properties here
      }
    };
  }
  
  // Query modifier to filter only experts
  static modifiers = {
    onlyExperts(query: any) {
      query.where('role', 'expert');
    }
  };
  
  // Override the query builder to always filter for experts
  static query(...args: any[]) {
    return super.query(...args).modify('onlyExperts');
  }
}
